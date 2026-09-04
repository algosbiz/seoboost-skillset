---
name: seoboost-feasibility-study
description: >-
  Gunakan skill ini setiap kali SEO Boost membangun, menyusun, atau melengkapi
  sebuah Studi Kelayakan / Feasibility Study (FS) / uji kelayakan untuk proyek klien.
  Trigger: "buatkan FS untuk proyek ...", "studi kelayakan ...", "uji kelayakan ...",
  "apakah proyek X layak?", "feasibility study bandara/pasar/wisata/gedung/pabrik ...",
  atau mengubah proposal / concept note / TOR menjadi FS. Skill memegang STANDAR isi FS
  (aspek teknis, pasar/permintaan, finansial, ekonomi, hukum & perizinan, lingkungan,
  sosial-budaya, kelembagaan, risiko) plus CHECKLIST khas Bali (desa adat/awig-awig,
  tata ruang RTRW/KKPR, perizinan PBG/AMDAL, Tri Hita Karana, subak, kawasan suci) —
  dan WAJIB menanyakan data yang belum lengkap sebelum FS disusun (tidak boleh mengarang
  angka). Output UTAMA = dokumen FS (di-render via seoboost-formal-docs); deck ringkasan
  menyusul (via seoboost-formal-deck). JANGAN pakai untuk deck biasa atau dokumen non-FS.
license: Proprietary — PT Algo Sea Biz internal use
version: 0.1
---

# SEO Boost Feasibility Study (Studi Kelayakan) Builder

Skill untuk **membangun dokumen Feasibility Study (FS) / studi kelayakan** yang layak dijadikan
dasar keputusan investasi — dengan standar isi yang konsisten dan lengkap. FS adalah instrumen
pengambilan keputusan: ia menjawab satu pertanyaan besar — **"apakah proyek ini layak dijalankan,
dan dengan syarat apa?"** — dari berbagai sudut (teknis, pasar, finansial, hukum, lingkungan,
sosial, kelembagaan, ekonomi, risiko).

> **Dokumen FS adalah artefak utama.** Deck presentasi hanya turunan: setelah FS selesai dan solid,
> barulah dibuatkan deck ringkasannya. Jangan membalik urutan — pikirkan dan lengkapi FS-nya dulu.

## Prinsip inti (baca sebelum mulai)

0. **Lapisan bahasa `seoboost-tulis-indonesia` wajib.** FS dibaca pengambil keputusan, pemberi izin,
   dan kadang pemberi dana — ragamnya **konsultan** (rekomendasi di depan, angka menyertai klaim,
   ketidakpastian dinyatakan terbuka). Empat aturan kejelasan skill itu menentukan mutu vonis FS:
   setiap perbandingan harus punya pembanding, setiap keterangan waktu harus bertanggal, setiap
   kalimat pasif harus jelas pelakunya, dan setiap "hal tersebut" harus jelas acuannya. Istilah
   perizinan dan adat tetap Indonesia dan tidak boleh dicarikan padanan Inggris: awig-awig, krama,
   subak, KKPR, PBG, AMDAL, RTRW, desa adat. Konvensi penulisan SEO Boost (`seoboost-formal-docs` → Document
   language) berlaku saat FS dirender jadi dokumen berlogo.
1. **FS = keputusan, bukan dokumen formalitas.** Setiap aspek harus benar-benar menguji kelayakan,
   bukan sekadar mendeskripsikan proyek. Ujungnya selalu satu vonis jelas: **Layak / Tidak Layak /
   Layak Bersyarat**, dengan syarat & rekomendasi yang eksplisit.
2. **Jangan pernah mengarang data.** Angka pasar, biaya, perizinan, dan status lahan menentukan nasib
   uang klien. Bila sebuah data belum ada di input (proposal/TOR/brief), **skill WAJIB menanyakannya**
   ke pengguna sebelum menyusun bagian itu (lihat *Aturan Wajib-Tanya* di bawah). Bila tetap tidak
   tersedia, tandai sebagai **asumsi eksplisit** + rekomendasikan studi/data lanjutan — jangan diam-diam
   mengisi angka.
3. **Kelengkapan aspek itu wajib.** FS yang melewatkan satu aspek (mis. perizinan, lingkungan, atau
   adat di Bali) bisa membuat rekomendasi "layak" jadi salah total. Gunakan checklist standar sebagai
   pagar kelengkapan.
4. **Konteks Bali diperlakukan first-class.** Untuk proyek di Bali, aspek adat/desa, tata ruang, kawasan
   suci, subak, dan Tri Hita Karana bukan pelengkap — sering justru penentu fatal-flaw. Selalu jalankan
   `references/bali-checklist.md`.

