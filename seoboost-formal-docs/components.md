# SEO Boost Formal Docs — Component Catalog (DOCX lane)

Visual components available in `helpers.js`. Each entry covers: when to use, when NOT to use, and a code snippet.

> **Brand note.** This catalog describes the **SEO Boost identity**: brand orange `#FF8800`
> glowing inside charcoal anchor surfaces, on a white printable body. Source of truth:
> `helpers.js` and `design-tokens.md`. For the HTML expression of the same system, see
> `html-standard.md`.

**The rule that governs everything below:** `orange500` never appears as readable text on
white (2.39:1). It glows *inside* charcoal, or it is a mark. The only orange text permitted
on white is `orange700`, and only for H4 micro-labels.

**Content width is `9504` DXA** (`CONTENT_W` in `helpers.js`). Column widths must sum to it.

## P(text, opts) — Body paragraph

**When:** Default for prose body text.

**Options:** `{ size, bold, italics, color, align }`

```javascript
P("Bagian ini menjelaskan kebutuhan produk secara teknis...");
P("Catatan penting di sini.", { bold: true });
P("Diatur ulang otomatis.", { align: AlignmentType.CENTER });
```

## H1(title, firstPage) — Section heading (charcoal band + orange lead-tick, NO number, NO badge)

**When:** Top-level section. Always page-breaks before (except `firstPage = true`).

**Style:** a charcoal `ink850` band running the full content width, carrying a orange `▍`
lead-tick and an `onDark` title, followed by the hairline "shelf" the band casts onto the
page. **No section number on the band** — numbers live in H2, the TOC, and cross-references.
No badge chip: that pattern is banned (reads as generic AI template).

The band **is** the ornament. Do not add a rule, an icon, or a colored pill to it.

**Signature:** `H1(title, firstPage)` — two arguments. There is no number argument.

**Returns:** an array of four elements `[anchorParagraph, band, shelf, spacer]` — must be
spread with `.flat()` at section assembly.

```javascript
const section1 = [
  ...H1("Executive Summary", true),  // firstPage = true → no page break
  P("..."),
];
const section2 = [
  ...H1("Strategic Context"),        // page-break before
  P("..."),
];
// In main: children: [...section1, ...section2].flat()
```

**Pacing rule:** never place a charcoal object (metric cards, process flow, dark callout,
table header) immediately after the band. White prose or a `GAP()` must separate them, or
the page reads as a slab.

## H2 / H3 / H4 — Sub-headings

**When:** Hierarchical structure within a section.

- **H2** for major subsections (e.g., "5.1 Empat Pilar")
- **H3** for tertiary structure (e.g., "Decision Label Logic")
- **H4** for micro-labels. This is the **only orange heading-text allowed on white**, and it uses `orange700` (AA 5.02) — never `orange500`.

**H2 style:** number in `ink600` + title in `ink800`. Quiet typography — **no orange tick**; the lead-tick belongs to H1 alone. **H3:** `ink700`, type only.

```javascript
H2("5.1", "Empat Pilar sebagai Tulang Punggung Sistem"),  // number + title
H2("Ringkasan"),                                          // title only
H3("UC-1 — Pre-Market Briefing"),
H4("Acceptance criteria"),
```

## BL(text) — Bullet list item

**When:** Bullet list with simple item.

**Important:** All consecutive `BL()` calls render as one continuous list. Use `numbering: "bullets"` reference internally.

```javascript
BL("Macro intelligence layer."),
BL("Technical mapping precision."),
BL("Personalized execution rules."),
```

## NL(text) — Numbered list item

**When:** Numbered (ordered) list.

```javascript
NL("Finalize PRD."),
NL("Build agent prompt repo."),
NL("Validate scoring engine."),
```

## Callout(label, body, color) — Highlighted callout box

**When:**
- Strategic statement that must stand out from prose
- Critical principle, rule, or warning
- Sample output that should look like a "card"

**When NOT to use:**
- Long sub-section (use H3 + body instead)
- Simple emphasis (use bold inline)
- More than 5 lines of text (callouts should be skimmable)

**Signature:** `Callout(label, body, variant)` — the third argument is a **variant name**, not a color constant.

**Variants:**

| Variant | Use for |
|---|---|
| `note` (default) | Neutral emphasis, side notes — slate border on `sand50` |
| `success` | Confirmed rules, things that are working, orange-lit decisions |
| `info` | Context the reader needs but did not ask for |
| `warning` | Caveats, things that will bite later |
| `danger` | Hard failure modes, do-not-do |
| `dark` | **The charcoal hero callout. MAXIMUM 2 PER DOCUMENT.** |

