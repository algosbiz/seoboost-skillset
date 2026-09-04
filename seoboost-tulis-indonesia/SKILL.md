---
name: seoboost-tulis-indonesia
description: Menulis atau menyunting teks Bahasa Indonesia agar baku, wajar, dan tidak ambigu — untuk dokumen (laporan, proposal, PRD, MoM, paper, analisis keuangan), salinan situs web dan antarmuka, presentasi, email, maupun pesan panjang ke klien. Gunakan skill ini setiap kali keluaran berbahasa Indonesia akan dibaca orang lain, termasuk saat pengguna hanya berkata "tulis dalam bahasa Indonesia", "buatkan laporan", "bikin landing page", "susun proposal", "terjemahkan ke Indonesia", atau ketika pengguna mengeluh bahasanya "aneh", "kaku", "belibet", "tidak baku", "kebule-bulean", atau "seperti hasil terjemahan". Wajib dipakai juga ketika menulis versi Indonesia dari materi yang sumbernya berbahasa Inggris, karena di situlah kalke paling sering lolos.
---

# Menulis Bahasa Indonesia yang Baku dan Jernih

## Masalah sebenarnya

Teks Indonesia yang terasa "aneh" jarang disebabkan kosakata yang salah. Penyebabnya hampir selalu **penulisnya berpikir dalam Bahasa Inggris lalu menerjemahkan**. Hasilnya gramatikal, tetapi tidak ada penutur Indonesia yang akan menulis begitu.

Contoh nyata, dari dokumen yang ditolak pengguna karena bahasanya aneh:

| Ditulis | Sumber pikirannya | Seharusnya |
|---|---|---|
| "masing-masing **memetakan ke** rekam jejak pasar" | *each maps to* | "masing-masing **merujuk pada** rekam jejak pasar" |
| "**terbaca lintas negara**" | *legible cross-border* | "**relevansinya lintas negara**" |
| "**benteng kompetitif**nya kokoh" | *the moat is strong* | "**keunggulan struktural**nya kokoh" |
| "**pintu masuknya** ada di biaya rekonstruksi" | *the wedge is…* | "**celah masuk pasar**nya ada pada biaya rekonstruksi" |

Setiap kesalahan adalah metafora Inggris yang dipaksakan ke dalam Indonesia, dan tidak satu pun tertangkap pemeriksa ejaan. **Karena itu aturan intinya: susun kalimat dalam Bahasa Indonesia sejak awal.** Jika sebuah frasa terasa cerdas, periksa apakah kecerdasannya berasal dari idiom Inggris. Jika ya, frasa itu akan terbaca janggal.

## Yang bukan masalah

Tiga hal ini sering dikira kesalahan, padahal bukan:

**Keinformalan bukan kesalahan.** Salinan pemasaran yang hangat dan memakai "Anda" itu benar. Yang salah adalah ragam yang tidak cocok dengan pembacanya — paper akademis bergaya Instagram, atau halaman produk bergaya peraturan menteri.

**Kata serapan bukan kesalahan.** "Konten", "fitur", "audit", "investor", "startup" sudah menjadi kata kerja sehari-hari di bidangnya. Memaksakan "peladen" untuk *server* atau "tetikus" untuk *mouse* justru membuat pembaca berhenti dan mengernyit. Ganti istilah asing hanya bila padanannya benar-benar dipakai orang.

**Kalimat pendek bukan kesalahan.** Kalimat panjang berlapis bukan tanda keseriusan. Sering kali justru tanda penulis belum selesai berpikir.

## Kata kerja kotor dan pola khas keluaran LLM

Pola-pola ini paling sering lolos justru karena gramatikal. Semuanya wajib diperbaiki di semua ragam:

**Kata kerja kotor** — verba ringan yang menggendong kata benda, padahal Indonesia punya verba langsungnya:

| Ditulis | Seharusnya |
|---|---|
| melakukan pengecekan / pemeriksaan | memeriksa |
| melakukan perbaikan | memperbaiki |
| melakukan analisis terhadap | menganalisis |
| melakukan improvisasi (salah makna: *improvisasi* ≠ *improvement*) | memperbaiki, menyempurnakan |
| memberikan dampak pada | berdampak pada, memengaruhi |
| memberikan penjelasan mengenai | menjelaskan |
| men-deliver, meng-handle, di-follow up, meng-improve | menyerahkan/menuntaskan, menangani, ditindaklanjuti, meningkatkan |
| memastikan bahwa X adalah lengkap | memastikan X lengkap |

Verba Inggris berimbuhan Indonesia (men-, di-, -nya menempel pada kata Inggris) hampir selalu punya padanan yang lazim — pakai padanannya. Kecualikan hanya istilah kerja industri yang tak terganti (*di-deploy*, *di-merge*).

