---
name: seoboost-surat-register
description: Use when issuing or numbering ANY outbound SEO Boost document that carries a nomor surat — contracts (PKTA/PKS), NDA, invoices, SPK/surat tugas/surat penugasan, penawaran, berita acara, surat keterangan/undangan, MoU. Triggers when the user asks "nomor surat berapa", "buatkan surat/kontrak/invoice", "surat keluar", "register surat", "lanjutkan penomoran", or when a seoboost-formal-docs document needs its Nomor field filled. Maintains ONE company-wide register so letter numbers are never reused, always continuable within the same month, and every issued document is traceable. Like the decision-log, but for outbound documents + their numbers.
license: Proprietary — PT Algo Sea Biz internal use
version: 1.0
---

# SEO Boost Surat Register — Penomoran & Pelacakan Dokumen Keluar

## Overview

Satu sumber kebenaran untuk **semua dokumen resmi yang keluar dari SEO Boost** dan membawa nomor surat. Tujuannya dua:

1. **Penomoran berbasis register** — sebelum menerbitkan surat, cek register untuk tahu nomor berikutnya. Tidak ada nomor dobel, tidak ada tebak-tebakan.
2. **Jejak audit** — setiap dokumen keluar (kontrak, NDA, invoice, surat tugas, penawaran, berita acara, dst.) tercatat: nomor, tanggal, tujuan, project, status, lokasi file.

**Register (data) = satu file untuk seluruh perusahaan, rujukan utamanya di repo `seoboost-skill-set`:**
`~/.claude/seoboost-skill-set/seoboost-surat-register/REGISTER-SURAT-KELUAR.md`
Semua mesin SEO Boost clone repo ke path itu, jadi path ini portabel lintas mesin. **Selalu baca/tulis file rujukan utama itu**, bukan salinan lokal — supaya seluruh tim melihat nomor yang sama. Satu register untuk seluruh perusahaan, BUKAN per-project: nomor surat berlaku lintas project, dua project berbeda tidak boleh sama-sama menerbitkan `001/INV-SEO Boost/VII/2026`.

## Format nomor surat

```
NNN / KODE-SEO Boost / BULAN_ROMAWI / TAHUN
```

| Bagian | Isi | Contoh |
|---|---|---|
| `NNN` | Nomor urut 3 digit, zero-padded | `001`, `014` |
| `KODE` | Kode jenis dokumen (lihat tabel) | `PKTA`, `NDA`, `INV` |
| `SEO Boost` | Kode perusahaan (tetap) | `SEO Boost` |
| `BULAN_ROMAWI` | Bulan terbit, angka Romawi I–XII | `VII` (Juli) |
| `TAHUN` | Tahun terbit 4 digit | `2026` |

Contoh nyata (surat pertama yang diterbitkan sistem ini): `001/PKTA-SBI/VII/2026`.

### Kode jenis dokumen

| Kode | Dokumen |
|---|---|
| `PKS` | Perjanjian Kerja Sama |
| `PKTA` | Perjanjian Kerja Tenaga Ahli |
| `NDA` | Perjanjian Kerahasiaan (Non-Disclosure Agreement) |
| `MoU` | Nota Kesepahaman |
| `SPK` | Surat Perintah Kerja |
| `ST` | Surat Tugas |
| `SP` | Surat Penugasan |
| `SPH` | Surat Penawaran Harga |
| `INV` | Invoice / Faktur |
| `BA` | Berita Acara |
| `SKET` | Surat Keterangan |
| `SU` | Surat Undangan |
| `SPP` | Surat Permohonan / Pengantar |

Kode di luar daftar boleh ditambahkan — cukup catat kode barunya di sini saat pertama dipakai supaya konsisten.

## Aturan penomoran (PENTING)

- **Nomor urut berjalan PER JENIS DOKUMEN (kode), reset tiap awal bulan.** Artinya PKTA dan NDA yang terbit di bulan sama boleh sama-sama `001` (dibedakan oleh kodenya). Bulan baru → kembali ke `001` per kode.
  - Contoh: Juli 2026 → `001/PKTA-SBI/VII/2026` dan `001/NDA-SBI/VII/2026`. PKTA kedua di Juli → `002/PKTA-SBI/VII/2026`. PKTA pertama di Agustus → `001/PKTA-SBI/VIII/2026`.
