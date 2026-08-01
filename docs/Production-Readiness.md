---
tags: [wealthpulse, production, security, checklist]
created: 2026-06-10
---

# Production Readiness

## ⚠️ Action required: make the repo private

**The GitHub repo is currently PUBLIC** (checked 2026-06-10). This is a personal-finance project — make it private:

1. Go to https://github.com/tzone85/wealth-pulse/settings
2. Scroll to **Danger Zone** → **Change repository visibility** → **Make private** → type the repo name to confirm.

Notes after going private:

- GitHub Actions on private repos use your free quota (2,000 min/month). The cron uses roughly **±50 min/month** (≈44 runs × ~1 min) plus CI runs — comfortably within the free tier.
- Repo topics (`cli`, `education`, `nextjs`, `typescript`) stop being publicly visible automatically.

## Done in code ✅

- [x] **No secrets in the repo** — the app uses only free, keyless APIs; `.env*` is gitignored. (Keep it that way: never commit account numbers, balances, or broker credentials.)
- [x] **Search engines blocked**: `robots.txt` disallows all, `X-Robots-Tag: noindex` header, `robots` metadata — so even a deployed URL stays out of Google.
- [x] **Security headers** in `next.config.ts` (nosniff, frame-deny, referrer policy, permissions policy); `X-Powered-By` disabled.
- [x] **Next.js upgraded to 16.2.9**, clearing a high-severity advisory (middleware bypass / cache poisoning fixes).
- [x] **CI** (lint + typecheck + tests + build) on every push and PR.
- [x] **Automated, validated market data** with audit trail in git ([[Market-Data-Pipeline]]).

Known accepted risk: `npm audit` reports a *moderate* postcss advisory vendored **inside** Next.js itself; even the newest Next release carries it, and it only matters when stringifying untrusted CSS, which this app never does.

## Deployment recommendation

Deploy on **Vercel** (free Hobby tier is fine for personal use):

1. vercel.com → Add New Project → import `tzone85/wealth-pulse` (works with private repos).
2. Defaults are fine — Next.js is auto-detected.
3. **Privacy**: Project → Settings → **Deployment Protection** → enable *Vercel Authentication* for Production. Then only you (logged into Vercel) can open the site. This makes the dashboard truly private, not just unindexed.
4. Each cron data commit to `main` now auto-deploys — the dashboard stays fresh without touching it.

## Remaining manual checklist

- [ ] Make repo private (above)
- [ ] Merge this branch to `main` so the cron schedule activates
- [ ] Confirm first scheduled run next weekday morning (Actions tab)
- [ ] Deploy to Vercel + enable Deployment Protection
- [ ] Optional: GitHub → Settings → Branches → protect `main` (require CI to pass)
