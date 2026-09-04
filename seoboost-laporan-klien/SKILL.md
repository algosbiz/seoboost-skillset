---
name: seoboost-laporan-klien
description: Use when composing an OUTGOING status report for an Indonesian client — routine weekly update, milestone report, or a blocker that needs the client's action — as a short WhatsApp message or a formal email/document. Gathers facts from ProjectDocs (PROGRESS, decisions since the last report, versioned outputs, blockers), drafts per channel register, gates the draft through seoboost-bahasa-jernih + seoboost-tulis-indonesia + Honest Reporting, then logs the sent report. Triggers: "buatkan laporan mingguan untuk Ibu/Bapak X", "susun update progres", "draft WA laporan status", "laporan milestone untuk dikirim", "kabari [pihak] soal progres". NOT for logging incoming client chats (seoboost-communication-log), branded formal deliverables (seoboost-formal-docs), or numbered outgoing letters (seoboost-surat-register).
---

# SEO Boost Laporan Klien

## Overview

Menyusun laporan status keluar untuk pihak klien Indonesia: update berkala, laporan
milestone, atau kabar blocker yang butuh aksi mereka. Skill ini MEMPRODUKSI laporan
keluar lalu mencatatnya; `seoboost-communication-log` mencatat chat yang masuk. Keduanya
bertemu di `06-COMMUNICATION-LOG.md`.

**Core principle:** laporan disusun untuk penerimanya. Pemilik usaha yang membacanya
ingin tahu tiga hal, dalam urutan ini:

1. **Apa yang sudah jadi dan bisa saya lihat?** Hasil dengan angka dan tautan, bukan
   cerita kesibukan.
2. **Apa yang harus saya lakukan, dan kapan?** Permintaan eksplisit dengan tanggal
   dan alasan tanggalnya.
3. **Adakah yang mengancam biaya atau tenggat?** Kendala disebut apa adanya, dengan
   dampak dan rencana penanganannya.

Urutan isi laporan mengikuti tiga pertanyaan itu. Rencana kerja SEO Boost sendiri ditaruh
paling akhir, sebab itu pertanyaan keempat penerima, bukan pertama.

## When to Use

- Update berkala (mingguan/dwimingguan) yang sudah jadi ritme project
- Milestone selesai dan hasilnya siap ditunjukkan
- Blocker yang hanya bisa dibuka oleh pihak klien (data, akses, keputusan)
- Menjawab "sudah sampai mana?" dari klien: jawabannya disusun lewat skill ini

**Bukan wilayah skill ini:**

- Chat klien yang MASUK dan perlu dicatat → `seoboost-communication-log`
- Dokumen ber-branding (proposal, laporan formal ber-cover) → `seoboost-formal-docs`;
  susun isinya dengan skill ini, render lewat skill itu
- Dokumen bernomor surat (berita acara, surat penugasan) → `seoboost-surat-register`
- Laporan internal ke operator → aturan balasan chat `seoboost-bahasa-jernih` §12

## Langkah 1 — Kumpulkan fakta dari file, bukan dari ingatan

Semua isi laporan harus tertelusur ke file ProjectDocs atau hasil run. Urutannya:

1. **Cari laporan keluar terakhir** di `06-COMMUNICATION-LOG.md`. Tanggalnya menjadi
   titik nol: laporan baru hanya memuat apa yang berubah sesudahnya. Sekalian cek:
   adakah pertanyaan klien di timeline yang belum terjawab? Jawab di laporan ini.
2. **Status dan angka** dari `PROGRESS.md` + `05-CURRENT-STATE.md`. Angka yang belum
   diverifikasi segar (`superpowers:verification-before-completion`) belum boleh
   diklaim "selesai".
3. **Keputusan sejak titik nol** dari `03-DECISIONS-LOG.md` — yang sudah dijalankan
   dilaporkan sebagai hasil ("sudah kami sesuaikan dengan keputusan Ibu tanggal X").
4. **Output yang akan dirujuk/dilampirkan**: nama file mengikuti `seoboost-versioned-output`
   (`<Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.{ext}`), tautan Drive dicek benar-benar
   terbuka untuk penerimanya.
5. **Blocker yang butuh aksi klien** dari `05-CURRENT-STATE.md` — tiap blocker
   diterjemahkan jadi satu permintaan konkret dengan tanggal. Permintaan keputusan
   disertai opsi konkret plus rekomendasi SEO Boost, supaya penerima tinggal memilih.

Kalau salah satu file di atas belum mutakhir, perbaiki filenya dulu. Laporan yang
disusun dari ingatan adalah sumber klaim tanpa pijakan.

## Langkah 2 — Pilih kanal, lalu patuhi ragamnya

