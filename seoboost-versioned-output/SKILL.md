---
name: seoboost-versioned-output
description: Use when generating output files (PDF, CSV, Sheet, Doc) for SEO Boost clients that need traceability and audit trail. Provides hybrid versioning pattern (semver + date) for both file naming and folder structure. Triggers when user says "buat dokumen final", "generate output", "siapkan file untuk klien", "render PDF", "upload ke Drive", or asks about file naming convention.
---

# SEO Boost Versioned Output

## Overview

Pattern penamaan + struktur folder untuk output files yang di-share ke klien — memungkinkan audit trail yang jelas "kapan, kenapa, hasil mana yang berubah" tanpa kehilangan versi lama.

**Core principle:** Audit trail wajib. File lama jangan ditimpa, buat versi baru. Klien sering balik ke "yang kemarin" untuk reference.

## When to Use

**Always pakai versioning untuk:**
- PDF dokumen formal yang di-share ke klien (usulan, laporan, finding)
- CSV/Sheet hasil verifikasi atau analisis
- File ter-share di Google Drive
- Output yang akan di-review klien dan kemungkinan di-revisi

**Skip kalau:**
- Internal working files (drafts, intermediates, JSONL pipeline)
- Files yang memang sering ditimpa (logs, cache)

## File Naming Pattern

### Standard Pattern: `_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.{ext}`

```
<Slug-Descriptive-Name>_v1.0_2026-05-05.pdf
<Slug-Descriptive-Name>_v1.1_2026-05-06.pdf
<Slug-Descriptive-Name>_v2.0_2026-05-08.pdf
```

**Major bump (vN+1.0):**
- Struktur dokumen berubah substantif
- Section baru ditambah/dihapus
- Pivot pendekatan
- Hasil utama berubah signifikan

**Minor bump (v1.N+1):**
- Koreksi teks, istilah, typo
- Refinement layout
- Update redaksional
- Quote update sesuai feedback klien

**Date format:** ISO 8601 `YYYY-MM-DD` (sortable, internationally unambiguous)

**Slug:** kebab-case, descriptive, mention project + content type

✅ Good:
- `Usulan-Pendekatan-Verifikasi-Program B-Program B-2026_v1.1_2026-05-06.pdf`
- `Findings-DryRun-01_v1.0_2026-05-06.md`
- `Hasil-Verifikasi-Per-Entri-Tier-1+2_v1.0_2026-05-07.csv`

❌ Bad:
- `usulan_v1.pdf` (tidak descriptive, tidak ada date)
- `Usulan_2025_mei_06.pdf` (date format tidak ISO, ambiguous)
- `Usulan-Pendekatan-Final-FINAL-FINAL2.pdf` (no versioning)

## Folder Structure for Output

### Scenario 1: Single output type, multiple versions

```
output/
├── Usulan-Pendekatan-Verifikasi-Program B-Program B-2026_v1.0_2026-05-05.pdf
├── Usulan-Pendekatan-Verifikasi-Program B-Program B-2026_v1.1_2026-05-06.pdf
└── Usulan-Pendekatan-Verifikasi-Program B-Program B-2026_LATEST.pdf  # symlink to latest
```

### Scenario 2: Multiple outputs, sub-folder versioning (Drive handoff)

```
drive-handoff/
├── 04 - Hasil Verifikasi (Tier 1+2 Final)/
│   ├── v1 - 7 Mei 19_56 (Bidang strict)/
│   │   ├── Hasil Verifikasi - Per Entri.csv
│   │   ├── Feedback ke Peserta - BELUM LOLOS.csv
│   │   └── Summary.md
│   └── v2 - 8 Mei 09_00 (Bidang lenient)/  # kalau klien decide pivot
│       ├── Hasil Verifikasi - Per Entri.csv
│       └── ...
└── 05 - Findings/
    └── Findings - V4 Bidang Mismatch.md
```

