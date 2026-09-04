---
name: seoboost-consultant-deck
description: Use when building a stakeholder-facing consultant presentation — feasibility study, strategic assessment, business case, investment case, options appraisal, board/government/investor deck, or any "tayang konsultan / deck konsultan". Triggers include "buatkan deck konsultan", "business case presentation", "strategic assessment slides", "feasibility deck", "pitch ke pemerintah/investor", consultant-grade slides in a clean navy/red house style.
---

# SEO Boost Consultant Deck

## Overview

Produce a **consultant-grade strategic deck** — the kind an advisory firm presents to a
board, government, or investor. Two things make it "consultant-grade", and both are the
point of this skill:

1. **Structure = the Five Case Model.** Every strong business-case deck answers five
   questions in order: *should we? (Strategic) · is it worth it? (Economic) · can we
   buy/structure it? (Commercial) · can we afford it? (Financial) · can we deliver it?
   (Management).* See `references/five-case-structure.md`.
2. **Every slide title is an ACTION TITLE** — a full "so-what" sentence, not a label.
   `"Demand Assessment"` is a label; `"DPS runs out of capacity by 2030 without a second
   airport"` is an action title. The reader should grasp the argument from titles alone.

Render target: **PPTX** (primary — client-editable) and/or **HTML/reveal** (preview).
Both share one design system (`references/design-system.md`).

## When to use

- A client/board/government/investor deck that must *argue a recommendation*, not just report
- Feasibility study, business case, strategic assessment, options appraisal, investment case
- "Buatkan deck konsultan / tayang konsultan", "business case presentation", "board deck"

**When NOT to use:** internal SEO Boost formal documents → `seoboost-formal-docs`. Marketing landing pages → `seoboost-web-sections`. A deck with no argument
to make (pure status update) → plain `anthropic-skills:pptx`.

## Workflow

1. **Storyline first, slides later.** Write the action titles for the whole deck as a flat
   list — that IS the argument. If the titles don't tell a coherent story top-to-bottom,
   the deck won't either. Do this before touching any renderer.
2. **Map titles to the Five Case Model** — group into A. Overview (exec summary) → B.
   Strategic → C. Demand/Evidence → D. Options/Plan → E. Economic/Commercial/Financial/
   Management → Conclusion → Annex. (`references/five-case-structure.md` has the slide
   archetypes for each.)
3. **Fill each slide** to its archetype (divider, action-title + body, data/chart,
   options-comparison table, phase/roadmap, financial-summary). One idea per slide.
4. **Render** — `scripts/deck_pptx.py` (PPTX) or `scripts/deck_html.py` (HTML). Both take
   the same deck spec (see `assets/deck.example.json`). Run either with `--help`.
5. **QC** against the checklist in `references/five-case-structure.md` (action titles,
   footnote discipline, one-idea-per-slide, source every number).

## Bahasa — `seoboost-tulis-indonesia` wajib

Deck ini menghadap dewan, pemerintah, atau investor, jadi ragamnya **konsultan**: rekomendasi di
depan, angka menyertai klaim, ketidakpastian dinyatakan terbuka. Skill ini mengurus tata letak
dan sistem visual; `seoboost-tulis-indonesia` mengurus ragam, kalke, dan kejelasan.

Tiga hal yang paling sering merusak deck konsultan berbahasa Indonesia:

- **Action title yang diterjemahkan.** Judul slide adalah kalimat, dan kalimat inilah yang paling
  sering disusun dalam bahasa Inggris lebih dahulu. "Biaya rekonstruksi menahan margin di bawah
  12 persen" benar; "Reconstruction cost menekan margin" setengah jadi.
- **Kapital Di Setiap Kata pada judul.** Kebiasaan bahasa Inggris, tidak berlaku di Indonesia.
- **Klaim tanpa pembanding.** "Lebih efisien" dan "meningkat" tidak berarti apa-apa di slide yang
  dipakai mengambil keputusan.

Konvensi penulisan SEO Boost (`seoboost-formal-docs` → Document language) berlaku penuh, termasuk larangan
menulis "klien" — sebut nama pihaknya. Untuk deck berlogo SEO Boost pakai `seoboost-formal-deck`.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```

## Design system (summary)

Navy `#1B3A6B` + red `#C00000` accents on white; Segoe UI (fallback Arial). Content slide =
thin top rule + red square marker top-left, navy bold action title, red section kicker,
numbered footnotes small-grey at the bottom, page number bottom-left. Full tokens +
archetype specs: `references/design-system.md`.

> The palette/fonts here are a sensible distilled default. Swap in the client's or SEO Boost's
> exact brand hexes/logo before delivery — confirm, don't assume.

## Quick reference

| Need | Go to |
|---|---|
| What sections, in what order, which slide archetype | `references/five-case-structure.md` |
| Colors, fonts, spacing, action-title rules, footnote style | `references/design-system.md` |
| Generate PPTX | `scripts/deck_pptx.py` (python-pptx) |
| Generate HTML/reveal preview | `scripts/deck_html.py` |
| Deck spec shape (titles, bodies, tables) | `assets/deck.example.json` |

## Common mistakes

- **Label titles instead of action titles.** The #1 tell of an amateur deck. Every title is a sentence with a verb and a so-what.
- **Numbers without a source.** Every figure gets a superscript footnote (source + year + assumption). Consulting rigor lives in the footnotes.
- **Two ideas on one slide.** Split it. The action title names the single idea.
- **Skipping the storyline step** and writing slides directly — you get a report, not an argument.
- **Shipping the placeholder palette.** The default navy/red is a starting point; confirm the real brand before delivery.
