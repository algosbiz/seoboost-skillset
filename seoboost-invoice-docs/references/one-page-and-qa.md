# Keeping the invoice on ONE page (+ QA)

A formal invoice should be a single page. The generator's margins/spacing are pre-tuned so that a fairly dense invoice — 2 line items, a multi-line design scope, a donatur allocation row, the bank block, and the signature — fits on one US-Letter page. This file explains how to verify it and what to do when a heavier invoice spills over.

## Always verify the page count

`qlmanage` shows only page 1, so it can't tell you the document is 2 pages. Use `pypdf`:

```bash
python3 -c "from pypdf import PdfReader; print('pages:', len(PdfReader('INVOICE.pdf').pages))"
```

If it says `2`, find out **what** spilled — usually it's just the last line or two:

```bash
python3 -c "
from pypdf import PdfReader
r = PdfReader('INVOICE.pdf')
for i,p in enumerate(r.pages):
    t = p.extract_text() or ''
    print(f'--- PAGE {i+1} ({len(t)} chars) ---'); print(repr(t[-200:]))
"
```

In our build, page 2 contained only the word **"Direktur"** + the footer — a sub-line overflow.

## Two failure modes, two fixes

**1. Sub-line overflow ("visually fits but reports 2 pages").**
`qlmanage` renders the whole invoice on page 1, yet `pypdf` counts 2. The body's last edge sits a hair past the bottom-margin line, spawning a near-empty page 2. Don't slash any one element — shave a little from several. Effective levers, in rough order of leverage:
- **Page margins** (highest leverage): the generator uses `top 500, bottom 460`. Each is already tight; dropping ~40 each buys roughly one line.
- Signature sign-gap (`before: 200` on the underline paragraph).
- Callout cell margins (`top/bottom 90`).
- Item cell margins (`top/bottom 54`).
- Subtitle `after`, terbilang `before/after`, payment heading `before`.

**2. Genuinely too much content** (e.g. 5+ line items, each multi-line). Trimming spacing won't save you. Options, preferred first:
- Tighten verbose item descriptions (fewer wrapped lines).
- Drop the callout if the invoice doesn't need the donatur explanation.
- Only as a last resort, accept 2 pages — but a 2-page invoice usually means the scope belongs in a separate annex.

## Why the footer doesn't cause overflow

The electronic-document disclaimer lives in the **footer band** (`footers.default`), inside the page's bottom margin — not in the body flow. We moved it there precisely because, as a body paragraph, a single disclaimer line was enough to push the document onto a second page. Footer content overlaps the margin area and never competes with the body for height. Keep the disclaimer in the footer; don't reintroduce it as a trailing body paragraph.

## Full QA checklist before delivering

1. `node scripts/generate_invoice.js config.json out.docx` — regenerate.
2. Close open Word docs → convert to PDF (see `docx-to-pdf-macos.md`).
3. `pypdf` page count == 1.
4. `qlmanage -t -s 1600 -o qa out.pdf`, then **Read** the PNG and check:
   - kop logo centered, company name/contact correct;
   - recipient (Kepada Yth.) correct;
   - item rows + amounts right; **Total Tagihan** row has the orange fill;
   - terbilang matches the total tunai (the generator prints it to stdout — cross-check);
   - bank details (BCA / no. rek / a.n.) present;
   - director name filled in above "Direktur";
   - footer + disclaimer visible, nothing clipped.
