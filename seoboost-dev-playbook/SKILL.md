---
name: seoboost-dev-playbook
description: SEO Boost's 15 ready-to-fire Claude Code prompt plays covering the whole build lifecycle — PRD, CLAUDE.md bootstrap, ultra plan mode, spec-driven development, UI/UX design brief, implementation plan, MCP wire-up, database connect, security audit, fast debugging, Playwright E2E, dead-code cleanup, clean git commits, hooks-as-guardrails, and turning a task into a skill. Use when starting a feature and unsure how to brief Claude, when you want the disciplined version of a task instead of an ad-hoc prompt, or when you ask for "the prompt for X". Triggers — "playbook", "prompt untuk X", "cara minta claude bikin PRD/spec/plan", "bikin CLAUDE.md", "plan mode", "spec dulu", "implementation plan", "wire up MCP", "connect database", "audit keamanan", "security gaps", "debug error ini", "bikin E2E test", "bersihkan dead code", "commit yang rapi", "setup hooks", "jadikan skill". NOT for client-facing branded documents (use seoboost-formal-docs), NOT a replacement for the specialist skills each play routes to.
metadata:
  type: reference
---

# SEO Boost Dev Playbook — 15 prompt plays, PRD to commit

One skill, fifteen plays. Each play is a battle-tested prompt that produces the *disciplined*
version of a common task — with a defined output, a stop point, and something you can verify —
instead of an ad-hoc request that returns a plausible-looking blob.

**Core principle:** the quality of the output is set by the quality of the brief. These plays
are the standard briefs. Fill the `[SLOTS]`, fire, review at the stop point.

Full prompts + SEO Boost context per play → **`reference/plays.md`**. This page is the map.

## The 15 plays

| # | Play | Fires when | Output |
|---|------|-----------|--------|
| 01 | **Write a Full PRD** | Feature agreed, "done" undefined | `docs/prd-[feature].md` |
| 02 | **Create Your CLAUDE.md** | Repo has none / it's stale | `CLAUDE.md` at root |
| 03 | **Ultra Plan Mode** | Non-trivial task, approach unsettled | Plan on screen, zero code |
| 04 | **Spec-Driven Development** | PRD approved, behavior not nailed | Spec = source of truth |
| 05 | **Full UI & UX Design Brief** | A screen/flow needs designing | Journey + components + tokens |
| 06 | **Implementation Plan** | Spec approved, need build order | Numbered, verifiable sequence |
| 07 | **Wire Up an MCP Server** | Claude must reach a service | `.mcp.json` + verified tool call |
| 08 | **Connect Your Database** | Fresh DB wiring / new data layer | Schema + migrations + proof |
| 09 | **Find Security Gaps** | Pre-launch, post-auth work | Findings by severity + fixes |
| 10 | **Debug an Error Fast** | Broken, and guessing is tempting | Root cause + regression test |
| 11 | **E2E Test Your Application** | A money path must be provable | Playwright suite + coverage gaps |
| 12 | **Clean Up Dead Code** | Orphans piled up | Small commits + "unsure" list |
| 13 | **Write Clean Git Commits** | Pile of staged changes | Split commits, plan shown first |
| 14 | **Hooks as Guardrails** | Rules should be enforced, not remembered | Hook scripts + settings.json |
| 15 | **Turn a Task Into a Skill** | Same task done by hand 3× | New `seoboost-*` skill ⚠️ see routing |

## The pipeline (how they chain)

```
SET UP THE REPO      02 CLAUDE.md ─────────► 14 Hooks as guardrails
                            │
DEFINE THE WORK      01 PRD ──► 05 UI/UX brief ──► 04 Spec
                                                     │
DECIDE THE APPROACH  03 Ultra plan ──────────────► 06 Implementation plan
                                                     │
BUILD                08 Database  ·  07 MCP  ·  (implement step by step)
                                                     │
PROVE IT             11 E2E ──► 10 Debug ──► 09 Security audit
                                                     │
CLEAN UP             12 Dead code ──► 13 Clean commits
                                                     │
CAPTURE              15 Turn it into a skill (via seoboost-skill-candidate)
```

You rarely run all fifteen. Typical runs:
- **New feature on an existing repo:** 01 → 04 → 06 → build → 11 → 13
- **Inherited/unfamiliar repo:** 02 → 03 → 12
- **Something is broken:** 10 (then 11 to lock the fix in)
- **Before a launch:** 09 → 11 → 14

## How to use

1. **Pick the play** from the table — or let the trigger phrase pick it for you.
2. **Open `reference/plays.md`** and read that play's prompt *and* its SEO Boost notes; the notes
   carry the stack defaults and the known traps.
3. **Fill the `[SLOTS]`.** Unfilled slots are the #1 cause of generic output. SEO Boost defaults are
   listed at the top of the reference file.
4. **Respect the stop point.** Plays 03, 04, 06 and 13 deliberately halt for your approval —
   that pause is the feature, not friction.
5. **Hand off to the specialist skill** the play names (see routing below). This playbook is
   the brief; the specialist skills are the depth.

## Routing — this playbook briefs, other skills go deep

A play tells you *how to ask*. When the work gets real, hand off:

| Play | Hand off to |
|------|-------------|
| 01 PRD (client-facing version) | `seoboost-formal-docs` |
| 05 Design brief | `seoboost-ux-law` · `seoboost-ux-heuristics` · `impeccable` · `frontend-design` · `seoboost-design-dna` · `seoboost-web-sections` · `seoboost-financial-report-ui` |
| 06 Impl plan (BE+FE order) | `seoboost-deploy-queue` · `seoboost-verify-deploy` |
| 08 Database (migrations/RLS) | `seoboost-migration-rehearsal` · `seoboost-single2multitenant-saas` · `fullstack-dev-skills:postgres-pro` |
| 09 Security (remote agent) | `seoboost-remote-agent-hardening` |
| 10 Debug (known traps) | `seoboost-react-peer-dep-docker-trap` · `seoboost-minio-proxy-photo` · `seoboost-mock-check` |
| 11 E2E (CI runner) | `seoboost-cicd-selfhosted-runner` |
| 13 Commits (decisions) | `seoboost-decision-tracking` |
| 14 Hooks (settings.json wiring) | `update-config` |
| **15 Turn into a skill** | ⚠️ **`seoboost-skill-candidate` first** (the gate) → `writing-skills` → `seoboost-skill-updater` / `seoboost-development-set` |

Unsure which skill at all? → `seoboost-skill-router`.

## Boundaries

- **Not a document generator.** Play 01 writes a working `.md` in the repo. A branded PRD,
  proposal, or deck for a client goes through `seoboost-formal-docs` /
  `seoboost-formal-deck`.
- **Play 15 does not bypass the gate.** SEO Boost already has a skill-creation pipeline; the play is
  the drafting step *after* `seoboost-skill-candidate` returns YES.
- **The plays don't override the Iron Laws or house standards** — where a specialist skill has
  a rule (four-state handling, migration order, slop-check), that rule wins.
- **A stop point is not optional.** If a play says "wait for my approval", waiting is the point.

## Origin

Prompt set collected by the team from a public "Claude Code prompts" carousel (15 cards) and
kept **as-is** in structure and intent. Everything around them — the pipeline, the SEO Boost stack
defaults, the per-play notes, the routing table, and the boundaries — is original SEO Boost material.
Bundled as ONE skill on purpose: fifteen separate skills would compete for the same triggers
and dilute the namespace (see `agent-memory/seoboost-skill-set-management.md`).