**Gerbang sebelum render (WAJIB).** Jalankan pemeriksa pada teks final; Tingkat 1 harus **nol** sebelum dokumen dirender atau diserahkan:

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```

## Kapan dipakai / dilewati

**Pakai** untuk: studi kelayakan proyek (infrastruktur, properti/gedung, pasar/komersial, pariwisata,
pabrik/industri, energi, transportasi, layanan publik), pra-FS/concept note yang naik jadi FS,
melengkapi FS yang sudah setengah jadi, atau audit kelengkapan FS pihak lain.

**Lewati** untuk: deck presentasi biasa (→ `seoboost-formal-deck`), dokumen formal non-FS seperti PRD/proposal
umum (→ `seoboost-formal-docs`), invoice/PKS, atau catatan informal.

## Alur kerja (ikuti urutan ini)

FS dibangun dengan berpikir dulu, mengumpulkan data, baru menulis. Enam langkah:

1. **Tetapkan kerangka keputusan.** Perjelas: proyek apa, siapa sponsor/pengambil keputusan, keputusan
   apa yang harus mereka ambil, dan kriteria "layak" versi mereka (mis. IRR minimum, dukungan sosial,
   kepatuhan tata ruang). Tanpa ini FS kehilangan arah.

2. **Petakan input terhadap standar.** Baca input yang tersedia (proposal, TOR, data klien), lalu
   bandingkan dengan **`references/fs-standard.md`** (struktur + data wajib per aspek) dan — bila proyek
   di Bali — **`references/bali-checklist.md`**. Hasilnya: daftar **yang sudah ada** vs **yang masih kosong**
   (gap).

3. **WAJIB-TANYA untuk mengisi gap.** Untuk setiap data wajib yang kosong, tanyakan ke pengguna
   menggunakan bank pertanyaan **`references/intake-questions.md`**. Sajikan gap sebagai daftar terstruktur
   (dikelompokkan per aspek, tandai mana yang *penentu kelayakan* / fatal-flaw). Jangan menyusun bagian FS
   yang datanya belum ada — kumpulkan dulu jawabannya. (Detail cara bertanya di bawah.)

4. **Susun analisis per aspek.** Setelah data cukup, tulis tiap aspek sebagai **uji kelayakan** (bukan
   deskripsi): kriteria → data/bukti → temuan → implikasi kelayakan. Untuk angka tak pasti, pakai
   **skenario (low/base/high) + analisis sensitivitas**, bukan satu angka tunggal. Nyatakan sumber &
   asumsi secara terbuka.

5. **Rakit dokumen FS (artefak utama).** Susun konten terstruktur (objek `fs`) sesuai `fs-standard.md`,
   lalu render dengan **`build/fs-render.mjs`** — renderer FS yang memakai helper `seoboost-formal-docs` (brand
   korporat: cover charcoal, section band per aspek, callout *pertanyaan kelayakan*, tabel temuan, register
   risiko, **halaman vonis (dark callout)**, roadmap process-flow, lampiran asumsi). Cara pakai: isi objek
   `fs` mengikuti bentuk & contoh ilustratif di `build/fs-render.mjs` (fungsi `buildFS({meta, fs})`),
   jalankan `node build/fs-render.mjs <out.docx>`, lalu konversi `soffice --headless --convert-to pdf`.
   Selalu **QA per halaman** (charcoal band, tabel, vonis) sebelum diserahkan. Simpan di folder proyek
   `seoboost-project-onboarding` bila ada (lihat *Integrasi*). Jangan bikin format sendiri — form-nya milik
   `seoboost-formal-docs`; skill ini mengisi *isi & kelengkapan*.
   Prasyarat toolchain: node deps `seoboost-formal-docs` (docx, @resvg/resvg-js) + `soffice` (LibreOffice).

6. **(Opsional, menyusul) Turunkan deck.** Setelah FS final, ringkas jadi deck via `seoboost-formal-deck`.
   Deck mengikuti FS, bukan sebaliknya.

## Aturan Wajib-Tanya (jantung skill ini)

Ini yang membedakan FS bermutu dari FS asal jadi. Ketika data wajib belum ada:

- **Kumpulkan semua gap dulu, lalu tanyakan sekaligus per kelompok** — jangan menetes satu-satu yang
  melelahkan. Susun sebagai daftar bernomor per aspek. Untuk tiap item sebutkan: *apa yang dibutuhkan*,
  *kenapa penting bagi kelayakan*, dan *contoh bentuk jawaban* (agar pengguna mudah menjawab).
- **Tandai yang penentu (fatal-flaw) di atas.** Mis. status lahan, kesesuaian tata ruang/KKPR, izin
  lingkungan, rekomendasi desa adat. Bila salah satu ini "tidak/ belum ada", FS tidak boleh menyimpulkan
  "layak" tanpa kualifikasi.
- **Boleh menerima "belum tahu".** Bila pengguna belum punya datanya, catat sebagai **asumsi** +
  rekomendasikan cara memperolehnya (studi teknis, survei pasar, konsultasi instansi). FS tetap jalan,
  tapi vonisnya jadi *Layak Bersyarat* sampai data itu terpenuhi.
- **Jangan menambal dengan tebakan.** Lebih baik FS jujur menyatakan "data X belum tersedia; direkomendasikan
  Y" daripada memuat angka karangan yang bisa menyesatkan keputusan investasi.

Format menanyakan yang disarankan ada di `references/intake-questions.md` (bank pertanyaan per aspek,
termasuk pertanyaan khas Bali). Gunakan itu sebagai sumber, sesuaikan dengan jenis proyek.

## Aturan integritas data

- Setiap angka penting **wajib bersumber** (sebut sumbernya) atau **ditandai asumsi**.
- Proyeksi (demand, biaya, pendapatan) memakai **rentang skenario + sensitivitas**, bukan angka tunggal.
- **Akui keterbatasan & risiko secara terbuka** — kejujuran terukur menaikkan kredibilitas FS di mata
  pengambil keputusan publik/korporat (pola yang terbukti di studi acuan SEO Boost).
- Bila memakai benchmark (proyek sejenis), sebut pembandingnya dan mengapa relevan.

## Integrasi dengan skill lain

- **`seoboost-formal-docs`** — merender dokumen FS ke DOCX/PDF (brand korporat SEO Boost). FS = jenis dokumen di sini
  ("feasibility study" sudah tercakup). Skill FS mengurus *isi & kelengkapan*; formal-docs mengurus *bentuk*.
- **`seoboost-formal-deck`** — membuat deck ringkasan FS setelah FS final. Terapkan pola berpikir deck (action
  title, kesimpulan dulu, thinking-made-visual) saat meringkas.
- **`seoboost-project-onboarding`** — bila FS untuk **proyek klien baru**, jalankan onboarding lebih dulu (atau
  pastikan strukturnya ada), lalu simpan FS di `ProjectDocs/output/NN-feasibility-study/` (proyek legacy
  pra-25 Jul 2026 yang belum dimigrasi: `.implementation-plan/<proyek>/output/NN-feasibility-study/`).
  Jawaban intake FS sekaligus mengisi `01-CONTEXT-PROJECT.md` (sponsor, tujuan) dan `02-DOMAIN-KNOWLEDGE.md`
  (aturan domain). Integrasi ringan: FS tetap bisa berdiri sendiri bila bukan proyek onboarding.

## File referensi (baca sesuai kebutuhan)

- **`references/fs-standard.md`** — struktur dokumen FS + **data wajib per aspek** + kriteria go/no-go.
  Baca di langkah 2 & 4.
- **`references/bali-checklist.md`** — aspek khas Bali yang wajib diperiksa (adat/desa, tata ruang, kawasan
  suci, subak, THK, perizinan). Baca untuk semua proyek di Bali (langkah 2 & 3).
- **`references/intake-questions.md`** — bank pertanyaan wajib-tanya per aspek (termasuk Bali). Baca di
  langkah 3.
- **`assets/fs-intake-worksheet.md`** — lembar kerja isian: salin, isi bersama klien, jadi basis FS.
- **`build/fs-render.mjs`** — renderer FS → DOCX (via `seoboost-formal-docs`). Berisi `buildFS({meta, fs})`,
  helper aspek/risiko/vonis, dan contoh FS ilustratif yang bisa dibangun langsung (`node build/fs-render.mjs`).
  Pakai di langkah 5.

## Ringkas: gerbang mutu FS-SEO Boost

Sebelum FS dinyatakan selesai, pastikan:
- [ ] Ada vonis kelayakan eksplisit (Layak / Tidak / Bersyarat) + syaratnya.
- [ ] Semua aspek standar tercakup (tak ada yang dilewati); aspek Bali diperiksa bila relevan.
- [ ] Tidak ada angka karangan — semua bersumber atau ditandai asumsi.
- [ ] Proyeksi memakai skenario + sensitivitas.
- [ ] Fatal-flaw (lahan, tata ruang, izin, adat) sudah dinilai eksplisit.
- [ ] Risiko & mitigasi tercantum; roadmap bertahap ada.
- [ ] Dirender via `seoboost-formal-docs`; disimpan di struktur proyek bila ada.
