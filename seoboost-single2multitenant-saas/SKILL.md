---
name: seoboost-single2multitenant-saas
description: Use when converting an app that is ALREADY single-tenant and LIVE in production with real client data into a multi-tenant SaaS — the hardest variant, not greenfield. Triggers on "make this multi-tenant", "onboard a second client/tenant", "add tenant isolation to a live app", "single to multi-tenant", "multi-tenant cutover", or before the next SEO Boost product repeats the conversion. Battle-tested playbook (shared DB + RLS) + a copy-paste server-side activation prompt.
---

# seoboost-single2multitenant-saas

## Overview

Slipping multi-tenancy *under the feet* of a live single-tenant app — without losing or corrupting the existing client's data — is the hardest variant. This skill is the battle-tested playbook (proven on a real production POS: one tenant's ~400 sales preserved byte-for-byte) so the next SEO Boost product doesn't repeat the multi-day learning curve + the production bugs.

**Core principle:** Expand → backfill → contract as separate gated, reversible deploys; shared DB + `organization_id` everywhere + Postgres RLS as the mandatory net; **runtime connects as a non-owner role or RLS is silently theater.** Rehearse the whole chain on a real prod clone, prove byte-for-byte immutability + the RLS gate, before prod.

**Type:** Reference / playbook. Opinionated on ONE proven approach. The *why* (verify, defense-in-depth) is assumed.

## When to Use

- An app that is **already single-tenant and LIVE** with real client data must become multi-tenant SaaS (onboard a 2nd tenant) on a shared DB.
- Stack like NestJS + Postgres + better-auth + Drizzle (adapt nouns otherwise).

**When NOT to use (1-paragraph alternative):** For a one-off or two-tenant case where operational simplicity beats density, run **one isolated instance/deployment per tenant** — zero schema surgery, fastest and safest short-term. Reserve this shared-DB+RLS route for genuinely many tenants on flat ops cost, where you can absorb the schema retrofit + a strict isolation audit. A single forgotten `WHERE organization_id` is a cross-tenant leak — that's why RLS here is non-negotiable, not optional.

## Required sub-skills (do NOT duplicate them — invoke them)

- **REQUIRED SUB-SKILL:** `seoboost-migration-rehearsal` — for Phase R (rehearse the chain + run the RLS gate on a prod clone). This skill assumes you run that.
- **REQUIRED SUB-SKILL:** `seoboost-deploy-queue` — the expand/backfill/contract deploys obey its BE-first, gate-per-phase, rollback-tree discipline.
- **REQUIRED SUB-SKILL:** `seoboost-mock-check` — the isolation bugs here are caught only by DB-backed e2e, never by mocked unit tests. The aggregate/constraint queries each need a real-DB regression spec.

## Phase 0 — Readiness audit (confirm, don't assume)

1. **Prove it's truly single-tenant:** grep the schema + EVERY existing migration for `company_id|tenant_id|organization_id` — confirm ZERO exist. Verified, not assumed.
2. **Global UNIQUE census:** find every global `UNIQUE(name|code)` — there are usually *more* than you think. Each becomes a cross-tenant collision once shared.
3. **Map parent→child for org derivation:** top-level tables get `organization_id` directly; children derive it from a parent FK. Write the actual chains, e.g. `sale_items ← sales (sale_id)`, `product_variants ← products (product_id)`, `stock_mutations ← product_variants (variant_id)` — **2 hops**. Watch polymorphic refs: if a child has a `NOT NULL` FK to a real parent, derive via that, ignore the polymorphic `refType/refId`.
4. **Owner discriminator for backfill:** how do you identify the single existing tenant's owner (e.g. `user.role='owner'`, exactly one) vs cashiers? The backfill aborts if this is ambiguous.
5. **Check the migration runner's atomicity contract** (decisive — see footgun F4).

## Phase 1 — Architecture (the locked decisions)

| Aspect | Decision |
|---|---|
| Isolation | Shared DB + `organization_id text` on every business table + RLS (ENABLE **and** FORCE) |
| Tenant key | better-auth `organization.id` (text), denormalized onto child tables too (RLS without joins) |
| Auth | better-auth **organization plugin** (per-org membership/role) + admin plugin (super-admin) |
| Authority | per-org **`member.role`**, FAIL-CLOSED — no membership ⇒ no owner (never global `user.role`) |
| DB roles | **runtime = `app_rls`** (non-owner, non-superuser, DML-only); **migrations = owner** |
| Connection strings | TWO: `DATABASE_URL`→app_rls (runtime), `MIGRATION_DATABASE_URL`→owner (CI DDL) |
| Per-request scope | `set_config('app.current_tenant', $v, true)` — transaction-local, first stmt in a `runInTenant` tx |
| Onboarding | Phase 1 admin manual provision + invite; self-service later |

