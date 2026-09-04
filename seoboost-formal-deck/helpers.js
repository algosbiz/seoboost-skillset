/**
 * SEO Boost Formal Deck — Helper Library
 * --------------------------------
 * Reusable pptxgenjs primitives for SEO Boost/SEOBoost branded slide decks.
 * Source of truth for visual identity. Never hardcode colors or sizes
 * elsewhere — always import and use these helpers.
 *
 * Usage:
 *   const pptxgen = require('pptxgenjs');
 *   const { COLOR, FONT, makeDeck, addCover, addContentScaffold,
 *           addHeader, addFooter, addBadgeCard, addProgramCard,
 *           addInsightSidebar, addNumberedRow, addBottomCallout,
 *           addGanttRow, addClosing } = require('./helpers');
 *
 *   const pres = makeDeck();
 *   addCover(pres, { title: '...', tagline: '...', ... });
 *   // ... content slides
 *   addClosing(pres, { ... });
 *   await pres.writeFile({ fileName: '/mnt/user-data/outputs/deck.pptx' });
 */

// ============================================================================
// DESIGN TOKENS — keep in sync with design-tokens.md
// ============================================================================

const COLOR = {
  // Dark backgrounds
  CHAR_BG:     '231F20',
  CHAR_DEEP:   '131313',
  CHAR_HALF:   '3A3733',
  CHAR_CARD:   '2E2B27',
  // Signal greens
  ORANGE_HOT:   'FF8800',
  ORANGE_SOFT:  'FFA542',
  ORANGE_LIGHT: 'FFC078',
  // Timeline palette
  TL_ORANGE:      'FF8800',
  TL_ORANGE_SOFT: 'FFC078',
  TL_TEAL:       '4FB3A5',
  TL_BLUE:      '5B8FD4',
  TL_PLUM:      'A87FBF',
  // Text
  TEXT_PRIMARY: 'F6F5F1',
  TEXT_BODY:    'D5D2CA',
  TEXT_MUTED:   '9A968C',
};

const FONT = 'Arial';

// Common positioning constants (inches)
const LAYOUT = {
  SLIDE_W: 13.333,
  SLIDE_H: 7.5,
  MARGIN: 0.5,
  HEADER_Y: 0.3,
  FOOTER_Y: 7.22,
  TITLE_BLOCK_Y: 0.85,
  H1_Y: 1.15,
  UNDERLINE_Y: 1.85,
  SUBTITLE_Y: 2.0,
  CALLOUT_Y: 6.55,
  FOOTER_DIVIDER_Y: 7.18,
};

// ============================================================================
// DECK INIT
// ============================================================================

/**
 * Create a new pptxgenjs presentation with SEO Boost 16:9 layout and warm charcoal bg.
 * Always start here.
 */
function makeDeck(pptxgen) {
  if (!pptxgen) {
    pptxgen = require('pptxgenjs');
  }
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
  pres.defineSlideMaster({
    title: 'SEO Boost_DARK',
    background: { color: COLOR.CHAR_BG },
    objects: [],
  });
  return pres;
}

/** Add a fresh SEO Boost-styled slide (warm charcoal bg). */
function addSlide(pres) {
  return pres.addSlide({ masterName: 'SEO Boost_DARK' });
}

// ============================================================================
// HEADER / FOOTER (content slides)
// ============================================================================

/**
 * Top-left brand mark + orange dot + top-right page badge + orange progress bar.
 * Call on every content slide.
 *
 * @param {Slide} slide  pptxgenjs Slide instance
 * @param {Object} opts
 *   - pageNum {number}   current page (1-based)
 *   - totalPages {number}  total content pages (excluding cover/closing if desired)
 *   - brand {string}     default "SEO Boost · seoboost.co.id"
 */
