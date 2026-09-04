# Laporan progres — bentuk dan nadanya

Pembacanya operator, yang tidak mendalami sisi teknis. Laporan yang benar secara teknis tapi
tidak bisa dinilai operator adalah laporan yang gagal.

Untuk laporan di chat, aturan bahasa di berkas ini sudah lengkap — jangan memuat skill
`seoboost-tulis-indonesia`, karena CLAUDE.md sendiri mengecualikan balasan chat ke operator dan
memuatnya cuma menghabiskan konteks di titik sesi yang paling sempit. Skill itu baru wajib
kalau laporannya naik jadi berkas yang dibaca orang lain.

**Ukuran keberhasilannya satu:** setelah membaca, operator tahu apa yang berubah untuk dia,
apa yang belum, dan apa yang harus dia putuskan — tanpa perlu bertanya balik.

## Kerangka enam bagian

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 LAPORAN — <judul pekerjaan>
<tanggal, jam WITA> · <n> dari <n> kriteria selesai
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YANG KAMU MINTA
<Satu kalimat, disalin dari tujuan akhir di WORKPLAN.md.>

YANG SUDAH JADI
✅ <hasil, bahasa awam — apa yang sekarang bisa/ada, bukan apa yang saya ketik>
✅ <hasil>
⚠️ <hasil yang jadi sebagian — sebutkan bagian mana yang belum terbukti>

ARTINYA BUAT KAMU
<2–4 kalimat. Akibat praktisnya, bukan cara kerjanya. Contoh: "Sekarang laporan
bulanan tidak perlu kamu susun manual — buka berkasnya, angkanya sudah terisi."
Bagian ini yang paling sering dilewatkan dan paling dibutuhkan operator.>

YANG BELUM
❌ <yang belum jadi> — <alasan jujur, bukan alasan yang enak didengar>

YANG SAYA BUTUH DARI KAMU
<Keputusan, akses, atau bahan. Kalau memang tidak ada, tulis "Tidak ada, ini sudah
bisa kamu pakai." Jangan mengarang tugas untuk operator supaya laporannya terlihat penuh.>

BERKAS DAN LOKASINYA
<lintasan lengkap> — <isinya apa, satu baris>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Aturan bahasa

Ini bukan selera — operator sudah mengoreksi tiga hal ini berulang kali.

1. **Jangan kalke.** Susun dalam Bahasa Indonesia sejak awal. Jangan menulis kalimat
   Inggris di kepala lalu dialihbahasakan kata per kata. "Memetakan ke", "pada akhir
   hari", "di sisi lain koin" — semua ini bau terjemahan.
2. **Jangan pasif tanpa pelaku.** "Berkas sudah diperbarui" menyembunyikan siapa dan
   kapan. Tulis "Saya perbarui berkasnya tadi."
3. **Jangan "segera".** Kalau maksudnya tanggal, tulis tanggalnya.
4. **Jargon Inggris hanya kalau memang tidak ada padanannya** dan operator sudah biasa
   memakainya. Kalau terpaksa, jelaskan sekali di dalam kurung.
5. **Angka harus punya konteks.** "12 berkas diubah" tidak bermakna buat operator. "Dua belas
   halaman yang tadinya lambat sekarang terbuka di bawah satu detik" bermakna.

## Menerjemahkan istilah teknis

| Jangan tulis | Tulis |
|---|---|
| refactor komponen X | rapikan bagian <fitur> supaya lebih gampang diubah nanti |
| migrasi skema | ubah susunan penyimpanan data |
| unit test lulus | saya jalankan pemeriksaan otomatis, hasilnya bersih |
| deploy ke staging | pasang di lingkungan uji coba, belum kelihatan publik |
| endpoint | alamat yang dipanggil aplikasi untuk ambil data |
| race condition | dua proses saling menyerobot dan hasilnya jadi tidak menentu |
| dependency conflict | dua komponen minta versi yang saling bentrok |

## Kapan naik ke HTML/PDF

Laporan berhenti di chat kecuali operator minta berkas. Kalau menurutmu laporannya pantas naik
— akan diteruskan ke klien, mitra, atau pemerintah, atau menutup satu tahap besar —
**tawarkan** satu baris di akhir laporan chat ("mau saya jadikan PDF berjenama lewat
`seoboost-formal-docs`?") lalu tunggu jawaban. Jangan pernah membuatnya tanpa diminta:
merender PDF berjenama itu mahal dan tidak pernah ada di kriteria terima.

Kalau naik ke berkas, isi enam bagian di atas tetap jadi rangkanya, dan di titik itu
barulah skill `seoboost-tulis-indonesia` dipakai.

## Bentuk pesan saat penjaga menyala

Penjaga G1–G4 menyala di tengah kerja, saat operator mungkin sedang mengerjakan hal lain. Pesan
ini yang harus dia pahami dalam sepuluh detik, jadi bahasanya sama awamnya dengan laporan
akhir. Empat baris, tidak lebih:

```
⛔ **Saya berhenti karena:** <satu kalimat awam — apa yang saya temui>
**Kalau diteruskan, yang terjadi:** <akibat konkretnya buat kamu, bukan istilah teknis>
**Posisi sekarang:** <n dari n kriteria sudah hijau; ada/tidak ada agent yang masih jalan>
**Yang saya butuh darimu:** <satu keputusan, dengan pilihannya>
```

Jangan menumpuk beberapa masalah dalam satu pesan penjaga. Satu penjaga, satu pesan, satu
keputusan yang diminta.

## Cara menulis kegagalan

Kegagalan ditulis apa adanya beserta keluarannya. Jangan dihaluskan sampai operator mengira
semuanya beres. Jangan juga didramatisasi.

Bentuk yang benar: **apa yang gagal · apa yang sudah dicoba · dugaan sebabnya · apa yang
saya butuhkan untuk lanjut.** Empat kalimat, selesai.
