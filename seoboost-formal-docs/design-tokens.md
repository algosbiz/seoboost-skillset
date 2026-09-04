# SEO Boost Corporate — Design Tokens

Single source of truth for the `seoboost-formal-docs` skill (SEO Boost corporate brand). Every value below is contrast-verified against WCAG 2.1. Do NOT hardcode values elsewhere — reference the `C` tokens in `helpers.js`.

> **Brand DNA:** PT Algo Sea Biz trades as **SEO Boost Indonesia** — an SEO and digital-growth consultancy founded in Bali in 2015. Brand orange `#FF8800` (sampled from the rocket roundel in the canonical logo) + warm charcoal. The wordmark is set in a solid `#231F20` rich black, which is why the ink ramp is warm and anchors at `ink900 #231F20` rather than a neutral grey. Personality: architectural, premium, kinetic — the mark is a rocket, and the documents should feel like they are going somewhere.

---

## Two non-negotiable rules

1. **Orange `#FF8800` is a MARK / GLOW-ON-CHARCOAL color ONLY.** It fails as text on white (2.39:1). It appears as text/value ONLY on charcoal surfaces (cover, bands, cards), where it hits 6.81:1 on `ink900`. Readable orange text on white = `orange700 #A85500` (5.30:1 AA).
2. **NO numbered-badge chips. NO side-stripe callouts.** Section headings = a charcoal band + orange lead-tick + title (no boxed number, no section number on the band). Callouts = full border + tint + labeled heading (or full charcoal hero callout, max 2/doc).

---

## 1. Color tokens (DOCX hex WITHOUT `#`)

### Orange ramp (anchor `orange500` = literal logo orange)
| Token | Hex | Role | On white |
|---|---|---|---|
| `orange50` | `FFF4E5` | brand tint bg | — |
| `orange100` | `FFE8CC` | hover/chip bg | — |
| `orange300` | `FFB761` | diagram active-node fill, donut 4th arc | — |
| `orange500` | `FF8800` | **BRAND MARK** — logo, value-on-charcoal, band tick, cover accents, chart primary on charcoal, diagram highlight. On `ink900` = 6.81:1 AA | 2.39 ❌ never text on white |
| `orange600` | `C96A00` | icon glyphs, **chart primary series on white**, diagram active stroke | 3.79 (graphic ✅) |
| `orange700` | `A85500` | **only readable orange TEXT on white** — links, accent word, H4, ACTIVE label | 5.30 ✅ |
| `orange800` | `8F4A00` | inline-code text, strong brand label | 6.67 ✅ |
| `orange900` | `5C2F00` | deepest orange, rare | 11.28 |

### Charcoal / ink ramp
| Token | Hex | Role | On white |
|---|---|---|---|
| `ink950` | `131313` | **cover hero base** (darkest) | 18.58 |
| `ink900` | `231F20` | **wordmark ink** — RARE: dark hero callout, table header, metric cards, diagram anchor | 16.30 |
| `ink850` | `2E2B27` | Title/H1 text; **H1 section BAND fill** (the routine charcoal) | 14.08 |
| `ink800` | `3A3733` | BODY TEXT default, H2 text | 11.84 |
| `ink700` | `4F4B45` | H3/H4 text, table-cell strong | 8.66 |
| `ink600` | `5C5850` | secondary text, H2 number | 7.08 |
| `ink500` | `77776F` | captions, footer, metadata labels | 4.51 |
| `ink300` | `B4B2AA` | watermark on white, disabled | 2.12 |

### Warm sand neutrals + on-dark text
| Token | Hex | Role |
|---|---|---|
| `sand50` | `F7F7F4` | zebra even-row, light code bg, **chart panel** |
| `sand100` | `F0F0EB` | light note bg |
| `sand200` | `E5E5E1` | hairlines, gridlines, card border |
| `sand300` | `D9D9D4` | dividers, chart gridlines |
| `sand400` | `A5A39B` | diagram secondary stroke, axis ticks |
| `paper` | `FFFFFF` | page body background |
| `onDark` | `F4F4F0` | **text on charcoal** (soft white, premium) — 14.78:1 on ink900 |
| `onDarkMuted` | `A9A79F` | secondary text on charcoal — 6.76:1 |

