# projectdocs-lint — Linter Kerapian ProjectDocs

Skrip: `automation/projectdocs-lint.mjs` (Node >= 18, tanpa dependensi).

```
node projectdocs-lint.mjs <path-ProjectDocs> [--full]
```

Keluaran per temuan satu baris `[RULE:<id>] <path-relatif>: <pesan>`, ditutup
ringkasan `N error, M warning`. Ada error = exit 1; hanya warning = exit 0.

## Mode

- **Full** — aktif bila `--full` diberikan atau `<path>/agent-documentation/`
  ada. Semua rule berjalan.
- **Workstream** — default bila `agent-documentation/` tidak ada. Tiap subdir
  langsung ProjectDocs dianggap workstream dan wajib `README.md` +
  `PROGRESS.md` (`[RULE:workstream]`); `README.md` di root ProjectDocs bila
  tidak ada = warning. Rule placeholder, versioned-output, dan naming tetap
  berjalan atas seluruh isi.

## Tabel Rule

| Id | Mode | Ketentuan | Level |
|---|---|---|---|
| `skeleton` | full (akar) + semua `agent-documentation` bersarang | **Akar:** punya tepat satu file `.md` per prefix `00`..`09`. **Prefix `07` opsional** karena `seoboost-project-onboarding` menyatakannya lazy, dipakai hanya bila project punya skema data. **Bersarang** (`<workstream>/agent-documentation/`): hanya larangan awalan dobel yang berlaku, tidak ada berkas wajib, sesuai aturan lazy pada konvensi multi-workstream | error |
| `placeholder` | semua | `.md` agent-documentation, `README.md`, `PROGRESS.md` (mode workstream: semua `.md`) bebas dari `TBD`, `TODO:`, `[Project A]`, `lorem`, `xxx`, `<isi`, `<nama`; baris ber-kata `template`/`contoh`/`placeholder` dikecualikan. **Notasi penomoran `D-XXX` dan `DP-XXX` dibuang dari baris sebelum dipindai**, karena X di situ bagian konvensi, bukan isian kosong | error |
| `decision-log` | semua | file `03-*`: id `D-XXX` unik, berurutan tanpa lompat dari yang terkecil; tiap heading `## D-` memuat zona waktu (WIB/WITA/WIT/UTC/GMT) | error |
| `comm-log` | semua | file `06-*`: tanggal heading yang terparse (ISO atau `D MMM YYYY`) menaik; dicek bila >= 2 tanggal terparse | error |
| `versioned-output` | semua | file non-md di dir `output*`/`keluaran*`/`deliverable*` wajib pola `_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.`; di mana pun, nama ber-kata utuh `FINAL`/`REVISI` atau persis `output.<ext>`/`final.<ext>` dilarang | error |
| `freshness` | full | `00-*` memuat baris berlabel tanggal yang terparse. Label yang diterima: `Last updated`, **`Terakhir diperbarui`**, `Terakhir diupdate` (tidak ada = error); tanggal tertinggal > 7 hari dari mtime `.md` terbaru di agent-documentation = warning (mtime tidak andal lintas clone) | error/warning |
| `naming` | semua | nama dir dalam ProjectDocs: spasi = error; di luar lowercase/kebab/angka/titik = warning | error/warning |
| `workstream` | **kedua mode** (sejak 2 Sep 2026) | tiap direktori tingkat atas yang bukan struktural wajib punya `README.md` dan `PROGRESS.md`. Yang dikecualikan sebagai struktural: `agent-documentation`, `plans`, `build`, `scripts`, `assets`, plus nama berawalan `output` atau `arsip`. Sebelumnya rule ini terkurung di mode workstream, sehingga project hibrida (agent-documentation di samping direktori workstream) tidak pernah diperiksa subdirektorinya | error |
| `workstream` (lanjutan) | kedua mode | root ProjectDocs tanpa `README.md` = warning | warning |
| `versi-ganda-permukaan` | semua (sejak 3 Sep 2026) | tiap dokumen dikelompokkan per (direktori, slug, ekstensi); hanya versi tertinggi boleh berdiri di permukaan, sisanya turun ke `arsip/<slug>/`. Isi `arsip/` sendiri dilewati | error |
| `lane-tertukar` | semua (sejak 3 Sep 2026) | berkas berpola versi di dalam direktori bernama persis `out` = terbitan yang nyasar ke lane artefak regenerable. **Bukan** dengan menambahkan `out` ke daftar direktori keluaran: `scripts/out/` memang tidak wajib berversi, yang salah adalah terbitan yang mendarat di sana | error |
| `arsip-akar` | semua (sejak 3 Sep 2026) | berkas yang berdiri langsung di direktori bernama persis `arsip`; akar arsip hanya berisi map (`seoboost-versioned-output` Skenario 7) | error |

