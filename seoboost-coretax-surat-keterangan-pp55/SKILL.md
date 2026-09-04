---
name: seoboost-coretax-surat-keterangan-pp55
description: >-
  Panduan operasional MENGAJUKAN SURAT KETERANGAN PP 55/2022 (Surat Keterangan WP UMKM ber-PPh
  Final 0,5%) di Coretax DJP (coretaxdjp.pajak.go.id) untuk wajib pajak badan SEO Boost (mis. PT Bali
  Mikro Teknologi), lewat sub-layanan LA.06.01. Picu SETIAP KALI user ingin membuat/mengurus
  surat keterangan ini — meski tak menyebut "Coretax" — mis. "ajukan surat keterangan PP 55",
  "bikin suket UMKM/PPh final", "biar klien tidak potong PPh 23", "surat bebas potong pajak",
  "LA.06.01", atau "surat keterangan supaya dipotong 0,5% saja". Skill memandu Layanan
  Administrasi → Buat Permohonan → LA.06.01, pengisian formulir, validasi syarat, penandatanganan
  (Sertel/Kode Otorisasi), submit, hingga unduh PDF suket. Mode co-pilot via Claude in Chrome
  (boleh mengisi field), tetapi LOGIN dan PENANDATANGANAN ELEKTRONIK tetap oleh user. JANGAN picu
  untuk: menyetor/membayar PPh final bulanan (itu skill setor bulanan/kode billing), lapor SPT
  Tahunan, faktur/PPN, PPh 21, atau pertanyaan faktual soal tarif.
---

# Ajukan Surat Keterangan PP 55/2022 (WP UMKM) via Coretax DJP

Skill ini memandu penerbitan **Surat Keterangan PP 55/2022** — bukti resmi bahwa SEO Boost (mis.
**PT Algo Sea Biz**) adalah WP UMKM yang dikenai **PPh Final 0,5%**. Fungsinya penting:
dengan surat ini, **lawan transaksi (klien/pemotong) tidak memotong PPh Pasal 23 2%** atas jasa
SEO Boost — SEO Boost cukup menyetor 0,5% final sendiri. Sekali terbit, salinannya diberikan ke setiap klien
badan (mis. Koperasi Klien C) di awal kerja sama.

Setelah suket terbit, kewajiban **setor 0,5% bulanan** tetap berjalan lewat skill
[[seoboost-coretax-pph-final-umkm]] (buat kode billing + bayar). Dua skill ini sepaket.

## Pembagian peran (mode co-pilot)

Tidak ada transaksi uang di alur ini, tetapi ada **tanda tangan elektronik** yang bersifat
otorisasi hukum — itu tak bisa diwakilkan.

| Dilakukan **Claude** (mode co-pilot) | Dilakukan **user sendiri** (wajib) |
| --- | --- |
| Membuka menu & memilih sub-layanan **LA.06.01** | **Login / password** Coretax |
| Mengisi/melengkapi field formulir (banyak terisi otomatis) | **Penandatanganan** (Sertifikat Elektronik / **Kode Otorisasi DJP**) |
| Klik **Create PDF**, **Save**, memeriksa draf | Centang disclaimer & **Submit** (tindakan hukum) |
| Membantu verifikasi status & unduh PDF | Menyimpan PDF suket sebagai arsip |

Claude tidak pernah memegang **passphrase Sertel** atau **Kode Otorisasi DJP**. Begitu sampai
layar tanda tangan/login, **berhenti dan serahkan ke user**.

## Prasyarat (cek dulu — ada gate keras)

1. **SPT Tahunan tahun pajak sebelumnya SUDAH dilaporkan.** Ini syarat wajib; bila belum, validasi
   Coretax akan menolak permohonan. Lapor SPT Tahunan dulu, baru ajukan suket.
2. **Sesi Coretax aktif** — user sudah login ke `coretaxdjp.pajak.go.id`. Jika 401 → login ulang.
3. **Role access benar** — pilih akun **badan** (PT Algo Sea Biz) sebagai *main account*,
   bukan akun pribadi pengurus.
4. **SEO Boost memang masih di rezim PPh Final 0,5%** (omzet ≤ Rp 4,8 M/th dan masih dalam masa berlaku
   final — untuk PT masa fasilitasnya 3 tahun). Bila sudah keluar rezim final, suket ini tidak relevan.