function addHeader(slide, { pageNum, totalPages, brand = 'SEO Boost · seoboost.co.id' }) {
  // Orange dot
  slide.addShape('ellipse', {
    x: 0.42, y: 0.4, w: 0.14, h: 0.14,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });
  // Brand text
  slide.addText(brand, {
    x: 0.62, y: 0.32, w: 3.0, h: 0.3,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'middle',
  });
  // Page progress bar (short solid orange line, left of badge)
  slide.addShape('rect', {
    x: 11.05, y: 0.49, w: 0.55, h: 0.05,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });
  // Page badge (rounded outline rect)
  slide.addShape('roundRect', {
    x: 11.7, y: 0.32, w: 0.9, h: 0.4,
    fill: { color: COLOR.CHAR_BG },
    line: { color: COLOR.ORANGE_HOT, width: 1 },
    rectRadius: 0.05,
  });
  slide.addText(`${String(pageNum).padStart(2, '0')}/${String(totalPages).padStart(2, '0')}`, {
    x: 11.7, y: 0.32, w: 0.9, h: 0.4,
    fontFace: FONT, fontSize: 10, bold: true,
    color: COLOR.TEXT_PRIMARY,
    align: 'center', valign: 'middle',
  });
}

/**
 * Bottom orange divider line + footer caption text. Call on every content slide.
 *
 * @param {Object} opts
 *   - footer {string}  default "Internal discussion deck · siap dipresentasikan"
 */
function addFooter(slide, { footer = 'Internal discussion deck · siap dipresentasikan' } = {}) {
  // Orange divider line
  slide.addShape('rect', {
    x: 0.5, y: LAYOUT.FOOTER_DIVIDER_Y, w: 12.3, h: 0.015,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });
  // Footer text
  slide.addText(footer, {
    x: 0.5, y: LAYOUT.FOOTER_Y, w: 8, h: 0.22,
    fontFace: FONT, fontSize: 9,
    color: COLOR.TEXT_MUTED,
    valign: 'middle',
  });
}

// ============================================================================
// TITLE BLOCK (content slides)
// ============================================================================

/**
 * Standard content-slide title block: eyebrow, H1, short orange underline, subtitle.
 * Returns the y-coordinate of the END of the title block (where body content can start).
 *
 * @param {Slide} slide
 * @param {Object} opts
 *   - eyebrow {string}    e.g., "02 · MANDAT" (rendered in ORANGE_HOT, uppercase)
 *   - title {string}      H1 text (28pt bold)
 *   - subtitle {string}   one-line lead-in below underline
 * @returns {number} y position after the title block
 */
function addTitleBlock(slide, { eyebrow, title, subtitle }) {
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: LAYOUT.MARGIN, y: LAYOUT.TITLE_BLOCK_Y, w: 8, h: 0.3,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.ORANGE_HOT,
      charSpacing: 2,
      valign: 'middle',
    });
  }
  if (title) {
    slide.addText(title, {
      x: LAYOUT.MARGIN, y: LAYOUT.H1_Y, w: 12, h: 0.7,
      fontFace: FONT, fontSize: 28, bold: true,
      color: COLOR.TEXT_PRIMARY,
      valign: 'top',
    });
  }
  // Short orange underline
  slide.addShape('rect', {
    x: LAYOUT.MARGIN, y: LAYOUT.UNDERLINE_Y, w: 1.6, h: 0.04,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: LAYOUT.MARGIN, y: LAYOUT.SUBTITLE_Y, w: 12, h: 0.4,
      fontFace: FONT, fontSize: 13,
      color: COLOR.TEXT_BODY,
      valign: 'top',
    });
  }
  return 2.55; // body content can start here
}

/**
 * Combined scaffold: header + title block + footer. Use as one-call setup.
 * Returns y where body content can start.
 */
function addContentScaffold(slide, { pageNum, totalPages, eyebrow, title, subtitle, brand, footer }) {
  addHeader(slide, { pageNum, totalPages, brand });
  const yStart = addTitleBlock(slide, { eyebrow, title, subtitle });
  addFooter(slide, { footer });
  return yStart;
}

// ============================================================================
// COVER SLIDE
// ============================================================================