**Style:** full border on all four sides + tint background + a bold labeled heading. The
single colored left-stripe is **banned** — `Callout()` already renders the correct shape, so
never hand-roll a left-border-only box.

**On the `dark` variant:** charcoal `ink900` with a `orange500` label and `onDark` body at a
larger size. It is the loudest object in the document. Scarcity is what makes it read as
premium — two per document is the ceiling, and most documents should use one or none.

```javascript
Callout("CATATAN PENTING",
  "Module Koperasi WAJIB bergantung pada modul Accounting.",
  'note'),

Callout("ATURAN BISNIS",
  "Permintaan dari unit yang belum mengaktifkan modul mengembalikan 403 sebelum mencapai service.",
  'success'),

Callout("LANGKAH BERIKUTNYA", [
  "Finalisasi spesifikasi tabel registry.",
  "Follow-up kontak teknis untuk spesifikasi integrasi.",
], 'info'),  // body can be an array → renders as multiple lines

Callout("PRINSIP INTI",
  "Setiap perhitungan diverifikasi terhadap standar sejak baris pertama kode.",
  'dark'),   // ← at most twice in the whole document
```

## buildTable(headers, rows, columnWidths) — Banded table

**When:** Any structured tabular data.

**Headers:** Array of strings — rendered on a charcoal `ink900` band in bold `onDark`, with a **orange `orange500` bottom-seam** separating header from body. That seam is the table's only orange.
**Rows:** Array of arrays. Each cell is either a string OR an object `{text, bold, color}` for emphasis (e.g. `color: C.dangerText` for a risk level).
**columnWidths:** Array of DXA widths summing to **9504** (`CONTENT_W`).

**Rules:** outer frame + horizontal rules only — **no inner vertical rules**. Zebra body:
even rows `paper`, odd rows `sand50`. Never restyle the header to a lighter fill; the
charcoal header is one of the document's structural anchors.

```javascript
buildTable(
  ["Phase", "Duration", "Output"],
  [
    ["Phase 0", "1-2 weeks", "Blueprint + prompt repo"],
    ["Phase 1", "2-4 weeks", "Manual MVP daily brief"],
    ["Phase 2", "4-8 weeks", "Web command center"],
  ],
  [2504, 1600, 5400]  // sums to 9504
);

// With emphasis on a cell:
buildTable(
  ["Risiko", "Dampak", "Mitigasi"],
  [
    ["Regresi pada core", { text: "Tinggi", bold: true, color: C.dangerText }, "Bounded context + guard"],
    ["Scope melebar", { text: "Sedang", bold: true, color: C.warningText }, "Sprint ramping"],
  ],
  [3104, 1560, 4840]  // sums to 9504
);
```

**Banding:** even rows `paper`, odd rows `sand50` — automatic.

## buildMetricCards(items) — Hero metric cards

**When:**
- Cover page summary (4 pillars, key numbers)
- Section opener with high-level metrics

**When NOT to use:**
- Long descriptions (use buildTable instead)
- More than 4 cards across (gets cramped)
- Without interpreting prose — a row of numbers with no sentence explaining them is decoration, not information

**Style:** charcoal `ink900` tiles separated by thin white gaps, the value on top in
`orange500`, the label below in `onDarkMuted`. Labels are **sentence case, not uppercase** —
uppercase labels here read as a dashboard widget, which is exactly the slop this brand avoids.

```javascript
buildMetricCards([
  { value: "5 Unit",   label: "Modul inti" },
  { value: "SAK EP",   label: "Standar akuntansi" },
  { value: "Per-Unit", label: "Pola aktivasi" },
  { value: "2 Orang",  label: "Tim pengembang" },
]),
GAP(),
P("Empat angka di atas menentukan..."),  // ← the interpreting sentence is not optional
```

## buildProcessFlow(stages) — Horizontal pipeline

**When:**
- Process visualization (5-7 stages)
- Phase progression
- Workflow steps

**When NOT to use:**
- More than 5 stages (text gets too small)
- Stages with long names (use a numbered list instead)

**Style:** uniform charcoal `ink900` stages joined by `orange500` `›` chevrons. The helper
adds a muted "Tahap N" line above each stage name automatically. Stages are **uniform** —
do not alternate fills between them; alternating colour implies a meaning that is not there.

```javascript
buildProcessFlow(["Pilih Unit", "Cek Dependensi", "Aktivasi Registry", "Pasang Guard"]),
```

## SP() — Vertical spacer (small)

**When:** Empty line between paragraphs, or between a paragraph and a table.

**Anti-pattern:** Do NOT rely on a single `SP()` between two consecutive Tables, or between a Table and a Callout — Word/LibreOffice frequently collapse a single empty paragraph that sits between two block elements, causing the next element to render "glued" to the table above. Use `GAP()` instead.

