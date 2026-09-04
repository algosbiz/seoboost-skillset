# DOCX → PDF on macOS (reliable method)

This Mac has **no** LibreOffice/`soffice`, no `pdftoppm`, no PyMuPDF. Available: Microsoft **Word.app**, `docx2pdf`, `qlmanage` (QuickLook), `python3` with `pypdf` + Pillow, and Node.

Deliver the invoice as **both** `.docx` (editable) and `.pdf` (final). Convert with Word driven by AppleScript — not `docx2pdf`.

## The reliable converter

```bash
INV="/abs/path/Invoice_SEOBoost-Client_v1.0"   # no extension

# 1) Close any docs Word already has open, so it can't serve a STALE copy (see gotcha #2)
osascript -e 'tell application "Microsoft Word"
  repeat with d in (every document)
    close d saving no
  end repeat
end tell'

# 2) Open the target read-only and export to PDF by document reference
osascript -e "tell application \"Microsoft Word\"
  set d to open file name (POSIX file \"$INV.docx\" as string) with read only
  save as d file name \"$INV.pdf\" file format format PDF
  close d saving no
end tell"
```

## Verify it actually worked

```bash
# Page count (must usually be 1 — see one-page-and-qa.md)
python3 -c "from pypdf import PdfReader; print('pages:', len(PdfReader('$INV.pdf').pages))"

# Visual QA — render page 1 to PNG, then Read the PNG and eyeball it
qlmanage -t -s 1600 -o qa "$INV.pdf"   # writes qa/<name>.pdf.png
```

## Gotchas (learned the hard way)

1. **`docx2pdf` exports Word's *active/frontmost* document, not your target file**, when Word already has another doc open. Symptom: ~33 KB PDFs showing the wrong document. Don't use `docx2pdf` here — use the AppleScript above.

2. **`open … with read only` returns an ALREADY-OPEN document by name** instead of re-reading from disk. After several convert cycles, Word serves a *stale, pre-edit* copy — the tell-tale sign is a **byte-identical PDF** even though you regenerated the `.docx`. Always run the "close every document" step first (step 1 above).

3. **Word needs warm-up.** The very first AppleScript call in a fresh shell can fail with `-1708 "doesn't understand save as"` while Word is still launching. Just run it again; the second call succeeds. Converting one file at a time is more reliable than batching.

4. **`close d saving no` may throw `-1728`** right after `save as` (the active-doc reference changed). Harmless — the PDF is already written. Verify by checking the file timestamp/size.

5. **`qlmanage` only ever renders page 1.** It is *not* a page-count check — always confirm the count separately with `pypdf`. A document that visually looks complete on the rendered page 1 can still be 2 pages (see one-page-and-qa.md).
