---
name: seoboost-react-peer-dep-docker-trap
description: Use when a Docker/CI container crash-loops on startup with "Cannot find package 'X'" / "Cannot find module 'X'" / ERR_MODULE_NOT_FOUND for a dependency the code didn't touch, especially when older deploys worked and only a fresh-cache rebuild fails, or when a peerDependency (react, react-dom, etc.) is imported at runtime but missing from the project's own dependencies. Triggers — "container crash-loop", "Cannot find package", "deploy lama OK rebuild gagal", "works for weeks then breaks".
metadata:
  type: reference
---

# The peer-dependency Docker rebuild trap

## Overview

A package you depend on declares `X` as a **peerDependency** and **imports it eagerly at
load time** (e.g. `@react-pdf/renderer` does `import React from 'react'`). Your own
`package.json` does NOT list `X` in `dependencies`. For weeks deploys work — because `X`
happens to be present (hoisted by another dep, or in a warm Docker layer cache, or
installed before someone pruned it). Then a **fresh-cache CI rebuild** resolves the tree
from scratch, `X` isn't there, and the container **crash-loops on startup** with
`Cannot find package 'X'` — even though no related code changed.

**Core principle:** declare what you import. A peerDependency is the *consumer's*
responsibility to install. Relying on hoisting or build cache to supply it is a latent
bug that detonates on the next clean build — a success that lies until rebuilt.

## Why it lies for weeks then breaks

| Why it worked | Why it suddenly breaks |
|---|---|
| `X` got **hoisted** to top-level `node_modules` by some other dependency | A version bump elsewhere changes who hoists what; `X` no longer lands resolvable |
| The Docker **layer that installed deps was cached** from when `X` was present | Fresh CI runner / cache bust / `--no-cache` → deps reinstall without `X` |
| `X` was reachable only via a **devDependency** subtree | `npm ci --omit=dev` / `--production` prunes that subtree → `X` gone |
| Old lockfile state included `X` transitively | Lockfile regenerated / `npm install` re-resolves differently |

The trigger is almost always **environmental** (cache, runner, prune flag), not a code
change — which is exactly why it's hard to spot.

## The fix

Add the imported package to your project's **own `dependencies`** with a version inside
the peer range, regenerate the lockfile, rebuild from clean:

```jsonc
// package.json — react is a peerDep of @react-pdf/renderer, imported at runtime → declare it
"dependencies": {
  "@react-pdf/renderer": "^4.3.2",
  "react": "^18.3.1"          // do NOT remove "because it's frontend-only" — react-pdf needs it on the BE
}
```

> Check the package's actual peers first: `node -e "console.log(require('PKG/package.json').peerDependencies)"`.
> Declare every peer you rely on at runtime (some packages peer on `react` AND `react-dom`;
> react-pdf v4 peers on `react` only).

## The audit (turn uncertainty into a command)

Don't guess whether the tree is safe — prove it. A clean install + resolve check is the
only honest test:

```bash
# 1. Every runtime peer must resolve. Empty/"unmet peer"/"missing" = the bug, pre-crash.
npm ls react                 # or the package in the error; want a resolved version, not UNMET
npm ls --all 2>&1 | grep -i "unmet\|missing" || echo "no unmet peers"

# 2. Reproduce the PRODUCTION install in a clean tree (this is what CI does on a fresh runner):
rm -rf node_modules
npm ci --omit=dev            # same flags as your Dockerfile's prod stage
node -e "require('@react-pdf/renderer')"   # eager import — throws here if a peer is missing

# 3. Best gate: boot the built image in CI and hit /health BEFORE promoting (catches it for real).
```

Wire #2 into CI: a fresh `npm ci --omit=dev` + a smoke import/boot is the difference
between catching this in the pipeline and a production crash-loop. (`--legacy-peer-deps`
silences peer *warnings* during install — it does NOT add missing runtime deps, so it can
mask the warning while leaving the crash intact. Don't let it lull you.)

## Common mistakes

- **Diffing application code looking for a regression.** Nothing in the code changed; the
  **resolved dependency tree** changed (invisible unless you diff the lockfile or run
  `npm ls`). Check `npm ls X` first, not `git log`.
- **"It's a frontend package, the backend doesn't need it."** If a backend dep
  `import`s it at load, the backend needs it in `dependencies`. Removing it is what plants
  the bug.
- **Blaming `--omit=dev` and dropping the flag.** That masks it; the package belongs in
  `dependencies`, not `devDependencies`.
- **Trusting a green deploy that ran off a warm cache.** Warm cache ≠ correct tree. Only a
  fresh `npm ci` proves it.
- **Assuming `--legacy-peer-deps` / `--force` fixed it** because install stopped warning —
  the warning is gone but the runtime import still fails.

## Real-world impact

A NestJS backend (Project F, 2026) used `@react-pdf/renderer` for report PDFs. `react` had
been removed from `dependencies` as "frontend-only." Deploys passed for weeks on cached
Docker layers; the first fresh-cache rebuild crash-looped with `Cannot find package
'react'`. Fix: re-add `react@^18.3.1` to `dependencies`; audit with `npm ls react`. The
class generalizes to any eager-imported missing peer behind a build cache.