| | WA singkat | Email / dokumen |
|---|---|---|
| Kapan | update rutin, konfirmasi cepat, kabar blocker | laporan mingguan formal, milestone, isi yang akan dirujuk ulang, ada lampiran/tabel |
| Panjang | muat 1-2 layar HP (di bawah kira-kira 200 kata) | bebas, dibuka ringkasan 3 baris |
| Bentuk | paragraf pendek + daftar polos; tanpa heading; tebal (`*...*`) hanya untuk angka/tanggal penting | bagian bernomor tetap (lihat kerangka) |
| Lampiran | tautan Drive ke file ber-versi | file ber-versi dilampirkan + disebut namanya |

Kalau draf WA melewati batas panjangnya atau butuh tabel, isinya pindah ke dokumen;
WA-nya menyusut jadi pengantar dua kalimat plus tautan.

## Kerangka WA singkat

```
Salam Sehat Ibu/Bapak <Nama>,

<1 kalimat inti: hasil atau status utama, dengan angka.>

Yang berubah sejak laporan <tanggal laporan lalu>:
- <hasil 1, dengan angka/tautan>
- <hasil 2>

Yang kami tunggu dari Ibu/Bapak: <satu permintaan konkret>, paling lambat
<tanggal> — <alasan tanggalnya>.

Laporan berikut kami kirim <tanggal>, setelah <tahap berikutnya>.

Terima kasih,
<Nama pengirim> — SEO Boost Indonesia
```

Contoh terisi (angka dan tanggal hanya memperagakan pola):

> Salam Sehat Ibu <Nama>,
>
> Verifikasi berkas tahap 1 selesai: *480 dari 520 entri* lolos, 40 entri perlu
> perbaikan dari peserta.
>
> Yang berubah sejak laporan tanggal 25 Agustus:
> - Daftar entri yang perlu perbaikan sudah kami unggah ke folder Drive "Hasil
>   Verifikasi" (berkas Hasil-Verifikasi-Tahap-1_v1.0_2026-08-28.csv).
> - Aturan tanda tangan pembimbing sudah kami sesuaikan dengan keputusan Ibu
>   tanggal 26 Agustus.
>
> Yang kami tunggu dari Ibu: persetujuan mengirim pemberitahuan perbaikan ke
> peserta, paling lambat *30 Agustus*, supaya peserta masih punya waktu perbaikan
> 48 jam sebelum batas unggah 2 September.
>
> Laporan berikut kami kirim 1 September, setelah verifikasi tahap 2 selesai.
>
> Terima kasih,
> operator — SEO Boost Indonesia

## Kerangka email / dokumen

```
Perihal: Laporan Kemajuan <Nama Project> — <periode / milestone> (per <tanggal>)

Salam Sehat Ibu/Bapak <Nama>,

<Ringkasan 3 baris: status keseluruhan; capaian utama periode ini;
satu hal yang paling menunggu keputusan/aksi penerima.>

1. Hasil sejak laporan <tanggal laporan lalu>
   - <hasil, dengan angka dan rujukan berkas ber-versi>
   - <keputusan Ibu/Bapak tanggal <X> sudah kami jalankan: <wujudnya>>

2. Yang kami butuhkan dari Ibu/Bapak
   - <permintaan>, paling lambat <tanggal> — <alasan tanggalnya>

3. Kendala dan penanganannya
   - <kendala>; dampaknya <apa, ke tenggat/biaya mana>; rencana kami <apa>
   - (bila nihil, tulis "tidak ada kendala baru periode ini"; jangan hapus bagiannya)

4. Rencana sampai laporan berikutnya
   - <tahap>, target <tanggal>. <Kalau targetnya bergantung pihak lain,
     sebut dependensinya di kalimat yang sama.>

Lampiran: <Slug>_v1.0_<YYYY-MM-DD>.pdf

Hormat kami,
<Nama> — SEO Boost Indonesia
```

Contoh isian bagian kendala, supaya nadanya terpegang:

> Data pembanding dari vendor lama belum kami terima (dijanjikan 20 Agustus).
> Tanpa data itu, pencocokan saldo awal belum bisa dimulai, sehingga target
> 5 September bergeser mengikuti tanggal terimanya. Kami sudah menagih ulang
> tanggal 27 Agustus; bila sampai 1 September belum ada, kami usulkan opsi
> input manual dengan perkiraan tambahan waktu 3 hari kerja.

## Gerbang wajib sebelum kirim

Draf laporan adalah **teks yang diserahkan** (`seoboost-bahasa-jernih` §13), sekalipun
permintaannya datang santai di tengah obrolan. Tiga gerbang, semuanya wajib:

**Gerbang bahasa** (`seoboost-bahasa-jernih` §14 + `seoboost-tulis-indonesia`):
- Sapaan "Salam Sehat Ibu/Bapak <Nama>"; varian untuk prajuru/krama Bali lihat §14
- Nol emoji; nol kata "klien" — sebut nama pihaknya
- Istilah ikut yang dipakai penerima di rapat. Istilah internal SEO Boost tidak bocor:
  tanpa nomor D-XXX, tanpa "sprint 3", tanpa nama branch/pipeline. Keputusan dirujuk
  dengan tanggal dan kanalnya ("keputusan Ibu via WA tanggal 26 Agustus")