**Notes untuk sub-folder versioning:**
- Format: `v{N} - {DD MMM HH_MM} ({short-context})`
- Underscore `HH_MM` (bukan colon `HH:MM`) karena Google Drive tidak suka colon di nama folder
- Short-context dalam parentheses untuk tahu kenapa versi baru dibuat (mis. "Bidang strict" vs "Bidang lenient")

### Scenario 3: Source vs Released

```
build/
├── source-doc.md            # working copy, edit-in-place
├── style.css
└── build.sh

output/
├── source-doc_v1.0_2026-05-05.pdf  # released artifact, immutable
├── source-doc_v1.1_2026-05-06.pdf
└── source-doc_LATEST.pdf   # symlink
```

**Source file** boleh di-edit terus, **output file** tetap (kecuali bug rendering).

### Scenario 4: Banyak TOPIK berbeda — sub-direktori per-topik (WAJIB saat output flat sudah ramai)

Saat `output/` mulai menampung **beberapa jenis/topik kerjaan berbeda** (mis. contoh dokumen, laporan status, review kontrak), JANGAN biarkan flat — user akan bingung mencari. Pisah jadi **sub-direktori per-topik bernomor**, dengan `README.md` index di root `output/`.

```
output/
├── README.md                       # INDEX — daftar folder + tandai mana yang AKTIF vs DIGANTIKAN
├── 01-contoh-dokumen/              # topik 1: sampel / contoh brand
│   ├── Contoh-<Doc>_v2.1_2026-06-01.{docx,pdf}   ⭐ aktif
│   └── Contoh-<Doc>_v1.0_2026-06-01.{docx,pdf}      referensi lama
├── 02-laporan-status/             # topik 2: laporan status + bundle
│   ├── Laporan-Status-<Proyek>_v1.0_2026-06-15.{docx,pdf}  ⭐
│   ├── Bundle-<Proyek>_2026-06-15.zip                      ⭐ siap-share
│   └── Bundle-<Proyek>_2026-06-15/                         isi bundle
└── 03-review-kontrak/             # topik 3: review/tanggapan kontrak
    ├── Tanggapan-<Kontrak>-v2_v1.0_2026-06-17.{docx,pdf}   ⭐ AKTIF
    └── Catatan-Revisi-<Kontrak>_v1.0_2026-06-16.{docx,pdf} ⚠️ DIGANTIKAN
```

**Aturan Scenario 4:**
- **Trigger:** begitu `output/` punya **≥ 2 topik berbeda** ATAU **> ~6 file flat**, pecah jadi sub-direktori per-topik. (1 topik / sedikit file → tetap flat, Scenario 1.)
- **Nama folder:** `NN-slug-topik` (bernomor 2 digit untuk urutan stabil + kebab-case). Nomor = urutan kronologis/logis, bukan prioritas.
- **README.md index WAJIB** di root `output/`: daftar tiap folder + 1 baris isi + tandai file **AKTIF (⭐)** vs **DIGANTIKAN (⚠️)**. Ini yang bikin user tidak bingung "mana yang terbaru".
- **Versioning tetap di dalam topik** — file naming `_v{X.Y}_{tanggal}` tidak berubah, hanya lokasinya yang dikelompokkan.
- **Audit trail tetap:** versi lama yang sudah digantikan **TIDAK dihapus** — tetap di folder topiknya, ditandai ⚠️ DIGANTIKAN di README (opsional: pindah ke `NN-topik/_arsip/` kalau folder mulai padat).
- **Anti-pattern:** 10+ file beda topik menumpuk flat di `output/`; folder topik tanpa README index; nomor folder yang melompat-lompat tanpa alasan.

### Scenario 5: Dokumen formal project klien — sub-folder PER-TIPE (WAJIB)

Ini spesialisasi Scenario 4 untuk project klien yang menghasilkan **dokumen formal**
(Discovery, BRD, MoM, Proposal, dst — biasanya dari `seoboost-formal-docs`). Begitu ada **≥ 2 jenis dokumen**, JANGAN flat — pisah per-tipe,
mengikuti **alur project** (discovery → BRD → MoM → proposal).

