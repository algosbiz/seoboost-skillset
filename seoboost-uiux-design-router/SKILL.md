---
name: seoboost-uiux-design-router
description: Use at the START of any UI/UX/frontend/design task in SEO Boost projects, or when unsure which design skill(s) to load and in what order. Triggers — "design ...", "buat UI ...", "buat komponen ...", "bikin halaman ...", "polish tampilan ...", "fix layout ...", "audit visual", "refactor UI", "frontend work", "landing page", "dashboard UI", "mobile app screen". Routes design work through a 4-tier stack (discipline → context → execution → specific → quality gate) and enforces the mandatory-impeccable rule (`impeccable` WAJIB pada setiap UI touchpoint). IMPORTANT — 25 of the skills it routes to are EXTERNAL (skills.sh registries, not in seoboost-skill-set); run `install-design-stack.sh` once per machine or this router dead-ends, and follow its Degradation section when a skill is absent instead of proceeding silently. NOT a replacement for the target skills — it points to them and defines invocation order. For general SEO Boost lifecycle routing use `seoboost-skill-router`. For full org SOP see `~/.claude/seoboost-skill-set/SKILLS-SOP.md` section G.
---

# SEO Boost UI/UX Design Router

Routes UI/UX/frontend/design work to the right skills in the right order.
Design domain has grown too large (30+ skills across taste, discipline, implementation) —
loading everything wastes tokens. Load per tier, per need.

## Prerequisites — most skills below are NOT in this repo

**Read this before routing anything.** Of the skills this router points to, 25 come
from public skills.sh registries, not from `seoboost-skill-set`. `git pull` and
`sync-skills.sh` will never install them. A machine that has only the repo will
dead-end here, including at Tier 0.

Install them once per machine:

```bash
bash <repo>/install-design-stack.sh --check   # report what is missing
bash <repo>/install-design-stack.sh           # install
```

External sources, for reference:

| Source | Provides |
|---|---|
| `pbakaus/impeccable` | `impeccable` (Tier 0, mandatory) |
| `nextlevelbuilder/ui-ux-pro-max-skill` | `ui-ux-pro-max` |
| `vercel-labs/agent-skills` | `web-design-guidelines` (Tier 4) |
| `emilkowalski/skills` | `emil-design-eng`, `apple-design`, `animation-vocabulary`, `pick-ui-library` |
| `greensock/gsap-skills` | `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-plugins`, `gsap-performance` |
| `Leonxlnx/taste-skill` | the 13-skill taste bundle (Tier 1 and Tier 2) |

Not covered by the script: `21st` MCP (needs the operator's own API key, never
committed) and `graphify` (pip, not a design skill).

**In-repo skills** (`seoboost-design-dna`,
`seoboost-top-design`, `seoboost-ux-heuristics`,
`seoboost-ios-hig-design`, `seoboost-microinteractions`, `seoboost-web-sections`,
`seoboost-web-typography`, `seoboost-financial-report-ui`) arrive
with a normal repo sync and need nothing extra. (`seoboost-refactoring-ui`,
`seoboost-design-everyday-things`, `seoboost-high-perf-browser` were removed 28 Aug 2026 after
the ecosystem audit — covered by `impeccable` + `web-design-guidelines`.)

## Degradation — what to do when a skill is absent

Never route to a skill without checking it exists, and never proceed silently as if
Tier 0 were satisfied when it was not.

1. **`impeccable` missing** → STOP and tell the operator: "Tier 0 (`impeccable`) is
   not installed on this machine, so the mandatory-impeccable rule cannot be
   satisfied. Run `install-design-stack.sh`, or confirm you want me to proceed
   without design-slop detection." Wait for an explicit answer. Do not substitute
   `ui-ux-pro-max` and call the gate met; it is a different skill with different
   coverage.
2. **A Tier 1 aesthetic skill missing** → fall back to `frontend-design`
   (native Anthropic) and say which direction skill you wanted and why it was unavailable.
3. **A Tier 3 specific skill missing** → say so and continue without it, unless the
   task IS that sub-domain (e.g. a GSAP task with no `gsap-*` installed). In that
   case stop and ask.
