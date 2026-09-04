# SEO Boost Invoice — Design Tokens

Single source of truth for the invoice's visual identity. The generator (`scripts/generate_invoice.js`) hardcodes these — do **not** redefine colors elsewhere. Sibling of `seoboost-formal-docs` / `seoboost-formal-deck`: same brand DNA, tuned for a dense one-page billing document.

## Color palette

```
PRIMARY
  CHARCOAL / CHARCOAL  #2E2B27   — headings, table headers, totals text, signer name
                               (SEO Boost's charcoal; carries all dark text — NOT pure black)
  BRAND_ORANGE      #FF8800   — FILLS & BORDERS ONLY: total-row fill, kop divider,
                               callout left border, "|" separator. Too light for text.
  ACCENT_DARK        #A85500   — darker orange for the tagline + allocation row text +
                               callout title (legible orange where orange text is needed)

SUPPORT
  SAND_LIGHT  #F0F0EB   — invoice-detail box background, charcoal callout background
  ACCENT_LIGHT  #FFF4E5   — brand-orange callout background (default callout)
  GRAY_BAND   #F7F7F4   — banded (odd) item rows
  GRAY_BORDER #E5E5E1   — table cell borders
  WHITE       #FFFFFF   — even item rows, header text on charcoal
  INK         #3A3733   — body text in tables/lists (warm ink, not pure black)
  TEXT_MUTED  #5C5850   — labels (Bank, No. Rek), address, "Kepada Yth."
  TEXT_DIM    #77776F   — footer line + disclaimer
  TEXT_DARK   #3A3733   — callout body text, terbilang value
```

**Rules**
- Dark text is CHARCOAL `#2E2B27`, never the brand orange (`#FF8800` fails contrast as text).
- The bright brand orange appears only as fills/borders — chiefly the **Total Tagihan** row fill and the kop divider, so the eye lands on the amount due.
- Where orange *text* is genuinely needed (tagline, the parenthesised allocation amount), use `ACCENT_DARK #A85500`.
- No red/orange "alert" colors. A negative/contra amount (allocation) is shown in parentheses `(Rp …)`, the accounting convention — not in red.

## Typography

**Font:** Arial throughout (predictable across Word / LibreOffice / Google Docs).

Sizes are docx half-points (multiply by 0.5 for pt).

| Use | Size | Pt | Weight | Color |
|-----|------|----|--------|-------|
| Company name (kop) | 30 | 15 | Bold | CHARCOAL |
| Address / contact (kop) | 18 | 9 | Reg | TEXT_MUTED |
| "INVOICE" title | 40 | 20 | Bold | CHARCOAL |
| Subtitle (tagline) | 20 | 10 | Italic | ACCENT_DARK |
| Recipient name | 22 | 11 | Bold | CHARCOAL |
| Meta labels / values | 18 | 9 | Reg/Bold | TEXT_MUTED / CHARCOAL |
| Table header | 19 | 9.5 | Bold | WHITE on CHARCOAL |
| Table body / item desc | 19 | 9.5 | Reg | INK |
| Summary row label/value | 19 | 9.5 | Bold (total) | CHARCOAL |
| Terbilang label / value | 19 | 9.5 | Bold / Italic | CHARCOAL / TEXT_DARK |
| Callout title | 20 | 10 | Bold | ACCENT_DARK / CHARCOAL |
| Callout body | 19 | 9.5 | Reg | TEXT_DARK |
| Payment block heading | 20 | 10 | Bold | CHARCOAL |
| Payment labels / values | 19 | 9.5 | Reg / Bold | TEXT_MUTED / INK |
| Signature lines | 19 | 9.5 | mixed | INK / CHARCOAL |
| Director name | 19 | 9.5 | Bold | CHARCOAL |
| "Direktur" caption | 18 | 9 | Reg | TEXT_MUTED |
| Footer / disclaimer | 14 / 13 | 7 / 6.5 | Reg / Italic | TEXT_DIM |

## Page & spacing (tuned for ONE page)

US Letter: 12240 × 15840 DXA. Content width **9360 DXA**.

**Margins (deliberately tight):** `top 500, bottom 460, left/right 1440, header 260, footer 220`.
These were tuned so a dense invoice — 2 line items, donatur allocation, bank block, and signature — fits on a single page. The first thing to overflow if you loosen them is the **last signature line ("Direktur")**. See `references/one-page-and-qa.md` before changing.

**Key spacings (DXA, 240 = 12pt):**
- Kop divider: `before 80, after 110`
- Subtitle after: `120`
- Item cell margins: `top/bottom 54, left/right 120`
- Summary cell margins: `top/bottom 80`
- Terbilang: `before 100, after 30`
- Callout cell margins: `top/bottom 90, left 260, right 220`
- Payment heading before: `160`
- Signature line gap (space to sign): `before 200`

## Component tokens

- **Kop surat** — centered: logo (112×98) → company name → address → "Telp | Email" (orange `|`) → orange divider (`SINGLE size 14 #FF8800`).
- **Invoice-detail box** — right cell, `SAND_LIGHT` fill, borderless inner table: No. Invoice / Tanggal / Jatuh Tempo.
- **Item table** — charcoal header; banded body rows (white / `F7F7F4`); columns No(620) / Deskripsi(5740) / Qty(900) / Jumlah(2100).
- **Summary rows** — right-aligned, 3-col label span + value; the final total row gets `BRAND_ORANGE` fill.
- **Callout** — left border only (`SINGLE size 24`, brand orange or charcoal), tinted background; used for the donatur/sponsorship explanation.
- **Signature** — right-aligned block: city+date / "Hormat kami," / signer / sign-line / director name / "Direktur".
- **Footer** — top border + contact line + electronic-document disclaimer (lives in the page margin band so it never steals body height; see one-page reference).

## Anti-patterns

- ❌ Brand orange `#FF8800` as text — illegible. Use charcoal or `ACCENT_DARK`.
- ❌ Hand-typing subtotal / total / terbilang — the generator computes them; manual values drift.
- ❌ Red for the allocation/contra amount — use `(Rp …)` parentheses.
- ❌ Percentage table widths (breaks in Google Docs) — always DXA.
- ❌ Loosening margins without re-checking page count (see QA reference).
