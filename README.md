# WealthPulse

Personal investment dashboard for the journey from **R100 to financial independence** — South African + global markets, compound-growth planning, and income opportunities. Built with Next.js 16, React 19, Tailwind 4, and Recharts.

> **Private project.** This repo should be kept **private** on GitHub (it tracks a personal financial plan), and the deployed site is `noindex` + crawler-blocked. See [docs/Production-Readiness.md](docs/Production-Readiness.md).

## Quick start

```bash
npm ci
npm run dev        # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest unit tests |
| `npm run refresh-data` | Fetch live market data into the snapshot (needs internet) |

## How market data works

All market values live in **`src/data/market-snapshot.json`**, refreshed automatically by a GitHub Actions cron (`.github/workflows/refresh-market-data.yml`) on weekdays at 07:15 and 17:15 SAST using free, keyless APIs (open.er-api.com + Yahoo Finance). The schedule only fires from `main`. Full runbook: [docs/Market-Data-Pipeline.md](docs/Market-Data-Pipeline.md).

## Docs / Obsidian

Project docs live in [`docs/`](docs/Home.md) and are written as an **Obsidian vault** (wikilinks, frontmatter, callouts):

- [Home](docs/Home.md) — index
- [Architecture](docs/Architecture.md)
- [Market-Data-Pipeline](docs/Market-Data-Pipeline.md) — cron runbook
- [Production-Readiness](docs/Production-Readiness.md) — privacy & deploy checklist
- [Money-Plan](docs/Money-Plan.md) — Phase 0 action plan
- [Obsidian-Setup](docs/Obsidian-Setup.md) — how to open these notes in Obsidian

## CI

`.github/workflows/ci.yml` runs lint, typecheck, tests, and build on pushes to `main` / `claude/**` and on PRs. Snapshot-shape tests guard against the cron ever committing malformed data.
