---
tags: [wealthpulse, cron, runbook]
created: 2026-06-10
---

# Market Data Pipeline (Cron Runbook)

The workflow `.github/workflows/refresh-market-data.yml` keeps `src/data/market-snapshot.json` current.

## Schedule

- **Weekdays at 07:15 and 17:15 SAST** (05:15 / 15:15 UTC) — before SA market open and after close.
- > [!warning] GitHub only fires scheduled workflows from the **default branch** (`main`). The cron is inert until this workflow file is merged to `main`. Manual runs (`workflow_dispatch`) work from any branch.
- GitHub may also **auto-disable schedules after 60 days without repo activity** — if data goes stale, check the Actions tab for a "workflow disabled" banner and re-enable it.

## Data sources (free, no API keys)

| Series | Primary source | Fallback |
|---|---|---|
| USD/EUR/GBP → ZAR | open.er-api.com | — |
| S&P 500 / NASDAQ / FTSE | Stooq (`^spx` / `^ndq` / `^ukx`) | Yahoo Finance |
| Gold / Platinum / Palladium / Brent | Stooq (`xauusd` / `xptusd` / `xpdusd` / `cb.f`) | Yahoo Finance |
| JSE All Share / Top 40 | Yahoo Finance (`^J203.JO` / `^J200.JO`) — **only source** | — |

> [!warning] JSE caveat — verified during testing
> Yahoo Finance rate-limits GitHub Actions runner IPs (HTTP 429), and it is the only free keyless source for JSE indices. The JSE values therefore update only when Yahoo lets a request through; on other runs they keep their previous values (clearly logged). Everything else updates reliably via Stooq. If JSE staleness becomes a problem, the cleanest fix is a free API key from a provider that covers the JSE (e.g. Marketstack/EODHD) wired in as another source.

## Failure behavior (by design)

- A symbol that fails to fetch **keeps its previous value** — logged as `[FAIL] … (keeping previous value)` but the run still succeeds.
- The run only fails (red X, GitHub emails you) when **every** fetch failed.
- The snapshot is validated before writing; malformed data is never committed. CI tests double-check the committed snapshot.

## How to verify it's working

1. **Actions tab** → "Refresh market data" → latest run should be green; the log lists each series with `[ok]`/`[FAIL]`.
2. **Git history**: `git log --oneline -- src/data/market-snapshot.json` — expect `chore: refresh market data snapshots` commits on weekdays.
3. **Dashboard header** shows "Data updated {date}" from the snapshot's `updatedAt`.
4. Manual run: Actions tab → Refresh market data → *Run workflow*, or locally `npm run refresh-data` (needs open internet).

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No runs appearing | Workflow not on `main`, or schedule auto-disabled | Merge to `main`; re-enable in Actions tab |
| `[FAIL]` on JSE symbols only | Yahoo rate-limiting the runner (HTTP 429) — expected, see caveat above | Nothing urgent; values catch up when a request gets through, or run `npm run refresh-data` locally (home IPs aren't throttled) and push |
| `[FAIL]` on Stooq symbols | Stooq down or symbol changed | Check the symbol on stooq.com; update `STOOQ_SYMBOLS` in `scripts/refresh-market-data.mjs` |
| Run green but site shows old data | Site not redeployed | Connect the repo to Vercel — every cron commit then auto-deploys |

## Note on deploys

The cron commits data to git; it does **not** deploy. Once the repo is connected to Vercel (see [[Production-Readiness]]), each cron commit to `main` triggers an automatic rebuild, so the live site stays current with zero extra setup.
