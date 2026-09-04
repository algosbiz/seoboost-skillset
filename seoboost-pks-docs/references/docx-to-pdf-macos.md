# DOCX → PDF on macOS (reliable method)

This Mac has **no** LibreOffice/`soffice`, no `pdftoppm`, no PyMuPDF. Available: Microsoft **Word.app**, `docx2pdf`, `qlmanage` (QuickLook), `python3` with `pypdf` + Pillow, and Node.

Deliver the PKS as **both** `.docx` (editable, for signing/edits) and `.pdf` (final). Convert with Word driven by AppleScript — not `docx2pdf`. A PKS is multi-page (≈9–11 pages); there is **no** one-page constraint — just confirm it opens cleanly and the kop-surat header repeats on every page.

## The reliable converter

```bash
INV="/abs/path/PKS_SEOBoost-Client_v1.0"   # no extension

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
# Page count (a full 21-Pasal PKS is normally 9–11 pages)
python3 -c "from pypdf import PdfReader; print('pages:', len(PdfReader('$INV.pdf').pages))"

# Visual QA — qlmanage only renders page 1, so split the pages you want to
# eyeball (p1 / a nested-list page / the signature page), then Read each PNG.
python3 - "$INV.pdf" <<'PY'
import sys; from pypdf import PdfReader, PdfWriter
r=PdfReader(sys.argv[1])
for i in (0,1,len(r.pages)-1):
    w=PdfWriter(); w.add_page(r.pages[i])
    open(f'qa_p{i+1}.pdf','wb').write(b'') or w.write(open(f'qa_p{i+1}.pdf','wb'))
PY
for f in qa_p*.pdf; do qlmanage -t -s 1500 -o . "$f" >/dev/null 2>&1; done
```

## Gotchas (learned the hard way)

1. **`docx2pdf` exports Word's *active/frontmost* document, not your target file**, when Word already has another doc open. Symptom: ~33 KB PDFs showing the wrong document. Don't use `docx2pdf` here — use the AppleScript above.

2. **`open … with read only` returns an ALREADY-OPEN document by name** instead of re-reading from disk. After several convert cycles, Word serves a *stale, pre-edit* copy — the tell-tale sign is a **byte-identical PDF** even though you regenerated the `.docx`. Always run the "close every document" step first (step 1 above).

3. **Word needs warm-up.** The very first AppleScript call in a fresh shell can fail with `-1708 "doesn't understand save as"` or time out with `-1712 "AppleEvent timed out"` while Word is still launching. Run `open -a "Microsoft Word"; sleep 6` first, then just retry the save-as — the second call succeeds. Converting one file at a time is more reliable than batching.

4. **`close d saving no` may throw `-1728`** right after `save as` (the active-doc reference changed). Harmless — the PDF is already written. Verify by checking the file timestamp/size.

5. **`qlmanage` only ever renders page 1.** It is *not* a page-count check — always confirm the count separately with `pypdf`, and split out the inner pages you want to inspect (signature page especially) as shown above.
