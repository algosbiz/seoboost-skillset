---
name: seoboost-deploy-queue
description: Use when shipping a feature to production that spans a backend (with a DB migration) and a frontend in separate push-to-deploy repos — deciding merge order, what to verify between steps, and how to roll back. Triggers on "merge to production", "deploy this feature", "push the migration", "ship to main", or any coupled FE+BE+migration release. Reference for the safe sequence + per-phase gates.
---

# seoboost-deploy-queue

## Overview

Two repos deploy independently; there is always a window where one is live and the other isn't. You don't get to avoid the mismatch — you get to **choose which one**. This skill is the concrete safe sequence + the gate to clear at each boundary, so a migration failure can never strand a deployed frontend.

**Core principle:** Deploy the tolerant half first (backend, additive migration — old FE survives it), the demanding half last (frontend — new UI dies against old BE). Verify the *currently-live other half* still works at every step. The frontend, instantly revertible with no schema state, goes last on purpose.

**Type:** Reference. Assumes you already know to verify before claiming done; this gives the exact order + gates.

## When to Use

- A feature spans BE (NestJS, with a migration) + FE (Next.js) in **separate** push-to-deploy repos (GitHub Actions, push-to-`main`).
- The migration is part of the BE deploy pipeline; the FE calls the new BE endpoints.

**NOT for:** a single repo, a no-migration change, or a destructive/renaming migration (that needs expand-backfill-contract first — see the load-bearing check below).

## The load-bearing precondition

**The migration MUST be additive-only** (new tables, new nullable/defaulted columns). Additive = backward-compatible: the old FE that's still live during the window ignores what it doesn't know about.

If the migration **drops / renames / narrows / adds NOT NULL to an existing column** → STOP. BE-first does NOT make it safe; the still-live old FE breaks. Use expand-backfill-contract (ship the additive expand, backfill, deploy both, then a later contract migration) instead. Inspect the migration file and confirm additive before proceeding.

## The sequence

### Phase 0 — Pre-flight (before touching `main` on either repo)
All gates green, fresh evidence (run now, not cached):
- [ ] Migration is **additive-only** (inspected the file).
- [ ] BE: build + lint + typecheck + tests pass on the feature branch.
- [ ] FE: build + lint + typecheck + tests pass on the feature branch.
- [ ] Rollback known: the `down`/revert SQL or the previous commit to redeploy.
- [ ] DB backup/snapshot will be taken before migrate (most SEO Boost deploy.yml does this automatically — confirm the step exists).
- [ ] You can watch the BE Actions run + see migration output.

Any red gate → don't start.

### Phase 1 — Backend first, watch the migration
1. Merge BE feature → `main` (`--no-ff`). This triggers deploy + runs the migration.
2. **Watch the Actions run to completion** — the migration runs here. Fails → STOP, do not deploy FE, go to rollback.
3. **Gate — BE live + correct (all of):**
   - Actions run green end-to-end; "Apply migrations" + "Backup" steps succeeded.
   - Migration applied: the new migration is the latest in the `_app_migrations` ledger; new tables/columns exist in prod.
   - **Probe a new endpoint** against prod (curl): unauthenticated → 401/403 (deployed+gated), NOT 404. Swagger/docs lists the new routes.
   - **Old FE still works:** load the currently-live prod FE, exercise a critical existing flow — must be unaffected (this catches a migration that wasn't as backward-compatible as you thought).

Only when ALL pass → Phase 2.

### Phase 2 — Frontend second
1. Merge FE feature → `main`. Triggers FE deploy (+ Cloudflare cache clear if configured).
2. **Watch the Actions run** — green end-to-end.
3. **Gate — full feature live:**
   - FE loads, no white screen (a white screen is often an unguarded `localStorage`/storage-partition read, NOT the deploy — check the console before blaming the deploy).
   - **Walk the new feature end-to-end through the UI** against prod: renders, calls new endpoints, real data back, writes succeed.
   - Existing critical flows still work (regression sweep).
   - BE logs clean of 4xx/5xx from the new endpoints under real FE traffic.

### Phase 3 — Close
- `git status` clean both repos, 0 ahead/0 behind origin.
- Update memory / `05-CURRENT-STATE.md`: deployed commits, migration confirmed, anomalies.

## Rollback decision tree

| Failure | Action |
|---|---|
| Phase 1 migration step fails | Schema maybe half-applied → restore from snapshot or run revert SQL. Do NOT deploy FE; old FE+old BE still live, users unaffected. |
| Phase 1 BE code deployed but endpoint misbehaves | Revert BE `main` to previous commit, redeploy. **Additive migration can stay** — old code ignores the new tables/columns. Usually no need to roll back the migration. |
| Phase 2 FE fails | Revert FE `main` to previous commit, redeploy → instant known-good UI back. BE stays (it's backward-compatible). Clean, fast, low blast radius — the reason FE goes last. |

## Why this order (the asymmetry)

Additive BE changes are backward-compatible (old FE survives them); FE changes that call new endpoints are NOT forward-compatible (new FE 404s against old BE). Deploy the tolerant half first, the demanding half last, verifying the live other half at each boundary. FE — instantly revertible, no schema state — is the safest last step.

## Common Mistakes

| Mistake | Fix |
|---|---|
| FE first, or both at once | New UI 404s against old BE during the window. BE first, always. |
| Assuming "additive" without reading the migration | A rename/drop/NOT-NULL breaks the live old FE. Inspect it; if destructive, use expand-contract. |
| Merging FE before BE migration verified green | A failed migration + deployed FE = broken prod. Gate Phase 1 fully first. |
| "Endpoint works" without checking old FE still works | That's the gate that catches a non-backward-compatible migration. |
| Rolling back an additive migration to roll back code | Unnecessary — old code ignores additive schema. Revert the commit, leave the schema. |
