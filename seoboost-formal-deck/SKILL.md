---
name: seoboost-formal-deck
description: "Use this skill whenever creating slide decks or presentations for PT Algo Sea Biz (SEO Boost) / SEO Boost. Triggers include: pitch deck, investor deck, client presentation, internal discussion deck, proposal pemaparan, audiensi deck, kickoff deck, status update deck, roadmap presentation, project review deck, or any .pptx that needs SEO Boost visual identity. Style: warm charcoal #231F20 background, bright signal orange #FF8800 accents, Arial typography, 16:9 widescreen, numbered badge cards, insight sidebars, program rows, gantt timelines, page badge in top-right. Output is .pptx (always) and .pdf (for distribution). Do NOT use for Word documents (use seoboost-formal-docs instead), single-image graphics, casual visuals, social posts, or non-SEO Boost-branded decks."
license: Proprietary — PT Algo Sea Biz internal use
version: 1.0
---

# SEO Boost Formal Deck Skill

Style guide and helper library for producing SEO Boost-branded slide decks (.pptx with optional .pdf conversion). Visual sibling to `seoboost-formal-docs` — same brand DNA, different medium. One source of truth for typography, colors, components, and slide layouts.

## When to use

Trigger this skill for any of these deliverables:

| Category | Examples |
|----------|----------|
| **Pemaparan / proposal** | Pitch deck, investor deck, client pemaparan, partnership proposal deck |
| **Internal** | Kickoff deck, status update, roadmap presentation, internal discussion deck |
| **Stakeholder / audiensi** | Audiensi deck for Pemprov / Pemda / BUMD, board presentation, sponsor briefing |
| **Project lifecycle** | Project charter deck, sprint review, post-mortem retrospective deck |

**Skip this skill for:** Word documents (→ `seoboost-formal-docs`), single-image graphics, infographic posters, social-media images, or decks needing a non-SEO Boost visual identity (white-label client work).

## Workflow (always follow this order)