/**
 * Add the cover slide with all signature elements:
 *   - decorative half-circle on left
 *   - top-right circle logo (BALI / MICRO / TECHNOLOGY)
 *   - vertical orange line on right
 *   - eyebrow "PEMAPARAN MITRA KONSULTAN"
 *   - title (big)
 *   - short orange divider
 *   - tagline
 *   - meta block (presenter, date, ref)
 *   - bottom-left footer (year, location, company)
 *
 * @param {Pres} pres
 * @param {Object} opts
 *   - brandTop {string}     small top label, e.g. "PT BALI MIKRO TEKNOLOGI"
 *   - brandSub {string}     italic sub, e.g. "seoboost.co.id"
 *   - eyebrow {string}      e.g. "PEMAPARAN MITRA KONSULTAN"
 *   - title {string}        2-line title (use \n)
 *   - tagline {string}      one-line summary below divider
 *   - meta {string[]}       up to 3 lines of meta info (presenter, date, ref) — first line bold
 *   - footer {string}       bottom-left footer, e.g. "2026  |  Bali, Indonesia  |  PT Algo Sea Biz (SEO Boost)"
 */
function addCover(pres, {
  brandTop = 'PT BALI MIKRO TEKNOLOGI',
  brandSub = 'seoboost.co.id',
  eyebrow = '',
  title = '',
  tagline = '',
  meta = [],
  footer = '',
} = {}) {
  const slide = addSlide(pres);

  // Left decorative half-circle (anchored off-canvas left)
  slide.addShape('ellipse', {
    x: -3.5, y: -1.5, w: 7, h: 7,
    fill: { color: COLOR.CHAR_HALF },
    line: { color: COLOR.CHAR_HALF, width: 0 },
  });

  // Right vertical orange accent line (full height)
  slide.addShape('rect', {
    x: 12.15, y: 0, w: 0.015, h: LAYOUT.SLIDE_H,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });

  // Top-right circle logo
  _drawCircleLogo(slide, { x: 11.3, y: 0.2, size: 1.7 });

  // Top-left brand
  slide.addText(brandTop, {
    x: 0.6, y: 0.45, w: 5, h: 0.3,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.TEXT_PRIMARY,
  });
  if (brandSub) {
    slide.addText(brandSub, {
      x: 0.6, y: 0.78, w: 5, h: 0.28,
      fontFace: FONT, fontSize: 10, italic: true,
      color: COLOR.TEXT_BODY,
    });
  }

  // Eyebrow
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.6, y: 2.0, w: 8, h: 0.3,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.TEXT_PRIMARY,
      charSpacing: 2,
    });
  }

  // Title (big)
  if (title) {
    slide.addText(title, {
      x: 0.6, y: 2.55, w: 10.5, h: 1.6,
      fontFace: FONT, fontSize: 36, bold: true,
      color: COLOR.TEXT_PRIMARY,
      valign: 'top',
    });
  }

  // Short orange divider (longer than content-slide underline, runs across more of the title width)
  slide.addShape('rect', {
    x: 0.6, y: 4.45, w: 4.6, h: 0.04,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });

  // Tagline
  if (tagline) {
    slide.addText(tagline, {
      x: 0.6, y: 4.65, w: 10.5, h: 0.5,
      fontFace: FONT, fontSize: 13,
      color: COLOR.TEXT_BODY,
      valign: 'top',
    });
  }

  // Meta block (3 lines — first bold, rest regular)
  if (meta && meta.length) {
    const metaY = 5.6;
    meta.slice(0, 3).forEach((line, i) => {
      slide.addText(line, {
        x: 0.6, y: metaY + (i * 0.27), w: 11, h: 0.27,
        fontFace: FONT, fontSize: 10,
        bold: i === 0,
        italic: i === 2,
        color: COLOR.TEXT_BODY,
        valign: 'middle',
      });
    });
  }

  // Bottom-left footer
  if (footer) {
    slide.addText(footer, {
      x: 0.6, y: 7.12, w: 9, h: 0.3,
      fontFace: FONT, fontSize: 9,
      color: COLOR.TEXT_MUTED,
      valign: 'middle',
    });
  }

  return slide;
}

// Internal: draw the circular BALI/MICRO/TECHNOLOGY logo
function _drawCircleLogo(slide, { x, y, size }) {
  // Outer ring
  slide.addShape('ellipse', {
    x, y, w: size, h: size,
    fill: { type: 'solid', color: COLOR.CHAR_BG },
    line: { color: COLOR.ORANGE_HOT, width: 2.25 },
  });
  // Stacked text inside — use a single text block with line breaks via mixed text format
  slide.addText(
    [
      { text: 'BALI', options: { bold: true, color: COLOR.TEXT_PRIMARY, fontSize: 13, breakLine: true } },
      { text: 'MICRO', options: { bold: true, color: COLOR.ORANGE_HOT, fontSize: 13, breakLine: true } },
      { text: 'TECHNOLOGY', options: { bold: true, color: COLOR.TEXT_PRIMARY, fontSize: 13 } },
    ],
    {
      x, y, w: size, h: size,
      fontFace: FONT,
      align: 'center', valign: 'middle',
      charSpacing: 1.5,
    }
  );
}

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

