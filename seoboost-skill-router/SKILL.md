---
name: seoboost-skill-router
description: Use at the START of any SEO Boost session, or whenever unsure WHICH seoboost-* skill to reach for and in what order — to route a task to the right skill fast and in the correct lifecycle position (onboarding → coordinate → work → capture → deploy → checkpoint → contribute), while keeping token usage low. Triggers — "skill mana yang aku pakai", "which skill for this", "cek skill kita", "urutan pakai skill", "biar hemat token", at session start on a SEO Boost project, or before deciding whether a task even needs a skill. NOT a replacement for the target skills — it points to them. For the full org-level SOP see ~/.claude/seoboost-skill-set/SKILLS-SOP.md.
---

# SEO Boost Skill Router

## Overview

A fast router + lifecycle map for the SEO Boost skill library. Its whole job is to get you to the
**right skill, at the right moment, with minimal tokens** — then get out of the way. It does
not do the work; it hands off to the target skill.

**Core principle:** skill descriptions are already in context (progressive disclosure) — so the
waste is never "not knowing a skill exists", it's **picking the wrong one, invoking five for a
one-liner, or reaching for them out of order** (e.g. forking without checkpoint = context loss).

## Token discipline (the reason this skill exists)

- Skills auto-expose their **description**; the **body** loads only on invoke. Never `cat`/Read a
  SKILL.md just to "see what's there" — invoke it, or don't.
- **One skill = one job.** Pick the *narrowest* skill that fits. Skip skills for trivial tasks.
- Delegate multi-file reading to an **Explore/Plan** agent (keep the conclusion, not the dump).
- **Capture durable facts the moment they appear** — don't defer to `/compact` (paraphrase loses
  literal quotes/numbers).
- **Long sessions / heavy tool output** — use `context-mode` MCP (already installed) to sandbox
  raw output. For token compression before it even reaches the LLM (60-95% reduction on JSON,
  15-20% on coding), wrap the coding agent: `headroom wrap claude` from terminal — session-level,
  not per-skill.

## The lifecycle — reach for skills in this order

| Phase | When | Skill |
|---|---|---|
| **Onboard** | new/resumed SEO Boost project | `seoboost-project-onboarding` (new) · read repo `agent-documentation/` (existing) · `seoboost-context-enrichment` (refresh ecosystem/client context) |
| **Coordinate** | >1 session same project | `seoboost-agent-coordination` · `seoboost-agent-coordination` |
| **Plan & run** | task won't finish in one reply | `seoboost-workplan` — DoD contract (approve once) → agent fan-out sized to complexity → QC by an agent that did NOT do the work → plain-language report |
| **Work** | execute the task | domain skill (see map below) → verify with `verify` / `run`. Under a workplan this is the step it *picks from*, not a step it replaces |
| **Close sprint** | "sprint X selesai" / "tutup sprint" / "wrap up sprint" / closure phase | `seoboost-sprint-close` — Sprint Completion Reporting Convention: fresh audit on both repos, live e2e, CI Run ID, doc consistency, git clean, stage name + mandatory report format; then hands off to `seoboost-skill-evolution` (harvest) and `seoboost-fork-checkpoint` if the session ends |
| **Capture** | client decision / chat (continuous!) | `seoboost-decision-tracking` · `seoboost-communication-log` |
| **Report out** | scheduled/milestone status report TO the client | `seoboost-laporan-klien` — facts from ProjectDocs, drafted per channel (short WA vs formal email/doc), gated by `seoboost-bahasa-jernih` + `seoboost-tulis-indonesia` + Honest Reporting, then logged to 06 |
| **Deploy** | ship to prod | `seoboost-deploy-queue` → `seoboost-verify-deploy` (+ `seoboost-deploy-docker-cloudflared`) |
| **Checkpoint** | fork / `/compact` / close | `seoboost-fork-checkpoint` |
| **Contribute** | wrap-up, "is there a skill here?" | `seoboost-skill-candidate` (gate) → `writing-skills` / `seoboost-development-set` |
| **Evolve** | sprint close, after checkpoint, monthly, post-incident — "panen pelajaran" | `seoboost-skill-evolution` — harvest 09 entries / operator corrections, classify, route to `seoboost-skill-updater` / `seoboost-skill-candidate` / operator proposal / agent-memory; canon changes stay proposals |
| **Maintain** | edit ONE existing skill's content (fold new gotcha/fix) | `seoboost-skill-updater` |
| **Audit** | weekly/monthly, after major install, or when router feels stale | `seoboost-skill-ecosystem-audit` (versions, deprecations, router drift) |