- **Rumus nomor berikutnya** untuk (kode, bulan, tahun):
  `NNN = (nomor tertinggi untuk kode itu di bulan+tahun yang sama di register) + 1`, atau `001` jika belum ada.
- Dokumen yang berpasangan (mis. kontrak + NDA lampirannya) boleh berbagi nomor urut yang sama karena kodenya beda — ini pilihan yang sudah dipakai untuk kontrak+NDA Raka (D-035 KLC).
- **Jika SEO Boost nanti memutuskan nomor berjalan tahunan** (tidak reset bulanan), ubah satu aturan ini: ganti "reset tiap bulan" → "reset tiap tahun", dan rumusnya pakai tahun saja. Register-nya tidak perlu diubah.

## Workflow — saat menerbitkan dokumen keluar

1. **Tentukan kode** jenis dokumen dari tabel.
2. **Buka `REGISTER-SURAT-KELUAR.md`**, cari nomor tertinggi untuk kode itu di bulan+tahun terbit. Hitung nomor berikutnya (rumus di atas).
3. **Isi nomor** di dokumen (field `Nomor:` di kop). Kalau dokumen merujuk dokumen lain (mis. NDA menyebut nomor PKTA-nya), pastikan rujukan konsisten.
4. **Catat entry baru di register SEKARANG** — jangan tunggu dokumen selesai diteken. Log saat nomor dialokasikan (disiplin sama dengan comm-log: catat saat kejadian, bukan saat checkpoint). Status awal boleh `Draft` / `Terbit`, di-update jadi `Ditandatangani` saat sudah diteken.
5. Kalau dokumen akhirnya **batal/di-void**, JANGAN hapus barisnya — tandai status `DIBATALKAN` dan biarkan nomornya "hangus" (jangan dipakai ulang). Audit trail > kerapian nomor.

## Format entry register

Satu baris tabel per dokumen (kolom di `REGISTER-SURAT-KELUAR.md`):

`| Nomor | Tgl Terbit | Kode | Perihal | Pihak / Tujuan | Project | Status | File |`

- **Tgl Terbit** — `DD Mmm YYYY` (mis. `24 Jul 2026`).
- **Status** — `Draft` · `Terbit` · `Ditandatangani` · `Terkirim` · `DIBATALKAN`.
- **File** — path relatif ke PDF/dokumen final, supaya bisa ditelusuri.
- **Project** — nama project/engagement (mis. `KLC — Project E for Koperasi`) atau `Internal SEO Boost`.

## Anti-pattern

1. **Mengarang nomor tanpa cek register.** Selalu buka register dulu. Nomor resmi bukan tebakan.
2. **Pakai ulang nomor** yang sudah pernah dialokasikan (termasuk yang dokumennya batal). Nomor hangus tetap hangus.
3. **Menunda pencatatan** sampai dokumen jadi/terkirim. Alokasikan nomor → catat detik itu juga. (Kalau tidak, dua dokumen di sesi berbeda bisa ambil nomor sama.)
4. **Menyimpan register per-project.** Register itu company-wide, satu file. Nomor bentrok lintas project kalau dipecah.
5. **Menghapus baris** dokumen yang batal. Tandai `DIBATALKAN`, jangan hapus.
6. Format nomor tidak konsisten (mis. `1` bukan `001`, atau lupa `-SEO Boost`). Ikuti format persis.

## Sinkronisasi

Register ini sebaiknya ikut mekanisme sync skill SEO Boost (repo `seoboost-skill-set`) supaya seluruh tim melihat nomor yang sama. Setelah menambah entry, commit + push register mengikuti prosedur `seoboost-skill-set` (lihat memory "SEO Boost skills-set management"). Jangan push tanpa izin (Iron Law #4) — koordinasikan dengan pemilik repo.