## Contoh Pelanggaran dan Perbaikan

| Pelanggaran | Perbaikan |
|---|---|
| `agent-documentation/` tanpa file `05-*` | tambahkan `05-CURRENT-STATE.md` (satu file per prefix 00..09) |
| `Fase 1: TBD` di PROGRESS.md | isi nilai nyata, mis. `Fase 1: selesai 20 Agu 2026` |
| `## D-002 — Jadwal kirim (12 Agu 2026)` tanpa zona waktu | `## D-002 — Jadwal kirim (12 Agu 2026 10:00 WITA)` |
| entri `12 Agu 2026` di 06 muncul setelah `15 Agu 2026` | urutkan chronological ascending (terbaru di bawah) |
| `Laporan_FINAL.pdf`, `output.csv` | `Laporan-Audit_v1.0_2026-08-29.pdf`, `rekap-penjualan_v1.0_2026-08-29.csv` |
| dir `Data Klien/` | ganti jadi `data-klien/` |

## Penjaga Arah Path (sejak 3 Sep 2026)

Bila path yang diberikan bukan bernama `ProjectDocs` tetapi memuat `ProjectDocs/`
di dalamnya, skrip **berhenti dengan exit 2** dan menyebutkan perintah yang benar.

Alasannya terukur, bukan teoretis. Dua kali dalam dua hari linter ini dijalankan
atas path yang salah dan menghasilkan laporan yang terlihat sah padahal memeriksa
hal yang lain. 2 September 2026 sebuah sesi menjalankannya atas
`program-b-2026/assets` lalu menyimpulkan aturan `workstream` tidak menjangkau isi
ProjectDocs, padahal menjangkau; kesimpulan itu hampir diteruskan sebagai usulan
perubahan skill. 3 September 2026 kesalahan yang sama terulang atas
`fixtures-projectdocs/baik`, dan sempat terbaca sebagai fixture yang rusak.

Keluaran yang menyesatkan lebih buruk daripada berhenti.

## Titik Pemakaian

1. **Onboarding — Step verifikasi**: setelah `seoboost-project-onboarding` men-generate
   skeleton, jalankan linter dengan `--full`; skeleton belum boleh dilaporkan
   jadi sebelum 0 error.
2. **Checkpoint — Self-Check Final**: `seoboost-fork-checkpoint` menjalankan linter
   (tanpa `--full` untuk project mode workstream) sebelum checkpoint dinyatakan
   selesai; biayanya beberapa detik.
3. **Sprint close — audit dokumentasi**: `seoboost-sprint-close` melampirkan keluaran
   linter 0 error sebagai bukti konsistensi dokumentasi di laporan sprint.

Path skrip berbeda per mesin: `<repo seoboost-skill-set>/automation/projectdocs-lint.mjs`
(di mesin M4: `~/.claude/seoboost-skill-set/automation/projectdocs-lint.mjs`).

Fixture uji: `automation/fixtures-projectdocs/baik/` (lolos semua rule) dan
`automation/fixtures-projectdocs/buruk/` (melanggar 7 rule).
