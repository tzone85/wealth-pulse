#!/usr/bin/env node
/**
 * Refreshes src/data/market-snapshot.json with live market data.
 *
 * Sources (all free, no API key):
 *   - FX rates:            https://open.er-api.com (daily ECB-style rates)
 *   - Indices/commodities: Stooq CSV API (primary), Yahoo Finance (fallback)
 *
 * Stooq is primary because Yahoo rate-limits GitHub Actions runner IPs
 * (HTTP 429). The JSE indices are only available on Yahoo, so they keep
 * their previous values whenever Yahoo throttles us.
 *
 * Designed to run unattended in GitHub Actions. Partial failures are
 * tolerated: any series that cannot be fetched keeps its previous value.
 * The script exits non-zero only when EVERY fetch failed (so the
 * scheduled workflow alerts on a total outage, not a flaky symbol).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SNAPSHOT_PATH = fileURLToPath(new URL('../src/data/market-snapshot.json', import.meta.url));

// Stooq symbols (primary source; daily-history CSV endpoint).
const STOOQ_SYMBOLS = {
  SPX: '^spx', // S&P 500
  IXIC: '^ndq', // NASDAQ Composite
  UKX: '^ukx', // FTSE 100
  XAU: 'xauusd', // gold spot
  XPT: 'xptusd', // platinum spot
  XPD: 'xpdusd', // palladium spot
  BRN: 'cb.f', // Brent crude continuous futures
};

// Yahoo Finance symbols (fallback; only source carrying the JSE indices).
const YAHOO_SYMBOLS = {
  JALSH: '^J203.JO',
  JTOPI: '^J200.JO',
  SPX: '^GSPC',
  IXIC: '^IXIC',
  UKX: '^FTSE',
  XAU: 'GC=F',
  XPT: 'PL=F',
  XPD: 'PA=F',
  BRN: 'BZ=F',
};

const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

async function fetchJson(url, { retries = 3 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        const delay = 1000 * 2 ** attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

/** Returns { price, previousClose } for a Yahoo Finance symbol. */
async function fetchYahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const data = await fetchJson(url);
  const meta = data?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`No usable price for ${symbol}`);
  }
  return { price, previousClose };
}

/**
 * Returns { price, previousClose } from Stooq's daily-history CSV
 * (last ~14 calendar days; the final two closes give price + change).
 */
async function fetchStooqQuote(symbol) {
  const fmt = (d) => d.toISOString().slice(0, 10).replaceAll('-', '');
  const now = new Date();
  const start = new Date(now.getTime() - 14 * 24 * 3600 * 1000);
  const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol)}&i=d&d1=${fmt(start)}&d2=${fmt(now)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const csv = (await res.text()).trim();
  // Format: Date,Open,High,Low,Close[,Volume] with a header row.
  const rows = csv.split('\n').slice(1);
  const closes = rows
    .map((line) => Number.parseFloat(line.split(',')[4]))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (closes.length === 0) {
    throw new Error(`No usable data from Stooq for ${symbol} (got: ${csv.slice(0, 60)})`);
  }
  const price = closes[closes.length - 1];
  const previousClose = closes.length > 1 ? closes[closes.length - 2] : price;
  return { price, previousClose };
}

/** Tries Stooq first (reachable from CI), then falls back to Yahoo. */
async function fetchQuote(internalSymbol) {
  const errors = [];
  const stooqSymbol = STOOQ_SYMBOLS[internalSymbol];
  if (stooqSymbol) {
    try {
      return { ...(await fetchStooqQuote(stooqSymbol)), via: `stooq:${stooqSymbol}` };
    } catch (err) {
      errors.push(err.message);
    }
  }
  const yahooSymbol = YAHOO_SYMBOLS[internalSymbol];
  if (yahooSymbol) {
    try {
      return { ...(await fetchYahooQuote(yahooSymbol)), via: `yahoo:${yahooSymbol}` };
    } catch (err) {
      errors.push(err.message);
    }
  }
  throw new Error(errors.join(' | ') || `no source for ${internalSymbol}`);
}

/** Returns ZAR per USD, EUR and GBP. */
async function fetchFxRates() {
  const data = await fetchJson('https://open.er-api.com/v6/latest/USD');
  if (data?.result !== 'success' || !Number.isFinite(data?.rates?.ZAR)) {
    throw new Error('FX API did not return usable rates');
  }
  const { ZAR, EUR, GBP } = data.rates;
  return {
    'USD/ZAR': ZAR,
    'EUR/ZAR': ZAR / EUR,
    'GBP/ZAR': ZAR / GBP,
  };
}

