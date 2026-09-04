# SEO Boost — Brand Reference

Single source of truth for the identity used across every skill in this repo. Per-medium
tokens live in each skill's `design-tokens.md`; they all derive from this page. Values were
sampled from the company's own published assets (seoboost.co.id) and contrast-verified
against WCAG 2.1.

**Never sample a colour off a rendered document or screenshot.** Read it from here.

---

## 1. Identity

| | |
|---|---|
| Trading name | **SEO Boost Indonesia** (short form: *SEO Boost*) |
| Legal entity | **PT Algo Sea Biz** |
| Positioning | SEO & digital-growth consultancy — *Market Smarter* |
| Founded | 2015, Bali, Indonesia |
| Web | [seoboost.co.id](https://seoboost.co.id) · Instagram [@seoboost.co.id](https://www.instagram.com/seoboost.co.id) |
| Contact | contact@seoboost.co.id · +62 878-6303-1503 |
| Offices | Jl. Pulau Galang No. 54A, Denpasar, Bali 80221 · MARQUEE – Alamanda Bali, 5th Floor, Jl. Bypass Ngurah Rai No. 67, Kuta, Bali 80361 |
| Services | SEO · content strategy · Google Ads · social media · digital marketing consulting · web design & development |

**Which name where.** The **trading name** goes on anything a reader sees — document
headers and footers, deck covers, letterheads, signatures. The **legal entity** appears
only where the law wants it: contracts, invoices, tax documents, bank details.

---

## 2. Colour

### Brand orange — the mark

`#FF8800` is a **mark colour**, not a text colour. It scores 2.39:1 on white, which fails
every text threshold; on charcoal it reaches 6.81:1 and comes alive. So it appears as the
logo, an accent tick, a rule, a value sitting on a dark surface — and never as body or
heading text on white.

| Token | Hex | Role | On white |
|---|---|---|---|
| `orange50` | `#FFF4E5` | tint background | 1.09 |
| `orange100` | `#FFE8CC` | chip / hover background | 1.19 |
| `orange300` | `#FFB761` | active fill, secondary data arc | 1.72 |
| `orange500` | `#FF8800` | **BRAND MARK** — logo, accents, value-on-charcoal (6.81:1 on `ink900`) | 2.39 ❌ never text |
| `orange600` | `#C96A00` | chart primary, icon glyphs, active stroke | 3.79 ✅ graphic |
| `orange700` | `#A85500` | **the only readable brand text on white** — links, accent words | 5.30 ✅ |
| `orange800` | `#8F4A00` | inline code, strong brand label | 6.67 ✅ |
| `orange900` | `#5C2F00` | deepest, rare | 11.28 |

Site hover state is `#E67A00`; the app-icon roundel runs a `#F6891F` → `#F15822` gradient.

### Ink — warm charcoal

Anchored on `#231F20`, the solid rich black the wordmark is actually set in. That is why
the ramp is warm rather than a neutral grey.

| Token | Hex | Role | On white |
|---|---|---|---|
| `ink950` | `#131313` | darkest surface — cover hero base | 18.58 |
| `ink900` | `#231F20` | **wordmark ink** — rare heavy objects, table headers, metric cards | 16.30 |
| `ink850` | `#2E2B27` | routine charcoal — section bands | 14.08 |
| `ink800` | `#3A3733` | **body text** | 11.84 |
| `ink700` | `#4F4B45` | subheadings, strong cells | 8.66 |
| `ink600` | `#5C5850` | secondary text | 7.08 |
| `ink500` | `#77776F` | captions, footers, metadata | 4.51 |
| `ink300` | `#B4B2AA` | watermark, disabled | 2.12 |

### Sand — warm neutrals

| Token | Hex | Role |
|---|---|---|
| `sand50` | `#F7F7F4` | zebra rows, code background, chart panel |
| `sand100` | `#F0F0EB` | note background |
| `sand200` | `#E5E5E1` | hairlines, borders, gridlines |
| `sand300` | `#D9D9D4` | dividers |
| `sand400` | `#A5A39B` | secondary strokes, axis ticks |
| `paper` | `#FFFFFF` | page body |
| `onDark` | `#F4F4F0` | text on charcoal (14.78:1 on `ink900`) |
| `onDarkMuted` | `#A9A79F` | secondary text on charcoal (6.76:1) |

### Semantic states

Orange is the **brand** hue, so no state may borrow it — including the amber slot a warning
would normally take. Warning is pushed yellower and deeper, and every warning **must** carry
its written label; hue alone never carries the meaning.

| State | Border / text | Background | On white |
|---|---|---|---|
| success | `#15803D` | `#EAF6EE` | 5.02 ✅ |
| warning | `#8A6410` | `#FBF1E4` | 5.37 ✅ |
| danger | `#A82828` | `#FBEBEB` | 7.00 ✅ |
| info | `#2B5C9C` | `#EAF0F8` | 6.74 ✅ |

---

## 3. Typography

| Surface | Face | Why |
|---|---|---|
| Web / HTML | **Poppins** (fallback: `ui-sans-serif, system-ui, sans-serif`) | the face seoboost.co.id ships |
| Office documents (DOCX, PPTX) | **Arial** | renders identically in Word, LibreOffice and Google Docs |
| Code / monospace | **Cascadia Code**, falling back to `ui-monospace, Consolas, monospace` | |
| PKS / legal contracts | **Courier New** body | deliberate typewriter register; see `seoboost-pks-docs` |

---

## 4. Logo

The mark is a **rocket inside a roundel**, with the wordmark `BOOST` set beside it. The
rocket is a **knockout** — it shows whatever sits behind the mark. That is why the light and
dark lockups are separate files rather than one recoloured asset, and why you must not try
to "fix" the rocket to white.

| Asset | Ratio | Use |
|---|---|---|
| `seoboost-wordmark-dark.png` | 3.45:1 | ink lockup for white and light surfaces |
| `seoboost-wordmark-light.png` | 3.45:1 | orange roundel + soft-white wordmark, for charcoal surfaces |
| `seoboost-wordmark-brand.png` | 3.45:1 | orange roundel + ink wordmark — letterheads, invoices, contracts |
| `seoboost-mark.png` | 1:1 | roundel alone — running headers (~16px), dividers |
| `seoboost-mark-watermark.png` | 1:1 | roundel pre-flattened to 12% alpha |

Masters live in `seoboost-formal-docs/assets/`; `seoboost-invoice-docs` and
`seoboost-pks-docs` carry their own `assets/logo.png` copy of the brand lockup.

**Rules.** Set the width and let the height follow — the lockup is 3.45:1, not the
near-square shape most templates assume. Keep clear space of at least the roundel's radius
on every side. Never stretch it, re-space it, add effects to it, or place the light lockup
on a light background.

---

## 5. Quick anti-patterns

- ❌ `#FF8800` as text on white — use `orange700 #A85500`.
- ❌ Orange standing in for success or warning.
- ❌ A warning callout adjacent to a brand-orange accent.
- ❌ The lockup squashed into a square box, or the roundel hand-recoloured.
- ❌ Pure black `#000000` for body text — the ink ramp is warm on purpose.
- ❌ Colours hardcoded outside the skill's `design-tokens.md` / `helpers.js`.
