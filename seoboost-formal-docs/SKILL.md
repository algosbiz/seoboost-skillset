---
name: seoboost-formal-docs
description: "Use this skill whenever creating formal business or technical documents for PT Algo Sea Biz (SEO Boost) — the parent/holding (corporate) brand. Triggers: PRD, system design document, technical specification, software architecture document, API specification, engineering runbook, minutes of meeting (MoM), business proposal, concept note, feasibility study, white paper, RFP/RFQ response, project charter, post-mortem, or any formal document that needs SEO Boost corporate visual identity. Style: SEO Boost brand — orange #FF8800 (logo mark) + charcoal, on a WHITE printable body with CHARCOAL-DARK anchor surfaces (cover hero, section header bands, table headers, metric cards, one reserved dark callout) where the orange glows. Section headings = charcoal band + orange lead-tick + title (NO badge chips, NO section numbers on bands). Callouts = full border + tint + labeled heading (NO side-stripes). Includes hand-drawn Rough.js diagrams (technical/architecture) and professional SVG charts bar/line/donut (data). THREE output lanes: .html (read-first — shared via link/WhatsApp, mobile-friendly, self-contained single file), .docx (fill-in / edit-first), .pdf (print + file record; companion to either lane). Do NOT use for casual notes, informal chat, single-page summaries, marketing copy."
license: Proprietary — PT Algo Sea Biz internal use
version: 2.1
---

# SEO Boost Corporate — Formal Documents Skill

Style guide + helper library for **PT Algo Sea Biz (parent/holding "Market Smarter") corporate** documents in DOCX (+ PDF). One source of truth for the SEO Boost brand: orange `#FF8800` (sampled from the logo mark) + charcoal, with hand-drawn diagrams and professional charts.

> **One house brand.** White body + **charcoal-dark anchor surfaces** (cover hero, section bands, cards) where the brand orange `#FF8800` glows. Architectural, premium, kinetic. Sibling media: decks → `seoboost-formal-deck`, invoices → `seoboost-invoice-docs`, contracts → `seoboost-pks-docs`.

## The committed identity