- Terjemahkan pekerjaan teknis ke dampaknya. Tulis "data lama sudah pindah ke sistem
  baru; jumlah barisnya kami cocokkan, sama persis", jangan "migrasi database selesai"
- Tanggal menyebut sifatnya: dijanjikan, diterima, disepakati, berlaku sejak
- Draf panjang dilewatkan pemeriksa:
  `python3 ~/.claude/skills/seoboost-tulis-indonesia/scripts/periksa.py <berkas> --ragam pemasaran`
  untuk pesan WA, `--ragam konsultan` untuk laporan email/dokumen (dokumen yang
  memakai istilah konvensi pihak itu: tambah `--konvensi`)

**Gerbang Honest Reporting** (CLAUDE.md):
- Setiap klaim "selesai" punya bukti verifikasi segar; setiap angka tertelusur ke
  file atau hasil run
- Interpretasi yang belum dikonfirmasi ditulis sebagai pertanyaan, bukan sebagai fakta
- Janji tanggal hanya untuk yang di kendali SEO Boost; selebihnya sebut dependensinya
- Kendala tidak disembunyikan dan tidak didramatisasi: fakta, dampak, rencana

**Checklist kirim:**
- ☐ Kalimat pertama setelah sapaan = inti laporan (hasil/status), bukan latar
- ☐ Hanya memuat yang berubah sejak laporan terakhir (cek titik nol di 06)
- ☐ Pertanyaan klien yang menggantung di 06 terjawab
- ☐ Tiap permintaan aksi penerima punya tanggal + alasan tanggalnya
- ☐ Lampiran/tautan ber-versi, dicek terbuka untuk penerimanya
- ☐ Ragam sesuai kanal; WA tidak melebihi 1-2 layar HP

## Setelah terkirim

1. **Log ke `06-COMMUNICATION-LOG.md`** via `seoboost-communication-log` — laporan keluar
   masuk timeline dengan tanggal, kanal, dan ringkasan isinya, supaya laporan
   berikutnya punya titik nol yang jelas.
2. **Lampiran** yang baru dibuat mengikuti `seoboost-versioned-output`; jangan menimpa
   versi yang sudah pernah dikirim.
3. **Balasan klien** yang berisi keputusan → `seoboost-decision-tracking` (D-XXX);
   balasan lain → `seoboost-communication-log`.
4. Permintaan beraksi yang dikirim ke klien dicatat sebagai item tunggu di
   `05-CURRENT-STATE.md`, supaya tidak hilang saat fork.

## Anti-Patterns

1. Laporan aktivitas tanpa hasil ("minggu ini kami fokus menganalisis...") — penerima
   tidak bisa berbuat apa-apa dengan itu
2. Menyebut D-XXX, "sprint", "Tier 1", nama branch, atau istilah internal lain di
   teks yang diserahkan
3. Mengulang isi laporan lalu tanpa menandai mana yang baru
4. Klaim "selesai" tanpa bukti verifikasi segar, atau angka dari ingatan
5. Permintaan aksi tanpa tanggal, atau tanggal tanpa alasan
6. WA panjang ber-heading bertingkat — itu materi dokumen, WA cukup pengantar + tautan
7. Menimpa lampiran versi lama; klien sering kembali ke "yang kemarin"
8. Lupa mencatat laporan terkirim ke 06 — laporan berikutnya kehilangan titik nol
9. Menjanjikan tanggal yang bergantung pihak ketiga tanpa menyebut dependensinya
10. Menyembunyikan kendala sampai klien menemukannya sendiri

## Trigger Phrases yang Match Skill Ini

- "buatkan laporan mingguan untuk Ibu/Bapak <Nama>"
- "susun update progres ke <pihak>"
- "draft WA laporan status" / "kabari <pihak> soal progres"
- "laporan milestone untuk dikirim"
- "<pihak> tanya sudah sampai mana"

## Related Skills

- `seoboost-communication-log` — mencatat chat masuk DAN laporan keluar ini ke 06
- `seoboost-decision-tracking` — balasan klien yang berisi keputusan
- `seoboost-versioned-output` — penamaan lampiran
- `seoboost-bahasa-jernih` + `seoboost-tulis-indonesia` — gerbang bahasa; keduanya wajib
- `seoboost-formal-docs` — bila laporan perlu wujud dokumen ber-branding
- `seoboost-surat-register` — bila keluarannya dokumen bernomor surat
- `superpowers:verification-before-completion` — bukti sebelum klaim "selesai"

---
Dibuat 29 Agu 2026 via council review.
