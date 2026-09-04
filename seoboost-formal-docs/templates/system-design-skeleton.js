// ============================================================================
// system-design-skeleton.js — SEO Boost Corporate doc (charcoal-hero cover + body).
// Demonstrates: full-bleed charcoal cover w/ orange logo + ghost-mark, inner-page
// section bands, callouts, tables, metric cards, process flow, charts, diagrams.
//
// cover(meta) → full-bleed charcoal hero (section with page.margin=0).
// buildDoc({meta, sections}) → 2-section Document (cover + body w/ header/footer).
// ============================================================================
const path = require('path');
const fs = require('fs');
const H = require('../helpers.js');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
  AlignmentType, WidthType, ShadingType, VerticalAlign, PageNumber, BorderStyle,
  LevelFormat, ImageRun, C, FONT,
} = H;
const { HeightRule } = require('docx');

const SKILL_DIR = path.join(__dirname, '..');
const ASSETS = path.join(SKILL_DIR, 'assets');
const PAGE_W = 12240, PAGE_H = 15840;

// ---- numbering (orange-square bullets + decimal) ----
const numbering = {
  config: [
    { reference: 'bullets', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '▪', alignment: AlignmentType.LEFT, style: { run: { color: C.orange500 }, paragraph: { indent: { left: 360, hanging: 220 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { run: { color: C.ink500 }, paragraph: { indent: { left: 720, hanging: 220 } } } },
    ]},
    { reference: 'numbers', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { run: { bold: true, color: C.ink800 }, paragraph: { indent: { left: 360, hanging: 260 } } } },
    ]},
  ],
};

// charcoal full-bleed band (1-row table, page width, zero margins)
function darkBand(heightChildren, fill = C.ink950, indent = 1080) {
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [PAGE_W], borders: H.noBorders,
    rows: [new TableRow({ children: [new TableCell({
      width: { size: PAGE_W, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR }, borders: H.allBorders(fill, 4),
      margins: { top: 0, bottom: 0, left: indent, right: 240 },
      children: heightChildren,
    })] })],
  });
}

// ---- COVER (full-page charcoal, single uniform dark surface) ----
// One full-bleed charcoal cell filling the entire page. Content zones via
// vertical spacers: logo (top) → tick + title + subtitle + doc-type (middle)
// → metadata + attribution (bottom). All soft-white/orange on charcoal.
// No ghost-mark, no white zone.
function cover(meta) {
  const logo = path.join(ASSETS, 'seoboost-wordmark-light.png'); // glows on charcoal

  const kids = [];
  // top breathing room
  kids.push(new Paragraph({ spacing: { before: 760, after: 0 }, children: [new TextRun({ text: '', size: 2 })] }));
  // logo (left), glows orange-on-charcoal
  if (fs.existsSync(logo)) kids.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: 'png', data: fs.readFileSync(logo), transformation: { width: 290, height: 84 } })] }));
  else kids.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: 'SEO BOOST INDONESIA', size: 30, bold: true, color: C.orange500, font: FONT })] }));

  // middle — push down, then orange tick + title block
  kids.push(new Paragraph({ spacing: { before: 2600, after: 120 }, children: [new TextRun({ text: '', size: 2 })] }));
  // short orange tick
  kids.push(new Table({
    width: { size: 620, type: WidthType.DXA }, columnWidths: [620],
    borders: { top: H.noBorder, bottom: { style: BorderStyle.SINGLE, size: 28, color: C.orange500 }, left: H.noBorder, right: H.noBorder, insideHorizontal: H.noBorder, insideVertical: H.noBorder },
    rows: [new TableRow({ children: [new TableCell({ width: { size: 620, type: WidthType.DXA }, borders: { top: H.noBorder, bottom: { style: BorderStyle.SINGLE, size: 28, color: C.orange500 }, left: H.noBorder, right: H.noBorder }, children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: '', size: 2 })] })] })] })],
  }));
  kids.push(new Paragraph({ spacing: { before: 220, after: 60 }, children: (meta.titleRuns || [new TextRun({ text: meta.title, size: 60, bold: true, color: C.onDark, font: FONT })]) }));
  if (meta.subtitle) kids.push(new Paragraph({ spacing: { before: 60, after: 0 }, children: [new TextRun({ text: meta.subtitle, size: 27, color: C.onDarkMuted, font: FONT })] }));
  kids.push(new Paragraph({ spacing: { before: 200, after: 0 }, children: [new TextRun({ text: (meta.docType || '').toUpperCase(), size: 22, bold: true, color: C.orange500, font: FONT })] }));

  // bottom — push down, hairline, metadata grid (soft-white on charcoal), attribution
  kids.push(new Paragraph({ spacing: { before: 2700, after: 160 }, children: [new TextRun({ text: '', size: 2 })] }));
  // thin orange-tinted hairline above metadata
  kids.push(new Table({
    width: { size: 2160, type: WidthType.DXA }, columnWidths: [2160],
    borders: { top: H.noBorder, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink700 }, left: H.noBorder, right: H.noBorder, insideHorizontal: H.noBorder, insideVertical: H.noBorder },
    rows: [new TableRow({ children: [new TableCell({ width: { size: 2160, type: WidthType.DXA }, borders: { top: H.noBorder, bottom: { style: BorderStyle.SINGLE, size: 6, color: C.ink700 }, left: H.noBorder, right: H.noBorder }, children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: '', size: 2 })] })] })] })],
  }));
  kids.push(new Paragraph({ spacing: { before: 150, after: 0 }, children: [new TextRun({ text: '', size: 2 })] }));
  const metaRow = (label, value) => new TableRow({ children: [
    new TableCell({ width: { size: 2700, type: WidthType.DXA }, borders: H.noBorders, margins: { top: 56, bottom: 56, left: 0, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: label.toUpperCase(), size: 18, bold: true, color: C.onDarkMuted, font: FONT })] })] }),
    new TableCell({ width: { size: 6100, type: WidthType.DXA }, borders: H.noBorders, margins: { top: 56, bottom: 56, left: 0, right: 0 }, children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, color: C.onDark, font: FONT })] })] }),
  ]});
  kids.push(new Table({ width: { size: 8800, type: WidthType.DXA }, columnWidths: [2700, 6100], borders: H.noBorders, rows: [
    metaRow('Disiapkan untuk', meta.preparedFor || '—'),
    metaRow('Disiapkan oleh', meta.owner || 'PT Algo Sea Biz'),
    metaRow('Versi', meta.version || '1.0'),
    metaRow('Tanggal', meta.date || ''),
    metaRow('Klasifikasi', meta.classification || 'Internal'),
  ]}));
  kids.push(new Paragraph({ spacing: { before: 480, after: 0 }, children: [
    new TextRun({ text: 'SEO Boost Indonesia', size: 20, bold: true, color: C.onDark, font: FONT }),
    new TextRun({ text: '   ·   Market Smarter', size: 18, color: C.onDarkMuted, font: FONT }),
  ]}));
  // trailing spacer so the charcoal cell fills to the page bottom edge (no white strip)
  // single full-page charcoal cell holding everything (left-indent 1080).
  // Row height fixed to the full page (15840 DXA) so the charcoal fills
  // edge-to-edge with NO white sliver, regardless of content height.
  return [new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: [PAGE_W], borders: H.allBorders(C.ink950, 4),
    rows: [new TableRow({
      height: { value: PAGE_H, rule: HeightRule.EXACT },
      children: [new TableCell({
        width: { size: PAGE_W, type: WidthType.DXA },
        shading: { fill: C.ink950, type: ShadingType.CLEAR }, borders: H.allBorders(C.ink950, 4),
        margins: { top: 0, bottom: 0, left: 1080, right: 900 },
        children: kids,
      })],
    })],
  })];
}

