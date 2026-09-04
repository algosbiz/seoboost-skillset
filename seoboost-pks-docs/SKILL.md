---
name: seoboost-pks-docs
description: "Create or update a Perjanjian Kerja Sama (PKS) / cooperation agreement / kontrak kerja sama between PT Algo Sea Biz (SEO Boost) and another company, as a formal multi-page DOCX (and PDF). Triggers: 'buatkan PKS dengan PT ...', 'bikin perjanjian kerja sama untuk klien ...', 'draft kontrak kerja sama SEO Boost', 'PKS konsultasi/pendampingan dengan ...', 'agreement antara SEO Boost dan ...', or any request to formalise a cooperation/consulting deal with a counterparty in a signed document. The 21-Pasal legal boilerplate (Definisi, Ruang Lingkup, Hak & Kewajiban, Kerahasiaan, Kekayaan Intelektual, Pengakhiran, Sengketa, dll.) is LOCKED; you only fill variable fields per counterparty: nomor, signing place/date, PIHAK KEDUA identity + business description, term/jurisdiction/confidentiality periods, and the two signatories. Handles SEO Boost kop surat, A4 layout, Courier New body, and DOCX to PDF on macOS. Do NOT use for invoices (seoboost-invoice-docs), decks (seoboost-formal-deck), or proposals/reports (seoboost-formal-docs)."
license: Proprietary — PT Algo Sea Biz internal use
version: 1.0
---

# SEO Boost PKS Skill

Generate a formal, SEO Boost-branded **Perjanjian Kerja Sama** as a **config-driven** `.docx` (then convert to `.pdf`). The 21 Pasal of legal text are **invariant boilerplate baked into the generator**; you write a small JSON config supplying only the *variable* parts — the counterparty, the numbers, the dates, and a handful of quantitative terms.

Visual sibling of `seoboost-invoice-docs` (billing) and `seoboost-formal-deck` (slides): same brand DNA, specialised for a multi-page signed contract.

## When to use

Any document that **formalises a cooperation/consulting relationship between SEO Boost and another party** in a signed agreement: konsultasi & pendampingan teknologi/bisnis, ongoing partnership, vendor/partner MOU-style PKS, etc. Trigger on "PKS", "perjanjian kerja sama", "kontrak kerja sama", "agreement", or any description of locking in a deal with a counterparty.

**Skip for:** invoices / tagihan (→ `seoboost-invoice-docs`), slide decks (→ `seoboost-formal-deck`), proposals / reports / letters (→ `seoboost-formal-docs`).

## What's locked vs. what you edit

This skill exists so a PKS with a new company takes ~2 minutes and stays legally consistent. Therefore:

- **LOCKED (in `scripts/generate_pks.js`):** the wording of all 21 Pasal, the KONSIDERAN, the definitions, the kop surat, and the layout. You do **not** put clause text in the config. If a counterparty genuinely needs different clauses, that's a deliberate generator edit (and should be reviewed), not a config tweak.
- **YOU EDIT (in the JSON config):** agreement numbers, signing place/day/date, the PIHAK KEDUA block (identity + one-line business description for the KONSIDERAN), the few quantitative terms (jangka waktu, masa kerahasiaan, cure period, payment days, dispute forum), and the two signatories.

PIHAK PERTAMA (SEO Boost) and the agreement-type title default to SEO Boost's standard consulting PKS — **omit them unless they change.**

## Workflow (follow in order)

1. **Read** `design-tokens.md` if you'll touch styling (note: body font is **Courier New** by deliberate house standard, not Arial). Skim `templates/pks-config.json` for the config shape.
2. **Set up deps once** in a working build dir:
   ```bash
   mkdir -p build && cp scripts/generate_pks.js scripts/package.json build/
   cd build && npm install        # installs `docx`
   ```
   (Or reuse a build dir that already has `node_modules/docx`.)
3. **Copy a template** and edit the variable fields (Bahasa Indonesia):
   `cp ../templates/pks-config.json ./config.json` (or `pks-config.minimal.json` for the leanest required set).
4. **Generate:** `node generate_pks.js config.json /abs/out/PKS_SEOBoost-Client_v1.0.docx`
   The script prints the two parties, signatories, both Nomor, and the signing line — **cross-check these** against what the user asked for. It refuses to run if a required field (nomor, penandatanganan, full pihakKedua) is missing.
5. **Convert to PDF** via Word AppleScript — full procedure + warm-up/stale-copy gotchas in `references/docx-to-pdf-macos.md`. Always close open Word docs first.
6. **Visual QA:** confirm page count with `pypdf` (a full PKS is ≈9–11 pages), then split & render page 1, a nested-list page, and the **signature page**, Read each PNG, and check the kop header repeats and the signature block names/jabatan are right.
7. **Deliver both** the `.docx` (editable, for wet-signing) and `.pdf` (final), and report the two parties + both Nomor to the user.

## The config (what you actually edit)

Required: `nomor`, `penandatanganan`, `pihakKedua`. Everything else has a SEO Boost default.

