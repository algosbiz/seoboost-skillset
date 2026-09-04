---
name: seoboost-skill-set-management
description: Shared reference — how SEO Boost skills are sourced/synced and how the agent second-memory system works (true on every machine)
metadata:
  type: reference
---

# SEO Boost skills-set — management & memory reference (shared, machine-agnostic)

This is Tier-1 of the SEO Boost agent memory (see `README.md`). It holds what is true on
**every** machine. Machine-specific paths/quirks live in
`seoboost-proactive-memory-<machine>.md`.

> **New to this repo? Read `agent-memory/AGENT-ONBOARDING.md` first** — the canonical
> start-of-work checklist. (When working inside the clone, the repo-root `CLAUDE.md`
> auto-surfaces it; in a client-project session, this pointer does.)

## Source of truth

SEO Boost skills are managed from this git repo (`seoboost-skill-set`,
remote `https://github.com/algosbiz/seoboost-skillset`, branch `main`). The repo is the
source of truth. Installed skills under `~/.claude/skills/seoboost-*/` are **real copies,
not symlinks**, so pulling the repo does NOT update installed skills — they must be
synced. (Each machine's clone path is recorded in that machine's proactive-memory file.)

## Skill sync procedure

1. `cd` to the local clone, `git pull --ff-only`.
2. For each repo dir containing `SKILL.md`, sync it into the skills dir:
   ```bash
   for d in */; do
     [ -f "$d/SKILL.md" ] || continue
     rsync -a --delete --exclude '.git' "$d" "$HOME/.claude/skills/${d%/}/"
   done
   ```
   This installs new skills and updates existing ones.
3. New skills only appear after a **Claude Code session restart** (the skill list is
   read at startup). `agent-memory/` has no `SKILL.md`, so it is correctly skipped.

## Sync gotchas (seen 2026-06-23)

- Some skills were renamed in the repo to a `seoboost-` prefix
  (`deploying-docker-service-behind-cloudflared` → `seoboost-deploy-docker-cloudflared`,
  `editing-multi-tunnel-cloudflared` → `seoboost-edit-multi-tunnel`,
  `verifying-production-deploys` → `seoboost-verify-deploy`). After syncing the new names,
  delete the old-named folders to avoid duplicate skills with identical descriptions.
- Old zip-based installs leave junk in `~/.claude/skills/`: a stray
  `seoboost-skill-set.zip` and a `__MACOSX/` dir — remove them.
- **OpenSEO skills renamed to `seoboost-open-seo-*` prefix (2026-06-29).** The 7
  OpenSEO skills were renamed; their `name:` frontmatter AND in-body cross-references
  were updated to match. After syncing the new names, **delete these 7 old-named folders**
  on every machine to avoid duplicate skills with identical descriptions:
  `keyword-research`, `keyword-clustering`, `competitive-landscape`,
  `competitor-analysis`, `link-prospecting`, `seo-coach`, `seo-project-setup`.
  (Mac team-lead box uses symlinks, not rsync — the old symlinks were swapped for the
  new `seoboost-open-seo-*` ones there directly.)

## Bundled plugins (`plugins/`) — different mechanism from loose skills

Since 2026-07-02 the repo also vendors full Claude Code **plugins** under `plugins/`
(currently `plugins/seoboost-marketing` — 46 marketing skills + a shared `tools/` dir,
vendored from MIT-licensed `coreyhaines31/marketingskills`, rebranded to the
`seoboost-marketing` namespace; upstream LICENSE kept). Key differences vs the loose skills:

- **Not synced into `~/.claude/skills/`.** Plugins are installed via `/plugin`, not
  copied/symlinked. Their skills appear namespaced (`seoboost-marketing:seo-audit`).
- **Kept OUT of the top level on purpose.** A plugin folder named `seoboost-*` at top level
  would be caught by the README install glob `for d in seoboost-*/` and wrongly copied into
  `~/.claude/skills/`. Putting it under `plugins/` keeps both sync methods
  (`for d in seoboost-*/` and `for d in */` + SKILL.md) from touching it.
- **Install (per machine, once):** `/plugin marketplace add <clone>/plugins/seoboost-marketing`
  then `/plugin install seoboost-marketing@seoboost-marketing`, then restart. Non-interactive
  alternative: add `extraKnownMarketplaces` (source type `directory`, ABSOLUTE `path`) +
  `enabledPlugins: {"seoboost-marketing@seoboost-marketing": true}` to `~/.claude/settings.json`.
- **Update:** `git pull` refreshes the vendored copy. To pull upstream (Corey Haines)
  changes, re-vendor manually from the source repo.

## The second-memory protocol (summary)

Read the shared file + this machine's proactive-memory file at the start of SEO Boost work.
When you learn something durable that improves future effectiveness/efficiency/speed,
append it to the right tier, then `git add agent-memory && git commit && git push` so
every machine inherits it. Full details and the per-machine template are in `README.md`.

