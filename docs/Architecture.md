---
tags: [wealthpulse, architecture]
created: 2026-06-10
---

# Architecture

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind 4 + Recharts. All pages are statically prerendered; there is no backend or database.

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard: key metrics, charts, growth simulator, geopolitical context |
| `/markets` | SA + global indices, FX, commodities, 12-month charts |
| `/calculator` | Compound growth calculator |
| `/strategy` | The six wealth-building phases |
| `/opportunities` | Income platforms (freelance, bounties, passive) |

## Data flow

```
open.er-api.com + Yahoo Finance
        │  (GitHub Actions cron, weekdays 07:15 & 17:15 SAST)
        ▼
scripts/refresh-market-data.mjs
        │  validates, writes
        ▼
src/data/market-snapshot.json   ← single source of truth, committed to git
        │  imported at build time
        ▼
src/lib/market-data.ts  →  pages/components
```

Key properties:

- **`market-snapshot.json` is the only data file.** Pages never hardcode market values. The dashboard header shows the snapshot's `updatedAt`.
- Because data is committed, every refresh is **auditable in git history** and the site builds even when the APIs are down.
- A redeploy (or local rebuild) is needed to pick up a new snapshot — see [[Market-Data-Pipeline]] for hooking up auto-deploys.
- Currency pairs are quoted as **ZAR per foreign unit** (`USD/ZAR ≈ 16` means R16 per dollar). Tests enforce this convention.
- History series before 2026-06 are approximate seed values; from June 2026 onward the cron appends real monthly closes.

## Quality gates

`.github/workflows/ci.yml` runs lint, typecheck, vitest, and build on pushes to `main`/`claude/**` and on PRs. The snapshot-shape tests in `src/lib/market-data.test.ts` fail CI if the cron ever commits malformed data.
