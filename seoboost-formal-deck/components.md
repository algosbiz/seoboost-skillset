# SEO Boost Formal Deck — Component Catalog

Visual components available via `helpers.js`. Pair this with `design-tokens.md` for the colors/sizes each component uses. Refer to `templates/deck-skeleton.js` for end-to-end usage examples.

## 1. Cover slide — `addCover(pres, opts)`

Full cover with all signature decoration: left half-circle, top-right circle logo (BALI/MICRO/TECHNOLOGY), right vertical orange line, eyebrow, big title, short divider, tagline, meta block, bottom footer.

```js
addCover(pres, {
  brandTop: 'PT BALI MIKRO TEKNOLOGI',     // small label, top-left
  brandSub: 'seoboost.co.id',          // italic sub-label
  eyebrow: 'PEMAPARAN MITRA KONSULTAN',    // small uppercase, above title
  title: 'Pendampingan Teknologi & Bisnis\nuntuk PT Klien C',  // 2-line title
  tagline: 'Roadmap prioritas untuk memperkuat fondasi …',
  meta: [
    'Sesi pemaparan kepada pemegang saham SNR',  // line 1 = bold
    'Berdasarkan PKS Nomor … — 4 Mei 2026',      // line 2 = regular
    'Disampaikan oleh: <Nama Direktur> · Direktur PT SEO Boost', // line 3 = italic
  ],
  footer: '2026  |  Bali, Indonesia  |  PT Algo Sea Biz (SEO Boost)',
});
```

**Tips:**
- Use `\n` in `title` for an explicit 2-line break (Indonesian titles often run long)
- `meta` is rendered as 3 lines: bold / regular / italic. Pass fewer items if you only need 1-2 lines.
- `tagline` is one line; keep under ~95 chars or it wraps awkwardly

## 2. Content slide chrome — `addContentScaffold(slide, opts)`

One-call setup that adds: top header (brand mark + page badge), title block (eyebrow + H1 + short underline + subtitle), bottom footer (orange divider + caption). Returns the y-coordinate where body content can start (typically ~2.55).

```js
const slide = addSlide(pres);
const bodyY = addContentScaffold(slide, {
  pageNum: 2, totalPages: 7,
  eyebrow: '02 · MANDAT',
  title: 'Mandat Pendampingan yang Sudah Dicakup PKS',
  subtitle: 'Enam area ini menjadi dasar diskusi prioritas dan urutan eksekusinya.',
});
// now build body starting around y = bodyY (or just 2.7+ for safety)
```

If you want fine control, call `addHeader`, `addTitleBlock`, `addFooter` individually.

## 3. Badge card grid (2x3 or 3x2) — `addBadgeCard`

Rounded card with a small orange pill containing a 2-digit number in the top-left corner. Use for "Mandat", overview grids, capability matrices.

```js
addBadgeCard(slide, {
  x: 0.5, y: 2.85, w: 4.05, h: 1.6,
  num: '01',
  title: 'Strategi Bisnis',
  body: 'Pemetaan kebutuhan, positioning, dan model pertumbuhan.',
});
```

**Recommended grid:** 3 columns × 2 rows on a 16:9 slide. With 12.3" content width:
- cardW ≈ 4.05" (with 0.13" horizontal gap)
- cardH ≈ 1.6" (with 0.2" vertical gap)
- start y ≈ 2.85"

## 4. Program-row card (3-6 columns) — `addProgramCard`

Rounded card with a orange eyebrow label (e.g., "PROGRAM 1") and a bold title, optional body. Use for roadmaps, capability columns, role overviews.

```js
addProgramCard(slide, {
  x: 0.5, y: 3.0, w: 2.32, h: 2.7,
  eyebrow: 'PROGRAM 1',       // optional - omit/empty for plain title cards
  title: 'Brand Guideline',
  body: 'Merapikan identitas dan materi dasar.',
});
```

**Recommended counts:** 3-6 cards per row. For 5 cards: cardW ≈ 2.32" with 0.15" gaps. For 4 cards: cardW ≈ 2.96".

**When to use without eyebrow:** Pass `eyebrow: ''` for plain cards (e.g., role cards "Admin / Runner / Tenant / User"). The helper auto-adjusts spacing so body doesn't overflow.

## 5. Insight sidebar — `addInsightSidebar`

Tall vertical card with a orange eyebrow label ("INSIGHT KUNCI"), a bold headline, and a body paragraph. Used as a sidebar on numbered-list slides or callout panels.

```js
addInsightSidebar(slide, {
  x: 0.5, y: 2.85, w: 2.7, h: 3.5,
  label: 'INSIGHT KUNCI',
  headline: 'Masalah utama Klien C bukan kurang peluang.',
  body: 'Yang perlu diperkuat adalah identitas, kontrol operasional, dan disiplin eksekusi sebelum ekspansi dipercepat.',
});
```

Pass `headline: ''` if you only need a label + body. The body will move up to fill the saved space.

## 6. Numbered row — `addNumberedRow`

Wide rounded row with a small orange numbered circle on the left, bold title in the middle-left, and a regular description on the right. Stack 4-6 vertically for a list.

```js
addNumberedRow(slide, {
  x: 3.4, y: 2.85, w: 9.4, h: 0.62,
  num: 1,
  title: 'Identitas brand belum konsisten',
  body: 'Belum ada standar visual tunggal untuk produk inti.',
});
```