function round(value, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function withChange(current, previous) {
  if (!Number.isFinite(previous) || previous <= 0) {
    return { change: 0, changePercent: 0 };
  }
  return {
    change: round(current - previous, 4),
    changePercent: round(((current - previous) / previous) * 100, 2),
  };
}

/** Inserts or updates the current month's point in a history series. */
function upsertHistory(series, value) {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const point = { date: month, value: round(value, 4) };
  const last = series[series.length - 1];
  if (last && last.date === month) {
    series[series.length - 1] = point;
  } else {
    series.push(point);
  }
  // Keep a rolling 13 months (12 months of movement + current).
  while (series.length > 13) series.shift();
}

function validateSnapshot(snapshot) {
  const assert = (cond, msg) => {
    if (!cond) throw new Error(`Snapshot validation failed: ${msg}`);
  };
  assert(Array.isArray(snapshot.indices) && snapshot.indices.length > 0, 'indices missing');
  assert(Array.isArray(snapshot.currencies) && snapshot.currencies.length > 0, 'currencies missing');
  assert(Array.isArray(snapshot.commodities) && snapshot.commodities.length > 0, 'commodities missing');
  for (const idx of snapshot.indices) {
    assert(Number.isFinite(idx.value) && idx.value > 0, `bad value for ${idx.symbol}`);
  }
  for (const fx of snapshot.currencies) {
    assert(Number.isFinite(fx.rate) && fx.rate > 0, `bad rate for ${fx.pair}`);
  }
  for (const c of snapshot.commodities) {
    assert(Number.isFinite(c.price) && c.price > 0, `bad price for ${c.symbol}`);
  }
  for (const series of Object.values(snapshot.history)) {
    assert(Array.isArray(series) && series.every((p) => Number.isFinite(p.value)), 'bad history series');
  }
}

async function main() {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  let succeeded = 0;
  let failed = 0;
  const log = (status, label, detail) =>
    console.log(`  [${status}] ${label.padEnd(10)} ${detail}`);

  console.log('Refreshing market snapshot…');

  // --- FX ---
  try {
    const rates = await fetchFxRates();
    for (const fx of snapshot.currencies) {
      const next = rates[fx.pair];
      if (!Number.isFinite(next)) continue;
      Object.assign(fx, { rate: round(next, 4), ...withChange(next, fx.rate) });
    }
    upsertHistory(snapshot.history.usdZar, rates['USD/ZAR']);
    succeeded++;
    log('ok', 'FX', `USD/ZAR=${round(rates['USD/ZAR'], 4)}`);
  } catch (err) {
    failed++;
    log('FAIL', 'FX', err.message);
  }

  // --- Indices & commodities via Yahoo ---
  const quoteTargets = [
    ...snapshot.indices.map((item) => ({ item, kind: 'index' })),
    ...snapshot.commodities.map((item) => ({ item, kind: 'commodity' })),
  ];
  for (const { item, kind } of quoteTargets) {
    if (!STOOQ_SYMBOLS[item.symbol] && !YAHOO_SYMBOLS[item.symbol]) continue;
    try {
      const { price, previousClose, via } = await fetchQuote(item.symbol);
      const field = kind === 'index' ? 'value' : 'price';
      item[field] = round(price, 2);
      Object.assign(item, withChange(price, previousClose));
      succeeded++;
      log('ok', item.symbol, `${via} = ${round(price, 2)}`);
    } catch (err) {
      failed++;
      log('FAIL', item.symbol, `${err.message} (keeping previous value)`);
    }
  }

  // History series driven by Yahoo values that may have just updated.
  const bySymbol = Object.fromEntries(
    [...snapshot.indices, ...snapshot.commodities].map((i) => [i.symbol, i]),
  );
  upsertHistory(snapshot.history.jseTop40, bySymbol.JTOPI.value);
  upsertHistory(snapshot.history.gold, bySymbol.XAU.price);
  upsertHistory(snapshot.history.platinum, bySymbol.XPT.price);

  if (succeeded === 0) {
    console.error(`\nAll ${failed} fetches failed — leaving snapshot untouched.`);
    process.exit(1);
  }

  snapshot.updatedAt = new Date().toISOString();
  snapshot.source = 'open.er-api.com + Yahoo Finance';
  validateSnapshot(snapshot);

  writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\nDone: ${succeeded} fetched, ${failed} kept previous values.`);
  console.log(`Snapshot written to ${SNAPSHOT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
