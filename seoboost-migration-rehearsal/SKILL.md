---
name: seoboost-migration-rehearsal
description: Use before shipping a Postgres migration or RLS change to production for a multi-tenant app — rehearse it on a throwaway clone so the prod run is a replay, not a first attempt. Triggers on "new migration", "RLS change", "verify tenant isolation", "is this migration safe", "expand-backfill-contract", or any prod schema change with row-level security. Reference for the replay recipe + the role/GUC traps that make a green gate lie.
---

# seoboost-migration-rehearsal

## Overview

A migration that aborts halfway, or an RLS policy that's silently bypassed, must surface on a clone — not in the prod store-closed window. This skill is the recipe to replay the migration chain + run the tenant-isolation gate against a throwaway DB, plus the role/session-variable traps that make a "green" gate meaningless.

**Core principle:** A rehearsal is a true replay only if it (a) applies migrations the way prod actually does, (b) on real-shaped data so the migration's own safety guards fire, (c) as the table OWNER, while (d) the isolation gate runs as the non-superuser RUNTIME role. Get the role/GUC wrong and a green gate proves nothing.

**Type:** Reference. The *why* (verify before prod) is assumed; this gives the *how* + the traps.

## When to Use

- About to ship a migration to a multi-tenant Postgres app with RLS (per-tenant policy keyed on a session GUC like `app.current_tenant`; app connects at runtime as a non-superuser role, e.g. `app_rls`).
- An expand-backfill-contract cutover, a new RLS policy, or any schema change where tenant isolation could regress.

**NOT for:** a single-tenant app with no RLS, or a trivial additive column with no policy/NOT-NULL interaction (rehearsal is overkill there).

## The replay recipe

### 1. Build the clone + apply the chain the way PROD does
**Check first: does prod use `drizzle-kit migrate`, or a raw `*.sql` loop with a custom ledger?** Many SEO Boost deploys apply raw `.sql` files in filename order, each in its own transaction, tracked in an `_app_migrations` table — NOT Drizzle's runner. A faithful replay reproduces *that loop*, not `drizzle-kit`.

```bash
# Throwaway PG matching prod's engine (e.g. postgres:16-alpine)
docker run -d --name <app>-rehearsal -p 5499:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=pg -e POSTGRES_DB=<db> postgres:16-alpine

# Load a prod-shaped snapshot at prod's CURRENT ledger point (real orphan data is the point)
#   pg_dump --no-owner --no-privileges --format=plain <PROD_URL> | gzip > snap.sql.gz
gunzip -c snap.sql.gz | docker exec -i <app>-rehearsal psql "postgresql://postgres:pg@localhost:5432/<db>" -v ON_ERROR_STOP=1

# Apply pending chain with prod's loop: ledger table + per-file BEGIN/COMMIT + ON_ERROR_STOP
PG='postgresql://postgres:pg@localhost:5499/<db>'
psql "$PG" -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS _app_migrations(id bigserial PRIMARY KEY, filename text UNIQUE, applied_at timestamptz DEFAULT now());"
for f in drizzle/migrations/*.sql; do n=$(basename "$f")
  [ "$(psql "$PG" -tAc "SELECT 1 FROM _app_migrations WHERE filename='$n';")" = "1" ] && continue
  echo "apply $n"; psql "$PG" -v ON_ERROR_STOP=1 -f "$f" && psql "$PG" -c "INSERT INTO _app_migrations(filename) VALUES('$n');"
done
```
`ON_ERROR_STOP=1` + each file's internal `BEGIN/COMMIT` means a mid-file abort rolls back with **no ledger row** → fix-and-rerun replays cleanly, exactly like prod. If you can't pull a real dump, hand-seed orphan rows (NULL tenant id + exactly one `role='owner'` user) or the rehearsal proves nothing about the backfill.

### 2. Roles: apply as OWNER, run the gate as RUNTIME
| Step | Role | Why |
|---|---|---|
| Migrations (DDL) | table **owner** (`postgres` / `MIGRATION_DATABASE_URL`) | the runtime role is deliberately NOT granted `ALTER`/ownership; it can't create policies or `SET NOT NULL`. |
| Isolation gate | **`app_rls`** (non-owner, non-superuser; `DATABASE_URL` / `TEST_APP_RLS_DATABASE_URL`) | **Postgres silently bypasses RLS for the owner and any superuser.** Run the gate as owner → every assertion passes vacuously → green means nothing. |