**Every structural ANCHOR is a solid charcoal tile with the brand orange glowing inside it** — cover hero, section-header band (orange lead-tick + soft-white title), table header (orange seam), metric cards (orange value), process-flow chevrons, diagram anchor node. The white body is the "paper"; charcoal tiles are "the brand returning to the surface"; orange only ever *glows* (never readable text on white). Body ink = `#3A3733` (the logo's diagonal stripe color, not black) so every page subliminally carries the M.

## Pick the output lane FIRST

The visual system is identical across lanes — same tokens, same components, same rules. A reader
must not be able to tell which lane a document came from. Choose by **what the recipient will do
with it**, not by habit:

| Recipient will… | Lane | Why |
|---|---|---|
| **Read** it — link over WhatsApp/email, opened on a phone | **HTML** (+ PDF if they may print) | Indonesian clients read on phones far more than they print. A DOCX attachment often goes unopened on mobile. |
| **Edit / fill in** it — redlines, tracked changes, fills sections | **DOCX** (+ PDF) | Only DOCX is genuinely editable by the recipient. |
| **File / sign / print** it | **DOCX + PDF** | Archival and signature flows. |
| Internal doc revised often | **HTML** | One self-contained file to edit, no rebuild step. |

HTML does **not** replace DOCX, and it cannot do running page numbers or an auto TOC — those are
DOCX-lane features. When in doubt: HTML for reading, PDF for the record.
Full rules for the HTML lane: **`html-standard.md`**.

## When to use

| Category | Examples |
|----------|----------|
| **Product** | PRD, technical spec, feature spec, product brief |
| **Engineering** | System design doc, architecture, API spec, runbook, post-mortem, ADR |
| **Business** | Proposal, concept note, feasibility study, project charter, white paper |
| **Operations** | Minutes of Meeting (MoM), formal memo, RFP/RFQ response |

**Skip for:** casual notes, informal chat, single-page summaries, marketing copy.

## Workflow — HTML lane

1. **Read** `design-tokens.md` + `html-standard.md` — including its two traps and gate snippet.
2. **Copy** `templates/html-shell.html`, **drop everything above `<html>`** (authoring note, not
   deliverable), then replace the `__PLACEHOLDER__` tokens.
3. **Write content** between the CONTENT markers using only the classes the shell defines.
   Locate the markers with `lastIndexOf` — a regex matches the header mention and eats the cover.
4. **Decide on the back page** (`.back`, the closing-quote page): fill `__QUOTE__` /
   `__QUOTE_ATTR__`, or delete the section as a unit. Always last, after `</footer>`.
5. **Inline the mark** — `sips -Z 560 assets/seoboost-wordmark-light.png`, base64, substitute `__LOGOMARK__`.
   It is the charcoal-surface mark, used on both the cover hero and the back page.
6. **Render the PDF companion:**
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="<out>.pdf" "file://<abs>.html"`
   (`--no-pdf-header-footer` matters — Chrome otherwise stamps its URL and date over the design.)
7. **Visual QA both media** — open the HTML (cover hero, section band, table, callout, back page),
   then `pdftoppm -jpeg -r 70 <out>.pdf qa/p`. **Check that page 1 is the cover** — the traps in
   `html-standard.md` remove it silently.
8. **Version + file** per `seoboost-versioned-output`, into the per-type sub-folder.

## Workflow — DOCX lane (always follow this order)

1. **Read** `design-tokens.md` and `components.md` for visual rules.
2. **Render visuals first** (if needed): `scripts/diagram.mjs` (technical/architecture, hand-drawn) and/or `scripts/chart.mjs` (data — bar/line/donut). They output PNG @2× (embed at ~62%).
3. **Build** the doc: `require('./helpers.js')` + `require('./templates/system-design-skeleton.js')` (`buildDoc({meta, sections})`). Use ESM build entry (see `build-example.mjs`) so chart/diagram renderers can be awaited.
4. **Convert** to PDF: `soffice --headless --convert-to pdf --outdir <dir> <file>.docx`.
5. **Visual QA** every page: `pdftoppm -png -r 105 <file>.pdf qa/p` and inspect (cover hero, bands, charts, callouts).
6. **Version + present** per SEO Boost convention: `<Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.{docx,pdf}`. Present DOCX first.

## One-time server setup (prerequisites)

On a fresh machine the toolchain is: **Node deps** (build) + **LibreOffice** (DOCX→PDF)
+ **poppler-utils** (per-page visual QA). Install once:

```bash
# Node deps — no native libs, no sudo (resvg-js ships prebuilt binaries):
npm install @resvg/resvg-js docx        # in this skill dir (or a parent of helpers.js)
# System tools (need sudo; ~600 MB for LibreOffice — ensure disk headroom first):
sudo apt-get install -y libreoffice-writer poppler-utils fonts-dejavu
command -v soffice pdftoppm && node -e "require('@resvg/resvg-js');require('docx')" && echo OK
```

Without `poppler-utils` the visual-QA step (step 5) degrades to text-only; without
LibreOffice step 4 can't produce a PDF (deliver DOCX-only and say so — see below).

## Environment preflight (constrained / headless servers)

Step 4 needs **LibreOffice (`soffice`)**, which isn't everywhere (esp. small VPS / n8n
boxes). **Before building, preflight** — don't discover this mid-render:

```bash
command -v soffice libreoffice >/dev/null || echo "NO LibreOffice"
df -h / | awk 'NR==2{print $4" free"}'        # need headroom for render + temp
```

- **Missing `soffice` or low disk:** do NOT silently fail or try a sudo install you
  can't complete. Either install if you safely can (enough disk + sudo), or fall
  back: deliver the **`.docx` only** and say the PDF is pending, or convert with a
  lighter tool if present (`pandoc` + a PDF engine, or headless chromium on an HTML
  render). State which path you took.
- **On a headless agent (e.g. the Telegram channels host): NEVER ask via an
  interactive menu/`AskUserQuestion`** — it renders to a dead TUI and hangs the turn
  forever (caused a multi-hour outage once). Ask the operator via the channel's
  reply tool as plain text, list options, and end the turn. See
  `seoboost-claude-telegram-setup` / the agent's `CLAUDE.md` guardrail.

## Quick reference

| File | Purpose |
|------|---------|
| `design-tokens.md` | Eco-tech color/type/spacing tokens — single source of truth (all lanes) |
| `html-standard.md` | **HTML lane**: when to use it, the rules, component catalog, traps, responsive/print requirements, anti-patterns |
| `templates/html-shell.html` | **HTML lane**: canonical shell with CSS inlined — copy this, do not hand-roll |
| `components.md` | **DOCX lane**: component catalog (cover, H1 band, callout, table, cards, flow, charts, diagrams) |
| `helpers.js` | docx-js helpers: `C` tokens + `P PR SP GAP PB H1 H2 H3 H4 BL NL Callout buildTable buildMetricCards buildProcessFlow figCaption img chipRun` |
| `scripts/diagram.mjs` | Rough.js hand-drawn diagrams (SEO Boost palette + charcoal **anchor** node) |
| `scripts/chart.mjs` | Professional SVG charts → PNG (bar / line / donut) |
| `templates/system-design-skeleton.js` | `cover()` (charcoal hero) + `buildDoc()` (cover + body sections) |
| `build-example.mjs` | WORKED EXAMPLE (renders viz + assembles full SDD) |
| `assets/` | `seoboost-wordmark-light.png` (cover, glows on charcoal), `seoboost-mark.png` (header mark), `seoboost-mark-watermark.png` (cover ghost @12%) |

## Critical rules (do NOT violate)

1. **Always use `helpers.js`** — never hand-roll docx-js from scratch. Helpers encode validation-safe, on-brand patterns.
2. **Page = US Letter** (12240 × 15840 DXA). Cover section uses `margin:0` for the full-bleed charcoal hero; body section uses standard margins.
3. **Font = Arial** (DOCX-portable). Mono = Cascadia Code.
4. **Colors via `C` tokens only** — never hardcode hex. See `design-tokens.md`.
5. **`#FF8800` (orange500) NEVER as body/heading text on white** (1.41:1 fails). Readable orange text on white = `orange700 #A85500`. orange500 only glows on charcoal.
6. **H1 returns an ARRAY** — spread with `.flat()`.
7. **H1 = charcoal band + orange lead-tick + title. NO badge chips, NO section number on the band.** Numbers live in TOC / cross-refs only.
8. **Lead-tick `▍` on H1 ONLY.** H2 = quiet typography (number ink600 + title ink800, no orange tick).
9. **Callouts = full border (all 4 sides) + tint + labeled heading.** Side-stripes BANNED. The dark hero callout (`variant:'dark'`) is **MAX 2 per document** — scarcity makes it premium.
10. **Charcoal value-reservation:** H1 bands use `ink850`; the rare dark hero callout + cover hero use the darker `ink900/ink950`. The rare object must LOOK rarer.
11. **Pacing:** never stack two charcoal structural objects adjacent — white prose/whitespace separates them.
12. **Tables need dual widths** (Table width + columnWidths + each cell width), all DXA. Charcoal header + orange bottom-seam + zebra body + NO inner vertical rules.
13. **Charts sit on a sand50 light panel, never on charcoal.** One saturated hue per chart (orange600 primary on white).
14. **Diagrams need ≥1 charcoal `anchor` node** per architecture figure (the SEO Boost signature). One orange primary-path edge max.
15. **Never `\n` in text** — separate Paragraphs. **Use `GAP()`** between a Table and an adjacent Callout (Word/LO collapse `SP()`).
16. **Footer = "SEO Boost Indonesia" wordmark text only.** "Market Smarter" tagline = cover (and back page) only, NOT every footer. NO logo image in footer (rocket mark lives in the header).
17. **Design-rationale metaphors are forbidden in document copy** (internal only).

## Document language

Default **Bahasa Indonesia** for SEO Boost internal/corporate docs. English only for international
stakeholders, on explicit request, or technical terms (API names, frameworks, code).

> **Language layer: `seoboost-tulis-indonesia` is mandatory, and it runs alongside this skill.**
> This skill owns brand, layout, and — in the terminology table below — which *words* survive
> in English for a client-facing project document. Everything else about the prose belongs to
> `seoboost-tulis-indonesia`: register, calque removal, ambiguity, standard spelling, and the
> automated checker (`scripts/periksa.py`).
>
> Where the two disagree, the split is narrow and deliberate:
> - **Terminology in a client project document → this skill wins.** The table is calibrated to
>   the client's own technical writing, which is a stronger signal than a general style rule.
> - **Everything else → `seoboost-tulis-indonesia` wins, always.** Keeping *stakeholder* in English
>   does not license "Hal ini penting untuk dicatat bahwa..." or an untraceable "hal tersebut".
>
> A document that passes this skill's brand rules but reads as translated English has not
> passed. Run the language layer before rendering, not after.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```

### Do not over-translate established technical terms

Indonesian sentence structure, English technical nouns — **exactly as they circulate in the
client's own documents and meetings**. Translating a term that everyone already uses in English
makes the document *less* clear, not more formal.

The calibration reference is the client's own technical writing. On KLIEN A that is
`INSTALLATION ASSESSMENT REPORT - E-TAXI WULING CLOUD EV.pdf` from TransTRACK: Indonesian prose,
English kept for *assessment*, *adjustment*, *major*, *testing*, *device*, *Power Standby*,
*SOS Button*, *Roof Light*, *Occupancy Sensor*. Find the equivalent artefact on every project and
match it.

| Do not write | Write |
|---|---|
| kesenjangan | **GAP** |
| titik keputusan | **decision point** |
| daftar periksa | **checklist** |
| pemangku kepentingan | **stakeholder** |
| ambang | **threshold** |
| sanggahan | **dispute** |
| penyaringan | **filter** |
| bagi hasil | **revenue share** |
| batas waktu tanggap | **response time** |
| barang tertinggal | **lost item** |
| kebutuhan fungsional | **functional requirement** |
| aturan bisnis | **business rule** |
| perangkat lunak | **software** |
| peragaan | **demo** |
| uji terima | **UAT** |

**Follow the source, do not standardise across it.** If one client file has a column
`Prioritas` and another has `Priority`, keep each as its source has it. Harmonising them makes
the document disagree with the file it cites.

**Keep Indonesian for legal and domestic-regulatory terms** — *tera*, *laik jalan*, *KIR*,
*angsuran*, *keanggotaan*, *izin trayek*. These have precise meanings in Indonesian law that the
English word does not carry.

### Never write "klien" — name the party

Say **PT Klien A**, **Klien A**, **TransTRACK**, **Koperasi**. Not "klien",
not "pihak klien", not "the client".

Two reasons. First, the document is usually read *by* that party, and "klien" reads as if they
are being discussed rather than addressed. Second, most SEO Boost projects have three or more parties;
"klien" hides which one is meant, and the reader has to guess. `SOP Master List klien` is
ambiguous the moment TransTRACK is also in the room; `SOP Master List Klien A` is not.

Applies to file contents, tables, chart labels, and filenames alike.

### No cosmetic language, straight to the point

Cut anything that performs seriousness instead of carrying information. A sentence that would
survive being deleted should be deleted.

| Cut | Keep |
|---|---|
| "adu pernyataan" | "sulit dibuktikan kedua pihak" |
| "yang paling ingin dilupakan" | (delete the clause) |
| "terbaca lebih menenangkan daripada keadaan sebenarnya" | "memberi gambaran yang tidak akurat" |
| "bukan X, melainkan Y" repeated in every paragraph | use once where the contrast matters |
| "hal ini menjadi penting karena" | "karena" |

State the finding, its evidence, and its consequence. Do not add a closing sentence that
restates the finding in more elevated words.

### Ownership framing — do not put SEO Boost in the demanding seat

SEO Boost writes the document; the client owns the interest in it. Write from the party that
benefits, not from SEO Boost.

| Do not write | Write |
|---|---|
| "belum diperagakan kepada SEO Boost" | "belum ada demo ke Klien A" |
| "belum pernah diperiksa SEO Boost" | "belum pernah direview Klien A" |
| "usulan SEO Boost" | "opsi yang diusulkan" |
| "Prosedur SEO Boost" as a category | "Dokumen SOP" |

SEO Boost may still appear where it genuinely owns work — an owner column, a workload map, a
signature block. What it must not do is appear as the party whose satisfaction is the standard.

## Output conventions

- **Filename:** `{DocType}_{Project}_v{X.Y}_{YYYY-MM-DD}.docx` (SEO Boost versioned-output convention).
- **Folder layout:** once a project has ≥2 document types, do NOT dump them flat in `output/`. Use per-type sub-folders (`output/01-discovery/`, `02-brd/`, `03-mom/`, `04-proposal/`, `assets/`) + a `README.md` index — see **`seoboost-versioned-output` Scenario 5**. Build scripts (`build/build-<doc>.mjs`) must write to the type sub-folder, not `output/` flat.
- **Always produce both** `.docx` and `.pdf` unless told otherwise. Present DOCX first.
- **Visual-QA every page** before presenting — the charcoal surfaces + embedded viz must render correctly in the PDF.

## Reference example

`build-example.mjs` → a 9-page System Design Document ([Project Klien Koperasi]) exercising every component. Build it and open the PDF when in doubt about formatting.