```javascript
P("Some intro text..."),
SP(),
buildTable(...),
```

## GAP() — Larger spacer (use around callouts adjacent to tables)

**When:** You need RELIABLE vertical space between block-level elements that are prone to collapse:
- After a `buildTable()` and before a `Callout()`
- After a `Callout()` and before another `buildTable()` or `Callout()`
- After a `buildTable()` and before another `buildTable()`

**Why this exists:** Word and LibreOffice both have layout quirks where an empty paragraph between two block elements gets visually collapsed, causing callouts/notes to nempel ke table di atasnya. `GAP()` carries explicit `before/after: 200` spacing that survives the collapse.

```javascript
// CORRECT — quote/callout safely separated from table above
buildTable(["Komponen", "Tarif"], rows, [3104, 6400]),
GAP(),
Callout("CATATAN PENTING",
  "Total ini belum termasuk PPN cost yang ditanggung sebagai non-PKP.",
  'warning'),
GAP(),
P("Paragraf berikutnya..."),

// WRONG — single SP() between table and callout will often render with callout glued to table
buildTable(...),
SP(),         // ← too thin, often collapsed
Callout(...),
```

## PB() — Page break

**When:** Force a page break (e.g., before TOC, before disclaimer).

**Note:** H1 already does page-break-before automatically. Don't double up.

```javascript
PB(),  // forces new page
```

## Common composition patterns

**Section opener (informational):**
```javascript
...H1("Problem Statement"),
P("Lima masalah berikut..."),
buildTable([...], [...], [...]),
GAP(),
Callout("TEMUAN UTAMA", "...", 'note'),
```

**Section opener (with metrics) — note the prose between band and tiles:**
```javascript
...H1("Ringkasan Eksekutif", true),
P("Ringkasan singkat..."),   // ← separates the charcoal band from the charcoal tiles
GAP(),
buildMetricCards([...]),
GAP(),
P("Penjelasan metric..."),   // ← interpreting sentence, required
```

**Subsection with detail table:**
```javascript
H2("6.2", "Macro Agent"),
P("Tugas: ..."),
buildTable(["Atribut", "Spesifikasi"], [...], [2504, 7000]),
```

**Table followed by footnote-style callout (frequent MoM/finance doc pattern):**
```javascript
H3("Estimasi PPh 23"),
buildTable(["Komponen", "DPP/bln", "Tarif", "PPh 23/bln"], [...], [2704, 2200, 1400, 3200]),
GAP(),  // ← REQUIRED — single SP() causes the callout to nempel ke table
Callout("CATATAN",
  "Klasifikasi substansi (jasa 2% vs royalty 15%) krusial. Invoice harus split eksplisit per line.",
  'note'),
GAP(),
P("Lihat Tabel berikut untuk detail per komponen..."),
```

**Cover page — do NOT hand-roll it.**

The cover is a full-bleed charcoal `ink950` hero and it is generated for you by
`cover(meta)` in `templates/system-design-skeleton.js`, which `buildDoc({meta, sections})`
places as its own section with `page.margin = 0`. Hand-rolling centered paragraphs on a
white page is the retired pattern.

```javascript
const T = require('./templates/system-design-skeleton.js');

const meta = {
  title: 'Dokumen Desain Sistem',
  subtitle: 'Module Registry & Bounded Context',
  docType: 'System Design Document',   // rendered uppercase in orange500
  version: '1.0',
  date: 'Juni 2026',
  preparedFor: 'Tim Pengembangan SEO Boost',
  owner: 'Unit SEO Boost Indonesia',
  classification: 'Internal',
};

const doc = T.buildDoc({ meta, sections });   // cover + body, headers/footers wired
```

The hero carries, in order: logo top-left (glows orange on charcoal) → short orange tick →
`onDark` title → `onDarkMuted` subtitle → `orange500` uppercase doc-type → metadata grid →
"SEO Boost Indonesia · Market Smarter". No white zone, no ghost-mark, no centered text.

**Closing (always last):**
```javascript
H3("Penutup"),
P("Dokumen ini merupakan acuan internal dan dapat berubah seiring temuan implementasi."),
SP(),
new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 0 },
  children: [new TextRun({ text: '— Akhir Dokumen —', size: 17, italics: true, color: C.ink500, font: FONT })] }),
```

**Running header and footer** are wired by `buildDoc()`: header is "SEO Boost Indonesia"
text left + document title right; footer is the wordmark left, classification centre,
"Hal. X / Y" right. **No logo image in the footer, and the "Market Smarter" tagline
belongs to the cover only** — repeating it on every page cheapens it.
