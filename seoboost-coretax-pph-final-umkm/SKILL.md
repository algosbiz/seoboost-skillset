---
name: seoboost-coretax-pph-final-umkm
description: >-
  Panduan operasional MEMBUAT KODE BILLING dan MENYETOR PPh Final UMKM 0,5% (PP 55/2022)
  MASA BULANAN untuk wajib pajak badan SEO Boost (mis. PT BALI MIKRO TEKNOLOGI) di Coretax DJP
  (coretaxdjp.pajak.go.id). Picu SETIAP KALI user ingin membuat kode billing atau menyetor
  PPh final UMKM bulanan — meski tak menyebut "Coretax" — mis. "setor/bayar pajak final bulan
  ini", "bikin kode billing PPh final masa Mei", "bayar 0,5%/setengah persen dari omzet",
  "proses setoran 411128-420", atau saat user menyebut omzet bulanan lalu minta disetorkan.
  Skill menghitung pajak (0,5% × omzet), memandu Layanan Mandiri Kode Billing Tahap 1–3 dengan
  KAP-KJS 411128-420, dan memverifikasi pembuatan kode billing serta pembayaran. Mode co-pilot
  via Claude in Chrome (boleh isi field termasuk nominal), tetapi LOGIN dan PEMBAYARAN tetap oleh
  user. JANGAN picu untuk tugas pajak lain yang hanya mirip kata kunci: lapor SPT Tahunan (1771),
  faktur/PPN, PPh 21, laporan keuangan, daftar NPWP, PBB, atau pertanyaan faktual soal tarif.
---

# Bayar PPh Final UMKM 0,5% Bulanan via Coretax DJP

Skill ini memandu satu kewajiban berulang: menyetor **PPh Final UMKM 0,5%** (PP 55/2022)
setiap bulan untuk wajib pajak badan SEO Boost (mis. **PT BALI MIKRO TEKNOLOGI**) melalui
**Coretax DJP** (`coretaxdjp.pajak.go.id`).

Alurnya selalu sama: **hitung pajak → buat kode billing → bayar → verifikasi**. Karena
langkahnya identik tiap bulan, hampir semua kesalahan datang dari satu dari tiga hal:
salah hitung nominal, salah pilih KAP-KJS/masa pajak, atau lupa memverifikasi setoran
benar-benar tervalidasi. Skill ini disusun untuk menutup ketiga celah itu.

## Pembagian peran (penting — jangan dilanggar)

Coretax menyangkut uang dan kredensial. Batas tanggung jawab dibuat tegas:

| Dilakukan **Claude** (mode co-pilot) | Dilakukan **user sendiri** (wajib) |
| --- | --- |
| Menghitung nominal pajak dari omzet | **Login / memasukkan password** Coretax |
| Membuka menu & mengisi field Tahap 1–3 (KAP-KJS, masa pajak, **nominal**, keterangan) | **Menjawab "ya"** sebelum tiap submit |
| Membacakan ulang nilai untuk dikonfirmasi sebelum submit | **Klik bayar / transaksi** di bank/ATM/e-wallet |
| Memverifikasi keberhasilan (kode & setoran) | Menyimpan BPN/NTPN sebagai bukti |