## Domain map — task → skill

- **Architecture / code quality:** `seoboost-working-with-legacy-code` (Feathers technique
  catalog); book-summary skills removed 28 Aug 2026 after audit — use native
  `fullstack-dev-skills:architecture-designer`, `fullstack-dev-skills:cloud-architect`,
  per-stack experts, and harness `code-review`/`simplify`;
  platform: `repomix` (pack whole repo into 1 AI-friendly file — pair with
  `seoboost-working-with-legacy-code` when onboarding onto an unfamiliar/large codebase),
  `serena` (MCP semantic code retrieval/editing via LSP — pair with harness
  `simplify`/`code-review` for precise cross-file refactors; requires its MCP
  server connected, unlike `repomix` which is a plain CLI — `npx repomix@latest`),
  `graphify` (turn codebase + docs + SQL + configs + PDFs into queryable knowledge graph —
  local AST parsing, no vector store; type `/graphify .` in project — great for large/legacy
  onboarding + cross-file question answering, complements `repomix` for one-shot pack vs
  `graphify` for repeated queries).
- **Deploy / infra:** `seoboost-deploy-queue`, `seoboost-deploy-docker-cloudflared`, `seoboost-verify-deploy`,
  `seoboost-cicd-selfhosted-runner`, `seoboost-migration-rehearsal`, `seoboost-react-peer-dep-docker-trap`,
  `seoboost-remote-agent-hardening`, `seoboost-edit-multi-tunnel`, `seoboost-app-version-stamp`,
  `seoboost-pwa-update-prompt`, `seoboost-single2multitenant-saas`, `seoboost-mock-check`, `seoboost-minio-proxy-photo`.
- **Product / discovery:** `seoboost-mom-test`, `seoboost-lean-ux`; framework summaries removed
  28 Aug 2026 after audit — use `superpowers:brainstorming` + model knowledge.
- **Design / frontend / UI / UX:** → invoke **`seoboost-uiux-design-router`** first. NOTE: most of
  the skills it routes to are EXTERNAL (skills.sh, not this repo) — run
  `install-design-stack.sh` once per machine or the router dead-ends at its own mandatory
  Tier 0. It defines
  the mandatory-impeccable rule + 4-tier stack (discipline → context → execution → specific →
  quality gate) covering `frontend-design` (native), `seoboost-design-dna`,
  `seoboost-top-design`, `seoboost-ux-heuristics`, `seoboost-ios-hig-design`,
  `seoboost-microinteractions`, `seoboost-web-sections`, `seoboost-web-typography`, `seoboost-web-asset-generator`,
  `seoboost-financial-report-ui`, platform (`ui-ux-pro-max`, `dataviz`),
  taste-skill bundle (Leonxlnx 13 skills — `design-taste-frontend`, `minimalist-ui`,
  `industrial-brutalist-ui`, `high-end-visual-design`, `gpt-taste`, `redesign-existing-projects`,
  `image-to-code`, `imagegen-frontend-*`, `brandkit`, `stitch-design-taste`, `full-output-enforcement`),
  Emil Kowalski (`emil-design-eng`, `apple-design`, `animation-vocabulary`, `pick-ui-library`),
  official GreenSock animation (`gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`,
  `gsap-plugins`, `gsap-performance` — replaces deprecated `seoboost-gsap-*` + `gsap-master` since
  2026-08-07), and `21st` MCP for component generation. 3D/immersive: `seoboost-threejs-pointer`
  (pointer only, not vendored — install on-demand).