**Tic retoris LLM:**

| Ditulis | Perbaikan |
|---|---|
| "dimana" / "yang mana" sebagai kata hubung ("sistem dimana data disimpan") | susun ulang: "sistem tempat data disimpan", "sistem yang menyimpan data" |
| "adalah merupakan" | pilih satu |
| Pembuka basa-basi: "Di era digital yang terus berkembang…", "Dalam dunia bisnis saat ini…" | hapus; mulai dari isi |
| "Tidak hanya X, tetapi juga Y" beruntun | pakai sekali per dokumen, sisanya kalimat biasa |
| "sangat penting untuk dicatat bahwa", "perlu diketahui bahwa" | hapus; langsung nyatakan isinya |
| "Ini adalah…" membuka kalimat berulang kali | sebutkan bendanya, atau gabungkan kalimat |

## Pola mesin di teks formal

Arahan operator, 29 Agu 2026: pola bahasa AI harus lenyap dari semua keluaran — dokumen
resmi, formal, maupun balasan chat; hasilnya harus senatural tulisan manusia,
bagaimanapun caranya. Lima pola yang paling sering lolos ke dokumen formal:

| Pola | Ditulis | Ganti |
|---|---|---|
| Kontras semu | "bukan sekadar laporan, melainkan alat pengambilan keputusan" | tulis fungsinya; kontras hanya bila kontrasnya nyata |
| Tiga serangkai sifat | "cepat, andal, dan aman" | satu klaim dengan angka pendukungnya |
| Kata kerja pameran | "Hal ini menegaskan/menggarisbawahi bahwa…" | buang, atau ganti dengan fakta baru |
| Penutup rangkuman | "Sebagai kesimpulan, dapat disimpulkan bahwa…" | buang paragrafnya; akhiri pada fakta atau langkah berikutnya |
| Hedging bertumpuk | "mungkin sebaiknya dapat dipertimbangkan untuk…" | satu penanda ragu, lalu rekomendasi yang jelas |

Katalog lengkapnya, dengan contoh perbaikan per pola dan sapuan grep siap pakai, ada di
`seoboost-bahasa-jernih`, bagian "Tic retoris dan pola khas mesin" — jangan salin katalognya
ke sini. Pemeriksa otomatis (`--konvensi`) menangkap sebagian lewat kategori `KOSMETIK`;
sisanya lewat sapuan grep itu dan baca ulang.

## Arah penjelasan istilah

Ketika istilah asing perlu diperkenalkan, tulis padanan Indonesianya sebagai kata utama dan istilah asingnya sekali saja dalam kurung, dicetak miring:

> biaya akuisisi pelanggan (*customer acquisition cost*)

Bukan sebaliknya. Pola "Pemain lama (incumbent) sudah menguasai…" membalik hierarkinya. Setelah pemunculan pertama, pakai kata Indonesianya saja.

**Uji pembaca sebelum memutuskan istilah:**

- **Pembaca praktisi** (developer, analis, investor): pertahankan kata kerja industrinya (*server*, *endpoint*, *cap table*, *due diligence*) — memaksakan padanan justru mengganggu.
- **Pembaca non-teknis** (pemilik UMKM, pengguna akhir): istilah yang lazim bagi praktisi pun perlu glosa sehari-hari pada pemunculan pertama — "dasbor (halaman ringkasan)", "invoice (tagihan)". Uji: apakah pembaca ini memakai kata itu dalam percakapannya sendiri?
- **Istilah Inggris yang justru lebih jelas** bagi pembaca Indonesia awam jangan diterjemahkan: *transfer*, *refund*, *link*, *admin*, *WhatsApp*, *e-mail*. "Pranala" dan "surel" membuat pembaca berhenti; itu kebalikan dari kejelasan.

Gejala yang sama pada angka: tulis "47 dolar AS", bukan "$47", pada prosa Indonesia. Lambang mata uang tetap wajar di dalam tabel.

## Alur kerja

### 1. Tetapkan ragam dan pembaca sebelum menulis

Siapa yang membaca, dan apa yang harus mereka lakukan setelah membaca? Ragam mengikuti jawaban itu, bukan selera.

| Ragam | Pembaca | Ciri utama |
|---|---|---|
| **Konsultan** | Pengambil keputusan | Rekomendasi di depan, angka menyertai klaim, ketidakpastian dinyatakan terbuka |
| **Akademis** | Penelaah, dosen, panitia ilmiah | Kalimat pasif, konektor formal, klaim berhati-hati, tanpa sapaan orang kedua |
| **Analis keuangan / bisnis** | Manajemen, investor | Setiap angka bersatuan dan berperiode, tidak ada kata sifat tanpa angka pendukung |
| **Pemasaran** | Calon pelanggan | Kalimat pendek, "Anda", manfaat sebelum fitur, boleh hangat — tetapi tanpa campur bahasa |
| **Founder** | Investor, mitra, tim | "Kami", keyakinan yang konkret, narasi sebab-akibat |
| **Curah gagasan** | Diri sendiri dan tim | Boleh berupa fragmen, tetapi spekulasi wajib ditandai terpisah dari fakta |