### Semantic — orange is the BRAND hue, so no state may borrow it
Because the brand owns the warm-warning slot that amber usually occupies, `warning` is pushed **yellower and deeper** than `orange700`, and a warning callout must ALWAYS carry its written label. Hue alone never carries the meaning here.

| Token (border / bg / text) | Border | Bg | Text/white | Role |
|---|---|---|---|---|
| `success` | `15803D` | `EAF6EE` | 5.02 ✅ | success (true green — never the brand orange) |
| `warning` | `8A6410` | `FBF1E4` | 5.37 ✅ | warning (deep mustard; label mandatory) |
| `danger` | `A82828` | `FBEBEB` | 7.00 ✅ | risk |
| `info` | `2B5C9C` | `EAF0F8` | 6.74 ✅ | note/aside (muted slate-blue) |

---

## 2. Typography (Arial; DOCX sizes in half-points)

| Style | pt | docx size | Weight | Color | Notes |
|---|---|---|---|---|---|
| Cover title | 30 | 60 | Bold | `onDark` | left-aligned on charcoal hero |
| Cover subtitle | 13.5 | 27 | Reg | `onDarkMuted` | |
| Cover doc-type | 11 | 22 | Bold | `orange500` | uppercase |
| H1 band title | 15 | 30 | Bold | `onDark` | orange `▍` lead-tick; on `ink850` band; NO number |
| H2 | 14.5 | 29 | Bold | `ink800` | number `1.1` in `ink600`; NO orange tick |
| H3 | 12 | 24 | Bold | `ink700` | type only |
| H4 | 10.5 | 21 | Bold | `orange700` | the ONLY orange heading-text on white |
| Body | 10.5 | 21 | Reg | `ink800` | line 312 (~1.35×) |
| Body-strong | 10.5 | 21 | Bold | `ink850` | inline |
| Link/accent | 10.5 | 21 | Bold | `orange700` | inline, no underline |
| Bullet | 10.5 | 21 | Reg | `ink800` | orange square `▪` marker |
| Caption | 8.5 | 17 | Italic | `ink500` | figure captions |
| Code block | 9.5 | 19 | Mono | `ink800` on `sand50` | Cascadia Code |
| Code inline | 9.5 | 19 | Mono | `orange800` on `sand100` | |
| Table header | 9.5 | 19 | Bold | `onDark` on `ink900` | orange `12` bottom-seam |
| Table cell | 9.5 | 19 | Reg | `ink700` | zebra white/sand50 |
| Metric value | 22 | 44 | Bold | `orange500` on `ink900` | |
| Metric label | 9 | 18 | Reg | `onDarkMuted` | **sentence case** (not uppercase) |
| Footer/header | 8 | 16 | Mixed | `ink800`/`ink500` | |

---

## 3. Spacing & geometry

| Token | Value |
|---|---|
| `page.size` | US Letter 12240 × 15840 DXA |
| cover margins | **0** (full-bleed charcoal hero) |
| body margins | top 1440 / bottom 1296 / sides 1368 |
| body content width | 9504 DXA (`CONTENT_W`) |
| H1 band padding | top 150 / bottom 150 / left 240 / right 200 |
| callout padding (light) | top 200 / bottom 200 / left 280 / right 240 |
| callout padding (dark) | top 240 / bottom 240 / left 300 / right 260 |
| metric card padding | top 240 / bottom 240 / left 160 / right 160 |
| table cell margins | top 120 / bottom 120 / left 150 / right 150 |
| radius (diagram/chart) | 8px / 6-12px |

---

## 4. Charcoal value-reservation (impeccable P1-3)

The *rare* charcoal object must LOOK rarer than the routine one:
- **Routine charcoal** (`ink850 #2E2B27`): H1 section bands.
- **Deepest charcoal** (`ink900 #231F20` / `ink950 #131313`): cover hero, the reserved dark hero callout (max 2/doc), table headers, metric cards, diagram anchor node.

**Pacing:** never stack two charcoal structural objects adjacent — white prose/whitespace separates them.

---

## 5. Charts (SVG → resvg PNG @2×)
On a `sand50` panel (radius 12, sand200 border), white plot area. **Never on charcoal.** One saturated hue per chart: PRIMARY = `orange600` (readable on white), secondary `ink700`, tertiary `sand400`, donut 4th+ `orange300`→`ink500`→`sand300`. Axis `ink600` 1px; horizontal gridlines only `sand200`; data labels `ink800`. No 3D, no shadow, no gradient.