/**
 * Numbered "badge card" — a rounded card with a orange numbered pill at top-left,
 * a bold title, and a short body description. Used for "Mandat", grid-style overviews.
 *
 * @param {Slide} slide
 * @param {Object} opts
 *   - x, y, w, h            position & size (inches)
 *   - num {string}          badge number, e.g. "01"
 *   - title {string}        card heading
 *   - body {string}         card description (1-2 lines)
 */
function addBadgeCard(slide, { x, y, w, h, num, title, body }) {
  // Card background + border
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.08,
  });
  // Orange numbered pill
  slide.addShape('roundRect', {
    x: x + 0.2, y: y + 0.18, w: 0.45, h: 0.32,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
    rectRadius: 0.06,
  });
  slide.addText(num, {
    x: x + 0.2, y: y + 0.18, w: 0.45, h: 0.32,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.CHAR_BG,
    align: 'center', valign: 'middle',
  });
  // Title
  slide.addText(title, {
    x: x + 0.2, y: y + 0.6, w: w - 0.4, h: 0.4,
    fontFace: FONT, fontSize: 14, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'top',
  });
  // Body
  if (body) {
    slide.addText(body, {
      x: x + 0.2, y: y + 1.05, w: w - 0.4, h: h - 1.15,
      fontFace: FONT, fontSize: 10.5,
      color: COLOR.TEXT_BODY,
      valign: 'top',
    });
  }
}

/**
 * "Program card" — rounded card with a orange eyebrow label ("PROGRAM 1"),
 * a bold title, and a short body. Used for horizontal program rows.
 */
function addProgramCard(slide, { x, y, w, h, eyebrow, title, body }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.08,
  });
  // Track the next available y position inside the card
  let yCursor = y + 0.2;
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: x + 0.2, y: yCursor, w: w - 0.4, h: 0.25,
      fontFace: FONT, fontSize: 10, bold: true,
      color: COLOR.ORANGE_SOFT,
      charSpacing: 1.5,
      valign: 'middle',
    });
    yCursor += 0.3;
  }
  // Title: reserve enough space for up to 2 lines (~0.75")
  slide.addText(title, {
    x: x + 0.2, y: yCursor, w: w - 0.4, h: 0.75,
    fontFace: FONT, fontSize: 14, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'top',
  });
  yCursor += 0.85;
  if (body) {
    // Body fills whatever space remains (with bottom padding)
    slide.addText(body, {
      x: x + 0.2, y: yCursor, w: w - 0.4, h: (y + h) - yCursor - 0.15,
      fontFace: FONT, fontSize: 10.5,
      color: COLOR.TEXT_BODY,
      valign: 'top',
    });
  }
}

/**
 * "Insight sidebar" — vertical rounded card with a orange eyebrow label
 * ("INSIGHT KUNCI"), a bold headline, and a body paragraph.
 * Typically anchored on the left of a slide.
 */
function addInsightSidebar(slide, { x, y, w, h, label, headline, body }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.08,
  });
  // Track the next available y position inside the card
  let yCursor = y + 0.25;
  if (label) {
    slide.addText(label.toUpperCase(), {
      x: x + 0.2, y: yCursor, w: w - 0.4, h: 0.3,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.ORANGE_HOT,
      charSpacing: 1.5,
    });
    yCursor += 0.4;
  }
  if (headline) {
    // Reserve generous space for headline (typically 2-3 lines)
    slide.addText(headline, {
      x: x + 0.2, y: yCursor, w: w - 0.4, h: 1.3,
      fontFace: FONT, fontSize: 16, bold: true,
      color: COLOR.TEXT_PRIMARY,
      valign: 'top',
    });
    yCursor += 1.4;
  }
  if (body) {
    // Body fills whatever space remains (with bottom padding)
    slide.addText(body, {
      x: x + 0.2, y: yCursor, w: w - 0.4, h: (y + h) - yCursor - 0.2,
      fontFace: FONT, fontSize: 10,
      color: COLOR.TEXT_BODY,
      valign: 'top',
    });
  }
}