```
output/
├── README.md                  # INDEX — daftar folder + tandai AKTIF (⭐) vs DIGANTIKAN (⚠️)
├── 01-discovery/
│   └── Discovery_<Slug>_v1.0_2026-06-24.{docx,pdf}    ⭐
├── 02-brd/
│   └── BRD_<Slug>_v1.0_2026-06-24.{docx,pdf}          ⭐
├── 03-mom/
│   └── MoM_<Slug>_v1.0_2026-06-24.{docx,pdf}          ⭐
├── 04-proposal/
│   └── Proposal_<Slug>_v1.0_2026-06-29.{docx,pdf}     ⭐
├── 05-correspondence/         # balasan WA/email ke klien (.md/.docx)
│   └── Balasan-WA-<Nama>_v1.0_2026-06-29.md
└── assets/                    # diagram, gambar, file pendukung (BUKAN dokumen utama)
    └── diagram-arsitektur.png
```

**Saat onboarding project baru:**
- `output/` **dirancang per-tipe sejak awal** — jangan diperlakukan sebagai folder flat.
- **Tidak perlu pre-create folder kosong**: folder tipe dibuat saat dokumen pertama digenerate
  (`fs.mkdirSync(OUT, {recursive:true})`). Yang penting agent **tahu struktur target** sejak awal.

**Aturan Scenario 5:**
- **Nomor folder = urutan alur project** (`01-discovery` … `04-proposal`), bukan alfabetis.
  Tambah tipe baru dengan nomor berikutnya.
- **1 dokumen = 1 folder tipe**: `docx` + `pdf`-nya sekamar (jangan dipisah per-format).
- **`assets/`** untuk pendukung (diagram/png/img) — TANPA nomor, bukan dokumen utama.
- **`05-correspondence/`** untuk balasan/draft komunikasi klien yang di-generate.
- **README.md index WAJIB** di root `output/` (lihat Scenario 4).
- **Versioning tidak berubah** — nama file `_v{X.Y}_{tanggal}` tetap, hanya dikelompokkan.

**Build-script rule (PENTING — ini sumber bug "file numpuk flat"):**
Build script formal-docs (`build/build-<doc>.mjs`) **TIDAK BOLEH** menulis langsung ke
`output/` flat. Tiap script tulis ke sub-folder tipe-nya:
```js
// SALAH (bikin flat):
const OUT = path.join(__dirname, '..', 'output');
// BENAR (per-tipe):
const OUT = path.join(__dirname, '..', 'output', '02-brd');   // sesuai dokumen
fs.mkdirSync(OUT, { recursive: true });
```
Begitu ada >1 jenis dokumen, refactor `OUT` per-script ke folder tipe-nya + regen README.

**Trigger (kapan struktur ini WAJIB dipakai):**
- `output/` punya **≥ 2 jenis dokumen** → langsung per-tipe, jangan flat.
- Nemu `output/` yang **sudah flat & ramai (>6 file)** → rapikan ke per-tipe + bikin README index.
  Pindahkan tiap `.docx`+`.pdf` ke folder tipenya, refactor `OUT` di build script, regen PDF dari
  DOCX baru biar sinkron, bersihkan folder `qa/` setelah visual-QA.

Catatan: konvensi ini **dibaca & dipatuhi** (bukan auto-enforced hook). Skill terkait —
`seoboost-project-onboarding` (setup) · `seoboost-formal-docs` (generate).

### Scenario 6: Source code lane (`scripts/`) — pisahkan source dari data & output

Untuk project yang punya **script generator/pipeline** (Python dll, mis. isi poster,
replikasi Sheets, rekap skor), source code TIDAK boleh campur dengan data dan output.
Ini lane terpisah dari `build/` (doc-builder `.mjs`), dibedakan **by peran**:

```
scripts/                          # lane pipeline/data (lazy: hanya kalau ada script)
├── src/                          # KODE — build_form_juri.py, rekap_poster.py, run.py
├── data/                         # INPUT — daftar_juri.json (DI-COMMIT, ini input)
├── out/                          # ARTEFAK generated (GITIGNORED, regenerable)
├── requirements.txt              # pinned deps (saat lolos ambang reuse)
├── README.md                     # what + cara run (saat lolos ambang reuse)
└── .gitignore                    # __pycache__/, *.pyc, .venv/, out/
```

