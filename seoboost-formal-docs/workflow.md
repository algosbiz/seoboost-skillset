# SEO Boost Formal Docs — Build Workflow

The exact sequence to follow when producing a SEO Boost formal document. Skipping steps causes regressions.

## Prerequisites

- Node.js (any modern version)
- `docx` npm package: `npm install -g docx`
- Python 3 (already in standard environments)
- LibreOffice headless (for PDF conversion) — auto-configured in Claude environments via `/mnt/skills/public/docx/scripts/office/soffice.py`
- `pdftoppm` (for visual QA rasterization) — comes with poppler-utils

## Step 1 — Set up project directory

```bash
mkdir -p /home/claude/<project-name>/{qa}
cd /home/claude/<project-name>
```

## Step 2 — Compose the build script

**File: `build.js`** — single executable that contains:

1. `require('docx')` imports
2. Color & token constants (copied from `design-tokens.md`)
3. Helper functions (copied from `helpers.js`)
4. Document content (cover, TOC, sections, disclaimer)
5. Document config + `Packer.toBuffer().then(...)` save call

For long documents, split into module files (`p1_helpers.js`, `p2_section_*.js`, ...) and concatenate before running:

```bash
cat p1_helpers.js p2_section_a.js p3_section_b.js > build.js
```

## Step 3 — Run the build

```bash
node build.js
# Expected output: ✓ Document generated: <filename>.docx
```

If it errors, the most common causes are:
- Missing import in destructured `require('docx')` block
- Variable name typo (e.g., `Hl` instead of `H1`)
- Forgetting `.flat()` after spreading sections that contain `H1()` (which returns array)

## Step 4 — Validate the DOCX

```bash
python /mnt/skills/public/docx/scripts/office/validate.py <filename>.docx
```

Expected: `All validations PASSED!`

If validation fails:
- **`highlightCs not expected`** → you used `highlight: "..."` on a TextRun. Replace with table-cell shading instead. (This is exactly why H1 returns an array now.)
- **`Element 'X' not expected`** → some XML element is malformed. Unpack the docx (`unzip <file>.docx -d unpacked/`) and inspect the offending tag.
- **`whitespace not preserved`** → the validator usually auto-fixes; rerun with auto-repair.

## Step 5 — Convert to PDF

```bash
python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf <filename>.docx
```

Output: `<filename>.pdf` in the same directory.

## Step 6 — Visual QA via rasterization

```bash
# Render specific pages to JPEG
pdftoppm -jpeg -r 100 <filename>.pdf qa/page -f 1 -l 1   # cover
pdftoppm -jpeg -r 100 <filename>.pdf qa/page -f 4 -l 4   # mid-section
pdftoppm -jpeg -r 100 <filename>.pdf qa/page -f 11 -l 11 # heading example
# ...etc

# Or render all pages at once:
pdftoppm -jpeg -r 100 <filename>.pdf qa/page
```

**Inspection checklist (use the `view` tool on each rendered JPEG):**

- [ ] Cover page — full-bleed charcoal `ink950` hero filling the sheet edge to edge, logo glowing orange top-left, short orange tick, title `onDark`, subtitle `onDarkMuted`, doc-type `orange500` uppercase, metadata grid, "SEO Boost Indonesia · Market Smarter" at the foot. NO white zone, NO ghost-mark, NO running header on the cover
- [ ] Header running text appears at top of every non-cover page
- [ ] Footer page numbers appear at bottom (e.g., "Page 5 of 60")
- [ ] H1 section heading: charcoal `ink850` band + orange `▍` lead-tick + `onDark` title, with the hairline shelf under it. **NO section number on the band**, NO badge chip
- [ ] H2: number `ink600` + title `ink800`, quiet typography — no orange tick. H3 `ink700`. H4 is the only orange heading-text on white (`orange700`)
- [ ] Tables: `ink900` header row with a orange `orange500` bottom-seam, zebra white/`sand50` body, NO inner vertical rules, no overflow
- [ ] Callouts: full border on all 4 sides + tinted background + bold labeled heading (NO left-stripe). The `dark` charcoal hero callout appears **at most twice in the document**
- [ ] Metric cards: charcoal `ink900` tiles, `orange500` value on top, sentence-case `onDarkMuted` label below — never uppercase labels
- [ ] Process flow: uniform charcoal `ink900` stages joined by orange `›` chevrons — not alternating fills
- [ ] Pacing: no two charcoal structural objects sit adjacent — white prose or whitespace separates them
- [ ] Charcoal value-reservation respected: `ink850` for routine H1 bands, `ink900` for tables/cards/flow/dark callout, `ink950` reserved for the cover hero and back page
- [ ] No orphan headings at page bottom (single H without body)
- [ ] No overflowing text in table cells (especially right-most narrow column)
- [ ] Disclaimer at end (last page or last section, italic, centered)

If issues found, fix in `build.js` and rerun from Step 3.

## Step 7 — Move final outputs to user-visible location

```bash
mkdir -p /mnt/user-data/outputs
cp <filename>.docx /mnt/user-data/outputs/
cp <filename>.pdf /mnt/user-data/outputs/
```

## Step 8 — Present to user

Use the `present_files` tool with both files. **Order matters:** DOCX first (editable, primary), PDF second.

```
present_files(filepaths=[
  "/mnt/user-data/outputs/<filename>.docx",
  "/mnt/user-data/outputs/<filename>.pdf"
])
```

Add a brief response confirming page count, asking if any section needs revision (SEO Boost preview-then-revise pattern).

## Iteration pattern

When user requests changes:

1. **Single-section edit** — modify only the relevant section's content in the source `.js`, rerun build, regenerate PDF, do partial QA on changed pages
2. **Style change** — update tokens in `design-tokens.md` and `helpers.js`, rebuild from scratch
3. **Restructure** — discuss the change with user first before rebuilding (especially for long documents)

For SEO Boost specifically: operator prefers preview individual chapters before full document rebuild — confirm scope of change before re-running.

## Common pitfalls (from real builds)

| Symptom | Cause | Fix |
|---------|-------|-----|
| Validation: `highlightCs not expected` | Used `highlight: "darkBlue"` on TextRun | Replace with TableCell shading (see H1 helper) |
| Sections render as `[object Object]` | Forgot `.flat()` after spreading H1 result | Add `.flat()` to children array in main assembly |
| Table cells render with black background | Used `ShadingType.SOLID` | Change to `ShadingType.CLEAR` |
| Tables look broken in Google Docs | Used `WidthType.PERCENTAGE` | Switch all widths to `WidthType.DXA` |
| Empty boxes appear in header/footer | Used a Table for divider line | Replace with Paragraph + bottom border |
| TOC empty when generated by Word | Headings missing `outlineLevel` | Add `outlineLevel: 0` for H1, `1` for H2, etc. in style config |
| `\n` shows as literal text | Tried multi-line in single TextRun | Split into multiple Paragraph elements |
| PDF page breaks inside tables awkwardly | Long table without `tableHeader: true` on first row | Add `tableHeader: true` to header row so it repeats |
