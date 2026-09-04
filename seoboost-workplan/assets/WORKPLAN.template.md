# WORKPLAN — <judul pekerjaan>

**Status:** DRAFT · menunggu persetujuan operator
**Dibuat:** <YYYY-MM-DD HH:MM WITA>
**Terakhir diperbarui:** <YYYY-MM-DD HH:MM WITA>
**Project:** <nama project / lintasan folder>

---

## 1. Tujuan akhir

<Satu kalimat, bahasa manusia. Bukan daftar tugas — hasil akhir yang operator inginkan.>

## 2. Kriteria terima

Tiap butir harus bisa dijawab YA atau TIDAK oleh orang lain tanpa menebak.

| # | Kriteria | Cara membuktikan | Status |
|---|---|---|---|
| 1 | <kriteria terukur> | <perintah, berkas, atau langkah yang menunjukkan buktinya> | BELUM |
| 2 | | | BELUM |
| 3 | | | BELUM |

Status yang sah: `BELUM` · `DIKERJAKAN` · `LULUS` · `TERHALANG`.
Tidak ada "lulus sebagian" — kalau muncul, kriterianya kurang tajam, pecah jadi dua.

## 3. Di luar cakupan

Yang sengaja TIDAK dikerjakan di workplan ini, supaya tidak jadi kecewa di akhir.

- <hal yang tidak dikerjakan> — <alasan singkat>
- <hal yang tidak dikerjakan> — <alasan singkat>

## 4. Tier kompleksitas dan rencana agent

**Tier:** T<0–4> — <alasan satu baris>

| Agent | Peran | Tugas | Bentuk balasan |
|---|---|---|---|
| A1 | penggarap | <tugas> | lintasan berkas + ≤8 baris ringkasan |
| A2 | penggarap | <tugas> | <bentuk> |
| Q1 | penguji | menjatuhkan klaim pada kriteria #1 dan #2 | vonis + bukti |

Yang berjalan paralel: <A1, A2 — saling bebas>
Yang harus berurutan: <A3 setelah A1 karena butuh hasilnya>

## 5. Pagu

- **Perkiraan jumlah agent:** <n>
- **Batas jumlah agent sebelum harus minta restu ulang:** <n × 1.5, dibulatkan>
- **Perkiraan waktu:** <menit / jam>
- **Batas waktu sebelum harus lapor:** <n menit / jam>

Penjaga G4 menyala kalau salah satu terlampaui — jumlah agent, batas waktu, atau masuk
ronde QC ketiga pada kriteria yang sama. Mana pun yang lebih dulu: berhenti, lapor posisi,
minta restu.

## 6. Risiko dan asumsi

| Asumsi | Kalau ternyata salah | Rencana kalau salah |
|---|---|---|
| <asumsi> | <akibatnya> | <langkah alternatif> |

## 7. Batas keras

Yang tidak boleh disentuh tanpa izin eksplisit operator:

- <mis. jangan sentuh production>
- <mis. jangan ubah skema database>
- <mis. jangan kirim apa pun ke klien>

---

## Catatan jalannya kerja

Diperbarui setiap satu kriteria berubah status. Ini yang bikin kerja bisa dilanjut setelah
`/compact` atau fork ke sesi baru.

| Waktu (WITA) | Peristiwa | Kriteria terdampak |
|---|---|---|
| | Kontrak disetujui operator | — |
| | | |

## Berkas yang dihasilkan

| Lintasan | Isinya apa |
|---|---|
| | |