Contoh utuh tiap ragam ada di `references/register.md`. Baca hanya bagian ragam yang sedang dipakai.

### 2. Tulis, jangan terjemahkan

Kalau bahan sumbernya berbahasa Inggris: pahami maksudnya, tutup sumbernya, lalu nyatakan maksud itu sebagaimana orang Indonesia menyatakannya. Gejala bahwa penerjemahan sedang terjadi: "pada akhir hari", "mengambil tempat", "hal ini datang dengan", "bergerak maju" bertaburan, atau kalimat dimulai "Ini adalah…" berulang kali.

### 3. Jalankan pemeriksa otomatis

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam <konsultan|akademis|keuangan|pemasaran|founder|curah>
```

**Dokumen yang dibaca pihak klien wajib memakai `--konvensi`:**

```bash
python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam konsultan --konvensi
```

Flag itu menghidupkan Konvensi penulisan SEO Boost (`seoboost-formal-docs` → Document language) — empat kategori tambahan Tingkat 1:

| Kategori | Yang ditangkap |
|---|---|
| `ISTILAH` | istilah yang justru salah bila diterjemahkan: kesenjangan → GAP, pemangku kepentingan → stakeholder, daftar periksa → checklist, ambang → threshold, bagi hasil → revenue share |
| `PIHAK` | kata "klien" / "pihak klien" — sebut nama pihaknya |
| `KEPEMILIKAN` | SEO Boost ditempatkan sebagai pihak yang menuntut: "diperiksa SEO Boost", "kepada SEO Boost", "usulan SEO Boost" |
| `KOSMETIK` | kalimat yang menampilkan keseriusan tanpa membawa informasi: "hal ini penting untuk dicatat", "pada dasarnya", "dalam rangka untuk" |

Flag ini juga **membebaskan** istilah Inggris yang wajib dipertahankan dari tuduhan campur bahasa. **Jangan pakai `--konvensi` pada catatan internal** — di sana tabel istilah klien hanya menghasilkan temuan palsu.

Temuan pemeriksa adalah **kandidat**, bukan vonis. Kutipan langsung, nama produk, dan istilah hukum bisa membuat sebuah temuan justru benar. Nilai sendiri setiap temuan. HTML, Markdown, dan teks biasa didukung; kode dilewati otomatis.

### 4. Baca ulang untuk hal yang tidak bisa dideteksi mesin

1. **Setiap "ini", "itu", "hal tersebut", "mereka" — merujuk pada apa, persisnya?** Bila pembaca harus mundur satu kalimat, ganti kata ganti itu dengan bendanya.
2. **Setiap kalimat pasif — siapa pelakunya?** "Diputuskan bahwa anggaran dipotong" menyembunyikan pihak yang memutuskan. Sebutkan bila itu penting, dan biasanya penting.
3. **Setiap perbandingan — dibandingkan dengan apa?** "Lebih hemat" dan "meningkat" tidak berarti apa-apa tanpa pembanding.
4. **Setiap keterangan waktu — kapan tepatnya?** "Segera" dan "dalam waktu dekat" berubah makna bergantung pembacanya. Pakai tanggal.

Pola ambiguitas selengkapnya (rantai "yang", cakupan koordinasi, makna ganda "dapat") ada di `references/kejelasan.md`.

## Rujukan cepat

Tabel kalke, bentuk baku vs tidak baku, dan padanan istilah yang benar-benar dipakai ada di `references/kalke-dan-baku.md`. Buka ketika menyunting teks yang sudah jadi atau ragu pada satu kata. Tidak perlu dibaca seluruhnya sebelum menulis — pemeriksa otomatis sudah memuat isinya.

## Kesalahan ejaan yang paling sering lolos

- **merubah** → *mengubah* (kata dasarnya "ubah", bukan "rubah")
- **mempengaruhi** → *memengaruhi* (peluluhan /p/)
- **analisa, praktek, resiko, hutang, ijin** → *analisis, praktik, risiko, utang, izin*
- **di** sebagai kata depan ditulis terpisah (*di rumah*, *di mana*), sebagai awalan ditulis serangkai (*dibuat*, *dikirim*)
- **kerja sama, tanggung jawab, terima kasih, sumber daya** ditulis terpisah; **antarmuka, narasumber, pascapanen, nonaktif** ditulis serangkai

## Baku bukan birokratis

Tujuan skill ini bahasa yang wajar, bukan skripsi. Nada SEO Boost ke klien **formal-friendly**: diksi baku, kalimat pendek, langsung ke isi. Tanda teks sedang tergelincir jadi birokratis:

- Konektor formal bertumpuk ("Sehubungan dengan hal tersebut di atas, maka dengan demikian…") — satu konektor per peralihan gagasan sudah cukup, dan banyak peralihan tidak butuh konektor sama sekali.
- Pembuka surat/email berbelit sebelum sampai ke maksud — maksud surat ada di paragraf pertama.
- Semua kalimat dipasifkan demi terdengar resmi — pasif hanya bila pelakunya memang tidak relevan.
- Nominalisasi bertumpuk ("pelaksanaan penyelenggaraan kegiatan pengelolaan") — kembalikan jadi kata kerja.

## Ketika teks akan tampil di situs web atau antarmuka

Ragam pemasaran berlaku, dengan tambahan:

- Label tombol memakai kata kerja yang menyatakan hasil: *Kirim pesan*, *Unduh laporan* — bukan *Submit* atau *Klik di sini*.
- Judul dan label memakai kapital di awal kalimat saja, bukan Kapital Di Setiap Kata.
- Pesan kesalahan menyebutkan apa yang harus dilakukan pembaca: "Nomor telepon harus diawali 08" lebih berguna daripada "Input tidak valid".
- Jangan mencampur "Anda" dan "kamu" dalam satu produk. Pilih satu, konsisten.

## Sebelum menyerahkan

1. Ragam konsisten dari awal sampai akhir? Dokumen sering berubah nada di sepertiga terakhir, ketika penulis mulai lelah — baca bagian akhir lebih dahulu.
2. Ada kalimat yang harus dibaca dua kali? Itu bukan kesalahan pembaca.
3. Setiap klaim yang bisa dibantah sudah disertai angka, tanggal, atau sumber?
4. Sapuan grep pola mesin dari `seoboost-bahasa-jernih` sudah dijalankan, dan tiap temuannya dibaca di konteksnya?

## Batas wilayah dan presedensi

**Wilayah skill ini:** lapisan bahasa untuk **teks yang diserahkan** — dokumen, salinan web, antarmuka, email, presentasi. Dua skill tetangga saling melengkapi, bukan saling menggantikan:

- **`seoboost-bahasa-jernih`** mengurus jarak penulis-pembaca (jargon internal penyusun, framing kewenangan SEO Boost, klaim tanpa pijakan) dan memuat aturan tersendiri untuk balasan chat serta katalog buru-dan-ganti pola mesin. Teks yang lolos skill ini masih bisa gagal di sana, dan sebaliknya.
- **`seoboost-formal-docs`** mengurus wujud dokumen resmi berlogo. Skill ini mengurus bahasanya.

**Presedensi istilah (ditetapkan 16 Agu 2026, tercatat di SKILLS-SOP.md):** `seoboost-formal-docs` → Konvensi penulisan SEO Boost memuat tabel istilah yang menahan kata Inggrisnya (*GAP*, *checklist*, *threshold*, *stakeholder*, *decision point*, *revenue share*, *dispute*) — bertabrakan dengan arah bawaan skill ini.

- **Pada dokumen project yang dibaca pihak klien → tabel `seoboost-formal-docs` menang.** Tabel itu dikalibrasi ke tulisan teknis pihak itu sendiri; dokumen yang memakai "pemangku kepentingan" sementara seluruh rapat mereka menyebut *stakeholder* terbaca ditulis orang luar.
- **Di luar itu → skill ini menang, selalu** — catatan internal, log komunikasi, ProjectDocs, salinan web, pemasaran.

| Jenis teks | Istilah teknis | Ragam, kalke, kejelasan, ejaan |
|---|---|---|
| Dokumen project pihak klien | `seoboost-formal-docs` | Skill ini |
| Catatan internal, log komunikasi, ProjectDocs | Skill ini | Skill ini |
| Salinan web, antarmuka, pemasaran | Skill ini | Skill ini |
| Email dan pesan panjang ke klien | `seoboost-formal-docs` bila membahas project | Skill ini |

Yang **tidak pernah** dikalahkan tabel mana pun, karena bukan soal pilihan kata: larangan kalke, aturan kejelasan (rujukan kata ganti, pelaku pasif, pembanding, keterangan waktu), dan ejaan baku. Dokumen klien yang memakai *stakeholder* tetap salah bila kalimatnya berbunyi "Hal ini penting untuk dicatat bahwa stakeholder telah di-follow up".

---
Direvisi 28 Agu 2026 via council review. Direvisi 29 Agu 2026 via council review (wave 2).