```jsonc
{
  "output": "PKS_SEO Boost-SNR_Konsultasi_Pendampingan_v1.0.docx",  // or pass as 2nd CLI arg

  "nomor": {
    "pertama": "002/PKS/SBI/V/2026",       // SEO Boost's own numbering
    "kedua":   "000/PKS/PT-SNR/V/2026"         // counterparty's numbering (ask them; 000 if unknown)
  },

  "penandatanganan": { "kota": "Badung", "hari": "Senin", "tanggal": "4", "bulan": "Mei", "tahun": "2026" },

  "judul": {                                   // OMIT to keep the default consulting PKS title
    "baris1": "PERJANJIAN KERJA SAMA",
    "baris2": "KONSULTASI DAN PENDAMPINGAN TEKNOLOGI DAN BISNIS"
  },

  "pihakKedua": {                              // ALL fields required
    "nama": "PT Klien C",
    "bentuk": "sebuah perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia",
    "kedudukan": "berkedudukan di Lingkungan Penyarikan, Kelurahan Benoa, Kuta Selatan, Kabupaten Badung, Bali",
    "wakil": "<Nama Wakil>",
    "jabatan": "Direktur Utama",
    "deskripsiUsaha": "merupakan badan usaha yang menjalankan kegiatan usaha distribusi, ... (1 kalimat, masuk ke KONSIDERAN)"
  },

  "ketentuan": {                               // OMIT any field to take the standard default
    "jangkaWaktu": "1 (satu) tahun",
    "masaKerahasiaan": "2 (dua) tahun",
    "wanprestasiCure": "30 (tiga puluh) hari kalender",
    "pembayaranHariKerja": "7 (tujuh) Hari Kerja",
    "kaharNotif": "7 (tujuh) Hari Kerja",
    "musyawarahHari": "30 (tiga puluh) hari kalender",
    "forumSengketa": "Pengadilan Negeri Denpasar",
    "rangkap": "2 (dua) rangkap asli"
  },

  "tandaTangan": {                             // OMIT → defaults to each party's wakil/jabatan above
    "pertama": { "nama": "<Nama Direktur>", "jabatan": "Direktur" },
    "kedua":   { "nama": "<Nama Wakil>", "jabatan": "Direktur Utama" }
  }
}
```

Field notes:
- **`pihakPertama`** (SEO Boost identity) and **`kop`** (letterhead) default to SEO Boost — only set them if SEO Boost's own details change.
- **`deskripsiUsaha`** is appended after "PIHAK KEDUA " in KONSIDERAN point 2, so phrase it to read on naturally (e.g. starts with "merupakan ...").
- **`ketentuan.*`** values are inserted verbatim into the relevant Pasal — write the full phrase including the parenthetical spelling, e.g. `"2 (dua) tahun"`, `"Pengadilan Negeri Denpasar"`.
- **Bulan in `nomor`** conventionally uses Roman numerals (V = Mei). The generator does not compute this — type it.

## House rules

- **Language:** Bahasa Indonesia. **Lapisan bahasa `seoboost-tulis-indonesia` wajib** — skill ini
  mengurus wujud dan klausul, skill itu mengurus ragam dan kejelasan. Ragam yang dipakai
  **akademis/hukum**, bukan konsultan: kalimat pasif dan konektor formal justru benar di sini.
  Konvensi penulisan SEO Boost (`seoboost-formal-docs` → Document language) berlaku dengan **satu
  pengecualian penting**: di badan perjanjian, para pihak disebut dengan sebutan hukumnya
  (PIHAK PERTAMA / PIHAK KEDUA) sesuai definisi di komparisi — aturan "jangan pernah tulis
  klien, sebut namanya" berlaku pada lampiran, tabel lingkup kerja, dan korespondensi, bukan
  pada pasal. Istilah hukum tetap Indonesia dan tidak boleh diganti padanan Inggris:
  wanprestasi, force majeure ditulis apa adanya, ganti rugi, jangka waktu, pengakhiran,
  domisili hukum. Aturan kejelasan tetap penuh berlaku — pasal yang harus dibaca dua kali
  adalah pasal yang akan disengketakan.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam akademis --konvensi
```
- **Body font:** Courier New (house standard for PKS — see `design-tokens.md`). Change only via `BODY_FONT` in the generator, with reason.
- **Filenames:** `PKS_SEO Boost-<Client>_<jenis>_v<major.minor>.docx`. Bump the version on edits; keep prior versions.
- **Numbering:** SEO Boost's own `.../PKS/SBI/<bulan-romawi>/<tahun>`. Increment the leading serial per new PKS; if you don't know the next serial, ask the user rather than guessing.
- **Always deliver `.docx` + `.pdf`**, and verify the signature page renders with the correct two signatories before handing off.
- **Don't invent clauses.** If the user wants terms beyond the variable fields (e.g. a fixed monthly fee, exclusivity, a specific SLA), those belong in a separate Dokumen Pelaksanaan / invoice / addendum that the PKS already references — confirm with the user before editing locked clause text.

## Bundled resources

| File | Read it when |
|------|--------------|
| `scripts/generate_pks.js` | The generator. Copy to a build dir. The 21 Pasal live here; edit only to change locked legal text or layout. |
| `scripts/package.json` | `npm install` here to get `docx`. |
| `assets/logo.png` | SEO Boost logo for the kop surat, bundled so the skill is portable. |
| `templates/pks-config.json` | Worked example (the Klien C / PT Klien C PKS). Copy & edit. |
| `templates/pks-config.minimal.json` | Leanest config — only the required fields, with placeholders. |
| `design-tokens.md` | Fonts (two-font rule), colors, type scale, layout, anti-patterns. |
| `references/docx-to-pdf-macos.md` | Reliable Word-AppleScript DOCX→PDF + warm-up / stale-copy gotchas, adapted for multi-page QA. |
| `sample-output.pdf` | Reference render of the Klien C PKS (what good output looks like). |
