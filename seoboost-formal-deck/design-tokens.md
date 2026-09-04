# SEO Boost Formal Deck — Design Tokens

Single source of truth for visual identity. All colors, typography, spacing, and component sizing in `helpers.js` reference these tokens. Do NOT hardcode values elsewhere.

## Slide canvas

- **Aspect ratio:** 16:9 widescreen
- **Dimensions:** 13.333" × 7.5" (`LAYOUT_WIDE` in pptxgenjs)
- **Background:** `CHAR_BG` (`#231F20`) — never white, never pure black

## Color palette

```
PRIMARY DARKS (backgrounds)
  CHAR_BG       #231F20   — slide background (default)
  CHAR_DEEP     #131313   — deeper accent (subtle areas, decorative)
  CHAR_HALF     #3A3733   — decorative half-circles on cover
  CHAR_CARD     #2E2B27   — card / panel background

PRIMARY GREENS (signal accents)
  ORANGE_HOT     #FF8800   — bright signal orange: badges, dividers, logo strokes, primary CTA bars
  ORANGE_SOFT    #FFA542   — softer orange: card border outlines, "PROGRAM N" labels, eyebrow text
  ORANGE_LIGHT   #FFC078   — light orange: timeline / gantt bars (variant A)

TIMELINE PALETTE (gantt bar colors — use sparingly, one per row)
  TL_ORANGE      #FF8800   — gelombang 1 / fondasi
  TL_ORANGE_SOFT #FFC078   — gelombang 1 alt
  TL_TEAL       #4FB3A5   — gelombang 2 / kolaborasi
  TL_BLUE      #5B8FD4   — gelombang 3 / automasi
  TL_PLUM      #A87FBF   — gelombang 3 / skala

TEXT COLORS (on charcoal bg)
  TEXT_PRIMARY  #F6F5F1   — headings, titles, primary body text (off-white, easier on eyes than pure white)
  TEXT_BODY     #D5D2CA   — supporting body text, subtitles, card descriptions
  TEXT_MUTED    #9A968C   — captions, footer text, meta lines, page numbers
```

**Rules:**
- The deck is ALWAYS dark mode (charcoal bg). Never put a light/white slide in a SEO Boost deck.
- Headings = `TEXT_PRIMARY`. Body = `TEXT_BODY`. Captions/meta = `TEXT_MUTED`.
- `ORANGE_HOT` is the SIGNAL color — reserved for: section eyebrow ("02 · MANDAT"), short underline accent below H1, badge pill background, page-progress leading line, divider lines, decorative circle stroke.
- `ORANGE_SOFT` for card borders, "PROGRAM N" / "FASE N" eyebrow labels, "INSIGHT KUNCI" labels, secondary callout borders.
- Never use red, orange, or yellow EXCEPT in gantt timeline bars (where palette variety encodes phase).
- Never put orange text on orange bg — always orange on charcoal, or charcoal on orange.

## Typography

**Font family:** Arial (parity with `seoboost-formal-docs`, universally available, predictable rendering)

**Type scale** (sizes in pt, pptxgenjs uses pt directly):

| Use | Size (pt) | Weight | Color |
|-----|----|--------|-------|
| Cover title (Bahasa main title) | 36 | Bold | TEXT_PRIMARY |
| Cover tagline (italic, below divider) | 13 | Regular | TEXT_BODY |
| Cover eyebrow ("PEMAPARAN MITRA KONSULTAN") | 11 | Bold | TEXT_PRIMARY |
| Cover circle logo "BALI / MICRO / TECHNOLOGY" | 13 | Bold | mixed (MICRO=orange, rest=white) |
| Cover meta block (presenter, date) | 10 | Mixed | TEXT_BODY |
| Cover footer (year, location) | 9 | Regular | TEXT_MUTED |
| Slide H1 (content slide title) | 28 | Bold | TEXT_PRIMARY |
| Slide eyebrow ("02 · MANDAT") | 11 | Bold | ORANGE_HOT |
| Slide subtitle (under H1) | 13 | Regular | TEXT_BODY |
| Card title (e.g., "Strategi Bisnis") | 14 | Bold | TEXT_PRIMARY |
| Card body description | 10.5 | Regular | TEXT_BODY |
| Card badge number ("01") | 11 | Bold | CHAR_BG (on orange pill) |
| Program/Phase eyebrow ("PROGRAM 1", "Fase 0") | 10 | Bold | ORANGE_SOFT |
| Insight callout label ("INSIGHT KUNCI") | 11 | Bold | ORANGE_HOT |
| Insight callout headline | 16 | Bold | TEXT_PRIMARY |
| Insight callout body | 10 | Regular | TEXT_BODY |
| Bottom callout strip | 11 | Mixed (bold lead + regular tail) | TEXT_PRIMARY / TEXT_BODY |
| Header brand mark ("SEO Boost · seoboost.co.id") | 11 | Bold | TEXT_PRIMARY |
| Page badge ("02/07") | 10 | Bold | TEXT_PRIMARY |
| Slide footer ("Internal discussion deck …") | 9 | Regular | TEXT_MUTED |
| Gantt month label | 11 | Bold | TEXT_PRIMARY |
| Gantt row label | 11 | Bold | TEXT_PRIMARY |
| Closing "TERIMA KASIH" | 40 | Bold | TEXT_PRIMARY |

