# AGENT ONBOARDING — working in `seoboost-skill-set` (SEO Boost)

> Canonical, version-controlled onboarding. Read & follow this at the START of SEO Boost
> work. Instead of pasting a chat blob, point any agent here:
> *"Read `agent-memory/AGENT-ONBOARDING.md` and follow it."* Edits land for everyone
> via `git pull` — keep it machine-agnostic (no host-specific paths hardcoded).

Repo: `https://github.com/<org>/seoboost-skill-set` (PRIVATE)
**The org/URL above is a PLACEHOLDER** — replace it with the real remote the first time
this repo is pushed anywhere.
**Clone path differs per machine** — do NOT hardcode it. Each machine records its own
clone path in `agent-memory/seoboost-proactive-memory-<label>.md`, created by running
`bash agent-memory/bootstrap.sh <label>` on that machine. Use that path wherever this doc
says `<clone>`. The repo ships no per-machine memory files — each machine writes its own.

The repo holds the SEO Boost skill library (the count grows constantly — don't trust a fixed
number; get the live count from the clone with `ls -d seoboost-*/SKILL.md | wc -l`) plus the
two-tier `agent-memory/`. Many agents work this repo at once — the discipline below keeps
them from colliding.

---

## 1. At start (refresh + load memory)

a. **PULL first, before anything:** `cd <clone> && git pull --ff-only`
b. **SYNC skills** into `~/.claude/skills` — `git pull` does NOT update installed skills
   (they are physical copies, not symlinks). The rsync procedure is in
   `agent-memory/seoboost-skill-set-management.md`.
c. **READ second-memory** (agent-memory protocol):
   - `agent-memory/seoboost-skill-set-management.md` (shared, every machine)
   - `agent-memory/seoboost-proactive-memory-<label-of-this-machine>.md` (per-machine)
d. **New skills activate after a session RESTART** (the skill list is read at startup).
e. **Cek koordinasi aktif (WAJIB jika ada):** di per-machine memory yang baru kamu
   baca, cari field `ACTIVE_COORDINATION:`. Jika nilainya BUKAN "none" dan tidak kosong:
   kamu bagian dari koordinasi cross-agent yang aktif. **Sebelum mulai task apapun:**
   baca `agent-memory/cross-agent/<channel>/MANIFEST.md` + baca folder `from-<partner>/`
   terbaru + baca board project (`09-AGENT-COORDINATION.md`). Lihat `seoboost-agent-coordination`
   (MUST-CHECK rule) dan `seoboost-agent-coordination` untuk protokol lengkap. Tidak ada
   pengecualian.

## 2. Concurrent coordination (many agents, one repo)

- **PULL before you start AND before you push** (avoid divergence).
- **Do NOT reset/checkout a working tree that isn't yours.** A foreign local commit or an
  "ahead of origin" repo is NOT cause for alarm — VERIFY first (`git show <sha>`, read the
  diff). Never discard blindly.
- **Give a HEADS-UP** if you make a local commit you haven't pushed (state hash + summary +
  ahead-N) so other agents know.
- **Pushing needs operator confirmation** (Iron Law #4 — no push without permission).
- **Pushing someone else's commit?** VERIFY first (additive? conflicts? PII clean?
  installed == repo?) before pushing.

## 3. Output tidiness — client formal docs (REQUIRED)

When generating formal docs (Discovery/BRD/MoM/Proposal via `seoboost-formal-docs`), do NOT dump files flat in `output/`.

Structure (once there are ≥2 document types):
```
output/
├── README.md            ← REQUIRED index: ⭐ ACTIVE / ⚠️ SUPERSEDED
├── 01-discovery/        ← Discovery_<Slug>_v{X.Y}_<date>.{docx,pdf}
├── 02-brd/  ├── 03-mom/  ├── 04-proposal/
├── 05-correspondence/   ← client WA/email replies
└── assets/              ← diagrams/images (NOT primary documents)
```
- Numbers = project flow (discovery→proposal), not alphabetical.
- 1 doc = 1 folder; `.docx` + `.pdf` together. Name: `{DocType}_{Project}_v{X.Y}_{date}`.
- Never delete old versions — mark ⚠️ in the README (audit trail).
- **Build scripts** (`build/build-<doc>.mjs`) write to the type folder, NOT flat:
  `const OUT = path.join(__dirname,'..','output','02-brd'); fs.mkdirSync(OUT,{recursive:true});`
  (diagrams/png → `output/assets/`).
- Found a flat, crowded `output/` (>6 files)? Reorganize per-type + regen PDFs + clean `qa/`.
  Full detail: `seoboost-versioned-output` Scenario 5.

## 4. Evolve skills & memory (which to use when)

- New skill worth it? → `seoboost-skill-candidate` (gate) → `writing-skills` (author)
- Enrich/fix an EXISTING skill → `seoboost-skill-updater`
- Per-PROJECT client dev knowledge → `seoboost-development-set` (→ `seoboost-devset-<project>`)
- Facts/gotchas/host (cross-machine memory) → append to `agent-memory/` + push
- Deep research (market/competitor/investment) → `seoboost-deep-research`
- Technology adoption verdict → `seoboost-tech-radar`
- Landing-page sections → `seoboost-web-sections`

Note: a **machine-label** (agent-memory, e.g. `agent-stack-macbookP-M4`, `a Linux host`) is
NOT a **devset-slug** (per-project, e.g. `project-e`). Different systems — see README.

## 5. Before pushing ANYTHING

- ☐ `git pull --ff-only` (in sync)
- ☐ Sanitize client PII (people's names, credentials, secret schemas) — never leak to the
  repo. Project name is fine; technical secrets are not.
- ☐ Script? `shellcheck` it first (available on Mac & this Ubuntu host).
- ☐ Operator confirmation (Iron Law #4).

Full reference: `agent-memory/README.md` + `agent-memory/seoboost-skill-set-management.md`.
