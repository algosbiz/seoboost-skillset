# SEO Boost Dev Playbook — the 15 plays (full prompts)

Each play = a ready-to-fire prompt. Fill the `[SLOTS]`, paste, go.
`SKILL.md` is the map (when to use which); this file is the content.

**SEO Boost stack defaults** — use these to fill slots unless the repo says otherwise. Verify
per repo before asserting: FE Next.js + pnpm (`pnpm dev`, some repos need `pnpm dev:webpack`),
BE Node + Prisma + Postgres, deploy push-to-deploy via GitHub Actions self-hosted runner
(`prisma migrate deploy` on the server — a local `db push` does NOT reach staging).

---

## 01 — Write a Full PRD

**Use when:** a feature is agreed in principle but nobody has written down what "done" means.
**Output:** `docs/prd-[feature].md` — the artifact every later play references.

```
Write a complete PRD for the feature below.

Feature: [DESCRIBE FEATURE]
Users: [WHO USES IT]
Stack: [YOUR STACK]

Include:

* Problem statement + success metrics
* User stories with acceptance criteria
* Scope: what ships in v1, what does not
* Data model changes
* Edge cases + failure states
* Open questions for me to answer

Keep it under 2 pages. Be specific, no filler.
Save it as docs/prd-[feature].md so every later prompt can reference it.
```

**SEO Boost notes**
- This is a **working doc in the repo**, not a client deliverable. For a branded PRD/proposal
  for a client (.docx/.pdf) use `seoboost-formal-docs` instead — or write this first, then
  render it there.
- "Data model changes" on Project E = Prisma schema + a migration file. Flag it here so
  play 06 sequences the migration before the FE.
- Answer the open questions before play 04; an unanswered PRD produces a guessy spec.

---

## 02 — Create Your CLAUDE.md

**Use when:** starting on a repo that has no `CLAUDE.md`, or the existing one has gone stale.
**Output:** `CLAUDE.md` at repo root.

```
Scan this entire codebase, then generate a CLAUDE.md.

Include:

* What this project is, in 2 lines
* Tech stack + the versions that matter
* Commands: [DEV / BUILD / TEST / LINT]
* Architecture: where things live and why
* Code conventions you actually detect in the code
* Hard rules: [YOUR NON-NEGOTIABLES] -- what to never touch without asking
* Gotchas a new engineer would hit in week 1

Write rules as short imperatives. Nothing generic --
only what is true for THIS repo. If you are unsure
about a rule, ask me instead of inventing it.
```