## Phase 2 — Expand → Backfill → Contract (the migration chain)

Separate ledger-tracked deploys; app keeps serving between phases; each reversible until tenant #2 writes.

- **EXPAND** — `ADD COLUMN IF NOT EXISTS organization_id text` NULLABLE on all business tables (old code runs with NULL). Convert each global unique → `UNIQUE(organization_id, col)`. Defer a singleton table's `UNIQUE(organization_id)` to CONTRACT (the one existing NULL-org row would block it). Wrap in `BEGIN;…COMMIT;`. **Rollback:** drop columns + re-add global uniques.
- **ORG + ROLE** — better-auth org/member/invitation tables; create `app_rls LOGIN` (placeholder password) guarded by `IF NOT EXISTS pg_roles`; `GRANT SELECT,INSERT,UPDATE,DELETE` on business tables AND on better-auth tables; `GRANT … ON ALL SEQUENCES`; **`ALTER DEFAULT PRIVILEGES … GRANT … TO app_rls`** (so a future owner-created table doesn't lock the runtime out).
- **BACKFILL** (versioned, generic, idempotent, fail-closed) — NO-OP guard (skip if no NULL-org rows anywhere); **abort if owners ≠ 1**; find-or-create the org; insert a membership for every user (role from `user.role`); set `activeOrganizationId` on live sessions; stamp top-level tables then derive children from parent FKs. Every UPDATE `WHERE organization_id IS NULL`; every INSERT `ON CONFLICT DO NOTHING`/`WHERE NOT EXISTS` → re-run idempotent.
- **CONTRACT + RLS** — policies (ENABLE+FORCE, see gate below) → **zero-NULL guard** (`RAISE EXCEPTION 'CONTRACT ABORT … run the backfill first'`) → `SET NOT NULL` ×N → the deferred singleton unique → `CREATE INDEX <t>_org_idx` ×N (RLS predicate perf).

The RLS policy (identical on every business table):
```sql
ALTER TABLE "<t>" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "<t>" FORCE  ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "<t>"
  USING      (organization_id = current_setting('app.current_tenant', true))
  WITH CHECK (organization_id = current_setting('app.current_tenant', true));
```
The 2-arg `current_setting(…, true)` (missing_ok) returns NULL when unset; a cleared GUC on a pooled connection reads back `''`. No real org is NULL/`''` → **fail-closed**.

## Phase R — Rehearse on a real prod clone (mandatory, before prod)

**Use `seoboost-migration-rehearsal`.** Restore a REAL prod dump, replay the full chain the way prod does (raw `_app_migrations` loop, apply as owner), then prove:
- **Byte-for-byte immutability:** checksum the money/audit columns (everything EXCEPT org_id — e.g. `sales(id,total,signature_hash,created_by,transacted_at)`) and assert identical pre vs post. This is the trust artifact you give the next tenant.
- **Row counts identical** on every table; **zero NULL org_id**; every row scoped to the one org.
- **RLS gate 6/6 as `app_rls`** (next section).

## The RLS gate — 6 adversarial assertions (run as `app_rls`, NEVER owner)

1. **Forgotten-WHERE** — set tenant=A; `SELECT … FROM sales` with no WHERE → only A's rows.
2. **WITH CHECK** — set tenant=A; `INSERT … organization_id='B'` → rejected.
3. **Cross-tenant UPDATE** — set tenant=A; UPDATE of B's audit rows → 0 rows.
4. **Unset fail-closed (×2)** — GUC empty / never-set → 0 rows.
5. **Owner-bypass guard** — as owner → sees ALL rows (proves runtime must NOT be owner).
6. **Sanity** — app_rls + real org → real count; no tenant → 0; other org → 0.

## Phase C — Production cutover + role activation (point of no return)

The CONTRACT migration enables RLS, but **while the app still connects as owner, RLS is bypassed** (owner bypasses FORCE) — the app keeps working, not yet protected. **Repointing runtime to `app_rls` is what makes RLS real.** That's a deploy.yml + `.env` + container change, NOT SQL — the one thing the clone could not prove. Run it via the server-side template: **see `server-prompt-template.md`** (B1 set app_rls password + first RLS proof, B2 repoint `DATABASE_URL`→app_rls + RECREATE container + smoke, B3 provision tenant #2 + isolation check). Each step has its own verify + rollback.

**Point of no return = tenant #2's first write.** The only true rollback past it is the `pg_dump` taken immediately before Phase C.

## Footgun checklist (the expensive lessons — each cost real time)

| # | Symptom | Cause | Fix |
|---|---|---|---|
| F1 | RLS on+forced, app still sees all tenants | **Postgres bypasses RLS for the owner/superuser** | runtime MUST connect as non-owner `app_rls`; FORCE alone is not enough — it's the role split that enforces. |
| F2 | Can't enable RLS without breaking the runner or making it a no-op | one `DATABASE_URL` (owner) for DDL + runtime | TWO URLs: `MIGRATION_DATABASE_URL` (owner, CI) + `DATABASE_URL` (app_rls, container). |
| F3 | Request B sees request A's tenant data | plain `SET` persists on the pooled connection | `set_config(...,true)` transaction-local, inside `runInTenant`. |
| F4 | Mid-file migration failure → partial state, no ledger row, re-run double-applies | runner does `psql -f` per file, NOT `--single-transaction`; `--> statement-breakpoint` is a comment, not a tx | each cutover migration carries its OWN `BEGIN;…COMMIT;` AND every statement is idempotent. (Watch: a CONTRACT file that mixes the guard + `SET NOT NULL` may relax this — make it self-atomic.) |
| F5 | Tenant #2's FIRST insert throws `no unique/exclusion constraint matching ON CONFLICT` | unique→composite migration but app schema/upsert not updated | every unique→composite: update the Drizzle **TS schema** to the composite AND audit ALL `onConflict`/upsert targets to `(organization_id, col)`. Test against a clone, not a pushed dev DB. |
| F6 | Login / org-resolution fails-closed after RLS | RLS'd the better-auth tables (resolver reads `member` across orgs, no GUC) | RLS only the business tables; leave `user/session/account/verification/organization/member/invitation` granted-but-un-RLS'd. (Cross-tenant audit tables too.) |
| F7 | Editing `.env` doesn't change the app's DB connection | env is read at container **create**, not on restart | after the `.env` repoint, **`docker rm -f` + recreate** (or redeploy with `--env-file`), NOT `docker restart`. |
| F8 | A no-membership user becomes a global owner | admin-plugin `defaultRole:'owner'` + role normalize→owner | authority from per-org `member.role`, fail-closed; null orgRole denied. |
| F9 | Single-org user logs in, tenant guard locks them out | better-auth doesn't auto-pick the org | `session.create.before` hook sets `activeOrganizationId` when exactly 1 membership; backfill stamps existing sessions. |
| F10 | Singleton table returns the wrong tenant's row | `select().from(t).limit(1)` with no WHERE | filter by org; add its per-org unique in CONTRACT (not EXPAND). |
| F11 | A duplicate insert that used to return a friendly 400 now returns **500** | error handler matches the OLD constraint **name** by exact string (`if (err.constraint === 'products_code_unique')`); the rename to `<t>_org_<col>_unique` makes every branch miss → raw DB error re-thrown as 500 | rename is not just `onConflict` (F5): grep every `err.constraint === '..._unique'` / `error.code === '23505'` handler. Match by the meaningful **part** (`constraint.includes('variant_code')`), not the exact name, and translate ANY 23505 to a 4xx — never re-throw a raw unique-violation. Each such handler needs a regression spec. |

## Common Mistakes

| Mistake | Fix |
|---|---|
| One mega-migration | Expand/backfill/contract as separate gated deploys; reversible until tenant #2 writes. |
| Skipping the prod-clone rehearsal | `seoboost-migration-rehearsal` first — prove immutability checksum + RLS 6/6, or you find the abort in prod. |
| `docker restart` after `.env` repoint | Recreate the container (F7). |
| Trusting "the app looks fine" as isolation proof | Run the 6 gate assertions as `app_rls`; "looks fine" while running as owner is RLS theater. |
| Forgetting the composite `onConflict` audit (F5) | The new tenant's first transaction fails. Audit every upsert when a unique goes composite. |
| Auditing only `onConflict`, not constraint-**name** error handlers (F11) | A later duplicate 500s instead of a friendly 400. When a unique goes composite, its constraint NAME changes too — grep every handler that string-matches the old name. |
