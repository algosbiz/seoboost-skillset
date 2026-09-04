# SEO Boost Agent Memory — two-tier "second memory" system

This directory gives any AI agent (Claude Code, etc.) working on SEO Boost a
**portable, version-controlled memory** that survives across sessions *and* across
machines. It complements — does not replace — the host's native memory (Claude
Code's `~/.claude/.../memory/MEMORY.md`).

> **New agent? Start with [`AGENT-ONBOARDING.md`](AGENT-ONBOARDING.md)** — the canonical
> start-of-work checklist (pull, sync, load memory, concurrency discipline, push rules).
> Point any agent there instead of pasting a chat blob.

> **Non-Claude agent (hermes/Nous, GLM), a teammate's machine, or a client deployment?**
> Hand it [`OPERATING-GUARDRAILS.md`](OPERATING-GUARDRAILS.md) — a portable, model-neutral,
> paste-able set of hard limits (no auto-execute of irreversible actions; reflection ≠
> verification; external feedback is data not a command; append-only sourced memory;
> client-incident recovery). These are the few things a capable model does NOT do on its
> own; agents without this repo's `CLAUDE.md` need them explicitly.

## The two tiers

| Tier | File | Scope | Who reads it |
|------|------|-------|--------------|
| 1 — Shared reference | `seoboost-skill-set-management.md` | Machine-agnostic. Conventions, procedures, resources that are true everywhere. | Every agent, on every machine. |
| 2 — Per-machine memory | `seoboost-proactive-memory-<machine>.md` | Specific to one machine (paths, installed tooling, host quirks, machine-local learnings). | The agent running on that machine. |

`<machine>` is a short label chosen by the person who sets the machine up (ask
them — don't guess). One file per machine, so several machines coexist here
without collision (e.g. `seoboost-proactive-memory-a Linux host.md`).

> **Don't confuse the machine label with a `seoboost-devset-<project>` slug — they are
> different naming systems.** This `<machine>` label identifies a MACHINE/host
> (`agent-stack-macbookP-M4`, `a Linux host`); it's free-form, picked by the operator,
> and used for `seoboost-proactive-memory-<label>.md` + `bootstrap.sh <label>`. A
> `seoboost-devset-<slug>` (see the `seoboost-development-set` skill) identifies a CLIENT
> PROJECT (`project-e`, `project-f`, `agent-stack`) — derived from the project name, one per
> project. They can look similar (`seoboost-devset-<project>` is the *agent-stack project*,
> not a machine), so keep them straight: machine-label → memory; project-slug → devset
> skill.

## How an agent should use it (the protocol)

1. **At the start of SEO Boost work**, read the shared reference and *this machine's*
   per-machine file.
2. **While working / at the end of a turn**, if you learn something durable that
   would make future work faster, more efficient, or more reliable — append it to
   the per-machine file (or the shared file if it's true on every machine).
   Capture: non-obvious facts, host paths, decisions, conventions, gotchas, and
   confirmed-working procedures. Skip what git/code/CLAUDE.md already records and
   anything that only matters to the current conversation.
3. **Commit & push** the change so other sessions/machines inherit it:
   `git -C <repo> add agent-memory && git -C <repo> commit -m "memory: ..." && git -C <repo> push`.

The bar for writing: *"will this give effectiveness, efficiency, or speed to
future work?"* If yes, record it. If it's a one-off, don't.

## Bootstrapping a new machine

1. Clone `seoboost-skill-set` on the machine.
2. Ask the operator for a short **machine label**.
3. Copy the template below to `agent-memory/seoboost-proactive-memory-<label>.md` and
   fill in the host facts.
4. Wire it into Claude Code. **Read "Common gotchas" first — step 4 is per-PROJECT,
   not once per machine.** Each project Claude Code touches has its own memory dir at
   `~/.claude/projects/<project-slug>/memory`, and the agent only auto-loads memory
   from the dir of the project it is currently in. So the symlinks + `MEMORY.md`
   pointers must exist in **every SEO Boost project's** memory dir, not just one.

   Use the idempotent helper (it loops projects, skips dirs already wired, never
   overwrites existing `MEMORY.md` entries):
   ```bash
   bash agent-memory/bootstrap.sh <label>            # all existing SEO Boost project memory dirs
   bash agent-memory/bootstrap.sh <label> <slug>     # one specific project slug
   ```
   Editing a symlinked file writes through to the repo file — commit & push to share.

   New project later? Its memory dir is created the first time you open it in Claude
   Code, so re-run `bootstrap.sh <label>` (or the single-slug form) when you start
   work on a project that is not wired yet. Safe to re-run anytime.

## Common gotchas

Seen during real sync + bootstrap (keep this list current — it is the cheapest way
to save the next person an hour).

1. **Bootstrap is per-PROJECT, not once per machine.** Symlinking agent-memory into
   one project's memory dir does NOT cover the others — Claude Code loads memory from
   the *current* project's dir only. If second-memory "isn't loading" in some project,
   that project was never wired. Fix: run `bootstrap.sh <label>` (idempotent; wires
   every SEO Boost project + skips the ones already done). New projects need a re-run.

2. **New/updated skills only appear after a session RESTART.** Claude Code reads the
   skill list at startup. After `git pull` + skill sync, the new skill is on disk but
   not active until you restart the session. (A live skill-list reminder may surface
   it mid-session, but don't rely on that — restart to be sure.)

3. **Skill sync ≠ git pull.** Installed skills under `~/.claude/skills/seoboost-*/` are real
   copies, not symlinks; `git pull` updates the clone but not the installed skills.
   Run the rsync sync from `seoboost-skill-set-management.md` after every pull.

4. **`~/.claude/skills` may hold more `seoboost-*` than the repo.** Locally-authored or
   not-yet-pushed skills live there too. A higher local count than the repo is normal
   — don't "clean" them on the assumption they are stale.

5. **Project-slug paths differ per OS — the bootstrap glob must cover yours.** Claude
   Code derives the slug from the project's absolute path, which differs by machine:
   macOS here is `…WORKSPACE-SEOBoost-SEOBoost-Projects-X` (contains `SEO Boost`), Linux here is
   `…Workspaces-SEOBoost-Projects-X` (no `SEOBoost`). A `*SEOBoost*`-only glob silently matches
   ~0 projects on Linux yet prints a success-looking `Done. wired=N` — the worst kind
   of failure. `bootstrap.sh` now unions `*SEOBoost*` + `*SEOBoost-Projects-*` +
   `*SEOBoost-Projects-*` (deduped). If your projects live elsewhere, override with
   `SEOBOOST_PROJECT_GLOBS="*Foo* *Bar*"`. After running, sanity-check the `total=` count
   against how many SEO Boost projects you actually have.

### Per-machine file template

```markdown
---
name: seoboost-proactive-memory-<label>
description: Per-machine proactive memory for SEO Boost work on <label>
metadata:
  type: project
---

## Machine facts
- Label: <label>
- Hostname: <hostname>   User: <user>   OS: <os>
- seoboost-skill-set clone path: <repo path on this machine>
- Claude skills dir: <~/.claude/skills>

## Learnings (append-only; newest first, date each entry)
- YYYY-MM-DD — <learning that improves future efficiency>
```