## Langkah pengajuan

Bacakan label persis seperti di layar agar user tidak salah klik.

1. **Login** ke `coretaxdjp.pajak.go.id` (user), pilih **role access** WP badan SEO Boost.
2. Masuk **Portal Layanan Wajib Pajak → menu "Layanan Administrasi"** → klik
   **"Buat Permohonan Layanan Administrasi"**.
3. **Pilih sub-layanan:** cari dan pilih
   **"LA.06.01 — Pembuatan Surat Keterangan Memenuhi Kriteria Sebagai Wajib Pajak Berdasarkan
   Peraturan Pemerintah Nomor 55 Tahun 2022"**.
4. **Halaman Perutean Kasus / Alur Kasus (Case Flow):** lengkapi **konsep formulir permohonan**.
   Sebagian besar data terisi otomatis dari profil WP — periksa kebenarannya dan **isi semua field
   bertanda `*`**. Sistem lalu **memvalidasi syarat & status WP** (termasuk cek SPT Tahunan).
5. **Output Documents – CTAS:** klik **"Create PDF"**. Bila diminta, isi ulang/lengkapi data
   pada formulir, pastikan field `*` terisi, lalu klik **"Save"**.
6. **Penandatanganan (user):** pilih **"Sign"**, tanda tangani dokumen dengan
   **Sertifikat Elektronik** atau **Kode Otorisasi DJP**. → *serahkan ke user.*
7. **Periksa draf** suket, **centang disclaimer**, lalu klik **"Submit"**.
8. Status berubah menjadi **"Approved"** (biasanya dalam hitungan detik) dan **PDF suket siap
   diunduh** → klik **Download**.

## Verifikasi terbit berhasil

- Status permohonan/kasus = **Approved**.
- **PDF Surat Keterangan PP 55/2022 terunduh** dan memuat: nama/NPWP WP (PT Algo Sea Biz),
  dasar PP 55/2022, **tahun pajak berlaku**, dan nomor surat.
- Dokumen juga tersedia di daftar dokumen/kasus Coretax untuk diunduh ulang.

Catat **nomor** dan **masa berlaku** suket. Masa berlaku umumnya sampai **akhir Tahun Pajak
berjalan** — jadwalkan pengajuan ulang untuk tahun pajak berikutnya (setelah SPT Tahunan tahun
tersebut dilaporkan).

## Setelah terbit — distribusikan

- Berikan **salinan PDF suket** ke **setiap klien badan/pemotong** (mis. Koperasi Klien C) di
  awal kerja sama / sebelum penagihan pertama. Dengan itu klien **tidak memotong PPh 23**.
- Tetap **setor PPh Final 0,5% bulanan** memakai [[seoboost-coretax-pph-final-umkm]] — suket menghapus
  pemotongan oleh pihak lain, bukan kewajiban setor SEO Boost sendiri.

## Troubleshooting

- **Validasi gagal / permohonan ditolak** → paling sering karena **SPT Tahunan tahun sebelumnya
  belum dilaporkan**. Lapor SPT Tahunan dulu, lalu ulangi dari Langkah 2.
- **Sub-layanan LA.06.01 tidak muncul** → pastikan **role access** akun badan yang benar; sebagian
  layanan hanya tampil untuk main account WP yang sesuai.
- **`HTTP 401`** → sesi login kedaluwarsa; login ulang lalu ulangi.
- **Gagal tanda tangan** → Sertifikat Elektronik kedaluwarsa atau **Kode Otorisasi DJP** salah;
  perbarui Sertel / masukkan kode yang benar (dilakukan user).
- **Data profil salah** (alamat/KLU) → perbaiki data profil WP lebih dulu; suket menarik data dari profil.

## Batasan keamanan

- **Login/password dilakukan user sendiri.** Claude tidak meminta, menyimpan, atau mengetik kredensial.
- **Penandatanganan elektronik dilakukan user sendiri.** Claude tidak memegang passphrase Sertifikat
  Elektronik maupun Kode Otorisasi DJP, dan tidak menandatangani atas nama user — itu tindakan hukum.
- Mode co-pilot boleh mengisi field & menavigasi, tetapi **berhenti** pada login, penandatanganan,
  dan Submit final untuk dilakukan/dikonfirmasi user.