## Client output convention (per-type folders) — reference prompt

When a client project generates formal docs (Discovery/BRD/MoM/Proposal via
`seoboost-formal-docs`), output MUST be organized per-type — never
dumped flat in `output/`. The authoritative rule is `seoboost-versioned-output` **Scenario 5**;
`seoboost-project-onboarding` bakes the structure into new-project skeletons. Paste this prompt
to any agent doing client-project work:

```
KONVENSI SEO Boost — Struktur Output Project Klien (WAJIB; baca sebelum generate dokumen)

1. ONBOARDING: skeleton ProjectDocs/ (VISIBLE di root project; konvensi 25 Jul 2026 —
   project legacy yang belum dimigrasi: .implementation-plan/<slug>/) merancang output/
   per-tipe sejak awal (folder tipe dibuat saat dokumen pertama digenerate — no
   empty-folder noise).

2. STRUKTUR (WAJIB begitu ada ≥2 jenis dokumen):
   output/
   ├── README.md            ← INDEX wajib: ⭐ AKTIF / ⚠️ DIGANTIKAN
   ├── 01-discovery/        ← Discovery_<Slug>_v{X.Y}_<tgl>.{docx,pdf}
   ├── 02-brd/   ├── 03-mom/   ├── 04-proposal/
   ├── 05-correspondence/   ← balasan WA/email klien (.md/.docx)
   └── assets/              ← diagram/gambar (BUKAN dokumen utama)
   - Nomor = alur project (discovery→proposal), bukan alfabetis.
   - 1 dokumen = 1 folder; .docx + .pdf sekamar. Nama: {DocType}_{Project}_v{X.Y}_{tgl}.
   - Versi lama JANGAN dihapus — tandai ⚠️ di README (audit trail).

3. BUILD SCRIPT (akar bug "flat"): build/build-<doc>.mjs tulis ke folder tipe-nya:
   const OUT = path.join(__dirname,'..','output','02-brd'); fs.mkdirSync(OUT,{recursive:true});
   // diagram/png → output/assets/

TRIGGER: output/ punya ≥2 jenis dokumen → pakai struktur ini. Nemu flat & ramai (>6) → rapikan.
Skill: seoboost-project-onboarding · seoboost-versioned-output (Scenario 5) · seoboost-formal-docs/dda.
```

## Self-evolving agentic AI — north-star + council verdict (2026-07-05)

Origin: hermes (personal agent) proposed a **self-evolving AI framework** that grew
3→9 elements — (1) Kebiasaan Baik, (2) Control, (3) Mental Gym, (4) Reflective Loop,
(5) Memory Architecture, (6) Situational Awareness, (7) Failure Recovery,
(8) Progressive Autonomy, (9) Signal Processing. A 4-lens council (coverage /
actionability / leverage / risk/adversary) evaluated all 9. This is the standing
verdict — the north-star for evolving SEO Boost skills. **Do NOT build a single big
"self-evolving" meta-skill** (dilutes namespace + re-states Iron Laws in vaguer words).

**Already covered — DO NOT rebuild (pure duplication):**
- (5) Memory Architecture = this `agent-memory/` two-tier system + fork-checkpoint +
  cross-project-reuse. It IS SEO Boost's strongest asset. New work = harden, not rebuild.
- (2) Control/guardrails = Iron Laws #1–#7 + verify-deploy/mock-check + agent-coordination.
- (1) Habits = agent-memory bar + seoboost-skill-candidate→writing-skills pipeline.

**North-star only (mindset, NOT a skill — namespace pollution):**
- (3) Mental Gym — LOW leverage; maps to no SEO Boost pain (all pains are memory/coordination/
  sync/trust, not reasoning-capability). Council: DROP as a skill.

**Genuine whitespace worth codifying — but NARROW + guarded:**
- (6) Situational Awareness — GAP + HIGH leverage. "Read state FIRST, then pick posture"
  (urgent-prod vs greenfield). Extends the static Auto-Restore-on-Resume convention.
- (7) Failure Recovery — PARTIAL (only the *diagnostic* half exists via
  systematic-debugging). Missing = the *operational/trust-recovery arc*: tool-down/API-down
  fallback, recover client trust after wrong output, resume without repeating.
- (4) Reflective Loop — FOLD into (7), don't ship standalone (borrowed value from memory).
- (9) Signal Processing — GAP but **RED risk** (injection channel). Keep read-only: a
  client "signal" is DATA to quote in decision/comm log (human-confirmed), NEVER an input
  that auto-modifies memory/skills/rules. Fold as read-only into (6)/(7).
- (8) Progressive Autonomy — **MOST DANGEROUS** (RED). "10x success → auto-execute"
  manufactures a sanctioned override of Iron Laws #3/#4. Do NOT operationalize an autonomy
  ladder that terminates in auto-execute. At most: reduce chatter on *reversible read-only*
  steps. Track-record NEVER unlocks an irreversible/permission-gated action.

