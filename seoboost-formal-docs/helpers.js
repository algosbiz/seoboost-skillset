// ============================================================================
// SEO Boost Corporate — Formal Document helpers
// Brand: orange #FF8800 (logo mark) + warm charcoal.
// Committed identity: every structural ANCHOR is a charcoal tile with the
// brand orange glowing inside it; white body is the "paper". Body ink #3A3733
// — warm, never pure black.
//
// Slop bans honored (impeccable council, GO-WITH-FIXES):
//   - NO numbered-badge chips. H1 = charcoal band + orange lead-tick + title,
//     NO section number on the band (numbers live in TOC/cross-refs only).
//   - NO side-stripe callouts. Full border + tint + labeled heading (or full
//     charcoal hero callout, max 2/doc).
//   - lead-tick ▍ on H1 ONLY (H2 = quiet typography).
//   - #FF8800 never used as body/heading text on white (use orange700).
// ============================================================================
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  TabStopType, TabStopPosition, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, HeadingLevel, ImageRun, Math: _M,
} = require('docx');

// ---- color tokens (DOCX hex WITHOUT '#') ----------------------------------
const C = {
  // orange ramp (anchor orange500 = literal logo orange)
  orange50: 'FFF4E5', orange100: 'FFE8CC', orange300: 'FFB761',
  orange500: 'FF8800',   // BRAND MARK — never text on white (2.39:1)
  orange600: 'C96A00',   // chart primary on white, icon glyphs (3.79:1 graphic)
  orange700: 'A85500',   // ONLY readable brand text on white (AA 5.30)
  orange800: '8F4A00', orange900: '5C2F00',
  // charcoal / ink ramp
  ink950: '131313',     // cover hero base (darkest)
  ink900: '231F20',     // wordmark ink — RARE: hero callout, table header, metric cards, diagram anchor
  ink850: '2E2B27',     // Title/H1 text; H1 section BAND fill (routine charcoal)
  ink800: '3A3733',     // BODY TEXT default, H2 text
  ink700: '4F4B45', ink600: '5C5850', ink500: '77776F', ink300: 'B4B2AA',
  // warm sand neutrals
  sand50: 'F7F7F4', sand100: 'F0F0EB', sand200: 'E5E5E1',
  sand300: 'D9D9D4', sand400: 'A5A39B',
  paper: 'FFFFFF',
  onDark: 'F4F4F0',      // soft-white text on charcoal (premium)
  onDarkMuted: 'A9A79F', // secondary text on charcoal
  // semantic — orange is the BRAND hue, so no semantic state may borrow it.
  // Warning is a yellower, deeper amber and always ships with its label.
  successBorder: '15803D', successBg: 'EAF6EE', successText: '14622F',
  warningBorder: '8A6410', warningBg: 'FBF1E4', warningText: '8A6410',
  dangerBorder: 'A82828',  dangerBg: 'FBEBEB',  dangerText: 'A82828',
  infoBorder: '2B5C9C',    infoBg: 'EAF0F8',    infoText: '2B5C9C',
};
const FONT = 'Arial';
const MONO = 'Cascadia Code';
const CONTENT_W = 9504; // inner-page content width (DXA)

// ---- border helpers --------------------------------------------------------
const border = (color = C.sand200, size = 6) => ({ style: BorderStyle.SINGLE, size, color });
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };
const allBorders = (c = C.sand200, s = 6) => ({ top: border(c, s), bottom: border(c, s), left: border(c, s), right: border(c, s) });
const CELL_MARGINS = { top: 120, bottom: 120, left: 150, right: 150 };

// ---- image helper ----------------------------------------------------------
const img = (p, w, h) => new ImageRun({ type: 'png', data: fs.readFileSync(p), transformation: { width: w, height: h } });