**Recommended:** rowH 0.6-0.65", rowGap 0.1". Pairs nicely beside `addInsightSidebar`.

## 7. Section label (sub-eyebrow) — `addSectionLabel`

Small orange-uppercase label used to introduce a sub-block within a slide (e.g., "PENDEKATAN BERTAHAP" above a phase strip). Not the slide H1 eyebrow — that's handled by `addTitleBlock`.

```js
addSectionLabel(slide, { x: 0.5, y: 5.55, w: 6, h: 0.3, text: 'PENDEKATAN BERTAHAP' });
```

## 8. Phase strip card — `addPhaseStripCard`

Compact horizontal 3-column card: `[ eyebrow ] [ title ] [ duration ]`. Designed for phase timelines, status strips, or any inline key→value→meta pattern.

```js
addPhaseStripCard(slide, {
  x: 0.5, y: 5.9, w: 2.96, h: 0.55,
  eyebrow: 'Fase 0',                   // short (~6 chars max)
  title: 'Finalisasi desain',          // ~15 chars fits cleanly on 1 line
  duration: '2–4 minggu',              // short label, 9pt font
});
```

**Content guidance:**
- eyebrow: keep to ≤6 chars ("Fase 0", "Step 1")
- title: ≤15 chars for clean single-line. Longer titles wrap to 2 lines (still readable).
- duration: ≤12 chars ("2–4 minggu", "12-16 weeks")

## 9. Stat / target card — `addStatCard`

Compact card with orange eyebrow + single bold value. Use for hero stats, KPI targets, scale-up numbers.

```js
addStatCard(slide, {
  x: 0.5, y: 2.7, w: 5.5, h: 0.95,
  label: 'TARGET SCALE-UP',
  value: '100 KK pilot → 500 KK tahap 1 → 1.300 KK tahap 2',
});
```

## 10. Bottom callout strip — `addBottomCallout`

Wide rounded outline strip just above the footer. Use for a single "key takeaway" or "philosophy" line per slide.

```js
addBottomCallout(slide, {
  lead: 'Fokus rapat:',                                       // bold portion
  tail: 'memilih prioritas eksekusi paling berdampak.',       // regular continuation
  emphasis: 'soft',                                           // 'soft' (default) | 'hot' (orange-hot border)
});
```

Use `emphasis: 'hot'` to make the callout stand out more (rare — reserve for the most important takeaway in the deck).

## 11. Gantt timeline — `addGanttHeader` + `addGanttRow`

Two-step: first draw the month header strip, then each workstream row.

```js
const months = ['Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
const gridX = 3.4, gridY = 2.7, gridW = 9.4;

addGanttHeader(slide, { months, x: gridX, y: gridY, w: gridW });

[
  { label: 'Brand Guideline',      start: 3, end: 4, color: COLOR.TL_ORANGE },
  { label: 'Website Korporat',     start: 4, end: 6, color: COLOR.TL_ORANGE_SOFT },
  { label: 'Project E (opsional)',    start: 2, end: 3, color: COLOR.TL_TEAL },
  { label: 'Agentic AI + WA',      start: 5, end: 8, color: COLOR.TL_BLUE },
  { label: 'Ops Platform – Fase 1',start: 5, end: 8, color: COLOR.TL_PLUM },
].forEach((r, i) => {
  const rowY = 3.25 + i * 0.49;
  addGanttRow(slide, {
    label: r.label,
    labelX: 0.5, labelY: rowY, labelW: 2.7,
    rowY, rowH: 0.36,
    gridX, gridW, totalMonths: months.length,
    startMonth: r.start, endMonth: r.end,
    color: r.color,
  });
});
```

**Color guidance for bars:**
- Use the `COLOR.TL_*` palette (orange / soft-orange / cyan / amber / coral)
- Group related workstreams with the same color (e.g., both "Ops Platform Fase 0" and "Fase 1" use a orange family)
- ≤6 rows recommended; more rows get cramped

## 12. Closing slide — `addClosing(pres, opts)`

Mirror of cover with "TERIMA KASIH" headline, brand line, contact info, and a half-circle decoration in the bottom-right.

```js
addClosing(pres, {
  heading: 'TERIMA KASIH',
  brandLine: 'PT Algo Sea Biz · seoboost.co.id',
  contact: 'contact@seoboost.co.id  ·  0811 3940 4640  ·  JL. Sedap Malam No 9A Denpasar',
  closingNote: 'Siap untuk diskusi dan penetapan prioritas eksekusi.',
});
```

## Component selection guide

| When the content is… | Use this component |
|---------------------|--------------------|
| 4-6 distinct topics overview | `addBadgeCard` (numbered grid) |
| 3-6 horizontal program/role columns | `addProgramCard` |
| Lead insight + supporting findings list | `addInsightSidebar` + `addNumberedRow` |
| Phase timeline / status strip | `addSectionLabel` + `addPhaseStripCard` |
| Headline statistic or KPI | `addStatCard` |
| Workstream gantt across months | `addGanttHeader` + `addGanttRow` |
| One-line key takeaway | `addBottomCallout` |

## Composition rule

Every content slide = scaffold + ONE primary body pattern (+ optional bottom callout). Don't mix 3+ component types on one slide — it gets cluttered. If you have lots to say, split into multiple slides.