- **Docs / output:** `seoboost-formal-docs` (formal docs, all types) · `seoboost-invoice-docs`
  (tagihan) · `seoboost-pks-docs` (kontrak kerja sama)
  · `seoboost-versioned-output` · `seoboost-gdrive`; platform: `anthropic-skills:docx/pptx/xlsx/pdf`.
  **`seoboost-tulis-indonesia` — lapisan BAHASA, wajib untuk apa pun berbahasa Indonesia yang
  dibaca orang lain** (dokumen, salinan web, teks antarmuka, email klien, caption). Dipakai
  BERSAMA skill dokumen di atas, bukan menggantikannya: skill dokumen mengurus merek dan tata
  letak, skill ini mengurus ragam dan kejelasan. Kecuali balasan chat ke operator sendiri.
  **`seoboost-surat-register` — WAJIB saat dokumen keluar butuh NOMOR SURAT** (kontrak/PKTA/PKS, NDA,
  invoice, surat tugas/penugasan, penawaran, berita acara, MoU, dst): ambil nomor dari register
  company-wide, jangan pernah karang nomor. Pakai bersama skill dok di atas — dok merender, register
  memberi nomor + melacak.
  **`seoboost-laporan-klien` — outgoing status report to a client (short WA or formal email/doc):**
  gathers facts from ProjectDocs, drafts per channel, gates through the language skills above,
  then logs the sent report to `06-COMMUNICATION-LOG.md`. Counterpart of
  `seoboost-communication-log` (that one records INCOMING chats).
- **SEO (in order, native skills.sh):** `seo-project-setup` → `keyword-research` →
  `keyword-clustering` → `competitor-analysis`/`competitive-landscape` → `link-prospecting`;
  coach: `seo-coach` (the `seoboost-open-seo-*` series was removed 28 Aug 2026 — 1:1 duplicates).
- **Research:** `seoboost-deep-research` (sourced multi-lens) · `seoboost-tech-radar` (adoption verdict).
- **Comms infra:** `seoboost-claude-telegram-setup`, `seoboost-telegram-morning-insight-briefing`,
  `seoboost-hermes-agent-update` (upgrade/profil/config Hermes), `seoboost-hermes-plugin-dispatch`
  (menulis slash command Hermes / menjembatani chat ke Claude Code), `seoboost-ig-summarizer`.
- **Cross-project reuse:** `seoboost-cross-project-reuse`; per-project devsets live under the
  `seoboost-devset-<project>` prefix and are authored on demand via the gate `seoboost-development-set`.
  The repo ships none — a client runbook is written when that client exists.
- **Strategy / consulting:** `seoboost-management-consulting` (issue trees, strategy canvases, SVG
  diagrams for structured recommendations).

## Decide-fast heuristic

1. Is the task trivial (< the target skill's own "Skip" bar)? → **no skill**, just do it.
2. Does it touch a **client decision or conversation**? → capture skill **now**, in parallel.
3. **Issuing/numbering a document with a nomor surat?** → `seoboost-surat-register` **first** (get the number), then the doc skill. Never fabricate a number.
4. **Won't finish in one reply?** → `seoboost-workplan` wraps it end-to-end. It still picks a
   domain skill from the map below — it orchestrates, it does not replace them.
5. Otherwise pick **one** narrowest domain skill from the map. Invoke it. Follow it.
6. About to fork / compact / close? → `seoboost-fork-checkpoint` first, always. A live `WORKPLAN.md`
   makes this cheaper (task state is already written) but does **not** replace it — checkpoint
   holds project memory, workplan holds one task's contract.

## When NOT to use

- Mid-task when you already know the exact skill — just invoke it directly.
- To learn *how* to author a skill — that's `writing-skills`; whether/which is `seoboost-skill-candidate`.
- Project-specific conventions belong in that repo's CLAUDE.md / agent-documentation, not here.