/**
 * Add a small section-label eyebrow (e.g., "PENDEKATAN BERTAHAP") above
 * a sub-block within a content slide.
 *
 * @param {Object} opts
 *   - x, y, w, h
 *   - text {string}    label text (rendered uppercase + orange)
 */
function addSectionLabel(slide, { x, y, w, h = 0.3, text }) {
  slide.addText(text.toUpperCase(), {
    x, y, w, h,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.ORANGE_HOT,
    charSpacing: 1.5,
    valign: 'middle',
  });
}

/**
 * Inline "phase strip" card — a wide, short rounded card with 3 columns:
 *   [ EYEBROW ]  [ TITLE (center) ]  [ DURATION (right) ]
 * Designed for the "Fase 0 / Fase 1 / Fase 2 / Fase 3" strip pattern.
 *
 * @param {Slide} slide
 * @param {Object} opts
 *   - x, y, w, h          position & size (h typically ~0.6)
 *   - eyebrow {string}    short eyebrow on left, e.g. "Fase 0"
 *   - title {string}      main title, single-line preferred
 *   - duration {string}   duration on right, e.g. "2–4 minggu"
 */
function addPhaseStripCard(slide, { x, y, w, h, eyebrow, title, duration }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.06,
  });
  // Layout: eyebrow=0.7w on left, duration=0.75w on right (9pt), title=remaining middle (~1.25w typical)
  const padX = 0.15;
  const eyebrowW = 0.7;
  const durationW = 0.75;
  const gap = 0.08;
  const titleX = x + padX + eyebrowW + gap;
  const titleW = w - (padX * 2) - eyebrowW - durationW - (gap * 2);
  const durationX = x + w - padX - durationW;

  if (eyebrow) {
    slide.addText(eyebrow, {
      x: x + padX, y, w: eyebrowW, h,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.ORANGE_SOFT,
      valign: 'middle',
    });
  }
  slide.addText(title, {
    x: titleX, y, w: titleW, h,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'middle',
  });
  if (duration) {
    slide.addText(duration, {
      x: durationX, y, w: durationW, h,
      fontFace: FONT, fontSize: 9,
      color: COLOR.TEXT_BODY,
      align: 'right', valign: 'middle',
    });
  }
}

/**
 * Small "stat / target" card — a compact horizontal card with a orange eyebrow
 * label and a single bold value (or paragraph). Designed for things like
 * "TARGET SCALE-UP: 100 KK pilot → 500 KK tahap 1 → 1.300 KK tahap 2".
 *
 * @param {Slide} slide
 * @param {Object} opts
 *   - x, y, w, h         position & size
 *   - label {string}     eyebrow label, e.g. "TARGET SCALE-UP"
 *   - value {string}     the highlighted value/text
 */
function addStatCard(slide, { x, y, w, h, label, value }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.08,
  });
  if (label) {
    slide.addText(label.toUpperCase(), {
      x: x + 0.2, y: y + 0.12, w: w - 0.4, h: 0.3,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.ORANGE_HOT,
      charSpacing: 1.5,
      valign: 'middle',
    });
  }
  if (value) {
    slide.addText(value, {
      x: x + 0.2, y: y + 0.45, w: w - 0.4, h: h - 0.55,
      fontFace: FONT, fontSize: 13, bold: true,
      color: COLOR.TEXT_PRIMARY,
      valign: 'top',
    });
  }
}

/**
 * Numbered row item — a wide rounded rectangle with a small numbered circle,
 * a bold title on the left, and a description on the right.
 * Stack multiple rows vertically to form a list.
 */
