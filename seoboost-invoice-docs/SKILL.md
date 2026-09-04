---
name: seoboost-invoice-docs
description: "Use this skill whenever creating, building, or updating an invoice / faktur / tagihan / bill from PT Algo Sea Biz (SEO Boost) to a client — produced as a polished single-page DOCX (and PDF). Triggers include: 'buatkan invoice/faktur/tagihan ke ...', 'bikin tagihan untuk klien ...', 'invoice jasa pendampingan/design/development', 'bill the client for ...', 'surat tagihan SEO Boost', or any SEO Boost billing document — even when the user doesn't say the word 'invoice' but clearly wants to charge a client. Handles SEO Boost brand styling (charcoal #2E2B27 + bright orange #FF8800, Arial, centered kop surat), automatic money math, donatur/sponsorship (dana donatur) allocation where part of the fee is converted to a contribution, terbilang (rupiah-in-words), bank transfer details, director signature, and reliable DOCX→PDF conversion on macOS that is guaranteed to fit on one page. Do NOT use for slide decks (use seoboost-formal-deck) or general Word reports/proposals (use seoboost-formal-docs)."
license: Proprietary — PT Algo Sea Biz internal use
version: 1.0
---

# SEO Boost Invoice Skill

Generate formal, SEO Boost-branded invoices as a **config-driven** `.docx` (then convert to `.pdf`). You write a small JSON config describing the *variable* parts; the generator owns the *invariant* parts — branding, layout, money math, terbilang, and the tuning that keeps it on one page.

Visual sibling of `seoboost-formal-docs` (Word reports) and `seoboost-formal-deck` (slides): same brand DNA, specialised for billing.

## When to use

Any document that **charges a client money on SEO Boost's behalf**: jasa pendampingan/konsultasi, design grafis, software development, maintenance, sponsorship documentation, etc. Trigger even when the user says "tagihan", "faktur", "bill", or just describes amounts to charge — not only the literal word "invoice".

**Skip for:** slide decks (→ `seoboost-formal-deck`), proposals / reports / letters (→ `seoboost-formal-docs`), or non-SEO Boost (white-label) billing.

## Workflow (follow in order)

1. **Read** `design-tokens.md` (brand rules) if you'll touch styling. Skim `templates/invoice-config.json` for the config shape.
2. **Set up deps once** in a working build dir:
   ```bash
   mkdir -p build && cp scripts/generate_invoice.js scripts/package.json build/
   cd build && npm install        # installs `docx`
   ```
   (Or reuse an existing build dir that already has `node_modules/docx`.)
3. **Copy a template** to a config and edit the content (Bahasa Indonesia by default):
   `cp ../templates/invoice-config.json ./config.json` (use `invoice-config.minimal.json` for a simple one-item invoice with no allocation).
4. **Generate:** `node generate_invoice.js config.json /abs/out/Invoice_SEOBoost-Client_v1.0.docx`
   The script prints the computed subtotal, total tunai, and terbilang — **cross-check these** against what the user asked for.
5. **Convert to PDF** via Word AppleScript and **verify 1 page** — full procedure in `references/docx-to-pdf-macos.md`. Always close open Word docs first (avoids stale-copy bug).
6. **Visual QA:** `qlmanage -t -s 1600 -o qa out.pdf`, then Read the PNG and run the checklist in `references/one-page-and-qa.md`.
7. **Deliver both** the `.docx` (editable) and `.pdf` (final), and report the total + terbilang to the user.

## The config (what you actually edit)

`recipient`, `invoiceNo`, `date`, `dueDate`, `subtitle`, `items`, and `director` are the fields you change per invoice. `issuer`, `bank`, and `logo` default to SEO Boost — **omit them unless they change**.

```jsonc
{
  "output": "Invoice_SEOBoost-Client_v1.0.docx",   // or pass as 2nd CLI arg
  "invoiceNo": "INV/SEO Boost-XXX/06/2026",
  "date": "01 Juni 2026",
  "dueDate": "15 Juni 2026",
  "subtitle": "Jasa ... — Project",            // italic tagline under "INVOICE"
  "recipient": { "name": "PT. Klien", "attn": "u.p. Bagian Keuangan", "line3": "di Tempat" },
  "items": [
    { "desc": ["Judul item (baris 1, bold)", "Keterangan baris 2", "..."], "qty": "1 paket", "amount": 1500000 }
  ],
  "allocation": {                              // OPTIONAL — only for dana donatur / sponsorship
    "label": "Alokasi Dana Donatur Sponsorship (Nama Event)",
    "amount": 1700000,
    "totalLabel": "Total Tagihan Tunai"
  },
  "callout": { "title": "...", "color": "brand", "lines": [ "plain string", [ {"text":"emphasis ","bold":true,"color":"2E2B27"} ] ] },
  "director": "<Nama Direktur>"
}
```

