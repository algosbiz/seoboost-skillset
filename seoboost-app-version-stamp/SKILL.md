---
name: seoboost-app-version-stamp
description: Use when deciding or displaying a web app's version across SEO Boost projects — choosing a MAJOR/MINOR/PATCH bump, showing "v1.2.0" in a footer/settings, adding a build stamp, wiring a post-deploy "did it actually ship" tripwire, or setting up version detection groundwork for a PWA. Triggers — "app versioning", "bump version", "semver", "version.json", "footer version", "what version are we on", "release number". For the PWA update banner itself see seoboost-pwa-update-prompt.
metadata:
  type: reference
---

# SEO Boost app versioning standard + zero-touch build stamp

## Overview

The SEO Boost house standard for **application** versioning (the running web app), distinct
from the document-versioning convention (`<Slug>_v1.4_DATE.pdf` for client files). Two
parts: (1) a SemVer **decision rule** anyone can apply without agonizing, and (2) a
**zero-touch build stamp** (`version.json` + a baked `NEXT_PUBLIC_APP_VERSION`) that needs
no git and no CI/Dockerfile changes.

**Core principle:** the version of record is `package.json`'s `version` (SemVer). Display
`v1.2.0` to users; the build stamp's `builtAt` is the "this deploy actually shipped"
tripwire. FE and BE version **independently** (one per repo).

## The SemVer rule (app, not a library)

A deployed app has no public API, so re-anchor the numbers to **user/operational impact**.
Apply top-down, first match wins:

| Bump | When | Examples |
|---|---|---|
| **MAJOR** | User must relearn/re-onboard, OR an irreversible data migration ships | redesigned nav/IA, removed feature, auth model change (sessions invalidated), destructive DB migration |
| **MINOR** | New functionality or visible enhancement, backward-compatible | new page/report, new export, new settings, additive DB column |
| **PATCH** | Everything else (the default) | bug fix, copy/style tweak, perf, dep bump, refactor |

- **Pre-production:** stay on `0.y.z` until the first production deploy; features→MINOR,
  fixes→PATCH, don't agonize over MAJOR. First production release = `1.0.0`.
- **`v` is display-only.** `package.json` holds `1.4.2`, never `v1.4.2`.
- **Don't lockstep FE and BE** — a BE-only fix bumps BE PATCH, FE untouched.
- **Bump marks a release, not a commit.** Many commits share the in-progress number until
  it ships. Low-ceremony: bump at the (already-gated) production release via
  `npm version <patch|minor|major>` (updates package.json + creates the `vX.Y.Z` git tag).
  Staging deploys need **no** bump — they just carry whatever the number currently is.

## The zero-touch build stamp

Update *detection* (the PWA banner) is the service worker's job (see
[[seoboost-pwa-update-prompt]]) — the SW manifest byte-diff is the real signal, needs no SHA.
So the stamp here is **only** for human display + a deploy tripwire, and is deliberately
SHA-free so it works on any build (no git in the Docker context, no CI edit).

`scripts/gen-version.mjs` (copy-paste; identical across projects):

```js
#!/usr/bin/env node
// Writes public/version.json = { version, builtAt }. version from package.json,
// builtAt = build time. No git, no env, no CI/Dockerfile change. Runs as prebuild.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let version = '0.0.0';
try { version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version || version; } catch {}
const payload = { version, builtAt: new Date().toISOString() };
try {
  mkdirSync(join(root, 'public'), { recursive: true });
  writeFileSync(join(root, 'public', 'version.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log('[gen-version]', JSON.stringify(payload));
} catch (e) {
  console.warn('[gen-version] skipped:', e.message); // never fail the build over a stamp
}
```

Each project adds **one** script line + bakes the value for the client (single source, no
drift):

```json
// package.json
"scripts": { "prebuild": "node scripts/gen-version.mjs" }
```

```js
// next.config.js — read the stamp back so the footer matches version.json exactly
const fs = require('fs'), path = require('path');
let v = { version: '0.0.0', builtAt: '' };
try { v = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/version.json'), 'utf8')); } catch {}
// in nextConfig:
env: { NEXT_PUBLIC_APP_VERSION: v.version, NEXT_PUBLIC_BUILT_AT: v.builtAt },
```

`.gitignore`: add `public/version.json` (build artifact, never source).

Display anywhere: `process.env.NEXT_PUBLIC_APP_VERSION` → `v{...}` in a footer/settings.

## Tripwire (the one check that catches silent staleness)

`builtAt` changes on **every** build unconditionally. After a deploy:

```bash
curl -fsS https://<host>/version.json   # assert builtAt differs from the previous deploy
```

- `builtAt` unchanged across two deploys → the **prebuild didn't run** (build cached / path
  wrong). Fix the build, not the script.
- This is the canary that the new build actually shipped — independent of the SW.

## Staging vs production (SemVer syntax, done right)

Keep the environment OUT of the SemVer number; carry it separately.

- **Production:** display `v1.4.2`.
- **Staging:** display `v1.4.2 · staging` (channel is a deploy property — an env var /
  separate field, not part of the version). If you ever need it *in* the string, it's
  **build metadata** after a `+` (`1.4.2+staging`, ignored for precedence), never a
  pre-release after a `-` (`1.4.2-staging` sorts BELOW prod — wrong).

## Common mistakes

- **`v` or a SHA stored in `package.json` version** — it holds bare `1.4.2`.
- **SHA/env in the pre-release slot** (`1.4.2-staging`, `1.4.2-a1b9c3f`) → sorts below the
  real release. Use build metadata (`+`) if you must.
- **Computing the displayed version separately from version.json** → drift (footer says one
  thing, file says another). Read the file back once; one source.
- **Committing `public/version.json`** → served stale. Gitignore it.
- **Lockstepping FE and BE versions** "to look tidy" → you end up lying with one of them.
- **Trying to stamp a git SHA in a Docker build where `.git` is excluded / alpine has no
  git** → either the build fails or `commit` is silently `unknown`. Don't. Detection
  doesn't need the SHA (the SW handles it); the stamp is version + builtAt only.

## Real-world impact

Established as the SEO Boost cross-project standard (2026, Project F) after a release-eng/PWA/DevOps
council. Proven on Project F: `prebuild` writes `version.json`, `next build` bakes
`NEXT_PUBLIC_APP_VERSION`, `1.0.0`→`1.0.1` bump tracked live, builtAt tripwire confirmed the
deploy shipped — all with zero CI/Dockerfile changes. Pairs with [[seoboost-pwa-update-prompt]]
for the update banner.