## Spacing & layout

**Page setup:**
- Slide size: 13.333" × 7.5" (16:9)
- Content margin: 0.5" left/right (safe zone for body content)
- Header zone: top 0.5" (brand mark left, page badge right)
- Footer zone: bottom 0.4" (orange divider + footer text)
- Title block: starts at y ≈ 0.85", H1 begins at y ≈ 1.05"

**Common positions (inches):**
| Element | x | y | w | h |
|---------|---|---|---|---|
| Header brand mark | 0.5 | 0.3 | 3.0 | 0.3 |
| Header brand dot (orange circle) | 0.35 | 0.4 | 0.12 | 0.12 |
| Page badge | 11.7 | 0.32 | 0.9 | 0.4 |
| Page progress orange bar (left of badge) | 11.1 | 0.5 | 0.55 | 0.05 |
| Slide eyebrow | 0.5 | 0.85 | 6 | 0.3 |
| Slide H1 | 0.5 | 1.15 | 12 | 0.6 |
| Short orange underline (under H1) | 0.5 | 1.85 | 1.6 | 0.04 |
| Subtitle | 0.5 | 2.0 | 12 | 0.4 |
| Body content zone | 0.5 | 2.5 | 12.3 | 4.0 |
| Bottom callout strip | 0.5 | 6.55 | 12.3 | 0.45 |
| Footer divider (orange line) | 0.5 | 7.18 | 12.3 | 0.02 |
| Footer text | 0.5 | 7.22 | 6 | 0.2 |

**Card spacing rules:**
- Card corner radius: `rectRadius: 0.08` (subtle rounding)
- Card border: 1pt stroke, `ORANGE_SOFT`
- Card padding: 0.18" inside
- Gap between cards in a grid: 0.2" horizontal, 0.2" vertical

**Badge pill (numbered):**
- Width: 0.45", Height: 0.32"
- Corner radius: `rectRadius: 0.06`
- Fill: `ORANGE_HOT`
- Text color: `CHAR_BG` (dark on orange for max contrast)

## Component-specific tokens

**Cover decorative half-circle:**
- Color: `CHAR_HALF` (`#3A3733`)
- Position: large ellipse anchored off-canvas left, centered vertically (about 2/3 visible)
- Size: ~7" × 7" ellipse with center near x=-1.5, y=2

**Cover circle logo (top-right):**
- Outer ring: ellipse, no fill, 2.25pt stroke `ORANGE_HOT`
- Size: 1.7" × 1.7", positioned at x=11.3, y=0.2
- Inside: 3 stacked text lines, center-aligned: "BALI" (white) / "MICRO" (orange) / "TECHNOLOGY" (white)
- Vertical line accent: 0.02" × 7.5" full-height orange stroke at x=12.15 (or right edge of circle)

**Page badge (top-right of content slides):**
- Rounded rectangle outline, 1pt `ORANGE_HOT` stroke, no fill
- Short solid orange bar (0.55" × 0.05") immediately to the left, vertically centered with the badge

**Short H1 underline:**
- Solid orange bar, `ORANGE_HOT`, 1.6" × 0.04"
- Positioned directly under H1 with 0.05–0.1" gap

**Bottom callout strip:**
- Rounded rectangle, 1pt `ORANGE_SOFT` stroke, fill `CHAR_BG` (transparent feel — same as bg)
- Text inside: bold lead phrase + regular continuation, center or left-aligned

**Gantt bar:**
- Rectangle, slight rounding (`rectRadius: 0.04`)
- Height: 0.32"
- Color: pick from TIMELINE PALETTE based on workstream group

## Anti-patterns (do NOT do these)

- ❌ Light/white slide backgrounds (deck is dark-mode only)
- ❌ Mixing fonts (e.g., Calibri or Georgia) — use Arial throughout
- ❌ Using `ORANGE_HOT` for body text (too vibrant, only for accents)
- ❌ Hardcoded hex outside `helpers.js`
- ❌ Bullets with `•` or other unicode — pptxgenjs renders these inconsistently; use numbered pills or text with leading space
- ❌ Adding red/orange "alert" colors (only allowed inside gantt timeline)
- ❌ Section "accent lines" under EVERY title — only the short orange underline (1.6") under H1
- ❌ Full-bleed decorative bars at top/bottom — header/footer is text-only + a thin orange divider line above footer
- ❌ Emoji in body text (use bold or orange eyebrow for emphasis)
- ❌ Overlapping shapes / text bleeding outside cards — always verify with QA pass
- ❌ Tables with default borders (build cards out of `addShape` + text, not native tables)
