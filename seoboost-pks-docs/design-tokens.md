# SEO Boost PKS — Design Tokens

Single source of truth for the visual identity of a SEO Boost Perjanjian Kerja Sama. The generator (`scripts/generate_pks.js`) hardcodes these — do **not** redefine them in config. Sibling of `seoboost-invoice-docs` / `seoboost-formal-docs` / `seoboost-formal-deck`: same brand DNA, tuned for a dense **multi-page legal contract** rather than a one-page billing sheet.

## Two fonts, on purpose

| Where | Font | Why |
|-------|------|-----|
| **Body** (all clause text, parties, lists, signatures) | **Courier New** | Deliberate choice to match the counterparty-approved Klien C PKS — a formal "typewriter / legal instrument" feel. This is the house standard for PKS specifically, even though Arial is the SEO Boost brand face elsewhere. |
| **Kop surat** company name | Arial Rounded MT Bold | Matches the letterhead used across SEO Boost documents. |
| **Kop surat** divisi / address / contact + footer | Arial | Clean supporting line under the rounded company name. |

> If a future counterparty insists on a different body face, change `BODY_FONT` in the generator — it is the single switch. Times New Roman is the usual alternative for ID legal docs.

## Color palette

```
CHARCOAL / CHARCOAL  #2E2B27  — ALL dark text: title, PASAL headings, clause titles,
                            signer names, kop company name. (SEO Boost charcoal, not pure black.)
BRAND_ORANGE      #FF8800  — ACCENT ONLY: the kop divider rule and the "|" between
                            phone & email. Never used as text (fails contrast).
INK              #3A3733  — body clause text & list items (warm ink, not pure black).
TEXT_MUTED       #5C5850  — kop divisi/address/contact, signer jabatan caption.
TEXT_DIM         #77776F  — footer confidentiality line.
GRAY_BORDER      #E5E5E1  — footer top rule.
WHITE            #FFFFFF  — (unused as fill here; legal doc is plain white).
```

**Rules**
- Dark text is always CHARCOAL `#2E2B27` or INK `#3A3733` — never the bright brand orange.
- Orange appears exactly twice: the kop divider line and the `|` separator. That single restrained touch of brand is intentional — a contract should read as sober, not marketed.
- No fills, no banded rows, no callout boxes. A PKS is plain black-on-white body text; the only "chrome" is the repeating kop-surat header and the thin footer rule.

## Typography scale

Sizes are docx half-points (×0.5 = pt).

| Use | Size | Pt | Weight | Color |
|-----|------|----|--------|-------|
| Title "PERJANJIAN KERJA SAMA" | 30 | 15 | Bold | CHARCOAL |
| Judul baris-2 (jenis PKS) | 24 | 12 | Bold | CHARCOAL |
| Nomor lines | 20 | 10 | Reg | INK |
| "KONSIDERAN" / "PASAL n" / clause title | 22 | 11 | Bold | CHARCOAL |
| Body clause text & list items | 20 | 10 | Reg | INK |
| Kop company name | 28 | 14 | Bold | CHARCOAL (Arial Rounded MT Bold) |
| Kop divisi / address / contact | 16 | 8 | Reg | TEXT_MUTED (Arial) |
| Signer name | 20 | 10 | Bold | CHARCOAL |
| Signer "jabatan" caption | 20 | 10 | Reg | TEXT_MUTED |
| Footer | 13 | 6.5 | Italic | TEXT_DIM (Arial) |

Line spacing: `264` (~1.1×) everywhere in the body — dense enough to keep a 21-Pasal contract to ≈10 pages, loose enough to stay readable in Courier.

## Page & layout

A4: **11906 × 16838 DXA**. Content width **9072 DXA**.

**Margins:** `top 1700, bottom 1191, left/right 1417, header 360, footer 480`.
The generous top margin leaves room for the repeating **kop-surat header** (logo + 4 company lines + orange divider) on every page. Do not shrink `top` below ~1600 or the first body line collides with the divider.

**Numbered lists** are rendered as literal text markers (`1.`, `2.`, then nested `a.`, `b.`) with a hanging indent — *not* Word auto-numbering. This keeps output byte-stable and identical across Word / LibreOffice / Google Docs, at the cost of the numbers being fixed by the (locked) boilerplate.
- Level 0 (ayat): left indent `420`, hanging `360`, decimal.
- Level 1 (huruf): left indent `900`, hanging `360`, lower-letter.

## Component tokens

- **Kop surat (page header)** — centered: logo (60×52) → company name (Arial Rounded MT Bold) → "Divisi : seoboost.co.id" → address → "phone | email" (orange `|`) → orange divider rule (`SINGLE size 12 #FF8800`). Repeats on every page.
- **Title block** — centered: judul baris-1 / baris-2 / two `Nomor:` lines.
- **Pasal heading** — two centered bold lines: `PASAL n` then the clause title, with `before: 220` spacing so each article is visually separated.
- **Signature block** — borderless 2-column table: `PIHAK PERTAMA` / `PIHAK KEDUA`, company name (uppercased, bold), four blank lines for the wet signature, signer name (bold), jabatan caption.
- **Footer** — thin top rule + centered confidentiality line, italic, in the page margin band.

## Anti-patterns

- ❌ Brand orange `#FF8800` as text — illegible. Charcoal/black only.
- ❌ Editing clause wording in the JSON config — the 21 Pasal are **locked** boilerplate; only the variable fields in `pks-config.json` are meant to change. Changing legal text means editing the generator deliberately (and ideally getting it reviewed).
- ❌ Switching the body to a proportional font *per-document* on a whim — Courier New is the agreed PKS standard; change it globally via `BODY_FONT` only with reason.
- ❌ Shrinking the top margin and overrunning the kop header onto body text.
- ❌ Word auto-numbering — use the generator's literal-marker lists for stable output.