function addNumberedRow(slide, { x, y, w, h, num, title, body }) {
  slide.addShape('roundRect', {
    x, y, w, h,
    fill: { color: COLOR.CHAR_CARD },
    line: { color: COLOR.ORANGE_SOFT, width: 1 },
    rectRadius: 0.08,
  });
  // Number circle
  slide.addShape('ellipse', {
    x: x + 0.18, y: y + (h - 0.42) / 2, w: 0.42, h: 0.42,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });
  slide.addText(String(num), {
    x: x + 0.18, y: y + (h - 0.42) / 2, w: 0.42, h: 0.42,
    fontFace: FONT, fontSize: 12, bold: true,
    color: COLOR.CHAR_BG,
    align: 'center', valign: 'middle',
  });
  // Title (left half)
  const titleX = x + 0.75;
  const titleW = (w - 0.95) * 0.42;
  slide.addText(title, {
    x: titleX, y, w: titleW, h,
    fontFace: FONT, fontSize: 13, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'middle',
  });
  // Body (right half)
  const bodyX = titleX + titleW + 0.15;
  const bodyW = w - (bodyX - x) - 0.2;
  if (body) {
    slide.addText(body, {
      x: bodyX, y, w: bodyW, h,
      fontFace: FONT, fontSize: 10.5,
      color: COLOR.TEXT_BODY,
      valign: 'middle',
    });
  }
}

/**
 * Bottom callout strip — wide rounded rectangle (outline only, transparent fill),
 * positioned just above the footer. Supports a bold lead phrase + optional tail.
 *
 * @param {Object} opts
 *   - lead {string}     bold portion (required)
 *   - tail {string}     optional continuation (regular)
 *   - emphasis {string} 'soft' (default, orange-soft border) | 'hot' (orange-hot border)
 */
function addBottomCallout(slide, { lead, tail = '', emphasis = 'soft' }) {
  const borderColor = emphasis === 'hot' ? COLOR.ORANGE_HOT : COLOR.ORANGE_SOFT;
  slide.addShape('roundRect', {
    x: LAYOUT.MARGIN, y: LAYOUT.CALLOUT_Y, w: 12.3, h: 0.5,
    fill: { color: COLOR.CHAR_BG },
    line: { color: borderColor, width: 1 },
    rectRadius: 0.06,
  });
  const textItems = [
    { text: lead, options: { bold: true, color: COLOR.TEXT_PRIMARY } },
  ];
  if (tail) {
    textItems.push({ text: ' ' + tail, options: { color: COLOR.TEXT_BODY } });
  }
  slide.addText(textItems, {
    x: LAYOUT.MARGIN + 0.3, y: LAYOUT.CALLOUT_Y, w: 11.8, h: 0.5,
    fontFace: FONT, fontSize: 11,
    align: 'center', valign: 'middle',
  });
}

/**
 * Gantt-style row: a label on the left + a colored bar spanning a subset of
 * month columns on the right.
 *
 * IMPORTANT: call `addGanttHeader` first to draw the month columns,
 * then call `addGanttRow` for each workstream.
 *
 * @param {Object} opts
 *   - months {string[]}    array of month labels e.g. ['Mei','Jun','Jul',...]
 *   - x, y, w              top-left of the header strip; w is total width spanning all month cells
 */
function addGanttHeader(slide, { months, x, y, w }) {
  const colW = w / months.length;
  months.forEach((m, i) => {
    slide.addShape('roundRect', {
      x: x + (i * colW) + 0.05, y, w: colW - 0.1, h: 0.4,
      fill: { color: COLOR.CHAR_BG },
      line: { color: COLOR.ORANGE_SOFT, width: 1 },
      rectRadius: 0.05,
    });
    slide.addText(m, {
      x: x + (i * colW), y, w: colW, h: 0.4,
      fontFace: FONT, fontSize: 11, bold: true,
      color: COLOR.TEXT_PRIMARY,
      align: 'center', valign: 'middle',
    });
  });
}

/**
 * Add a single gantt row.
 *
 * @param {Slide} slide
 * @param {Object} opts
 *   - label {string}         workstream label (rendered on the left, e.g. "Brand Guideline")
 *   - labelX, labelY, labelW position of label
 *   - rowY {number}          y position of the bar
 *   - rowH {number}          height of the bar (default 0.32)
 *   - gridX, gridW           x position of the gantt grid + total grid width
 *   - totalMonths {number}   number of month columns
 *   - startMonth {number}    1-based start index (within totalMonths)
 *   - endMonth {number}      1-based end index (inclusive)
 *   - color {string}         hex color for the bar (use TL_* tokens)
 */