// ---- text paragraphs -------------------------------------------------------
const P = (text, opts = {}) => new Paragraph({
  spacing: { before: opts.before ?? 0, after: opts.after ?? 120, line: opts.line ?? 312 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  children: [new TextRun({
    text, size: opts.size || 21, bold: opts.bold || false,
    italics: opts.italics || false, color: opts.color || C.ink800, font: FONT,
  })],
});

// PR — paragraph from mixed runs (string | {text,bold,color,italics,size})
const PR = (runs, opts = {}) => new Paragraph({
  spacing: { before: opts.before ?? 0, after: opts.after ?? 120, line: opts.line ?? 312 },
  alignment: opts.align || AlignmentType.JUSTIFIED,
  children: runs.map(r => typeof r === 'string'
    ? new TextRun({ text: r, size: 21, color: C.ink800, font: FONT })
    : new TextRun({ size: 21, color: C.ink800, font: FONT, ...r })),
});

// SP / GAP spacers (GAP required around callouts adjacent to tables)
const SP = () => new Paragraph({ spacing: { before: 120, after: 120 }, children: [new TextRun({ text: '', size: 20, font: FONT })] });
const GAP = (n = 200) => new Paragraph({ spacing: { before: n, after: n }, children: [new TextRun({ text: '', size: 20, font: FONT })] });
const PB = () => new Paragraph({ children: [new PageBreak()] });

// ============================================================================
// H1 — charcoal section band + orange lead-tick + soft-white title (NO NUMBER).
// The band IS the anchor/ornament. Returns [band, hairlineShelf, spacer].
// ============================================================================
const H1 = (title, firstPage = false) => {
  const band = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    borders: noBorders,
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: C.ink850, type: ShadingType.CLEAR },
      margins: { top: 150, bottom: 150, left: 240, right: 200 },
      verticalAlign: VerticalAlign.CENTER,
      borders: allBorders(C.ink850, 4),
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [
        new TextRun({ text: '▍ ', size: 30, color: C.orange500, font: FONT }),
        new TextRun({ text: title, size: 30, bold: true, color: C.onDark, font: FONT }),
      ] })],
    })] })],
  });
  // hairline "shelf" the band casts onto the page
  const shelf = new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    borders: { top: noBorder, bottom: border(C.sand200, 6), left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      borders: { top: noBorder, bottom: border(C.sand200, 6), left: noBorder, right: noBorder },
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: '', size: 2 })] })],
    })] })],
  });
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: !firstPage, keepNext: true,
      spacing: { before: firstPage ? 0 : 200, after: 0 }, children: [new TextRun({ text: '', size: 2 })] }),
    band, shelf,
    new Paragraph({ spacing: { before: 160, after: 0 }, children: [new TextRun({ text: '', size: 2 })] }),
  ];
};

// H2 — quiet typography: number (ink600) + title (ink800). NO orange tick.
const H2 = (numbered, title) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 360, after: 120 },
  children: title === undefined
    ? [new TextRun({ text: numbered, size: 29, bold: true, color: C.ink800, font: FONT })]
    : [
        new TextRun({ text: `${numbered}  `, size: 29, bold: true, color: C.ink600, font: FONT }),
        new TextRun({ text: title, size: 29, bold: true, color: C.ink800, font: FONT }),
      ],
});

const H3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3, spacing: { before: 260, after: 90 },
  children: [new TextRun({ text, size: 24, bold: true, color: C.ink700, font: FONT })],
});

// H4 — the ONLY orange heading-text on white (micro-labels). orange700 (AA).
const H4 = (text) => new Paragraph({
  spacing: { before: 200, after: 70 },
  children: [new TextRun({ text, size: 21, bold: true, color: C.orange700, font: FONT })],
});

// Bullets: orange square ▪ at level 0; numbered: decimal.
const BL = (text, opts = {}) => new Paragraph({
  numbering: { reference: 'bullets', level: opts.level || 0 },
  spacing: { before: 40, after: 40, line: 300 },
  children: [new TextRun({ text, size: 21, color: C.ink800, font: FONT })],
});
const NL = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { before: 40, after: 40, line: 300 },
  children: [new TextRun({ text, size: 21, color: C.ink800, font: FONT })],
});

const figCaption = (text) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 80, after: 220 },
  children: [new TextRun({ text, size: 17, italics: true, color: C.ink500, font: FONT })],
});

// ============================================================================
// Callout — full border + tint + labeled heading (side-stripe BANNED).
// variant: note | success | info | warning | danger | dark
// 'dark' = charcoal hero callout (MAX 2 per document).
// ============================================================================
const VARIANTS = {
  note:    { border: C.sand300, bg: C.sand50,  label: C.ink800,    body: C.ink800 },
  success: { border: C.successBorder, bg: C.successBg, label: C.successText, body: C.ink800 },
  info:    { border: C.infoBorder, bg: C.infoBg, label: C.infoText, body: C.ink800 },
  warning: { border: C.warningBorder, bg: C.warningBg, label: C.warningText, body: C.ink800 },
  danger:  { border: C.dangerBorder, bg: C.dangerBg, label: C.dangerText, body: C.ink800 },
};
const Callout = (label, body, variant = 'note') => {
  const bodyArr = Array.isArray(body) ? body : [body];
  if (variant === 'dark') {
    const labelP = new Paragraph({ spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: label, size: 19, bold: true, color: C.orange500, font: FONT })] });
    const bodyPs = bodyArr.map(t => new Paragraph({ spacing: { before: 0, after: 60, line: 300 },
      children: [new TextRun({ text: t, size: 24, color: C.onDark, font: FONT })] }));
    return new Table({
      width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: allBorders(C.ink900, 4),
      rows: [new TableRow({ children: [new TableCell({
        width: { size: CONTENT_W, type: WidthType.DXA },
        shading: { fill: C.ink900, type: ShadingType.CLEAR },
        margins: { top: 240, bottom: 240, left: 300, right: 260 },
        borders: allBorders(C.ink900, 4),
        children: [labelP, ...bodyPs],
      })] })],
    });
  }
  const v = VARIANTS[variant] || VARIANTS.note;
  const labelP = new Paragraph({ spacing: { before: 0, after: 70 },
    children: [new TextRun({ text: label, size: 20, bold: true, color: v.label, font: FONT })] });
  const bodyPs = bodyArr.map(t => new Paragraph({ spacing: { before: 0, after: 60, line: 300 },
    children: [new TextRun({ text: t, size: 21, color: v.body, font: FONT })] }));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W], borders: allBorders(v.border, 8),
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: v.bg, type: ShadingType.CLEAR },
      margins: { top: 200, bottom: 200, left: 280, right: 240 },
      borders: allBorders(v.border, 8),
      children: [labelP, ...bodyPs],
    })] })],
  });
};

