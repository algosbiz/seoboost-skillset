---
name: seoboost-skill-candidate
description: Use when work is finishing and you want to know what (if anything) is worth codifying as a reusable skill — at the close of a big session, after a feature ships, after a hard-won bug fix, or when the user asks "ada yang layak jadi skill?", "apa yang bisa dijadikan skill?", "what here is reusable?", "should this be a skill?". The gate that runs BEFORE writing-skills — decides whether and which, not how.
---

# SEO Boost Skill Candidate

## Overview

A reflection gate that turns finished work into reusable skills — or correctly refuses to. Invoke it at the close of substantial work to answer: *"Dari yang sudah selesai, apa yang layak jadi skill, untuk apa, bagaimana memakainya?"*

**The whole value is saying NO to most things.** Expensive lessons evaporate when they're never codified; equally, a skill minted for a library call or a one-off becomes stale noise that pollutes the namespace. This skill is the strict filter between those two failures. It decides *whether* and *which* — then hands the *how* to `writing-skills`.

**Core principle:** A finished task is not a skill. Most good work is not skill-worthy. Default verdict is **NO**.

## When to Use

- Closing a long/substantial session (pair with `seoboost-fork-checkpoint`: that preserves *state*, this preserves *lessons*).
- A feature shipped, a gnarly bug got fixed, a migration/cutover landed.
- User asks any form of "is there a skill in this?", "apa yang layak jadi skill?", "what's reusable here?".

**Do NOT use** for: deciding *how* to write a skill (that's `writing-skills`), or project-specific conventions (those go in CLAUDE.md, not a skill).

## The 3-Criteria Filter

A piece of work is skill-worthy only if **ALL THREE** hold. Miss one → not a standalone skill.

1. **Repeatable across projects** — a pattern you'll hit again elsewhere, not a one-off feature tied to this codebase.
2. **Has an expensive footgun** — costly if forgotten or done wrong: silent data loss, security hole, hours of rediscovery, a green signal that lied.
3. **Not just "call library X"** — if the essence is `auth.api.createOrganization` or `someLib.doThing()`, the library docs + context7 already cover it; a skill there only goes stale.

### The sharpest tell for criterion 2

> **Did a success signal lie to you?**

The lessons most worth bottling are the ones where something *passed when it shouldn't have*: a bulk insert "succeeded" but silently dropped rows; tests went green while the feature was broken because the mock returned success the real dependency rejects. A failure that announced itself cost you minutes. A success that lied cost you the debugging session — and it will lie again next project. If a success signal lied, lean YES on criterion 2.

## The Iron Rule: Decide, Don't Hedge

Every candidate gets exactly ONE verdict. **"Maybe" is not a verdict** — it's the failure mode this skill exists to prevent. If you're tempted to write "maybe", you have not applied the filter; apply it and commit.

| Verdict | Meaning |
|---|---|
| ✅ **YES** | All 3 criteria hold → draft it as a standalone skill. |
| ❌ **NO** | Misses criterion 1 or 3 (one-off, or just a library call) → stays as code, say so in one line. |
| 🟡 **FOLD-IN** | A real footgun but too small to stand alone (one rule, not a workflow) → a checklist line inside an existing skill or a cross-project gotchas note, NOT a new skill. |

Default to NO. A session that produces zero YES verdicts is a normal, correct outcome — most work is competent execution, not a transferable lesson.

## Workflow

1. **List** what the session actually accomplished (discrete pieces of work).
2. **Filter** each piece through the 3 criteria → produce a verdict table (work · verdict · one-line why).
3. **Draft** each ✅ YES: proposed `name`, "for what / why", "how to use / trigger phrases". Each 🟡 FOLD-IN: which existing skill/note it belongs in.
4. **Hand off** the YES drafts to `writing-skills` to actually author (RED→GREEN→REFACTOR). This skill stops at the decision; it never authors the skill itself.

## Output Format (honest-review style)

Mirror the SEO Boost honest-review convention — never "let's make all of them":

- A verdict table covering **every** piece of work (including the NOs — showing what you rejected is half the value).
- For each ✅ YES: 2–4 reasons it clears the bar, and the draft name + purpose + triggers.
- For each 🟡 FOLD-IN: the one-line lesson + its home.
- A closing "cut line": which one to mint *first* if minting only one, and why.

## Worked Example (the filter in action)

From a real multi-tenant session:

| Work | Verdict | Why |
|---|---|---|
| Single-tenant → multi-tenant production cutover (expand-backfill-contract, RLS, super-admin) | ✅ YES | Repeatable, expensive footguns, not a library call. |
| "Mocking the auth/payment SDK mocks away the exact bugs that bite" + class-level-guard-during-altered-session trap | ✅ YES | Recurring across every auth/integration; a green signal that lied; stable across version bumps. |
| Consent-gated impersonation on better-auth + Postgres RLS | ✅ YES | Reusable pattern shape (DB-tier consent check), real footguns — scope it to the stack, not "auth-agnostic". |
| better-auth org provisioning (`createOrganization` on signup) | ❌ NO | Just a documented library call → goes stale. |
| Self-service change-password (`auth.changePassword`) | ❌ NO | Ordinary CRUD, no cross-project footgun. |
| Drizzle bulk insert silently drops conflicting rows without `onConflict` | 🟡 FOLD-IN | One rule, not a workflow → a line in the cross-project ORM/Postgres gotchas note (sibling to other one-line traps like "Prisma 6 rejects `undefined` in `data`"). |
| Flexbox alignment fix | ❌ NO | Local one-off; the fix lives in the commit. |

## Common Mistakes

| Mistake | Fix |
|---|---|
| Writing "maybe" / hedging | Not a verdict. Apply the filter and commit to YES/NO/FOLD-IN. |
| Minting a skill for one SDK call | Fails criterion 3 — it'll go stale. NO, or FOLD-IN as a gotcha line. |
| A wall of FOLD-INs to avoid deciding | FOLD-IN is for genuine small footguns only, not a dumping ground for indecision. |
| Authoring the skill here | Stop at the decision. Hand YES drafts to `writing-skills`. |
| Treating "it was hard" as the bar | "Hard but I just looked it up and it worked" → NO. The bar is *transferable footgun*, not effort spent. |

## Red Flags — you're doing it wrong if

- You wrote "maybe" anywhere.
- Every piece of work got a YES (the filter isn't filtering).
- You proposed a skill whose one-line summary is a single library function call.
- You started writing the skill's body instead of handing off to `writing-skills`.