// ---- header / footer for body section ----
function buildHeaderFooter(meta) {
  // text wordmark only (no logo/rocket mark icon) — left, doc title right.
  const headerKids = [];
  headerKids.push(new TextRun({ text: 'SEO Boost Indonesia', size: 17, bold: true, color: C.ink800, font: FONT }));
  headerKids.push(new TextRun({ text: `\t${meta.title}`, size: 17, color: C.ink500, font: FONT }));
  const header = new Header({ children: [new Paragraph({
    tabStops: [{ type: H.TabStopType.RIGHT, position: H.CONTENT_W }],
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.sand200 } },
    children: headerKids,
  })] });

  const fCell = (kids, w) => new TableCell({ width: { size: w, type: WidthType.DXA }, borders: H.noBorders, margins: { top: 30, bottom: 0, left: 0, right: 0 }, verticalAlign: VerticalAlign.CENTER, children: kids });
  const footer = new Footer({ children: [
    new Paragraph({ spacing: { before: 0, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.sand200 } }, children: [new TextRun({ text: '', size: 2 })] }),
    new Table({ width: { size: H.CONTENT_W, type: WidthType.DXA }, columnWidths: [3802, 1900, 3802], borders: H.noBorders, rows: [new TableRow({ children: [
      fCell([new Paragraph({ children: [new TextRun({ text: 'SEO Boost Indonesia', size: 16, bold: true, color: C.ink800, font: FONT })] })], 3802),
      fCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: (meta.classification || 'Internal'), size: 16, color: C.ink500, font: FONT })] })], 1900),
      fCell([new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: 'Hal. ', size: 16, color: C.ink500, font: FONT }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.ink600, font: FONT }),
        new TextRun({ text: ' / ', size: 16, color: C.ink500, font: FONT }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: C.ink600, font: FONT }),
      ] })], 3802),
    ] })] }),
  ] });
  return { header, footer };
}

function buildDoc({ meta, sections }) {
  const { header, footer } = buildHeaderFooter(meta);
  return new Document({
    creator: 'PT Algo Sea Biz', title: meta.title, description: meta.docType,
    numbering,
    styles: {
      default: { document: { run: { font: FONT, size: 21, color: C.ink800 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, color: C.ink850, font: FONT }, paragraph: { outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 29, bold: true, color: C.ink800, font: FONT }, paragraph: { outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 24, bold: true, color: C.ink700, font: FONT }, paragraph: { outlineLevel: 2 } },
      ],
    },
    sections: [
      { properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } }, children: cover(meta) },
      { properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 1440, bottom: 1296, left: 1368, right: 1368 } } }, headers: { default: header }, footers: { default: footer }, children: sections },
    ],
  });
}

module.exports = { buildDoc, cover, numbering };