**Beda `scripts/out/` vs `output/`** (kritikal — jangan tertukar):
- `scripts/out/` = **intermediate/artefak regenerable** → GITIGNORED, boleh dihapus & regen.
- `output/` = **deliverable klien** → versioned `_v{X.Y}_{tgl}`, immutable, di-commit, audit trail.

Aturan tulang punggung (dari `seoboost-project-onboarding` § Source Code & Output Lanes):
**script tidak pernah satu folder dengan data yang dibacanya atau file yang dihasilkannya.**
Kalau nemu `.py` di sebelah `.json` di sebelah `.docx` flat → rapikan ke lane ini.

### Trigger cataloguing tool internal (saat stamp output klien)

**Begitu kamu stamp output klien di sini** (`_v{X.Y}_{tgl}` di `output/`), generator yang
memproduksinya sudah *terbukti & selesai*. Itu momen untuk tanya:

> "Generator ini lolos ambang promosi 4-dari-4? Kalau ya → tulis entry di
> `agent-memory/REUSABLE-CATALOG.md` SEKARANG (selagi konteks segar)."

Ambang 4-dari-4 + aturan sanitasi ada di `seoboost-cross-project-reuse`. Ini bukan chore baru
— tinggal menempel pada stamping yang sudah kamu lakukan. Sweep-net kedua: `seoboost-fork-checkpoint`
(project close). Ini yang bikin script rapi **terakumulasi jadi pustaka cross-reference tool
internal** SEO Boost, bukan sekadar rapi di satu project lalu terlupakan.

**Self-check tambahan saat stamp output:** ☐ Generator sudah dicatalog? (y / n-with-reason)

### Scenario 7: `arsip/` per direktori — versi lama turun, permukaan hanya versi tertinggi

Ditetapkan operator 1 Sep 2026. Sasarannya: operator menemukan berkas tanpa bertanya.

**Tiga aturan.**

1. **Hanya versi tertinggi tiap dokumen berdiri di permukaan.** Sisanya turun ke `arsip/`.
   Berkas lama tidak pernah dihapus — nomor versi yang pernah terbit adalah catatan.
2. **`arsip/` menempel pada direktori dokumennya**, bukan satu arsip terpusat di akar.
   Yang mencari versi lama sebuah dokumen mencarinya di tempat dokumen itu berada.
3. **Isi `arsip/` dikelompokkan per dokumen** — `arsip/<slug>/<berkas>`. Arsip yang rata
   menjadi tong begitu isinya lewat dua puluh berkas; satu dokumen KLIEN A sendiri sudah
   meninggalkan 23 versi. Nama berkas sudah memuat versi dan tanggal, jadi urutannya jatuh
   dengan sendirinya di dalam map. Untuk direktori berisi dokumen sekali terbit yang tidak
   berseri, `arsip/YYYY-MM/` lebih masuk akal; pilih satu dan pakai seragam per direktori.

4. **Akar `arsip/` hanya berisi map, tidak ada satu berkas pun berdiri di sana.** Ini menutup
   celah yang lahir dari aturan 3: alat perapian mengelompokkan berkas yang namanya berpola
   versi, dan yang TIDAK berpola dibiarkan di tempatnya — menganggur di akar arsip, selamanya,
   tanpa ada yang menandai. Arsip yang sudah dirapikan pelan-pelan menjadi tong lagi dari pintu
   belakang.

   Berkas yang mendarat di akar arsip selalu berarti salah satu dari dua hal, dan keduanya
   diperbaiki di pangkalnya, bukan dengan memindahkan berkasnya:

   - **Namanya tidak berpola versi** → perbaiki penamaan di pembangun yang menerbitkannya,
     supaya terbitan berikutnya masuk pola.
   - **Ia memang bukan berkas terbitan** — berkas antara, draf, atau berkas sumber yang
     tersesat → tempatnya bukan di arsip sama sekali.

   Alat perapian **melaporkan** berkas semacam itu, tidak memindahkannya diam-diam ke map
   tebakan. Menebak map tujuan sebuah berkas yang tidak dikenali lebih berbahaya daripada
   membiarkannya terlihat.

