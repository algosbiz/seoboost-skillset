---
name: seoboost-mock-check
description: Use when about to claim an auth, payments, or external-SDK feature works based on tests that mock that SDK — impersonation, role guards, session/cookie swaps, webhooks, charges. Triggers when unit tests are green but the integration is unproven, "the mock returns success", "green CI but prod fails", "should I mock this SDK?", or before merging anything where a mocked dependency is the system under test. Reference recipe for the live e2e + the gotchas that bite.
---

# seoboost-mock-check

## Overview

When you mock the SDK that IS the feature, your tests verify your understanding of the mock — not the real dependency's behavior. The mock answers "success" to inputs the real SDK rejects, so a full green suite ships a broken feature. The fix is one real path; this skill is the **recipe + landmine list** for running it, so you don't re-derive a multi-hour investigation each time.

**Core principle:** A green suite that mocks the system under test is not evidence the feature works. Prove the security/identity boundary against the real dependency, with your own eyes, before claiming done.

**Type:** Reference. The *why* (verify-before-completion, defense-in-depth) is assumed; this gives the *how*.

## When to Use

- A feature built on an auth/payments/external SDK (better-auth, Stripe, Clerk, Passport, an email/storage provider) is "done" with mocked unit tests.
- The dangerous behavior lives in the dependency: a guard denying, a charge succeeding/failing, a session flipping, a webhook signature verifying.
- Symptoms: "tests pass but it's broken", "the mock returns success", green CI ahead of a prod incident.

**NOT for:** pure-logic features with no external dependency (mocks are fine there), or deciding *whether* to test (you already know you should — this is the how).

## The Iron Rule

**At least one live path against the real dependency before "done".** Mocked tests are the floor (fast wiring checks), never the ceiling. The single most important behavior — the security/identity boundary — must have real coverage. If you only afford one live test, make it the **negative** one (the real guard actually denying).

## Recipe: live e2e for an auth/impersonation-style feature

Concrete because the gotchas live in the details. Adapt nouns to your stack.

### 1. Pick the altitude — boot the app, don't call the service
Drive the **real HTTP route through the real guards**, not the service in isolation:
```ts
const app = (await Test.createTestingModule({ imports: [AppModule] }).compile())
  .createNestApplication();
app.setGlobalPrefix('api');
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
await app.init();
```
Calling the service directly skips the guards — and the guard (denial) case is the whole point. The SDK call stays in-process either way; booting the app just puts the real guards in front of the controller.

### 2. Real throwaway DB, migrated the way prod is
```bash
docker run -d --name <app>-e2e-pg -p 55432:5432 \
  -e POSTGRES_PASSWORD=e2e -e POSTGRES_DB=<app>_e2e postgres:16
```
Apply the **real migration ledger** (don't hand-create tables — that tests a schema you don't ship). Create the runtime role (`app_rls`) + RLS policies exactly as prod.

### 3. Env BEFORE the SDK imports
The auth SDK is a module-level singleton built from `process.env` at import. Set env in jest `setupFiles` (runs before the module graph), never in the test body:
```
DATABASE_URL=postgres://postgres:e2e@localhost:55432/<app>_e2e
BETTER_AUTH_SECRET=<32+ bytes>
BETTER_AUTH_URL=http://localhost:3001   # localhost ⇒ cookies stay Lax/non-Secure (see landmines)
```

### 4. Seed real principals through the SDK's own sign-up
Three users via `auth.api.signUpEmail` (+ role/membership), NOT raw INSERTs: a **super-admin**, a **real admin-capable owner** (the impersonation target — must be a real owner, see landmine 1), and an **under-privileged** user. Raw-inserting a fake session is the #1 way these tests pass while testing nothing. Reuse existing `provision-*.ts` scripts if present.

### 5. The three assertions that justify the exercise

**Negative (the most important):** under-privileged user → real guard denies → AND no side effect.
```ts
await request(server).post(`/api/superadmin/impersonate/${ORG}`)
  .set('Cookie', cashierCookie).send({ reason: 'x' }).expect(403);
// then: SELECT count(*) FROM impersonation_audit WHERE organization_id=$1 → 0
```
Plus 401 (no cookie) and 403 (no consent grant) variants. Each must leave **zero** audit rows (the gate runs before the insert).