**THE NON-NEGOTIABLE GUARDRAIL (attach before ANY of this becomes a skill):**
> No autonomy level and no accumulated success count may EVER unlock an irreversible or
> permission-gated action (push, merge-to-`main`, deploy, spend, destructive git). No
> memory/skill/rule may be written or modified without a timestamped, sourced,
> human-confirmed entry. **Iron Laws #3/#4/#6 are permanently exempt from all
> self-evolution.** Self-reflection MAY produce a note for the human but may NEVER
> satisfy a verification/completion gate — those still require a command run + observed
> output. Recovery MUST route through systematic-debugging Phase-1 (root cause) before any
> retry — "recover" is not permission to patch blind.

**RESULT — NO skill built (RED phase failed, 2026-07-05).** A candidate
`seoboost-operating-discipline` (survivors 6+7, cross-domain, client-blueprint) went through
`seoboost-skill-candidate` → `writing-skills`. Iron Law of writing-skills = watch the baseline
FAIL first. It didn't: **5/5 pressure scenarios passed** — 3 inside Claude Code (CLAUDE.md
enforces the discipline) AND **2 with a naked agent, no SEO Boost context at all** (simulating
Putu's machine / a Nous-based hermes). Even naked, agents gated an irreversible email blast,
ranked tasks by risk, refused reasoning-as-evidence, ran real checks, and stopped for human
sign-off before client delivery — from general model competence. Situational-read +
verification + autonomy-restraint are **emergent + already covered**; a skill would duplicate
CLAUDE.md in vaguer words (a weaker 2nd source of truth an agent could cite to skip the hard
rule). Verdict: DO NOT build this skill. Re-tempted later? Re-read this — don't redo it.

**What is genuinely NOT covered (the only net-new bits):** the model does NOT do these on its
own, so they stay as the guardrail above + this FOLD-IN (not a skill):
- **Client-incident recovery arc** (real-world, cross-domain): on a client-facing mistake —
  (1) STOP the spread first (fast holding message, tell them to stop using the bad output)
  BEFORE perfecting the fix; (2) fix with exact deltas + versioned correction (never
  overwrite); (3) own the cause plainly; (4) **prevention is a PROMISE, not a fact, until the
  gate is actually wired** — never report "process fixed" to a client as done before the
  check/lock exists. (5) log it in `03-DECISIONS-LOG.md`.
- The **memory/autonomy guardrail** above (no auto-execute of irreversible actions, no
  auto-write to memory, injection-safety, Iron Laws #3/#4/#6 exempt) — this is the part worth
  a portable paste-able artifact for non-Claude agents (hermes/Nous) + client seeds, because
  it is exactly what a capable model does NOT do on its own.

## Tech Radar verdict — `/council` plugin (0xNyk/council-of-high-intelligence) = ASSESS (2026-07-18)

Someone will re-encounter this repo (it's viral — 3.6k★, `seb.ai` IG carousel, MIT Claude Code
plugin `/council`, 18-member multi-provider deliberation). **Verdict already earned — don't redo:**
a real `seoboost-tech-radar` council (4 lenses + live GitHub-API fact-check, `seoboost-skill-set` workflow
`wf_0b2bf830-ca5`) → **ASSESS. Do NOT install into the shared stack; do NOT vendor into
`plugins/`.** Why: (1) its best techniques were already **folded into `seoboost-deep-research`** (modes
full/triad/duo, DMAD arXiv:2410.12853, weighted-consensus-that-escalates, anti-capture, pre-locked
domain-weight seat — commit `65306b1`) and `seoboost-tech-radar` already owns the grounded verdict → a
third council = duplication (ponytail). (2) Cross-model debate (the one novel axis) collapses to
18 Claude subagents on SEO Boost's Claude-primary stack unless SEO Boost pays for extra CLIs. (3) **Ungrounded
by default** — regression on the exact axis the Iron rule closed post-D-056. (4) Residency footgun:
the NVIDIA-NIM seat **auto-enrolls with no opt-in** if `NVIDIA_API_KEY` (`nvapi-`) is in env, then
POSTs the full prompt to NVIDIA US cloud (UU PDP / self-hosted contradiction) — conditional/avoidable
→ ASSESS not HOLD. `install.sh` is clean (no telemetry/remote-fetch/tampering, verified). Full entry +
guardrails + re-eval triggers: `~/Documents/WORKSPACE/SEOBoost/Knowledge/Tech-Radar-SEOBoost_v1.2_2026-07-18.md`.
**If you want cross-model council anyway:** occasional external `/plugin install` per-run, sandboxed
(never `~/.claude`, never the Hermes host), never client/PII data, and every quotable verdict still
routes through `seoboost-tech-radar`/`seoboost-deep-research`.
