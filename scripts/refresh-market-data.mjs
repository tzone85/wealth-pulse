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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Returns { price, previousClose } for a Yahoo Finance symbol.
 *
 * Yahoo rate-limits CI runner IPs (HTTP 429) but lets requests through
 * intermittently — verified in run 27287482448 where one of 36 rapid
 * requests succeeded. So: alternate query1/query2 hosts, honor
 * Retry-After, and back off long and jittered. A cron job can afford
 * minutes of patience.
 */
async function fetchYahooQuote(symbol, { attempts = 5 } = {}) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const host = attempt % 2 === 0 ? 'query1' : 'query2';
    const url = `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 429) {
        lastError = new Error(`HTTP 429 from ${host} for ${symbol}`);
        const retryAfter = Number(res.headers.get('retry-after'));
        const wait =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 60_000)
            : 8_000 + 8_000 * attempt + Math.random() * 4_000;
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice;
      const previousClose = meta?.chartPreviousClose ?? meta?.previousClose ?? price;
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`No usable price for ${symbol}`);
      }
      return { price, previousClose };
    } catch (err) {
      lastError = err;
      await sleep(2_000);
    }
  }
  throw lastError;
}

/**
 * Fetches all Stooq symbols in ONE request via the current-quote CSV
 * endpoint (/q/l/). Returns a map of stooq symbol (lowercase) → close.
 * Tries stooq.com then the stooq.pl mirror.
 */
async function fetchStooqBatch(symbols) {
  const query = symbols.join(',');
  let lastError;
  for (const host of ['stooq.com', 'stooq.pl']) {
    try {
      const url = `https://${host}/q/l/?s=${encodeURIComponent(query)}&f=sd2t2ohlcv&h&e=csv`;
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/csv,text/plain,*/*' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${host}`);
      const text = (await res.text()).trim();
      // Format: Symbol,Date,Time,Open,High,Low,Close,Volume with header row.
      const quotes = {};
      for (const line of text.split('\n').slice(1)) {
        const cols = line.split(',');
        const symbol = cols[0]?.trim().toLowerCase();
        const close = Number.parseFloat(cols[6]);
        if (symbol && Number.isFinite(close) && close > 0) {
          quotes[symbol] = close;
        }
      }
      if (Object.keys(quotes).length === 0) {
        throw new Error(`no parsable rows from ${host} (got: ${text.slice(0, 80)})`);
      }
      return quotes;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
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

  // --- Indices & commodities: Stooq batch first, Yahoo per-symbol fallback ---
  const quoteTargets = [
    ...snapshot.indices.map((item) => ({ item, kind: 'index' })),
    ...snapshot.commodities.map((item) => ({ item, kind: 'commodity' })),
  ];

  let stooqQuotes = {};
  try {
    stooqQuotes = await fetchStooqBatch(Object.values(STOOQ_SYMBOLS));
  } catch (err) {
    log('FAIL', 'stooq', `batch fetch failed: ${err.message}`);
  }

  for (const { item, kind } of quoteTargets) {
    if (!STOOQ_SYMBOLS[item.symbol] && !YAHOO_SYMBOLS[item.symbol]) continue;
    const field = kind === 'index' ? 'value' : 'price';
    const stooqSymbol = STOOQ_SYMBOLS[item.symbol]?.toLowerCase();
    const stooqPrice = stooqSymbol ? stooqQuotes[stooqSymbol] : undefined;

    if (Number.isFinite(stooqPrice)) {
      // Change is day-over-day vs the previous snapshot value (same
      // semantics as FX — the cron runs at least daily on weekdays).
      Object.assign(item, withChange(stooqPrice, item[field]));
      item[field] = round(stooqPrice, 2);
      succeeded++;
      log('ok', item.symbol, `stooq:${stooqSymbol} = ${round(stooqPrice, 2)}`);
      continue;
    }

    const yahooSymbol = YAHOO_SYMBOLS[item.symbol];
    try {
      const { price, previousClose } = await fetchYahooQuote(yahooSymbol);
      item[field] = round(price, 2);
      Object.assign(item, withChange(price, previousClose));
      succeeded++;
      log('ok', item.symbol, `yahoo:${yahooSymbol} = ${round(price, 2)}`);
    } catch (err) {
      failed++;
      log('FAIL', item.symbol, `${yahooSymbol}: ${err.message} (keeping previous value)`);
    }
    // Space out Yahoo requests — rapid-fire is what triggers the 429s.
    await sleep(5_000);
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
