# seoboost-skill-set

You are working inside the SEO Boost shared **skills + agent-memory** repo. Many
agents work here concurrently, so discipline matters.

## ⚠️ Before doing anything: read and follow `agent-memory/AGENT-ONBOARDING.md`

That file is the canonical start-of-work checklist — pull, sync skills into
`~/.claude/skills`, load the two-tier second-memory, concurrency rules, and the push
rules. This `CLAUDE.md` only points to it (so the onboarding has one source of truth and
this file never goes stale). Claude Code auto-loads this `CLAUDE.md` whenever a session
starts in this clone, so every fresh clone/pull already knows where onboarding lives.

## Brand

Anything with a visible surface — document, deck, invoice, contract, web asset — uses the
SEO Boost identity in [`BRAND.md`](BRAND.md): brand orange `#FF8800` on warm charcoal,
Poppins on the web / Arial in office documents, the rocket-roundel lockup at 3.45:1.
**Never sample a colour off a rendered file; read it from `BRAND.md` or the skill's
`design-tokens.md`.** See also [`NOTICES.md`](NOTICES.md) for where this repo came from
and what that means for redistributing it.

## Non-negotiables (full detail in the onboarding)

- **PULL before you start AND before you push** (`git pull --ff-only`) — many agents,
  one repo.
- **Pushing needs operator confirmation** (Iron Law #4 — no push without explicit OK).
- **Sanitize client PII** (names, credentials, secret schemas) before anything reaches
  the repo. Project names are fine; technical secrets are not.
- **`git pull` does NOT update installed skills** — they are physical copies in
  `~/.claude/skills`; run the rsync sync (see `agent-memory/seoboost-skill-set-management.md`).
- **New skills activate only after a Claude Code session restart.**

Don't hardcode counts or host paths in shared docs — derive them
(`ls -d seoboost-*/SKILL.md | wc -l`) or read them from the per-machine file.
