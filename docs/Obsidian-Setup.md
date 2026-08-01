---
tags: [wealthpulse, obsidian, setup]
created: 2026-06-10
---

# Obsidian Setup

These docs are written to work natively in Obsidian: YAML frontmatter, `[[wikilinks]]`, tags, and callouts all render properly. Three ways to use them, pick one:

## Option A — Open `docs/` as its own vault (simplest)

1. Obsidian → **Open another vault** → **Open folder as vault**.
2. Choose the `wealth-pulse/docs/` folder in your local clone.

Edits you make in Obsidian are ordinary file changes in the repo — commit and push them like code, and `git pull` brings updates from the cron/CI side into Obsidian.

## Option B — Symlink into your existing vault

Keeps one vault for everything; the notes still live (and version) in the repo:

```bash
# macOS / Linux
ln -s /path/to/wealth-pulse/docs "/path/to/YourVault/WealthPulse"

# Windows (admin PowerShell)
New-Item -ItemType Junction -Path "C:\YourVault\WealthPulse" -Target "C:\path\to\wealth-pulse\docs"
```

## Option C — Obsidian Git plugin (auto-sync)

If you want the vault to pull/push automatically:

1. Use Option A or B so the notes are inside a git working copy.
2. Install the community plugin **"Git"** in Obsidian.
3. Set an auto-pull/auto-commit interval (e.g. 30 min).

> [!tip]
> The vault index is [[Home]]. Start there.
