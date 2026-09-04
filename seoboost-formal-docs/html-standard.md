# SEO Boost Corporate — HTML Document Standard

Third output lane for this skill, alongside DOCX and PDF.

The visual system is **identical** to the DOCX lane — same tokens, same components, same committed
identity. Only the medium differs. A reader must not be able to tell which lane a document came from.

---

## When HTML is the right lane

| Situation | Lane |
|---|---|
| Recipient will **edit** the document (fills sections, redlines, tracked changes) | **DOCX** |
| Formal submission, signature, archival, print-first distribution | **DOCX + PDF** |
| Recipient will **read** it — shared via WhatsApp/email link, opened on a phone | **HTML** (+ PDF if they may print) |
| Dense with tables and status labels that must stay legible on a small screen | **HTML** |
| Internal working document revised often | **HTML** — one file, no rebuild step |

Indonesian clients read on phones far more than they print. When a document is meant to be *read*
rather than *filled in*, HTML lands better than a DOCX attachment nobody opens on mobile.

**HTML does not replace DOCX.** If the recipient needs to write into the document, DOCX is still the
answer. When in doubt: HTML for reading, PDF for the record.

---

## The rules

Rules 1–3 are the skill's committed identity and apply to every lane. Rule 4 is HTML-specific.

1. **`orange500 #FF8800` is MARK / ACCENT / DARK-SURFACE only.** It fails contrast as text on white
   (1.41:1). Readable orange text on white = `orange700 #A85500`, and only as the `.h-accent` micro-label.
   In HTML the tempting violation is a orange link colour or a orange `<strong>` — do not. Links are
   `orange700`; bold body text is `ink850`.

2. **Every structural anchor is a charcoal tile with orange glowing inside it.** Cover hero, section
   band, table header, metric tiles, process-flow stages, the rare dark callout, the back page. The
   white body is the paper; charcoal is the brand returning to the surface.

3. **No side-stripe borders. No numbered-badge chips.** Callouts carry a full border on all sides
   plus a tint plus a labeled heading. Section headers are a charcoal band + orange `▍` lead-tick +
   title, with **no section number on the band** — numbers live in `h3` and cross-references.
   In HTML the tempting violation is `border-left: 4px solid` on a blockquote. That is the banned
   pattern wearing a different hat.

4. **Self-contained: one file, always.** No external stylesheet, font, script, or image. Images are
   base64 data URIs. The document must render correctly as a lone attachment on a phone with no
   network. A formal document that depends on a CDN is not a formal document.

---

## What the HTML lane cannot do

Be honest about this rather than faking it:

- **No running header/footer with page numbers.** Chrome's print engine does not support CSS margin
  boxes, so "Hal. X / Y" on every page is a DOCX-lane feature. The HTML lane carries a single `.foot`
  block at the end instead. If per-page numbering is a hard requirement, use DOCX.
- **No automatic table of contents.** Write one by hand, or use DOCX.

---

## Build workflow

1. Copy `templates/html-shell.html` to the target path.
2. **Drop the shell's authoring comment** — everything above `<html>`. It is a note to you, not part
   of the deliverable:
   ```js
   h = '<!DOCTYPE html>\n' + h.slice(h.indexOf('<html'));
   ```
3. Replace the `__PLACEHOLDER__` tokens (title, subtitle, doctype, version, date, prepared-for,
   owner, classification).
4. Write content between the CONTENT START and CONTENT END markers using the component classes the
   shell defines. Do not invent new classes without adding them here.
   **Locate the markers with `lastIndexOf`, never a regex** — see the traps below.
5. Decide on the back page: keep it and fill `__QUOTE__` / `__QUOTE_ATTR__`, or delete the whole
   `<section class="back">` as a unit. Leaving the placeholders unfilled trips the placeholder gate
   — deliberately, so an example quote can never reach a client.
6. Inline the mark:
   ```bash
   sips -Z 560 assets/seoboost-wordmark-light.png --out /tmp/sblogo.png   # __LOGOMARK__
   base64 -i /tmp/sblogo.png | tr -d '\n' > /tmp/sblogo.b64
   ```
   `seoboost-wordmark-light.png` is the charcoal-surface mark; it appears on the cover hero and the back page,
   both dark surfaces. Downscaled it costs about 40KB, which is fine for a self-contained document.