Skill ini berjalan dalam **mode co-pilot**: Claude boleh menyetir browser dan mengisi field
Coretax — termasuk nominal pajak — lewat **Claude in Chrome**, tetapi **berhenti total** di dua
titik yang tak bisa diwakilkan: **login** dan **transaksi pembayaran**. Setiap submit (mis. klik
"Unduh Kode Billing") wajib didahului konfirmasi user. Detail operasional ada di
[Membantu via browser (mode co-pilot)](#membantu-via-browser-mode-co-pilot); batas tegasnya di
[Batasan keamanan](#batasan-keamanan).

## Membantu via browser (mode co-pilot)

Coretax adalah **aplikasi web**, jadi navigasi memakai **Claude in Chrome**
(`mcp__Claude_in_Chrome__*`) — *bukan* computer-use, karena lewat computer-use browser hanya
bisa dibaca (tier "read"), tidak bisa diklik/diketik. Jika ekstensi Chrome belum tersambung,
minta user memasangnya dulu.

Pola kerja co-pilot:

1. **User login sendiri** ke `coretaxdjp.pajak.go.id`. Claude tidak pernah mengisi halaman login.
2. Claude membuka **Pembayaran → Layanan Mandiri Kode Billing** lalu mengisi sesuai Tahap 1–3
   di bawah (verifikasi identitas → KAP-KJS `411128-420` + masa pajak → mata uang, nominal,
   keterangan).
3. **Sebelum klik "Unduh Kode Billing"**, Claude membacakan ulang **KAP-KJS, masa pajak,
   nominal, dan terbilang**, lalu menunggu user menjawab "ya". Baru submit.
4. Claude memverifikasi pembuatan (status 200 + muncul di Daftar Kode Billing Belum Dibayar).
5. **Pembayaran diserahkan sepenuhnya ke user** (bank/ATM/internet banking/e-wallet). Claude
   tidak bertransaksi dan tidak menekan tombol bayar.
6. Setelah user membayar, Claude membantu [verifikasi pembayaran](#verifikasi-pembayaran-berhasil).

Jika kapan pun muncul layar **login** atau halaman **otorisasi pembayaran**, **berhenti** dan
minta user mengambil alih.

## Langkah 0 — Hitung nominal pajak

Rumus:

```
PPh Final UMKM = 0,5% × peredaran bruto (omzet) bulan tersebut
              = omzet ÷ 200
```

Bulatkan hasil ke **rupiah penuh** (umumnya dibulatkan ke bawah; Coretax hanya menerima
nominal tanpa desimal). Selalu **konfirmasi omzet ke user** sebelum menghitung — angka ini
milik user dan menentukan seluruh transaksi.

Contoh:

| Peredaran bruto (omzet) | Pajak 0,5% |
| --- | --- |
| Rp 4.000.000 | Rp 20.000 |
| Rp 17.500.000 | Rp 87.500 |
| Rp 9.999.500 | Rp 49.997 (dari 49.997,5 → bulatkan ke bawah) |

Tuliskan hasilnya secara eksplisit ke user, mis. *"Omzet Juni 2026 Rp 4.000.000 → pajak
0,5% = Rp 20.000"*, dan minta user mengonfirmasi sebelum lanjut membuat kode billing.

## Prasyarat

1. **Sesi Coretax aktif** — user sudah login ke `coretaxdjp.pajak.go.id`. Jika muncul
   error 401, sesi kedaluwarsa → lihat [Troubleshooting](#troubleshooting).
2. **Omzet/peredaran bruto** bulan yang akan dibayar sudah diketahui dan dikonfirmasi.
3. **Masa pajak** yang benar (bulan & tahun) sudah ditentukan, mis. *Juni 2026*.

## Langkah 1–3 — Membuat kode billing

Masuk dari **Home → menu "Pembayaran" → "Layanan Mandiri Kode Billing"**, lalu ikuti tiga
tahap berikut. Bacakan label persis seperti yang muncul di layar agar user tidak salah klik.

### Tahap 1 — Verifikasi Identitas
- Periksa **NPWP / Nama / Alamat** sudah sesuai wajib pajak (PT BALI MIKRO TEKNOLOGI).
- Klik **"Lanjut"**.

### Tahap 2 — Pilih KAP-KJS
- **KAP-KJS:** ketik `411128-420`, lalu pilih opsi
  **"411128-420 PPh Final UMKM Setor Sendiri"**.
  Ini kode yang menentukan jenis pajak — salah kode = setoran salah peruntukan, jadi
  pastikan persis 411128-420.
- **Periode dan Tahun Pajak:** pilih **bulan masa pajak** yang dibayar (mis. *Juni 2026*).
  **HARDLINE — Masa Pajak = bulan PEROLEHAN OMZET, bukan bulan saat menyetor.** Ini sumber
  kesalahan paling sering: menyetor pajak April di bulan Mei lalu masa keliru diisi *Mei*.
  Kasus nyata (2026): setoran April Rp 36.100 (0,5% × 7.220.000) terlanjur diisi masa
  `05052026` (Mei), padahal seharusnya `04042026` (April) — koreksinya rumit (lihat
  Troubleshooting). Cocokkan masa pajak dengan bulan yang omzetnya dihitung di Langkah 0.
- Klik **"Lanjut"**.

### Tahap 3 — Isi nominal
- **Mata Uang:** Rupiah Indonesia.
- **Jumlah:** isi nominal pajak hasil Langkah 0 (mis. `20000`). **Terbilang** terisi otomatis —
  cek terbilang cocok dengan angka sebagai pemeriksaan ulang.
- **Keterangan:** mis. `PPh Final UMKM 0,5% Masa Juni 2026`.
- Klik **"Unduh Kode Billing"**.

> Dalam mode co-pilot, Claude boleh mengetik **Jumlah**, tetapi karena ini angka finansial,
> **bacakan ulang nominal + terbilang dan tunggu konfirmasi "ya"** sebelum klik
> "Unduh Kode Billing". Nominal yang terlanjur salah submit harus dibuat ulang.

## Verifikasi pembuatan berhasil

Konfirmasi minimal salah satu, idealnya keduanya:

- **Teknis:** request `POST /paymentportal/api/createbillingcode` berstatus **200**.
- **UI:** kode billing muncul di **Pembayaran → "Daftar Kode Billing Belum Dibayar"**.

Lalu **catat dan bacakan ke user**: **Kode Billing**, **Jumlah**, dan
**Masa Aktif (tanggal kedaluwarsa)**. Ingatkan agar pembayaran selesai sebelum tanggal
kedaluwarsa kode billing.

## Pembayaran (dilakukan user sendiri)

- Bayar memakai **Kode Billing** via bank/ATM/internet banking/e-wallet.
- Selesaikan **sebelum tanggal kedaluwarsa** kode billing.
- Simpan **BPN/NTPN** sebagai bukti setor — NTPN adalah bukti bahwa setoran tervalidasi.

> **Jatuh tempo pajak vs. kedaluwarsa kode billing** itu berbeda. Untuk PPh Masa setor
> sendiri, batas setor umumnya **tanggal 15 bulan berikutnya** setelah masa pajak (mis.
> masa Juni 2026 → paling lambat 15 Juli 2026). Kode billing punya tanggal kedaluwarsa
> sendiri yang biasanya lebih pendek. Bayar sebelum **kedua-duanya** terlewati; jika ragu,
> minta user mengonfirmasi tenggat di akun mereka.

## Verifikasi pembayaran berhasil

Setelah user membayar, pastikan kewajiban benar-benar lunas dengan mengecek tiga tempat:

1. **Pembayaran → "Daftar Kode Billing Aktif"** → Total Payment **Rp 0,00** / kode sudah hilang.
2. **Menu SPT** (*SPT Belum Disampaikan* & *Konsep SPT*) → **kosong**.
3. **Buku Besar** → Saldo **0,00**, Debit/Kredit Tersisa **0,00**. Artinya: **tidak ada
   tunggakan** (Saldo/Debit Tersisa 0) **dan tidak ada sisa kredit mengambang** (Kredit
   Tersisa 0 → tak ada deposit yang bisa/perlu di-Pemindahbukuan).

Jika ketiganya bersih, masa pajak tersebut beres. Untuk PPh Final UMKM, setoran yang
tervalidasi (ber-NTPN) umumnya **sekaligus memenuhi kewajiban pelaporan masa**, sehingga
tidak perlu lapor SPT Masa terpisah.

## Troubleshooting

- **`HTTP failure response for ... 401`** → sesi login kedaluwarsa.
  **Solusi:** minta user login ulang ke `coretaxdjp.pajak.go.id`, lalu ulangi dari
  [Langkah 1](#langkah-13--membuat-kode-billing).
- **KAP-KJS tidak muncul / salah** → ketik ulang `411128-420` dan pilih dari dropdown,
  jangan mengetik bebas.
- **Masa pajak keliru — BELUM dibayar** → kode billing yang salah masa jangan dibayar;
  buat kode billing baru dengan masa yang benar (biarkan kode lama kedaluwarsa).
- **Masa pajak keliru — SUDAH dibayar** → perbaikan lewat **Pemindahbukuan (Pbk)**, TAPI ada
  batasannya: Pbk mandiri di portal (**Pembayaran → Permohonan Pemindahbukuan → Buat Baru →
  "Pencarian Kredit"**) hanya menemukan setoran bila ada **sisa kredit/deposit mengambang**.
  Untuk PPh Final setor-sendiri yang nominalnya pas & sudah teralokasi penuh, "Pencarian
  Kredit" **kosong (0 entri)** dan **Buku Besar Kredit Tersisa = 0** → **Pbk mandiri TIDAK
  bisa**. Opsi: **(a)** paling praktis — biarkan, rapikan di **SPT Tahunan** (total setoran
  tetap menutup kewajiban, tidak ada tunggakan); **(b)** koreksi resmi via **KPP/AR** dengan
  bekal **BPN/NTPN** + PDF kode billing (uraiannya menunjukkan masa asli).
- **Nominal salah** → jangan dibayar; buat ulang dengan nominal hasil Langkah 0.

## Batasan keamanan

- **Login/password dilakukan user sendiri.** Claude tidak pernah meminta, menyimpan, atau
  mengetik kredensial. Begitu halaman login muncul, berhenti dan serahkan ke user.
- **Transaksi pembayaran dilakukan user sendiri.** Claude tidak menekan tombol bayar dan tidak
  bertransaksi di bank/ATM/e-wallet — otorisasi pemindahan uang sepenuhnya milik user.
- **Mode co-pilot (isi nominal):** Claude boleh mengisi field Coretax termasuk **nominal pajak**,
  tetapi **wajib membacakan ulang nilai dan mendapat konfirmasi "ya"** sebelum men-submit (mis.
  sebelum "Unduh Kode Billing"). Pengaman ini menggantikan aturan lama "nominal diketik user":
  yang berubah hanya siapa yang mengetik, bukan siapa yang memutuskan.