**Audit landed (not "logger called"):** query the real table with a fresh `pg.Pool`:
```ts
const { rows } = await probe.query(
  `SELECT impersonator_user_id, impersonated_user_id, reason, ended_at
   FROM impersonation_audit WHERE organization_id=$1 ORDER BY started_at DESC LIMIT 1`, [ORG]);
expect(rows[0].impersonator_user_id).toBe(SUPERADMIN_ID); // not resolveId→owner
expect(rows[0].ended_at).toBeNull();                       // open on start
```
After stop: same row `ended_at` not null, and open-row count for that impersonator back to 0.

**Session flipped + reverted (not "a string changed"):** forward the Set-Cookie to a real `get-session`, use `request.agent` as a cookie jar:
```ts
// with impersonate cookies: get-session → user.id=OWNER, session.impersonatedBy=SUPERADMIN
// after stop, with post-stop cookies: user.id=SUPERADMIN, impersonatedBy=null
// and: a super-admin-only route returns 200 again (original session restored, not degraded)
```

### 6. Teardown (always)
`afterAll`: `app.close()` + end every pool. Then `docker rm -f <app>-e2e-pg; pkill -f jest; sleep 1`.

## Better-auth landmines (the checklist that's easy to miss)

1. **`YOU_CANNOT_IMPERSONATE_ADMINS`** — better-auth refuses to impersonate any user whose role ∈ `adminRoles`, by default. Tenant owners usually qualify → grant the super-admin role the `impersonate-admins` permission. **The target MUST be a real admin-capable owner**, or the e2e dodges the exact bug. (This is the bug a mocked test cannot see.)
2. **`getSetCookie()` needs Node/undici `Headers`, not jsdom** — set `testEnvironment: "node"` or the service's `res.headers.getSetCookie()` throws `TypeError`.
3. **`returnHeaders: true` is load-bearing** — it's the only thing carrying the Set-Cookie. Drop it and the session flips server-side but the browser never does; a mocked test misses this. The cookie-flip assertions catch it.
4. **`Secure`/`SameSite=None` vs loopback** — keep `BETTER_AUTH_URL=http://localhost…` so cookies stay non-`Secure`; supertest's HTTP loopback never stores `Secure` cookies (assertions fail for the wrong reason).
5. **Class-level guard during altered session** — an endpoint reachable *while impersonating* (e.g. `stop-impersonating`) must NOT carry the super-admin guard: mid-impersonation the session is the owner. Use per-method guards; test stop with the *impersonation* cookies, not super-admin cookies.
6. **Import-order/env trap** — anything importing the auth module before env is set builds the SDK against the wrong DB. `setupFiles`, not the test body.
7. **Open handles** — the SDK's pool keeps the event loop alive; end pools in `afterAll`, `--forceExit` only as a backstop.

## Quick Reference

| Need to prove | Real-path assertion |
|---|---|
| Unauthorized denied | real guard → 403/401 **and** zero side-effect rows |
| Audit persisted | `SELECT` the real row, assert ids/reason/`ended_at`, not a spy |
| Session swapped | `get-session` via cookie jar → target id + marker, then reverted |
| Charge/webhook | hit the provider's sandbox, assert provider-side state, not the mock's return |

## Common Mistakes

| Mistake | Fix |
|---|---|
| "18 green + clean build = done" | Mocked-green proves wiring, not the boundary. Add the live negative path. |
| Calling the service directly | Skips the guards — boot the app, drive HTTP. |
| Raw-INSERT a fake user/session | Seed through the SDK's sign-up so guards read real rows. |
| Spying that the logger/INSERT was called | Query the real table with a fresh connection. |
| Decoding the cookie string yourself | Use the cookies on a real who-am-I call. |
| Target is a throwaway non-admin | Make the target a real owner or you dodge `IMPERSONATE_ADMINS`. |