```
output/05-correspondence/
├── README.md                                  ← satu-satunya berkas yang berdiri sendiri
├── Matriks-GAP_KLIEN-A_KLIEN A/
│   ├── ..._v5.5_2026-08-31.pdf                ← tertinggi tiap ekstensi, di permukaan
│   ├── ..._v5.5_2026-08-31.xlsx
│   └── arsip/
│       ├── ..._v4.4_2026-08-26.pdf            ← terurut menurut nama, yang memuat versi
│       └── ..._v5.4_2026-08-31.pdf
└── Status-Proyek_KLIEN-A_KLIEN A/
    ├── ..._v4.1_2026-08-31.pdf
    └── arsip/
        └── ..._v4.0_2026-08-31.pdf
```

**Berulang dan seragam.** Direktori MANA PUN yang memuat berkas berversi mendapat submap per
dokumen, sehingga susunan bermakna yang sudah ada tetap hidup:
`06-sop/per-stakeholder/Klien A SOP/<Nama-SOP>/` berikut arsipnya sendiri.

**Dua hal yang WAJIB ikut berubah saat bentuk ini dipakai**, dan dua-duanya gagal tanpa suara
bila terlewat:

1. **Pembangun menulis langsung ke direktori dokumennya**, bukan ke akar kategori. Bila tidak,
   berkas baru mendarat di akar, glob pengunggah yang berpola `<kategori>/*/<berkas>` tidak
   menemukannya, dan unggahan berjalan tanpa berkas terbaru tanpa satu pun pesan galat.
   Satu penolong bersama lebih baik daripada dua puluh salinan logika:

   ```js
   export function mapDokumen(jalur) {
     const dir = path.dirname(jalur);
     const nama = path.basename(jalur);
     const m = nama.match(/^(.+?)_v\d+\.\d+_\d{4}-\d{2}-\d{2}/);
     if (!m || path.basename(dir) === m[1]) return jalur;   // idempoten
     const tujuan = path.join(dir, m[1]);
     fs.mkdirSync(tujuan, { recursive: true });
     return path.join(tujuan, nama);
   }
   ```

2. **Glob pengunggah bertambah satu tingkat** `*/`. `Path.glob` tidak melintasi batas
   direktori, jadi `<kategori>/*/<berkas>` berhenti di direktori dokumen dan isi `arsip/`
   tidak pernah ikut terjaring.

**Kunci pengelompokan adalah slug DAN ekstensi.** Satu dokumen dapat terbit dalam beberapa
bentuk pada versi yang sama — Matriks GAP terbit sebagai `.pdf` untuk dibaca dan `.xlsx` untuk
diisi. Menyatukan keduanya di bawah satu kunci membuat yang satu mengarsipkan yang lain.

**Penjaga terbitan WAJIB ikut membaca `arsip/`, dan menyusurinya, bukan menebak bentuk jalur.**
Kejadian nyata 1 Sep 2026: penjaga memeriksa `arsip/<berkas>`; ketika bentuknya berubah menjadi
`arsip/<slug>/<berkas>` sore harinya, pemeriksaan itu diam-diam berhenti menemukan apa pun dan
nomor versi yang sudah terbit menjadi bebas dipakai ulang. Tidak ada yang gagal saat itu terjadi.

```js
const adaDiBawah = (dir, nama) => fs.existsSync(dir)
  && fs.readdirSync(dir, { withFileTypes: true })
    .some((e) => (e.isDirectory() ? adaDiBawah(path.join(dir, e.name), nama) : e.name === nama));
```