// ============================================================================
// buildTable — charcoal header + orange bottom-seam + zebra body, no vert rules.
// cells: string | {text, bold, color}  (color e.g. C.orange700 for emphasis)
// ============================================================================
function buildTable(headers, rows, colW) {
  const totalW = colW.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: colW[i], type: WidthType.DXA },
      shading: { fill: C.ink900, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 150, right: 150 },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: border(C.ink900, 6), bottom: border(C.orange500, 12), left: border(C.ink900, 6), right: border(C.ink900, 6) },
      children: [new Paragraph({ spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: h, size: 19, bold: true, color: C.onDark, font: FONT })] })],
    })),
  });
  const bodyRows = rows.map((row, idx) => new TableRow({
    children: row.map((c, i) => {
      const isObj = typeof c === 'object' && c !== null && !Array.isArray(c);
      const text = isObj ? c.text : c;
      const bold = isObj ? !!c.bold : false;
      const color = isObj ? (c.color || C.ink700) : C.ink700;
      const fill = idx % 2 === 0 ? C.paper : C.sand50;
      const ps = (Array.isArray(text) ? text : [text]).map(t => new Paragraph({
        spacing: { before: 0, after: 0, line: 276 },
        children: [new TextRun({ text: String(t), size: 19, bold, color, font: FONT })],
      }));
      return new TableCell({
        width: { size: colW[i], type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: CELL_MARGINS, verticalAlign: VerticalAlign.TOP,
        // outer frame + horizontal rules only; no inner vertical rules
        borders: { top: border(C.sand200, 4), bottom: border(C.sand200, 4), left: border(C.sand200, 6), right: border(C.sand200, 6) },
        children: ps,
      });
    }),
  }));
  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: colW, borders: allBorders(C.sand200, 6), rows: [headerRow, ...bodyRows] });
}

// ============================================================================
// buildMetricCards — charcoal tiles, value-on-top orange500, sentence-case label.
// items: [{value, label}]   (max 4 across; accompany with interpreting prose)
// ============================================================================
function buildMetricCards(items) {
  const cw = Math.floor(CONTENT_W / items.length);
  const widths = items.map(() => cw); widths[widths.length - 1] = CONTENT_W - cw * (items.length - 1);
  const row = new TableRow({
    children: items.map((it, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: C.ink900, type: ShadingType.CLEAR },
      margins: { top: 240, bottom: 240, left: 160, right: 160 },
      borders: allBorders(C.paper, 8), // white 1px gaps between tiles
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: it.value, size: 44, bold: true, color: C.orange500, font: FONT })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: it.label, size: 18, color: C.onDarkMuted, font: FONT })] }),
      ],
    })),
  });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, borders: noBorders, rows: [row] });
}

// ============================================================================
// buildProcessFlow — uniform charcoal stages + orange › chevron connectors.
// ============================================================================
function buildProcessFlow(stages) {
  const CHEV = 320;
  const n = stages.length;
  const stageW = Math.floor((CONTENT_W - CHEV * (n - 1)) / n);
  const cols = [];
  const cells = [];
  stages.forEach((s, i) => {
    cols.push(stageW);
    cells.push(new TableCell({
      width: { size: stageW, type: WidthType.DXA },
      shading: { fill: C.ink900, type: ShadingType.CLEAR },
      margins: { top: 180, bottom: 180, left: 100, right: 100 },
      borders: allBorders(C.ink900, 4),
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
          children: [new TextRun({ text: `Tahap ${i + 1}`, size: 14, color: C.onDarkMuted, font: FONT })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: s, size: 19, bold: true, color: C.onDark, font: FONT })] }),
      ],
    }));
    if (i < n - 1) {
      cols.push(CHEV);
      cells.push(new TableCell({
        width: { size: CHEV, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: '›', size: 28, bold: true, color: C.orange500, font: FONT })] })],
      }));
    }
  });
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: cols, borders: noBorders, rows: [new TableRow({ children: cells })] });
}

// chip run (inline status pill text — orange700 on white)
const chipRun = (text, color = C.orange700) => new TextRun({ text: `  ${text}  `, size: 17, bold: true, color, font: FONT });

module.exports = {
  // docx primitives
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  TabStopType, TabStopPosition, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, HeadingLevel, ImageRun,
  // tokens + meta
  C, FONT, MONO, CONTENT_W,
  // border helpers
  border, noBorder, noBorders, allBorders, CELL_MARGINS,
  // content helpers
  img, P, PR, SP, GAP, PB, H1, H2, H3, H4, BL, NL, figCaption,
  Callout, buildTable, buildMetricCards, buildProcessFlow, chipRun,
};
