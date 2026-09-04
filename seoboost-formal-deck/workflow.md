# SEO Boost Formal Deck — Workflow

Detailed steps from blank request → presentable deck. Always follow this order.

## 1. Plan the deck (1-2 min)

Before writing any code, decide:

1. **How many slides?** Typical SEO Boost deck = 7 slides (cover + 5 content + closing). Pitch decks can run 10-15.
2. **What's each slide's pattern?** Match each slide to a component pattern from `components.md`:
   - Overview/themes → badge grid
   - Findings/insights → insight sidebar + numbered list
   - Roadmap → program-row cards
   - Detailed program → role cards + phase strip
   - Schedule → gantt timeline
3. **What's the page numbering?** Reference deck uses "02/07 … 06/07" — content pages are numbered out of TOTAL pages including cover/closing. Stay consistent.

## 2. Set up the working directory

```bash
mkdir -p /home/claude/my-deck
cp /mnt/skills/user/seoboost-formal-deck/helpers.js /home/claude/my-deck/
cp /mnt/skills/user/seoboost-formal-deck/templates/deck-skeleton.js /home/claude/my-deck/deck.js
cd /home/claude/my-deck
```

**Note:** since `deck.js` is at the same level as `helpers.js` now, change the require line in deck.js from `require('../helpers')` to `require('./helpers')`.

Alternatively, build directly in the skill dir if you only need one deck — but copying gives you isolation.

## 3. Edit the content data

Open `deck.js` and replace the `DECK = { ... }` object with the real content. Keep the same structure — the build code reads from this object.

**Content guidance (always in Bahasa Indonesia by default, unless asked for English):**
- **Title:** 5-9 words, action-oriented
- **Subtitle/tagline:** 1 sentence, ≤20 words
- **Eyebrow:** 2-3 words, ALL CAPS in the source (the helper uppercases anyway)
- **Card body:** 1-2 sentences max
- **Bottom callout:** 1 sentence "key takeaway"

## 4. Build the .pptx

```bash
node deck.js /home/claude/my-deck/MyDeck.pptx
```

The script prints `✓ Deck written to: …` on success. Common errors:
- `Cannot find module './helpers'` → fix the require path
- `slide.addText is not a function` → make sure you called `addSlide(pres)` first (not just declared a slide)
- Text overflowing visible bounds → see step 6 (QA)

## 5. Convert to PDF

```bash
python /mnt/skills/public/pptx/scripts/office/soffice.py --headless --convert-to pdf MyDeck.pptx
```

Produces `MyDeck.pdf` in the same directory. PDF is the stakeholder-distribution format (PPTX is for editing in PowerPoint/Keynote/Google Slides).

## 6. Visual QA (REQUIRED — never skip)

Rasterize each slide and inspect for defects:

```bash
rm -f slide-*.jpg
pdftoppm -jpeg -r 100 MyDeck.pdf slide
ls slide-*.jpg
```

Then `view` each `slide-N.jpg` and check for:

| Defect type | What to look for |
|-------------|-----------------|
| **Text overflow** | Text bleeding outside its rounded card boundary |
| **Title wrapping ugly** | H1 / card title broken at weird places — fix by shortening or reflowing |
| **Empty card slots** | Body text positioned too low, leaving big gap above |
| **Misaligned columns** | Cards in a row not the same height |
| **Page badge wrong** | "07/07" on slide 2 instead of "02/07" |
| **Callout overlapping** | Bottom callout strip too close to last row of cards |
| **Footer position** | Orange divider line should be at y=7.18, footer at y=7.22 |

**Fix loop:** edit `deck.js`, re-run step 4, re-run step 5, re-run step 6. Stop after one fix-and-verify cycle unless a new defect appears.

**Do NOT iterate forever on sub-pixel positioning.** A defect is something a viewer would notice: overflow, overlap, broken layout, missing content. Tiny gaps and exact font weights are not defects.

## 7. Present the files

```bash
# Copy finals to outputs
cp MyDeck.pptx MyDeck.pdf /mnt/user-data/outputs/
```

Then call `present_files` with PPTX first (editable, primary), PDF second:

```
present_files(['/mnt/user-data/outputs/MyDeck.pptx', '/mnt/user-data/outputs/MyDeck.pdf'])
```

## Quick reference — common slide patterns

### Pattern: card grid (2x3)
```js
const slide = addSlide(pres);
addContentScaffold(slide, { pageNum: 2, totalPages: 7, eyebrow, title, subtitle });
const cards = [...]; // 6 items: { num, title, body }
cards.forEach((c, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  addBadgeCard(slide, {
    x: 0.5 + col * 4.18, y: 2.85 + row * 1.8,
    w: 4.05, h: 1.6, ...c,
  });
});
addBottomCallout(slide, { lead: '…', tail: '…' });
```

### Pattern: insight sidebar + numbered list
```js
const slide = addSlide(pres);
addContentScaffold(slide, { pageNum: 3, totalPages: 7, eyebrow, title, subtitle });
addInsightSidebar(slide, { x: 0.5, y: 2.85, w: 2.7, h: 3.5, label, headline, body });
items.forEach((item, i) => {
  addNumberedRow(slide, {
    x: 3.4, y: 2.85 + i * 0.72,
    w: 9.4, h: 0.62, num: i+1, title: item.title, body: item.body,
  });
});
addBottomCallout(slide, { ... });
```

### Pattern: gantt timeline
```js
const slide = addSlide(pres);
addContentScaffold(slide, { pageNum: 6, totalPages: 7, eyebrow, title, subtitle });
const months = [...];
addGanttHeader(slide, { months, x: 3.4, y: 2.7, w: 9.4 });
rows.forEach((r, i) => {
  const rowY = 3.25 + i * 0.49;
  addGanttRow(slide, {
    label: r.label, labelX: 0.5, labelY: rowY, labelW: 2.7,
    rowY, rowH: 0.36,
    gridX: 3.4, gridW: 9.4, totalMonths: months.length,
    startMonth: r.start, endMonth: r.end, color: r.color,
  });
});
```

## Anti-patterns (will hurt the deck)

- ❌ Putting body content above y=2.5" (collides with title block)
- ❌ Putting body content below y=6.5" (collides with bottom callout / footer)
- ❌ Skipping `addContentScaffold` on a content slide (no header/footer = looks broken)
- ❌ Mixing 3+ component types on one slide (visually cluttered)
- ❌ Hardcoding hex colors in your deck.js — always import `COLOR.*` from helpers
- ❌ Skipping the PDF + visual QA step
- ❌ Filenames with spaces or special chars (use `SEO Boost_Deck_ClientName_v1.0.pptx` style)