**Perapian dijalankan alat permanen ber-`--kering`, bukan skrip sekali pakai.** Perapian versi
terjadi tiap kali dokumen dibangun ulang — beberapa kali sehari pada sesi sibuk. Skrip perapian
yang ditulis ke direktori sementara 1 Sep 2026 hilang saat mesin dimulai ulang, dan versi lama
menumpuk lagi dalam hari yang sama. Tempatnya di repo bersama berkas pembangun.

**Berkas lepas dilaporkan, bukan dipindahkan sendiri.** Menebak map tujuan sebuah berkas lepas
lebih berbahaya daripada membiarkannya terlihat. Di luar `README.md`, tidak ada berkas yang boleh
berdiri sendiri di akar project.

---

## Versi internal dan versi klien: satu sumber, dua keluaran

Dokumen klien sering perlu dua rupa: versi internal berisi margin, asumsi, dan hal yang belum pasti;
dan versi untuk klien yang bersih dari semua itu. Cara biasa adalah membuat satu berkas lalu menghapus
halaman internal sebelum kirim. **Cara itu bergantung pada seseorang mengingat**, dan yang bocor tidak
bisa ditarik kembali.

**Yang dipakai: satu berkas sumber, beberapa jalur build.** Blok internal dibuang **saat render**,
bukan sesudahnya.

```bash
./build.sh klien      # blok internal dibuang saat render
./build.sh internal   # dokumen lengkap
```

Penandanya komentar di sumber, dan jalur klien memotong dari penanda pembuka sampai penanda isi:

```html
<!-- ============ HALAMAN INTERNAL ============ -->
   ... margin, asumsi, angka yang belum pasti ...
<!-- ============ ISI ============ -->
```

**Aturan yang menyertainya:**

1. **Nama berkas internal diberi penanda yang terbaca sekilas**, mis. akhiran `-DRAF-INTERNAL`.
   Nama yang mirip adalah cara berkas salah terkirim.
2. **Sesudah tiap build, buktikan kebersihannya pada berkas terbitan**, jangan mengandalkan ingatan
   bahwa blok itu sudah dibuang:
   ```bash
   pdftotext keluaran-klien.pdf - | grep -ciE "catatan internal|asumsi|margin|usulan SEO Boost"   # harus 0
   ```
3. Pola yang sama dipakai untuk **varian isi**, bukan hanya internal lawan klien. Contoh: satu sumber
   menghasilkan dua proposal yang masing-masing memuat satu paket harga saja, supaya klien membaca
   satu tingkatan per berkas. Nilai yang berbeda per varian dimasukkan lewat token
   (`__UPAKARA__`, `__TOTAL__`) yang diisi saat build, dan angka yang belum ada ditampilkan sebagai
   penanda kuning, bukan dikosongkan diam-diam.
4. Angka yang masih ditunggu **dijadikan parameter build**, bukan disunting manual tiap kali:
   `./build.sh a-klien 4000000` menghitung ulang subtotal, fee, dan total sekaligus. Ini menghapus
   seluruh kelas kesalahan menjumlahkan ulang dengan tangan.

---

## CHANGELOG Convention

Untuk dokumen versioned, maintain `CHANGELOG.md` di project root:

```markdown
# CHANGELOG — <Slug Project>

Format: hybrid versioning `v{MAJOR}.{MINOR}_{YYYY-MM-DD}`.

---

## v1.1 — 2026-05-06

**Build:** `<filename>_v1.1_2026-05-06.pdf`

### Changed
- Sapaan: "Selamat malam Bu" → "Salam Sehat Ibu" (konsistensi)
- Footer PDF tambah info versi

### Internal
- Skema penamaan PDF diubah ke hybrid `_v{ver}_{YYYY-MM-DD}.pdf`

---

## v1.0 — 2026-05-05

**Build:** `<filename>_v1.0_2026-05-05.pdf`

### Added
- Initial release: Usulan pendekatan verifikasi
- 5 pertanyaan klarifikasi untuk klien
- Timeline 5-12 Mei 2026
```

## Build Script Convention

Untuk PDF dari markdown, pakai pandoc + weasyprint dengan build script:

