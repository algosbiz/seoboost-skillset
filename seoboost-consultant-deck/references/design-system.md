# Design System — Consultant Deck House Style

Distilled from a professional infrastructure business-case deck. These are **defaults** —
confirm and swap the client's/SEO Boost's real brand before delivery.

## Canvas

- **16:9**, 960 × 540 pt (= 13.333 × 7.5 in). PowerPoint "Widescreen".
- Margins: 0.55 in left/right, 0.4 in top/bottom. Content sits on a soft grid.

## Palette

| Token | Hex | Use |
|---|---|---|
| `navy` | `#1B3A6B` | Title band, action titles, table header fill, dividers |
| `navy-deep` | `#12285A` | Divider-slide background |
| `red` | `#C00000` | Accent rule, section kicker, marker square, emphasis, highlight row |
| `teal` | `#00B0A0` | Key milestone / positive callout (use sparingly) |
| `ink` | `#262626` | Body text |
| `grey` | `#7F7F7F` | Footnotes, secondary labels |
| `grey-band` | `#8496B0` | Table sub-header fill |
| `paper` | `#FFFFFF` | Slide background |
| `wash` | `#EEF2F8` | Zebra rows, callout backgrounds |

RAG for comparison tables: green `#2E7D32`, amber `#ED9B00`, red `#C00000`.

## Typography

- Family: **Segoe UI** (Semibold/Bold/Regular/Italic). Fallback: Arial, then Calibri.
- Action title: 24–28 pt, Bold, navy.
- Section kicker (small red label above/below title, e.g. "Timeline¹"): 12–14 pt, Bold, red.
- Body: 12–16 pt, Regular, ink. Bullets one level where possible.
- Footnotes: 8–9 pt, Regular, grey.
- Divider title: 32–40 pt, Bold, white on navy.

## Layout — content slide (archetype 3)

```
┌────────────────────────────────────────────────────────────┐
│ ■(red)  ───────────────(navy rule)───────────────────────── │  top rule + marker
│                                                              │
│  Action title sentence in navy bold                          │  ← 24–28pt
│  Red section kicker¹                                         │  ← optional
│                                                              │
│   • body content — bullets / chart / 2×2 / table            │
│                                                              │
│                                                    ◈ (brand) │  faint mark, bottom-right
│  ¹ source · year · assumption            (grey footnotes)   │
│  6                                                           │  page number, bottom-left
└────────────────────────────────────────────────────────────┘
```

## Layout — cover (archetype 1)

- Hero photo full-width, top ~55% of canvas.
- Thin red rule separating photo from the navy band below.
- Navy band: title (Bold white, ~32pt) + subtitle (Semibold white) top-left; partner logos
  top-right; "Final Presentation" + date lower-left; brand chevron bottom-right.

## Layout — section divider (archetype 2)

- Full navy background. Large white `"<Letter>. <Section Name>"`. Optional right-side agenda
  rail listing all sections with the current one in red/bold.

## Recurring furniture

- **Top rule + red square** marker on every content slide (consistency signal).
- **Page numbers** bottom-left on content slides (not on cover/dividers).
- **Footnotes** bottom, grey, numbered — one per sourced claim/number.
- **Brand mark** faint, bottom-right, never competing with content.

## Notes for renderers

- `scripts/deck_pptx.py` encodes these tokens as constants at the top of the file — change
  them in one place to re-skin.
- `scripts/deck_html.py` encodes them as CSS custom properties (`:root { --navy: … }`).
- Keep the two in sync when re-skinning.