4. **Machine is not a frontend box at all** (headless agent, CI runner) → this router
   does not apply. Say so plainly and hand back to `seoboost-skill-router`.

Deprecated `seoboost-gsap-*` are still present in the repo pending an ecosystem audit.
They are NOT a valid fallback for the official `gsap-*`. If a machine has only
`seoboost-gsap-*`, treat GSAP as unavailable per rule 3.

## Mandatory-impeccable rule (non-negotiable)

Setiap UI touchpoint (design, build, refactor, polish, audit) WAJIB pakai
`impeccable`. Alasan: keluaran AI default cenderung generic slop; impeccable menegakkan
design vocabulary + slop detection. Discipline umum tidak bisa dilewati.

> Catatan penomoran: jangan rujuk aturan ini dengan nomor. `~/.claude/CLAUDE.md`
> menomori aturan impeccable sebagai Iron Law #7, sedangkan system prompt operator
> memakai nomor 7 untuk aturan lain (multi-perspective council). Sebut namanya,
> bukan nomornya.

## The 4-tier stack — load per tier, per need

### Tier 0 — DISCIPLINE (always load saat UI touch)

- `impeccable` — design vocabulary + slop detection + live iteration
  (https://impeccable.style). EXTERNAL: `npx skills add pbakaus/impeccable`.
  It is a skill, not a Claude Code plugin; the older
  `/plugin marketplace add pbakaus/impeccable` instruction is wrong.

### Tier 1 — CONTEXT / AESTHETIC (pilih 1-2 sesuai brief klien)

Tentukan **arah visual** sebelum eksekusi.

- `emil-design-eng` — Emil Kowalski polish philosophy (invisible details, animation)
- `apple-design` — Apple HIG motion, fluid physics, spring, gestures, translucent materials
- `high-end-visual-design` — agency-grade "expensive-feeling" websites
- `minimalist-ui` — editorial monochrome, flat bento, muted
- `industrial-brutalist-ui` — Swiss + military terminal, rigid grids, declassified-blueprint feel
- `gpt-taste` — editorial GSAP-heavy, wide typography, AIDA structure

### Tier 2 — EXECUTION (per feature / per iteration)

Tools untuk actually build.

- `frontend-design` (natif Anthropic) — arah visual umum (menggantikan `seoboost-frontend-design`,
  dihapus 29 Agu 2026 — body-nya memang identik dengan yang natif)
- `seoboost-design-dna` — reverse-engineer referensi (screenshot/URL) → design tokens.
  **Run BEFORE `frontend-design` kalau ada referensi konkret**
- `design-taste-frontend` (Leonxlnx v2) — landing/portfolio/redesign, brief-driven direction
- `design-taste-frontend-v1` — v1 preserved untuk backward-compat
- `redesign-existing-projects` — audit-first upgrade website/app existing ke premium
- `stitch-design-taste` — generate agent-friendly `DESIGN.md` untuk Google Stitch
- `image-to-code` — visual-first web tasks: generate design image → deeply analyze → implement
- `seoboost-top-design` — Awwwards-level immersive/motion (heavy)

### Tier 3 — SPECIFIC (per kebutuhan sub-domain)

Pilih hanya yang relevan.

**Motion / animation:**
- `gsap-core` · `gsap-timeline` · `gsap-scrolltrigger` · `gsap-plugins` · `gsap-performance`
  (official GreenSock, 40K+ installs each) — **pilih paling sempit**
- `animation-vocabulary` — naming lookup ("apa nama efek yang bouncy saat popover buka?")
- `seoboost-microinteractions` — micro-interaction patterns

**Component / library selection:**
- `pick-ui-library` — pilih library trusted (toast/drawer/date picker/dll) instead
  of hand-roll atau install abandoned package
- `21st` MCP — component generation (magic UI, 21st.dev registry)
- `mcp__Shadcn_UI__*` — shadcn/ui component library

**Mockup / image gen:**
- `imagegen-frontend-web` — premium web design references (ONE image per section)
- `imagegen-frontend-mobile` — app-native screen concepts dengan phone mockup
- `brandkit` — brand-guidelines board, logo system, identity deck

**Typography / sections:**
- `seoboost-web-typography` — web typography
- `seoboost-web-sections` — page section patterns

**Platform-specific:**
- `seoboost-ios-hig-design` — iOS Human Interface Guidelines
- `seoboost-financial-report-ui` — laporan keuangan (P&L, neraca, dll) house standard

**Design system seed:**
- `getdesign.md` (CLI, not a skill) — `npx getdesign@latest add <brand>` untuk seed
  `DESIGN.md` dari brand referensi (Stripe, Vercel, dll). Adapt ke identity klien.
  Local mirror: `~/.claude/design-md-library/design-md/<brand>/DESIGN.md`

### Tier 4 — QUALITY GATE (sebelum ship / setelah build)

- `seoboost-ux-heuristics` — Nielsen + heuristik lain
- `web-design-guidelines` — UI code review terhadap Web Interface Guidelines
- `gpt-taste` (audit mode) — editorial audit

## Decide-fast heuristic

1. **Mandatory-impeccable rule:** Tier 0 (`impeccable`) — WAJIB, tidak bisa dilewati. Load first.
2. **Ada referensi visual konkret (screenshot/URL/brand)?** → Tier 2 `seoboost-design-dna` FIRST,
   atau Tier 3 `getdesign.md` CLI kalau brand mainstream (Stripe/Vercel/dll).
3. **Pilih 1 Tier 1** yang match brief:
   - "premium", "agency", "high-end" → `high-end-visual-design`
   - "Apple-style", "iOS-feel", "fluid" → `apple-design`
   - "polish", "animation matters" → `emil-design-eng`
   - "minimalist", "editorial" → `minimalist-ui`
   - "brutalist", "raw" → `industrial-brutalist-ui`
4. **Task type di Tier 2:**
   - Baru dari nol → `design-taste-frontend`
   - Refactor existing → `redesign-existing-projects`
   - Visual-first → `image-to-code`
   - Stitch → `stitch-design-taste`
5. **Sub-domain?** Load Tier 3 hanya yang relevan (motion? → gsap-*; library pick? → pick-ui-library; mockup? → imagegen-*).
6. **Sebelum ship:** Run 1 Tier 4 skill (`seoboost-ux-heuristics` atau `web-design-guidelines`).

## Anti-pattern

- **Load semua tier sekaligus** — token waste. Load per tier, per need.
- **Skip Tier 0** karena "task simple" — melanggar mandatory-impeccable rule. Ship generic slop.
- **Route ke skill yang tidak terpasang di mesin ini** — cek dulu, lalu ikuti aturan
  Degradation di atas. Diam-diam melanjutkan seolah Tier 0 terpenuhi adalah kegagalan
  paling mahal karena tidak terlihat sampai hasilnya sudah dikirim ke klien.
- **Overlap `gsap-master` (user-authored, deprecated 2026-08-07) + `gsap-*` official** — pakai official saja.
- **Overlap `seoboost-gsap-*` (user-authored, deprecated 2026-08-07) + `gsap-*` official** — pakai official saja.
- **Skip Tier 4** — ship tanpa audit visual/UX. Regression tidak ketahuan.

## When NOT to use this router

- Task bukan UI/UX (backend, database, docs, ops) → pakai `seoboost-skill-router` general.
- Sudah tahu skill spesifik yang perlu → invoke langsung, jangan lewat router.
- Trivial CSS tweak (ganti warna, spacing 1px) → skip router, langsung edit.

## Cross-references

- General SEO Boost lifecycle routing: `seoboost-skill-router`
- Full org SOP + skill inventory: `~/.claude/seoboost-skill-set/SKILLS-SOP.md` section G
- Mandatory-impeccable rule: `~/.claude/CLAUDE.md` — Engineering Convention section
  (dinomori Iron Law #7 di file itu; jangan pakai nomornya lintas-dokumen)
- Getdesign.md workflow: `~/.claude/CLAUDE.md` — Design Resources section