**SEO Boost notes**
- Candidate hard rules for a SEO Boost repo: never edit `migrations/` by hand · never commit
  `.env` · schema change ⇒ migration file (db push alone won't reach staging) · no UI work
  without a slop-check · don't merge FE before BE+migration (see `seoboost-deploy-queue`).
- Feed known gotchas in rather than making Claude rediscover them — pull from
  `seoboost-devset-<project>` / the relevant `seoboost-devset-*` and `agent-memory/`.
- Complements `seoboost-project-onboarding` (that builds the *client* doc skeleton; this one
  is the agent-facing repo brief).

---

## 03 — Ultra Plan Mode

**Use when:** the task is non-trivial and you want the approach settled *before* any file changes.
**Output:** a plan on screen. No code.

```
Enter plan mode. Do NOT write any code yet.

Task: [PASTE TASK]
Constraints: [DEADLINE / STACK / NO-GO ZONES]

1. Read every file this task touches, list them
   with one line on what each does today
2. Map current behavior vs target behavior
3. Propose 2-3 approaches with real tradeoffs:
   complexity, risk, blast radius
4. Pick one and justify it in 3 lines
5. Break it into steps small enough to verify
   one at a time, each with its own check
6. List risks + the exact rollback for each
7. Flag anything touching [AUTH / PAYMENTS /
   PROD DATA] for my explicit sign-off

Then stop. Show me the plan and wait for my
approval before touching a single file.
```

**SEO Boost notes**
- SEO Boost no-go zones worth naming in the Constraints slot: auth/RBAC, accounting postings,
  tenant isolation/RLS, migrations, production data.
- Anything touching migrations or RLS → the rollback in step 6 must be a real one; rehearse
  with `seoboost-migration-rehearsal` before prod.
- Cross-repo BE+FE features: the sequencing rules live in `seoboost-deploy-queue`.

---

## 04 — Spec-Driven Development

**Use when:** the PRD is approved and you want behavior nailed down before implementation.
**Output:** a spec you approve; then implementation follows it exactly.

```
We build specs first. Write a spec for: [FEATURE]

Context: [WHO USES IT + WHY NOW]

Spec format:

* Behavior: given / when / then, every case --
  happy path, edge cases, failure states
* API contract: inputs, outputs, error shapes,
  status codes
* Data: schema changes + migrations needed
* UI states: loading, empty, error, success
* Non-goals: what this spec deliberately skips
* Acceptance checklist I can verify line by line

After I approve the spec, implement EXACTLY the
spec. If reality forces a deviation, stop, update
the spec, get my ok, then continue. The spec is
the source of truth, not the code.
```

**SEO Boost notes**
- "UI states: loading, empty, error, success" is the same four-state rule as
  `seoboost-financial-report-ui` — reuse it verbatim for accounting screens.
- Accounting features: the spec must state the invariant (debit = credit, period balance)
  and what happens when it's violated — that's the acceptance line that matters.
- Auth/payments/SDK behavior in the spec cannot be accepted on mocked tests alone → `seoboost-mock-check`.

---

## 05 — Full UI & UX Design Brief

**Use when:** a screen or flow needs designing, not just styling.
**Output:** a brief covering journey, layout, components, tokens, motion, a11y.

```
Create a full UI/UX design brief for: [SCREEN OR FLOW]

Audience: [USERS]
Brand: [COLORS / FONTS / VIBE]

Deliver:

* User journey through the flow, step by step
* Layout per screen: hierarchy, spacing, breakpoints
* Component inventory with every state --
  hover, empty, error, loading
* Typography + color tokens
* Motion: what animates, duration, easing
* Accessibility notes

Study patterns from [2-3 PRODUCTS YOU ADMIRE]
for direction. Never copy them.
```

**SEO Boost notes** — this play *composes* SEO Boost's design skills; reach for them by name:
- Structural decisions (choice count, target size, ordering, feedback, endings) → `seoboost-ux-law`
- Usability audit + severity score → `seoboost-ux-heuristics`
- Hierarchy / spacing / color / depth → `impeccable`; type → `seoboost-web-typography`
- Aesthetic direction → `frontend-design` (native); extract a reference's DNA → `seoboost-design-dna`
- Landing-page sections → `seoboost-web-sections`; motion → official `gsap-*` (core/timeline/scrolltrigger/plugins/performance); micro-feedback → `seoboost-microinteractions`
- Accounting report screens have a house standard that overrides generic advice → `seoboost-financial-report-ui`

---

## 06 — Implementation Plan

**Use when:** the spec/PRD is approved and you want a build sequence you can run step by step.
**Output:** a numbered build sequence, each step independently verifiable.

```
Create an implementation plan for: [APPROVED SPEC / PRD]

Rules:

* Sequence steps so the app compiles and runs
  after EVERY single step
* Each step: files touched, what changes,
  how I verify it works
* Flag steps needing a migration or new dependency
* Put the riskiest unknowns first
* Size each step: [S / M / L]

Output a numbered build sequence I can run one
step at a time. Wait for my "go" between steps.
```

**SEO Boost notes**
- BE+FE across separate push-to-deploy repos: order is **BE + migration → verify → FE**.
  Full gates and rollback tree in `seoboost-deploy-queue`.
- Any step flagged "needs a migration" must be additive-only, and rehearsed via
  `seoboost-migration-rehearsal` before it runs on prod.
- Before reporting a deployed step as done → `seoboost-verify-deploy`.

---

## 07 — Wire Up an MCP Server

**Use when:** Claude needs to reach an external service/API from this project.

```
Wire up an MCP server for: [SERVICE / API]

What I need it to do: [JOBS TO BE DONE]

1. Check for an official or well-maintained
   existing server first -- name your source
2. If one exists: exact install command + the
   .mcp.json config, scoped to this project
3. If not: scaffold one with the MCP SDK --
   tools, auth, error handling, typed responses
4. Add ONLY the tools I will actually use: [LIST]
5. Wire secrets through [ENV VARS], never
   hardcode keys in the config file
6. Verify the connection and call one tool
   end to end, show me the output
7. Document each tool in 1 line so future
   sessions know when to reach for it
```

**SEO Boost notes**
- Step 5 is non-negotiable: a key in a committed config is a leak. If the agent is reachable
  from a remote channel (Telegram/Slack), also run `seoboost-remote-agent-hardening`.
- Step 4 keeps the tool list small on purpose — every extra tool costs context in every
  future session.
- Existing SEO Boost MCP work to copy from: `seoboost-devset-<project>` (coordination endpoint),
  `seoboost-devset-<project>` (mc-bridge debug path).

---

## 08 — Connect Your Database

**Use when:** wiring a fresh app to its database, or adding a new data layer.

```
Connect this app to [POSTGRES / SUPABASE / YOUR DB].

* Pick the client that fits this stack,
  justify it in 1 line
* Env vars: name them, add to .env.example,
  never commit real values
* Schema: tables for [ENTITIES] with types,
  relations, and indexes for [HOT QUERIES]
* Create + run the migrations, and show me
  the rollback for each one
* One typed query helper per table -- no raw
  SQL scattered through components
* Access rules / row-level security if this
  is [MULTI-TENANT]
* Connection pooling if we are serverless

Then prove it: seed one row, read it back,
show me the output.
```

**SEO Boost notes**
- SEO Boost default = Postgres + Prisma. **Local `prisma db push` does not reach staging** — a
  schema change needs a migration file; deploy runs `prisma migrate deploy`.
- Multi-tenant ⇒ RLS is not optional. Prove isolation with the `app_rls` gate, and beware the
  pooled-connection GUC leak that makes a green gate lie → `seoboost-migration-rehearsal`.
- Converting a live single-tenant app → `seoboost-single2multitenant-saas`.
- Datastore choice / partitioning / consistency questions → `fullstack-dev-skills:postgres-pro` / `fullstack-dev-skills:database-optimizer`.

---

## 09 — Find Security Gaps

**Use when:** before a launch, after auth/payment work, or on any repo holding client data.

```
Audit this codebase for security gaps.
Attack it like you want in.

Focus areas: [AUTH / PAYMENTS / USER DATA]

Check:

* Secrets in code, config, or git history
* Injection: SQL, XSS, command, path traversal
* Auth: routes missing checks, weak sessions,
  broken redirects
* IDOR: can user A read user B's data?
* File uploads + input validation on every form
* Dependency CVEs -- run the audit, read it
* Rate limiting on [EXPENSIVE ENDPOINTS]
* What leaks through error messages and logs

Rank findings by severity with exact file:line,
fix the critical ones now, and list the rest
as tickets with effort estimates.
```

**SEO Boost notes**
- **IDOR is the top risk for Project E**: "can user A read user B's data" = can tenant A read
  tenant B's. Test it as a tenant-isolation gate, not just a route check.
- Also check RBAC: a role guard that only hides the UI button but leaves the endpoint open.
- Secrets in **git history** count — a rotated key still in an old commit is still leaked.
- Agent exposed to a remote channel → `seoboost-remote-agent-hardening` (the `Read`-not-prompted
  secret-exfil footgun, `permissions.deny`).

---

## 10 — Debug an Error Fast

**Use when:** something is broken and you're tempted to guess.

```
Debug this error. Do NOT guess.

Error: [PASTE FULL ERROR + STACK TRACE]
When it happens: [STEPS TO REPRODUCE]

1. Read the stack trace, open the exact files
   involved
2. State expected vs actual behavior in 1 line
3. List 3 hypotheses, ranked by likelihood
4. Prove or kill each one with logs or a tiny
   test -- evidence, not vibes
5. Fix the root cause, not the symptom
6. Search the repo for the same pattern -- if
   it can break here, it breaks elsewhere
7. Add a regression test that fails without
   the fix
8. Tell me in 2 lines why it broke and why it
   can never break this way again
```

**SEO Boost notes** — check the known-trap skills first; they can end the hunt in one step:
- Container crash-loop `Cannot find package 'X'` after a cache-fresh rebuild → `seoboost-react-peer-dep-docker-trap`
- Image OK in curl, broken in browser / presigned 404 → `seoboost-minio-proxy-photo`
- Green mocked tests but prod fails → `seoboost-mock-check`
- Tenant gate passes locally, leaks in prod → GUC/pooling trap in `seoboost-migration-rehearsal`
- Deep methodology → `anthropic-skills:systematic-debugging`. Step 8 output is a
  `seoboost-skill-candidate` input if it's reusable.

---

## 11 — E2E Test Your Application

**Use when:** a money path needs to be provably working, not assumed working.

```
Write Playwright E2E tests for: [FLOW]

Stack: [YOUR STACK] CI: [GITHUB ACTIONS / OTHER]

* Money paths first: [SIGNUP / CHECKOUT /
  CORE ACTION]
* Test what the user sees, not implementation
  details
* Selectors: roles and labels, never brittle
  CSS chains
* One unhappy path per flow: bad input,
  network failure, expired session
* Tests stay independent -- any order, zero
  shared state, each seeds its own data
* Headless in CI, headed locally for debugging
* Screenshots + traces on failure only

Run the suite, show me the results, fix what
fails, and tell me what the suite still does
NOT cover.
```

**SEO Boost notes**
- SEO Boost money paths: login/RBAC, posting a journal entry, approval → posting, invoice
  generation, period close.
- "Each seeds its own data" + multi-tenant ⇒ each test seeds **its own tenant**, or tests
  will pass by leaking into each other's data — the exact bug you're trying to catch.
- CI runs on the self-hosted runner → `seoboost-cicd-selfhosted-runner`.
- The closing line ("what it still does NOT cover") is the honest part — keep it.

---

## 12 — Clean Up Dead Code

**Use when:** the repo has accumulated orphans and you want them gone safely.

```
Find and delete dead code in this repo.

Scope: [WHOLE REPO / SPECIFIC FOLDER]

* Unused exports, components, hooks, utils
* Unreachable branches + commented-out blocks
* package.json dependencies nothing imports
* Stale feature flags stuck always-on or
  always-off
* Duplicate logic that should merge into one
* Dead CSS classes and unused assets

Verify with a search before EVERY deletion --
dynamic imports and string references count.
Delete in small commits, run [BUILD + TESTS]
after each one, and report total lines removed
plus anything you were not 100% sure about.
```

**SEO Boost notes**
- "Dynamic imports and string references count" is the whole game — Next.js route files,
  `next/dynamic`, and string-keyed component maps look unused to a naive search.
- Known case: fe-project-e has orphan duplicate components + unused TS-in-`.js` files that
  throw eslint parse errors while the build graph stays clean — confirm a file is truly
  unimported before deleting.
- Not sure? Leave it and list it. The report's "not 100% sure" section is the deliverable.

---

## 13 — Write Clean Git Commits

**Use when:** you have a pile of staged changes and want a readable history.

```
Commit my staged changes properly.

Convention: [CONVENTIONAL COMMITS / YOUR FORMAT]

* Split unrelated changes into separate commits
* Format: type(scope): what changed and why
  feat / fix / refactor / chore / docs / test
* Subject under 50 chars, imperative mood
* Body explains the WHY, wrapped at 72
* Reference the ticket: [TICKET-ID]
* Never mix a refactor with a behavior change
  in one commit
* Never commit [SECRETS / .ENV / GENERATED FILES]

Show me the plan -- files per commit + messages --
before you commit anything. Then commit one at
a time so I can stop you between them.
```

**SEO Boost notes**
- SEO Boost convention: Conventional Commits, scope = module (`skills`, `plugins`, `accounting`,
  `fe`, `be`). Reference the decision id where one exists (`D-XXX`) → `seoboost-decision-tracking`.
- Commit ≠ deploy. On push-to-deploy repos a push to main **ships** — check `seoboost-deploy-queue`
  for order before pushing a BE+FE pair.
- Big pushes can fail with `HTTP 400 / RPC disconnect`; fix with
  `git config http.postBuffer 524288000` then retry.

---

## 14 — Hooks as Guardrails

**Use when:** you want the harness to enforce rules instead of trusting the agent to remember.

```
Set up Claude Code hooks as guardrails here.

Stack: [YOUR STACK + PACKAGE MANAGER]

* PostToolUse: run [LINT + TYPECHECK] after
  every file edit, feed errors straight back
* PreToolUse: block edits to [PROTECTED PATHS:
  MIGRATIONS, .ENV, PROD CONFIG]
* Stop: run [TEST SUITE] before a session ends
* Notification: ping me with [SOUND / SLACK]
  when my input is needed

Write the hook scripts + the settings.json
entries. Keep each script under 20 lines and
exit non-zero with a clear message so the
agent knows exactly what to fix. Then trigger
each hook on purpose and show me it firing.
```

**SEO Boost notes**
- SEO Boost protected paths worth blocking: `prisma/migrations/`, `.env*`, deploy workflows,
  anything under a prod config dir.
- The settings.json mechanics (hook events, matchers, scopes) are owned by the `update-config`
  skill — use it for the wiring, this play for *what* to guard.
- Last line matters: an untested hook is a hook you only find out about when it silently
  wasn't running. Trigger each one on purpose.

---

## 15 — Turn a Task Into a Skill

**Use when:** you've done the same multi-step task by hand more than twice.

> ⚠️ **SEO Boost routing — do not freelance this one.** SEO Boost already has the pipeline:
> `seoboost-skill-candidate` (the gate: is it worth a skill at all — YES/NO/FOLD) →
> `writing-skills` (author it) → `seoboost-skill-updater` (if it belongs inside an existing skill)
> → `seoboost-development-set` (if it's per-project dev knowledge). Run the gate first; use the
> prompt below as the drafting step *after* the verdict is YES.

```
Turn this repetitive task into a Claude Code skill.

The task I keep doing: [DESCRIBE TASK + STEPS]

* Create .claude/skills/[NAME]/SKILL.md
* Frontmatter: name + description with the exact
  trigger phrases I actually say
* Body: numbered workflow, my conventions,
  edge cases
* What it should ask me for vs infer on its own
* What "done" looks like
```

**SEO Boost notes**
- Name it `seoboost-<thing>` and put it in `~/Documents/seoboost-skill-set/`, not `.claude/skills/`
  directly — that repo is the source of truth and syncs to the whole team.
- The description is what makes it fire; write the trigger phrases you *actually say*,
  in Indonesian and English both.
- Then dry-run the skill on a real example and refine until the output matches how you do it
  by hand — a skill that never fires, or fires and produces something you'd rewrite, is worse
  than no skill.
- Sanity check before pushing: no client names, tokens, or real data (repo is public).