1. **Read** `design-tokens.md` and `components.md` for visual rules
2. **Plan** the deck: which slides, which patterns (see `workflow.md` step 1)
3. **Copy** `templates/deck-skeleton.js` to your working directory as a starter
4. **Edit** the `DECK = { ... }` content data with real content (Bahasa Indonesia by default)
5. **Build** with `node deck.js path/to/output.pptx`
6. **Convert** to PDF: `python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf output.pptx`
7. **Visual QA** — rasterize with `pdftoppm -jpeg -r 100 output.pdf slide` and inspect every page for overflow / overlap / misalignment
8. **Present** both PPTX and PDF via `present_files` (PPTX first since it's editable)

Full details for each step are in `workflow.md`.

## Quick reference

| File | Purpose |
|------|---------|
| `design-tokens.md` | Color palette, typography, sizing — single source of truth |
| `components.md` | Catalog of every visual component (badge card, insight sidebar, gantt, etc.) with usage examples |
| `workflow.md` | Detailed plan → build → validate → convert → QA → present workflow |
| `helpers.js` | The pptxgenjs helper library — `makeDeck`, `addCover`, `addContentScaffold`, `addBadgeCard`, `addProgramCard`, `addInsightSidebar`, `addNumberedRow`, `addStatCard`, `addPhaseStripCard`, `addBottomCallout`, `addGanttHeader`, `addGanttRow`, `addClosing` |
| `templates/deck-skeleton.js` | Full 7-slide deck starter exercising every layout pattern — COPY THIS as your starting point |

## Critical rules (do NOT violate)

1. **Always use `helpers.js`** — never hand-roll `slide.addShape` / `slide.addText` for things the helpers cover. The helpers encode validation-safe patterns, consistent spacing, and brand colors.
2. **Slide size = 13.333 × 7.5 inches** (LAYOUT_WIDE, 16:9). Never 4:3 unless explicitly requested.
3. **Font = Arial** as default (parity with `seoboost-formal-docs`). No Calibri, no Helvetica, no Georgia.
4. **Background = `COLOR.CHAR_BG` (#231F20)** on every slide. The deck is dark-mode only — never a white slide in the middle.
5. **Colors via `COLOR.*` tokens only** — never hardcode hex outside `helpers.js`. Reference: `design-tokens.md`.
6. **Every content slide needs `addContentScaffold`** (or manually `addHeader` + `addTitleBlock` + `addFooter`). A bare slide with no header/footer chrome looks broken.
7. **Body content lives in y = 2.5 to 6.5**. Above is title block, below is footer. Going outside this zone collides with chrome.
8. **No `\n` inside `addText` for body content** — use separate text blocks for separate paragraphs. `\n` IS supported inside cover `title` and similar (where you want explicit line breaks in a single text block).
9. **Page numbering** uses `pageNum`/`totalPages` where totalPages counts EVERY page (cover + content + closing). The reference uses "02/07 … 06/07" for content slides — cover is unnumbered, closing is unnumbered.
10. **Every deck has a cover + at least 1 content + closing.** A "minimum SEO Boost deck" is 3 slides; typical is 7.

## Deck language

Default language is **Bahasa Indonesia** for SEO Boost internal/client decks (per SEO Boost operating context). Use English only when:
- Deck is for international stakeholders / non-Indonesian audience
- Explicitly requested by the user
- Mixed-language is acceptable for technical terms (API names, framework names, etc.)

Eyebrows, section labels, and footer text can stay in Indonesian even if titles are English (e.g., "INSIGHT KUNCI" as eyebrow is fine in an English deck).

### Konvensi penulisan SEO Boost — berlaku wajib

Aturan lengkapnya ada di **`seoboost-formal-docs` → Document language**, dan berlaku untuk deck juga.
Empat hal yang paling sering dilanggar di slide:

1. **Jangan menerjemahkan istilah teknis yang sudah lazim berbahasa Inggris.** GAP, checklist,
   threshold, stakeholder, decision point, revenue share, dispute. Kalibrasinya ke tulisan
   teknis pihak itu sendiri, bukan selera penulis.
2. **Jangan pernah menulis "klien".** Sebut namanya langsung.
3. **Tidak ada kalimat kosmetik.** Bullet yang tetap utuh maknanya setelah dihapus, hapus.
4. **SEO Boost bukan pihak yang menuntut.** Tulis dari sudut pihak yang berkepentingan.

Istilah hukum dan regulasi domestik tetap Indonesia: tera, laik jalan, KIR, angsuran, izin trayek.

**Lapisan bahasa: `seoboost-tulis-indonesia` wajib, dipakai bersama skill ini.** Skill ini mengurus
tata letak dan merek; skill itu mengurus ragam, kalke, dan kejelasan.

Dua aturan tambahan khusus slide, karena ruangnya sempit dan penulis cenderung memampatkan:

- **Bullet tetap kalimat Indonesia, bukan telegram Inggris yang diterjemahkan.** Bullet paling
  rawan kalke justru karena dipendekkan dari kalimat Inggris di kepala penulis.
- **Judul slide memakai kapital di awal kalimat saja**, bukan Kapital Di Setiap Kata — pola itu
  terbawa dari kebiasaan bahasa Inggris dan tidak berlaku di Bahasa Indonesia.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```

## Output conventions

- **Filename:** `SEO Boost_Deck_{ClientOrTopic}_v{X.Y}.pptx` (e.g., `SEO Boost_Deck_Klien C_v1.0.pptx`, `SEO Boost_Deck_Kickoff_2026-05.pptx`)
- **Always produce both** `.pptx` and `.pdf` unless user requests only one
- **Working directory:** `/home/claude/{project}/` — copy finals to `/mnt/user-data/outputs/`
- **Present PPTX first**, PDF second (PPTX is editable, primary deliverable)

## Reference example

Run `templates/deck-skeleton.js` unmodified to produce a reference deck: it exercises every component pattern end-to-end and is the fastest way to see the current tokens applied. The repo ships no rendered sample on purpose — a stale .pptx would drift from `design-tokens.md`.

## Related skills

- **`seoboost-formal-docs`** — sibling skill for Word documents (PRD, MoM, proposal, etc.). Same brand DNA, different medium. Use that when the deliverable is a `.docx` or `.pdf` (paginated document), this one when it's a `.pptx` (slide deck).
- **`pptx`** (public) — base skill for any .pptx work. This skill builds on top of it; you don't need to read `pptx/SKILL.md` separately unless you're doing edge-case manipulation outside this skill's scope.