## 6. Diagram tokens (CLEAN FLAT — tidy, NOT hand-drawn)
Crisp SVG (rounded rects radius 10, straight connectors, clean triangular arrowheads), 2× export at ~62%, transparent bg. NO Rough.js / sketch look (user preference: rapi). Node kinds: `default` (white + `ink800` 1.6px), `active` (`orange300` + `orange600` 2px), **`anchor` (`ink900` fill + `orange500` title — the SEO Boost signature, ≥1 per arch figure)**, `accent` (`orange50` + `orange600`), `data` (`sand200` + `sand400`), `external` (`infoBg` + `infoStroke`), `secondary` (dashed `sand400`). Edges `ink700` 1.8px; ONE `orange600` primary-path edge (2.4px) max; edge labels LAST on white plates.

---

## 7. Logo assets (`assets/`)
All four are the company's own published marks, not redraws. The rocket inside the roundel is a **knockout** — it takes the colour of whatever sits behind it, which is why the light and dark lockups are separate files rather than one recoloured asset.

| File | Ratio | Use |
|---|---|---|
| `seoboost-wordmark-light.png` | 3.45:1 | cover hero + back page — orange roundel + soft-white `BOOST`; glows on charcoal |
| `seoboost-wordmark-dark.png` | 3.45:1 | the same lockup in `#231F20` ink, for white/light surfaces |
| `seoboost-mark.png` | 1:1 | the roundel alone — running-header mark (~16px), section-Part dividers (sparse) |
| `seoboost-mark-watermark.png` | 1:1 | cover ghost-mark (the roundel pre-flattened to 12% alpha) |

**Never squash the lockup.** It is 3.45:1, not the near-square mark most templates assume — set the width and let the height follow (`height:auto` in HTML; the paired DXA values in the DOCX skeletons).

**Cover pattern (full-page charcoal, single uniform dark surface):** one full-bleed `ink950` cell (row height EXACT 15840 DXA → fills edge-to-edge, no white sliver). Logo top-left (glows orange-on-charcoal) → orange tick + soft-white title + subtitle + orange doc-type (middle) → metadata grid (soft-white labels `onDarkMuted` / values `onDark`) + "SEO Boost Indonesia · Market Smarter" (bottom). NO ghost-mark, NO white zone. **Footer (pp.2+):** "SEO Boost Indonesia" wordmark (left) · classification (center) · "Hal. X / Y" (right) — NO logo image, NO tagline repeat. **Header:** "SEO Boost Indonesia" TEXT only (left) + doc title (right) — NO rocket mark icon.

---

## Anti-patterns (do NOT)
- ❌ Orange `#FF8800` as body/heading text on white (use `orange700`).
- ❌ Numbered-badge chips / section numbers on H1 bands (number lives in TOC/cross-refs).
- ❌ Zero-padded section numbers ("01"). Use `1`, `1.1`.
- ❌ Orange lead-tick `▍` on H2 (H1 only).
- ❌ Side-stripe callouts (full border + tint + label, or full charcoal).
- ❌ More than 2 dark hero callouts per doc.
- ❌ Charcoal hero callout at the same value as H1 bands (reserve the darker shade for the rare object).
- ❌ Two charcoal blocks stacked adjacent without white between.
- ❌ Charts on charcoal, rainbow chart palettes, 3D/shadow/gradient on data.
- ❌ Metric-card labels in uppercase tracking (use sentence case); metric band with no interpreting prose.
- ❌ "Market Smarter" tagline in every footer (cover/back-page only).
- ❌ Brand orange standing in for a semantic state (success/warning). Orange means *brand*; a state is carried by its own hue **and** its written label.
- ❌ A warning callout placed adjacent to a brand-orange accent — at a glance the reader cannot tell which orange means what.
- ❌ The lockup stretched to a square box (it is 3.45:1) or the roundel recoloured by hand (use the packaged light/dark files).
- ❌ Design-rationale metaphors in document copy.
- ❌ Hardcoded hex outside `helpers.js`; percentage table widths; `\n` in text; emoji in body.