7. **Render the PDF companion:**
   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
     --no-pdf-header-footer --print-to-pdf="<out>.pdf" "file://<abs>/<out>.html"
   ```
   `--no-pdf-header-footer` matters: without it Chrome stamps its own URL and date over the design.
8. **Visual QA, both media.** Screen: open the file and check the cover hero, a section band, a
   table, a callout, and the back page. Print: `pdftoppm -jpeg -r 70 <out>.pdf qa/p` and inspect the
   cover, one dense page, and the last page. Confirm no page break lands inside a callout or table
   row. **Confirm page 1 is the cover** — the traps below remove it silently.
9. Version and file per `seoboost-versioned-output`: `<Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.html` in the
   per-type sub-folder (`output/01-discovery/`, `02-brd/`, and so on).

### The two traps in this shell

Both shipped as real bugs in the sibling skill. The shell now avoids them, but any hand-rolled
assembly can reintroduce them, so verify rather than assume.

**Trap 1 — HTML comments do not nest.** If the authoring comment at the top contains a complete
comment marker, its closing sequence ends the block early and the rest of the note renders as visible
text above the cover, base64 fragments and all. Never write the CONTENT markers as complete comments
inside that header block, and drop the header block entirely when you build (step 2).

**Trap 2 — a non-greedy regex matches the wrong marker.** A pattern spanning CONTENT START to
CONTENT END matches the *mention* in the header comment, not the real marker in the body. The result
is body content injected inside a comment and **no cover at all** in the output. Use `lastIndexOf`
and assert the index sits after `<body`.

### Trap 3 — inline emphasis vanishing on charcoal surfaces

The global `strong{color:var(--ink850)}` rule is more specific than the parent's colour
declaration. So `.note--dark p{color:var(--onDark)}` colours the paragraph white, and then
every `<strong>` inside it reverts to charcoal — on a charcoal background. The words are
present in the PDF text layer, selectable, greppable, and **invisible to the reader**.

The same applies to `<em>`, inline `<code>`, and to every other dark surface: `.cover`,
`.back`, `.metric`, `.flow__s`, and `thead th`.

This shipped in a real client brief and was caught only at per-page visual QA. Text-layer
gates cannot catch it: `pdftotext` returns the words happily. The shell now carries the
override rule immediately below the global one; keep the pair together.

```css
.cover strong,.cover em,.back strong,.back em,
.note--dark strong,.note--dark em,
.metric strong,.flow__s strong,thead th strong{color:#fff}
```

**Rule of thumb:** any time you add a new charcoal surface, add its `strong`/`em` selector
to that list in the same edit. A dark surface without a matching emphasis override is a
defect waiting for a document that happens to bold a word inside it.

---

### Verification gates worth wiring into every build

Fail the build loudly; a silently wrong document looks fine until the client opens it.

```js
const gate = (bad, msg) => { if (bad) throw new Error('FAIL: ' + msg); };
gate(/__[A-Z_]+__/.test(h),                            'placeholder left unreplaced');
gate(!/^<!DOCTYPE html>\s*<html/.test(h),              'stray content between DOCTYPE and <html>');
gate(h.includes('Committed identity'),                  'shell authoring note leaked into the document');
gate(h.includes('Judul bagian'),                        'shell demo content still present');
gate(h.indexOf('class="cover"') > h.indexOf('</h2>'),   'cover is not first');
gate(!/\.note--dark strong/.test(h),                    'dark-surface emphasis override missing (Trap 3)');
```

### Visual QA is not optional, and it is not the same as the gates

The gates above read the HTML source and the PDF text layer. **Neither can see a rendered
page.** Trap 1 (comment leak), Trap 2 (regex marker), and Trap 3 (invisible emphasis) all
produce files that pass every text check and still reach the client broken.

Rasterise and look at **every** page, not a sample:

```bash
pdftoppm -jpeg -r 72 OUT.pdf qa/p    # then open and read each qa/p-*.jpg
```

What to look for on each page: the cover is page 1 and reaches every paper edge; no text
sits on top of the footer; no charcoal block is empty where words should be; tables that
split across pages repeat their header row; nothing is clipped at a page boundary.

Re-run this after **every** content edit, not only the first build. Content shifts, and a
page that was clean before an edit can overflow after it. Delete `qa/` when done.

---

## Component catalog

Every class below exists in the shell. Use these; do not hand-roll.

| Component | Class | Notes |
|---|---|---|
| Page container | `.sheet` | max-width 58rem, white on `sand100`, shadow drops in print |
| Cover hero | `.cover` + `.cover__mark` `.cover__rule` `.cover__title` `.cover__sub` `.cover__type` `.cover__foot` | Full-bleed `ink950`. Mark required. Tagline "Market Smarter" belongs here and on the back page only — never in the running footer |
| Cover metadata | `.meta` `.meta__k` `.meta__v` | Auto-fit grid on charcoal; labels `onDarkMuted`, values `onDark` |
| Section header | `.sec` + `.sec__band` `.sec__tick` `.sec__h` `.sec__shelf` | Charcoal band + orange `▍` + title, then the hairline shelf it casts. **No number on the band** |
| Sub-heading | `h3` with `<span class="n">1.1</span>` | Number in `ink600`, title in `ink800`. No orange tick |
| Orange micro-label | `.h-accent` | The only orange heading-text permitted on white (`orange700`) |
| Status chip | `.chip` + `--ok` `--warn` `--risk` `--info` `--mute` | Border + tint + readable text colour |
| Metric cards | `.metrics` `.metric` `.metric__n` `.metric__l` | Charcoal tiles, `orange500` value, sentence-case label. Max 4 across; always accompany with interpreting prose |
| Process flow | `.flow` `.flow__s` `.flow__k` `.flow__t` `.flow__c` | Charcoal stages + orange `›` connectors. Chevrons hide below 34rem |
| Table | `.tw` wrapper + `<table>` | **Always** wrap in `.tw` so wide tables scroll instead of breaking the page. Charcoal header + orange bottom-seam + zebra, no inner vertical rules |
| Table caption | `.tcap` | Italic, `ink500`, tight under the table |
| Callout | `.note` + `--note` `--ok` `--warn` `--risk` `--info` `--dark`, with `.note__l` label | Full border all sides. Never a left stripe. **`--dark` is limited to 2 per document** |
| Figure caption | `.cap` | Centered, italic, `ink500` |
| Lede paragraph | `.lede` | Slightly larger opener under a section header |
| Footer | `.foot` | Title, version, date, classification, entity. Wordmark text only — no logo image, no tagline |
| Back page | `.back` + `.back__tick` `.back__attr` `.back__foot` `.back__mark` `.back__r` | Optional closing-quote page. See below |

### Charcoal value-reservation

Not all charcoal is equal, and the hierarchy is deliberate:

- `ink850` — routine charcoal: the section band. Appears many times per document.
- `ink900` — reserved: table headers, metric tiles, flow stages, the dark callout.
- `ink950` — rarest: the cover hero and the back page. The two bookends.

**Never stack two charcoal structural objects adjacent.** White prose or whitespace must separate
them, or the page reads as a slab. A section band immediately followed by metric tiles is the most
common way this goes wrong.

### Back page (`.back`)

A charcoal page carrying one quote that states what the document argues, then the SEO Boost mark and
attribution. Optional — keep it when a document deserves a closing statement, delete the section as
a unit otherwise.

- **Always last, after `</footer>`.** It is the final page, not a content section.
- **A sanctioned place for large bright `orange500`** — the tick sits on a dark surface. Body text on
  it is `onDark`, secondary text `onDarkMuted`.
- **Quote an honest position.** Either a real sourced quotation, or a sentence the document itself
  argues, attributed as such. Never fabricate a quotation and put a person's name under it.
- In print it takes `page: bleed` (a named `@page` with no margin) plus `break-before: page` and
  `min-height: 11in`, so the charcoal reaches every paper edge. The cover hero uses the same trick.
  Never set `margin: 0` on the default `@page` to achieve this — the flowing body would then run to
  the paper edge on every page.

---

## Responsive and print requirements

- **Body must never scroll horizontally.** Wide content lives inside `.tw`, which scrolls in its own
  box. This is the single most common way an otherwise good document breaks on a phone.
- **`color-scheme: light only`.** A formal document commits to one look. Half-working dark mode on a
  document that will be printed is worse than no dark mode.
- **Page size is Letter**, matching the DOCX lane (`@page{size:Letter;margin:1in .9in .9in}`).
- **Nothing breaks mid-component in print:** `.note`, `.tw`, `.metric`, `.metrics`, `.flow`, `.back`
  carry `break-inside: avoid`; `thead` repeats via `display: table-header-group`; headings use
  `break-after: avoid`; the cover hero and `.back` both use `page: bleed` so they fill the sheet edge to edge.
- **Links lose their underline and turn charcoal in print** — a coloured underlined link on paper is
  a dead pixel.

---

## Anti-patterns

- **External anything.** A `<link>` to Google Fonts, a CDN script, an `<img src="./logo.png">`.
- **`border-left` accents** on blockquotes, callouts, or cards. The banned side-stripe.
- **A section number on the charcoal band**, or a coloured pill containing it. Plain band + tick + title.
- **Bright orange as text on white, or as a large fill behind body text.** The single tell that
  separates an on-brand document from a generic AI-tech-doc.
- **More than two `--dark` callouts.** Scarcity is what makes the dark surface read as premium.
- **Two charcoal blocks touching** with no white between them.
- **Writing the CONTENT markers as complete HTML comments in the shell's header note.** See Trap 1.
- **Matching the CONTENT markers with a regex.** See Trap 2.
- **A fabricated quotation on the back page** attributed to a person or organisation.
- **A table not wrapped in `.tw`.** Works on your desktop, breaks on every phone.
- **Adding a charcoal surface without adding its `strong`/`em` override.** See Trap 3. The
  words survive in the text layer and disappear on the page.
- **Declaring a document finished on the strength of text-layer checks alone.** Page count
  matching the plan proves nothing; `pdftotext` finding the words proves nothing. Look at
  the rendered pages.
- **Emoji.** House convention across all SEO Boost client-facing documents. Status is carried by chips.
- **Inventing new colours.** Every hex comes from `design-tokens.md`.

---

## Relationship to the other lanes

`design-tokens.md` remains the single source of truth for colour, type, and spacing. This document
governs how those tokens are expressed in HTML; `components.md` governs the DOCX expression. When a
token changes, all three change together.

The shell inlines its CSS deliberately — there is no separate stylesheet to drift out of sync.
`templates/html-shell.html` is the canonical copy; edit it there and the next document picks it up.

If a second shell is ever added for another medium, keep it structurally parallel to this one so a
fix in either is easy to port across.