### 3. Run the gate against the clone
```bash
export TEST_DATABASE_URL='postgresql://postgres:pg@localhost:5499/<db>'              # owner: seed + cleanup
export TEST_APP_RLS_DATABASE_URL='postgresql://app_rls:<pw>@localhost:5499/<db>'     # the role under test
NODE_OPTIONS='--max-old-space-size=2048' npx jest src/rls-isolation.e2e.spec.ts --maxWorkers=1 --workerIdleMemoryLimit=768MB --silent
pkill -f jest 2>/dev/null; sleep 1
```
The gate sets `set_config('app.current_tenant', $org, true)` (transaction-local) per query, seeds both orgs on the owner connection, and asserts (the typical 6): forgotten-WHERE scopes to own rows; WITH CHECK rejects cross-tenant INSERT; cross-tenant UPDATE affects 0 rows; unset GUC (empty **and** never-set) → 0 rows (fail-closed); owner sees ALL rows (proves the runtime-role requirement).

### 4. After the chain — confirm policies are actually forced
```sql
SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname IN ('sales','products'); -- both true
SELECT count(*) FROM pg_policies WHERE policyname='tenant_isolation';                                    -- one per tenant table
```

## A migration's safety guard aborts mid-rehearsal — bug or feature?

**Feature. It's a fail-closed interlock doing its job.** E.g. `CONTRACT ABORT: table X still has N rows with NULL organization_id — run the backfill first`, or `BACKFILL ABORT: found N users with role=owner (need exactly 1)`. It means your clone reached the enforce/contract step with un-backfilled or ambiguous-owner data — exactly what would corrupt prod.

**Fix the DATA precondition, never weaken the guard:**
1. Inspect: `SELECT count(*) FROM "user" WHERE role='owner';` and per-table `SELECT count(*) FROM <t> WHERE organization_id IS NULL;`.
2. Owner count ≠ 1, or remaining NULLs → that IS the finding; resolve in the **source** data (prod's owner state must look the same). The guard's header usually says "resolve manually."
3. Re-run the loop — the aborted file left no ledger row, so it replays from its top cleanly.
4. The whole value: this abort surfaces HERE, not in prod.

## The role/GUC traps that make a green gate a lie

1. **Gate as owner/superuser → meaningless.** RLS isn't evaluated for them. Verify the connection under test: `SELECT current_user;` then `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user;` — **both must be false.** `rolbypassrls=true` is the silent killer: policies exist but are skipped.
2. **GUC must be transaction-local on the RUNTIME path, not just the gate.** The policy is `organization_id = current_setting('app.current_tenant', true)`. On a pooled connection, a GUC set **session-wide** (`set_config(..., false)`) **leaks tenant A's value to the next checkout running tenant B** — silent cross-tenant exposure the gate (which sets-then-queries in one tx) would NOT catch. Confirm the runtime sets it with `set_config(..., true)` / `SET LOCAL` inside a per-request transaction (e.g. a `runInTenant` wrapper). This is the trap the gate can't see for you.
3. **`FORCE` is necessary, the role is what enforces.** `ENABLE ROW LEVEL SECURITY` alone leaves the owner unconstrained; `FORCE` extends policies to the owner too — but the operative guarantee is still that the runtime connects as the non-owner. Confirm both flags after the chain (step 4).

## Common Mistakes

| Mistake | Fix |
|---|---|
| Replay with `drizzle-kit migrate` | If prod uses a raw `_app_migrations` loop, reproduce THAT or the replay isn't faithful. |
| Empty/synthetic clone with no orphan rows | The backfill/contract guards never fire — restore real prod-shaped data. |
| Run the gate as `postgres` | RLS bypassed for owner → vacuously green. Run as `app_rls`, assert `rolsuper/rolbypassrls=false`. |
| Weaken a migration guard to finish the rehearsal | The guard caught a real data precondition. Fix the data at source, re-run. |
| Trust the gate but ignore the runtime's GUC scope | A session-wide GUC on a pooled conn leaks across tenants; the gate won't catch it. Verify `SET LOCAL` in the runtime path. |