Full schema notes:
- **`items[].desc`** is an array of lines; line 1 renders bold (the item title), the rest are detail/scope. `amount` is a plain integer (rupiah) — no formatting.
- **`items[].qty`** defaults to `"1 paket"`.
- **`callout.lines`** entries are either a plain string, or an array of run-specs `{text, bold, italics, color}` for inline emphasis (hex without `#`; use `2E2B27` charcoal for emphasis, never the bright orange as text).
- **`director`** omitted → a blank signature line `(______)` is drawn instead.

### Money math — let the generator do it

**Never hand-type Subtotal, Total, or Terbilang.** `generate_invoice.js` computes them from `items[].amount`:
- `subtotal` = sum of item amounts.
- **No `allocation`** → rows are `Subtotal` + **`Total Tagihan`** (orange-fill), terbilang of the subtotal.
- **With `allocation`** → rows are `Subtotal`, the allocation as a contra amount `(Rp …)`, and **`Total Tagihan Tunai`** = subtotal − allocation (orange-fill), terbilang of the *cash* total.

The **donatur/sponsorship** pattern: the full fee has real value (shown as item amounts and Subtotal), but part of it is converted into a sponsorship contribution rather than billed in cash — so net cash due drops accordingly. This mirrors the real Klien C invoice (Subtotal Rp 3.200.000 − donatur Rp 1.700.000 = Rp 1.500.000 tunai). See `templates/invoice-config.json` for the worked example.

## Splitting vs. combining

- **One combined invoice** (default): all line items in a single document with one Subtotal/Total. Preferred unless the user asks otherwise.
- **Separate invoices**: generate once per config (e.g. one for pendampingan, one for design). Give each its own `invoiceNo` and `output`.

## Bundled resources

| File | Read it when |
|------|--------------|
| `scripts/generate_invoice.js` | The generator. Copy to a build dir; edit only to change layout/brand. |
| `scripts/package.json` | `npm install` here to get `docx`. |
| `assets/logo.png` | SEO Boost logo, bundled so the skill is portable. Used by default; override via `config.logo`. |
| `templates/invoice-config.json` | Worked example (Klien C combined + donatur allocation). Copy & edit. |
| `templates/invoice-config.minimal.json` | Simplest one-item invoice, no allocation. |
| `design-tokens.md` | Colors, type scale, spacing, component + anti-pattern rules. |
| `references/docx-to-pdf-macos.md` | Reliable Word-AppleScript conversion + the stale-copy / warm-up gotchas. |
| `references/one-page-and-qa.md` | Verify page count, fix overflow, full visual-QA checklist. |

## House rules

- **Currency:** rupiah, `Rp 1.500.000` formatting (the generator handles it via `toLocaleString('id-ID')`).
- **Language:** Bahasa Indonesia by default. Konvensi penulisan SEO Boost berlaku (lihat
  `seoboost-formal-docs` → Document language): jangan terjemahkan istilah yang lazim Inggris,
  jangan pernah tulis "klien" — sebut nama pihaknya, tidak ada kalimat kosmetik.
  **Lapisan bahasa `seoboost-tulis-indonesia` wajib** untuk uraian pekerjaan dan catatan: skill ini
  mengurus wujud invoice, skill itu mengurus ragam dan kejelasan. Kekeliruan paling sering di
  invoice adalah uraian item yang berhenti di tengah jalan — "Pengembangan module reporting"
  alih-alih "Pengembangan modul pelaporan" — atau sebaliknya, istilah yang memang dipakai
  pihak itu sehari-hari dipaksa jadi Indonesia. Istilah hukum dan pajak tetap Indonesia:
  faktur, PPN, termin, retensi, denda keterlambatan.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```
- **Filenames:** `Invoice_SEO Boost-<Client>_v<major.minor>.docx`. Bump the version on edits; keep prior versions.
- **Invoice numbering:** `INV/SEO Boost-<CLIENT>/<NNN>/<MM>/<YYYY>` where `<CLIENT>` is a short client code (e.g. `KLC` = Koperasi Klien C) and `<NNN>` is a zero-padded **monthly running serial SHARED across ALL clients** — it counts every SEO Boost invoice issued that month and **resets each month**. It is NOT per-client, so you cannot derive it from this client's history alone. Before assigning a number, **ask the user (or check SEO Boost's invoice register / `references/client-invoice-ledger.md`) for the next free serial in that month**; after issuing, **append the entry to the ledger**.
- **Bank default:** set it in `config.bank` — there is no default account in this skill — override via `bank` only if it changes.
- **Always deliver `.docx` + `.pdf`**, and always confirm the page count is 1 before handing off.