function addGanttRow(slide, {
  label, labelX, labelY, labelW,
  rowY, rowH = 0.32,
  gridX, gridW, totalMonths,
  startMonth, endMonth,
  color,
}) {
  // Label
  slide.addText(label, {
    x: labelX, y: labelY, w: labelW, h: rowH,
    fontFace: FONT, fontSize: 11, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'middle',
  });
  // Bar
  const colW = gridW / totalMonths;
  const barX = gridX + ((startMonth - 1) * colW) + 0.05;
  const barW = ((endMonth - startMonth + 1) * colW) - 0.1;
  slide.addShape('roundRect', {
    x: barX, y: rowY, w: barW, h: rowH,
    fill: { color },
    line: { color, width: 0 },
    rectRadius: 0.04,
  });
}

// ============================================================================
// CLOSING SLIDE
// ============================================================================

/**
 * Closing slide ("TERIMA KASIH" / "THANK YOU"). Mirrors cover layout with
 * the half-circle decoration moved to bottom-right.
 *
 * @param {Pres} pres
 * @param {Object} opts
 *   - heading {string}     default "TERIMA KASIH"
 *   - brandLine {string}   e.g. "PT Algo Sea Biz · seoboost.co.id"
 *   - contact {string}     e.g. "contact@seoboost.co.id · 0811 3940 4640 · JL. Sedap Malam No 9A Denpasar"
 *   - closingNote {string} e.g. "Siap untuk diskusi dan penetapan prioritas eksekusi."
 */
function addClosing(pres, {
  heading = 'TERIMA KASIH',
  brandLine = '',
  contact = '',
  closingNote = '',
} = {}) {
  const slide = addSlide(pres);

  // Bottom-right decorative half-circle
  slide.addShape('ellipse', {
    x: 10, y: 5, w: 6, h: 6,
    fill: { color: COLOR.CHAR_HALF },
    line: { color: COLOR.CHAR_HALF, width: 0 },
  });

  // Right vertical orange accent line
  slide.addShape('rect', {
    x: 12.15, y: 0, w: 0.015, h: LAYOUT.SLIDE_H,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });

  // Top-right circle logo
  _drawCircleLogo(slide, { x: 11.3, y: 0.2, size: 1.7 });

  // "TERIMA KASIH" headline
  slide.addText(heading, {
    x: 0.6, y: 2.55, w: 10, h: 1.0,
    fontFace: FONT, fontSize: 40, bold: true,
    color: COLOR.TEXT_PRIMARY,
    valign: 'top',
    charSpacing: 1,
  });

  // Short orange divider
  slide.addShape('rect', {
    x: 0.6, y: 3.65, w: 1.6, h: 0.04,
    fill: { color: COLOR.ORANGE_HOT },
    line: { color: COLOR.ORANGE_HOT, width: 0 },
  });

  // Brand line
  if (brandLine) {
    slide.addText(brandLine, {
      x: 0.6, y: 4.1, w: 10, h: 0.3,
      fontFace: FONT, fontSize: 12,
      color: COLOR.TEXT_BODY,
    });
  }
  // Contact
  if (contact) {
    slide.addText(contact, {
      x: 0.6, y: 4.5, w: 10, h: 0.3,
      fontFace: FONT, fontSize: 11,
      color: COLOR.TEXT_BODY,
    });
  }
  // Closing note
  if (closingNote) {
    slide.addText(closingNote, {
      x: 0.6, y: 5.2, w: 10, h: 0.3,
      fontFace: FONT, fontSize: 12,
      color: COLOR.TEXT_BODY,
    });
  }

  return slide;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // tokens
  COLOR,
  FONT,
  LAYOUT,
  // deck init
  makeDeck,
  addSlide,
  // chrome
  addHeader,
  addFooter,
  addTitleBlock,
  addContentScaffold,
  // cover/closing
  addCover,
  addClosing,
  // content components
  addBadgeCard,
  addProgramCard,
  addInsightSidebar,
  addSectionLabel,
  addPhaseStripCard,
  addStatCard,
  addNumberedRow,
  addBottomCallout,
  addGanttHeader,
  addGanttRow,
};