```bash
#!/usr/bin/env bash
# build/build.sh
# Pattern: <Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.pdf

set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:-v1.1}"
BUILD_DATE="${2:-$(date +%Y-%m-%d)}"
SLUG="<Project-Slug>"
SRC="build/source.md"
HTML="build/source.html"
OUT="output/${SLUG}_${VERSION}_${BUILD_DATE}.pdf"
LATEST="output/${SLUG}_LATEST.pdf"

mkdir -p output

pandoc "$SRC" --standalone -o "$HTML"
weasyprint "$HTML" -s build/style.css "$OUT"
ln -sf "$(basename "$OUT")" "$LATEST"

echo "Built: $OUT"
```

Usage: `bash build/build.sh v1.2 2026-05-08`

## Convention Indonesian Naming for Drive

Saat handoff ke Drive client (yang prefer Indonesian):

✅ Good (Indonesian formal, descriptive):
- `Hasil Verifikasi - Per Entri (Tier 1+2).csv`
- `Feedback ke Peserta - BELUM LOLOS.csv`
- `Audit - Entri Bermasalah.csv`
- `Summary - Production Run 7 Mei.md`

❌ Bad:
- `results.csv` (English, no context)
- `output.csv` (vague)
- `final.csv` (no descriptive content)

**Tips:**
- Pakai dash (` - `) untuk separate prefix dari content (mis. "Audit - Entri Duplicate")
- Parenthesis untuk specifier (mis. "(Tier 1+2)", "(BELUM LOLOS)")
- Gunakan title case untuk readability

## Workflow When Generating Output

### Step 1: Determine Version

- Pertama kali generate? → `v1.0`
- Update minor (typo, format)? → bump minor: `v1.0 → v1.1`
- Update major (struktur/content berubah)? → bump major: `v1.1 → v2.0`

### Step 2: Generate File

Pakai build script atau manual generate dengan pattern naming yang benar.

### Step 3: Update CHANGELOG.md

Tambah entry baru di top:
```markdown
## v{N}.{M} — YYYY-MM-DD

**Build:** `<filename>`

### Added / Changed / Removed
- <bullet point>
```

### Step 4: Update Symlink (kalau ada)

```bash
ln -sf "<latest-filename>" "output/<Slug>_LATEST.pdf"
```

### Step 5: Lapor User

- File path generated
- Version bump rationale
- CHANGELOG entry summary

## Anti-Patterns

1. ❌ **Overwrite file lama** — kalau klien mau review history, lost forever
2. ❌ **Versioning dengan suffix `final`, `revisi`, `revisi2`** — pakai semver formal
3. ❌ **Date format ambiguous** (`5/6/2026`) — pakai ISO `YYYY-MM-DD`
4. ❌ **Skip CHANGELOG** untuk minor changes — hilang context kenapa version naik
5. ❌ **Mix English + Indonesian random** di file naming — pilih konsisten per audience
6. ❌ **Colon `:` di nama folder** — incompatible dengan Google Drive
7. ❌ **Symbolic link tanpa target relative** — ln -sf butuh path relative ke parent dir

## Self-Check Before Handoff

- ☐ File name follow pattern `<Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.{ext}`?
- ☐ Date di filename = build date (kapan dibuat)?
- ☐ CHANGELOG updated dengan entry baru?
- ☐ Symlink `_LATEST` updated kalau ada?
- ☐ Folder structure follow scenario yang sesuai (single-type vs multi-type)?
- ☐ File lama tidak ditimpa (dipertahankan untuk audit)?

## Trigger Phrases yang Match Skill Ini

- "buat dokumen final"
- "generate PDF untuk klien"
- "siapkan output file"
- "render markdown ke PDF"
- "upload ke Drive"
- "handoff file ke klien"
- "naming convention untuk file ini"
- "version bump"

## Related Skills

- `seoboost-project-onboarding` — folder structure setup di awal project (+ source-code lane `scripts/`)
- `seoboost-fork-checkpoint` — pre-fork harus include semua output ter-version
- `seoboost-cross-project-reuse` — saat stamp output, cek generator lolos ambang → catalog jadi tool internal
