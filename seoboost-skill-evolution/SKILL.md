---
name: seoboost-skill-evolution
description: Use to close the learning loop — harvest session lessons and route them into ecosystem improvements. Sources: new entries in agent-documentation/09-TEMUAN-EVALUASI-PROSES.md, operator corrections during a session, incidents with root cause found, working patterns proven more than once. Classifies each lesson, then routes to the EXISTING execution arms (seoboost-skill-updater, seoboost-skill-candidate, written convention proposal for the operator, agent-memory) and marks harvested entries. Triggers at sprint close, after seoboost-fork-checkpoint finishes, monthly alongside seoboost-skill-ecosystem-audit, after an incident is resolved, or when the operator corrects the way of working — "panen pelajaran", "proses temuan di file 09", "apa pelajaran sesi ini", "tutup loop belajar". NOT for editing one skill's content (seoboost-skill-updater), NOT for judging one piece of work (seoboost-skill-candidate), NOT for version/drift audits (seoboost-skill-ecosystem-audit) — this is the dispatcher above them.
---

# SEO Boost Skill Evolution — panen pelajaran sesi menjadi perbaikan ekosistem

## Overview

Skill ini menutup loop belajar. Pelajaran muncul terus selama kerja — temuan proses di
file 09, koreksi operator, insiden yang akar masalahnya ketemu — tetapi tanpa langkah
panen, entri itu menumpuk tanpa pernah mengubah cara kerja, dan pelajaran mahal
ditemukan ulang di project berikutnya. Skill ini memanen sumber-sumber itu,
mengklasifikasi tiap pelajaran, merutekannya ke lengan eksekusi yang sudah ada, lalu
menandai entri yang selesai diproses.

Perannya dispatcher. Eksekusi tetap di lengan masing-masing: `seoboost-skill-updater`
menyunting skill, `seoboost-skill-candidate` menyaring kandidat skill baru, `agent-memory`
menyimpan fakta mesin, operator memutuskan perubahan konvensi. Skill ini sendiri tidak
menulis skill, tidak mengubah canon, tidak menghapus apa pun.

## Posisi terhadap skill lain (cek dulu)

| Yang kamu pegang | Pakai |
|---|---|
| Tumpukan pelajaran sesi/sprint yang belum diproses | **Skill ini** |
| Satu perbaikan yang sudah jelas masuk skill mana | `seoboost-skill-updater` langsung |
| Satu pekerjaan selesai, tanya "layak jadi skill?" | `seoboost-skill-candidate` langsung |
| Cek versi skill, drift router, deprecated | `seoboost-skill-ecosystem-audit` |
| Simpan state sesi sebelum fork atau /compact | `seoboost-fork-checkpoint` |

Dua audit itu saling melengkapi dan dijalankan berdampingan tiap bulan:
`seoboost-skill-ecosystem-audit` memeriksa kondisi luar (versi, router, deprecated),
skill ini memeriksa pelajaran dari dalam sesi.

## Kapan dipakai

- **Sprint close** — langkah panen di ritual `seoboost-sprint-close`.
- **Setelah `seoboost-fork-checkpoint` selesai** — checkpoint menulis entri 09; panen
  penuh terjadi di sini, di luar budget 10 menit checkpoint.
- **Bulanan** — berdampingan dengan `seoboost-skill-ecosystem-audit`.
- **Setelah insiden selesai** — akar masalah sudah ditemukan lewat
  `superpowers:systematic-debugging`, pelajarannya siap dipanen.
- **Saat operator mengoreksi cara kerja** — operator membetulkan bagaimana agent
  seharusnya bekerja; koreksi itu sumber panen langsung.

**Jangan dipakai:**
- Di tengah `seoboost-fork-checkpoint` — budget checkpoint < 10 menit; checkpoint cukup
  memastikan entri 09 tertulis, panen menunggu sprint close atau sesi khusus.
- Untuk temuan yang baru terjadi sekali dan tanpa dampak — biarkan di file 09 tanpa
  marker, tunggu kejadian kedua (lihat gerbang di bawah).
- Untuk menulis isi skill — itu kerja `seoboost-skill-updater` atau `writing-skills`.

## Di mana pelajaran menetap

Project klien memakai `agent-documentation/09-TEMUAN-EVALUASI-PROSES.md`. Repo yang
memakai ProjectDocs mode workstream tanpa `agent-documentation/` — `seoboost-skill-set`
sendiri termasuk — memakai `ProjectDocs/<workstream>/TEMUAN-PROSES.md`, satu berkas per
workstream, format entri sama: judul `## T-XXX`, baris `**Bukti:**`, baris `**Dampak:**`,
marker panen di akhir entri. Cek dulu bentuk repo-nya sebelum mencari berkas 09 yang
mungkin memang tidak ada; jangan membuat `agent-documentation/` hanya demi panen.

## Empat sumber panen

1. **Entri baru di berkas temuan** (`agent-documentation/09-TEMUAN-EVALUASI-PROSES.md`
   atau `ProjectDocs/<workstream>/TEMUAN-PROSES.md`, sesuai bentuk repo) — semua entri
   yang belum membawa marker `[dipanen → …]`. Checkpoint boleh menandai entri baru
   sebagai BELUM-dipanen; penanda itu hanya antrean, entri tetap diproses di sini.
2. **Koreksi operator dalam sesi** — sebelum diklasifikasi, tulis dulu entrinya ke
   file 09 dengan kutipan koreksi apa adanya, supaya jejaknya tidak hilang bersama
   context window. Baru kemudian dipanen seperti entri lain.
3. **Insiden yang akar masalahnya sudah ditemukan** — insiden yang masih misteri
   belum siap dipanen; selesaikan investigasinya dulu.
4. **Pola yang terbukti berhasil** — cara kerja yang dipakai berulang dengan hasil
   baik dan layak ditularkan ke project lain.

Lingkup default: file 09 project aktif. Pada panen bulanan, periksa juga project lain
yang disentuh sejak panen terakhir.

## Gerbang keras — berlaku sebelum rute apa pun

1. **Bukti wajib.** Tiap pelajaran harus menunjuk bukti: nomor entri 09, kutipan
   koreksi operator, path/commit/angka insiden. Pelajaran tanpa bukti tidak dirutekan.
2. **Satu kejadian belum pola.** Syarat rute: minimal 2 kejadian, atau 1 insiden
   berdampak (data hilang, klien terdampak, jam kerja terbuang menemukan ulang).
   Kejadian tunggal tanpa dampak tetap di file 09 tanpa marker — menunggu, tanpa biaya.
3. **Canon = proposal saja.** Perubahan `CLAUDE.md`, `SKILLS-SOP.md`, atau
   `seoboost-skill-router` HANYA boleh berupa proposal tertulis; keputusan di operator.
   Agent tidak mengedit ketiganya langsung, sekecil apa pun perubahannya.

## Langkah

1. **Kumpulkan.** Baca berkas temuan repo ini (lihat bagian "Di mana pelajaran menetap"),
   pisahkan entri ber-marker dari yang belum:
   ```bash
   grep -rn 'dipanen →' agent-documentation/09-TEMUAN-EVALUASI-PROSES.md \
     ProjectDocs/*/TEMUAN-PROSES.md 2>/dev/null
   ```
   Sisanya kandidat panen. Tambahkan koreksi operator sesi ini (tulis dulu ke berkas
   temuan), insiden yang selesai, dan pola berhasil.

2. **Klasifikasi.** Tiap pelajaran mendapat tepat satu kelas. "Mungkin" dilarang —
   aturan yang sama dengan `seoboost-skill-candidate`.

   | Kelas | Kriteria | Rute |
   |---|---|---|
   | perbaiki-skill-existing | Pelajaran memperkaya/mengoreksi skill yang sudah ada | `seoboost-skill-updater` |
   | kandidat-skill-baru | Teknik lintas-project, belum ada skill yang menampung | `seoboost-skill-candidate` (gate; boleh menolak) |
   | usulan-konvensi | Mengubah cara kerja lintas-project di canon | Proposal tertulis untuk operator |
   | memory-mesin | Fakta host/lingkungan yang perlu diingat lintas sesi | `agent-memory/` |
   | buang | Satu kejadian tanpa dampak, sudah tercakup, atau khas satu project | Marker + alasan singkat, selesai |

3. **Rutekan dan eksekusi.**
   - `seoboost-skill-updater`: jalankan sekarang untuk tiap pelajaran kelasnya — dia yang
     menyunting, sanitasi PII, dan propagasi; push tetap butuh izin operator (Iron Law #4).
   - `seoboost-skill-candidate`: jalankan gate-nya; verdict NO dari gate dicatat sebagai
     buang dengan alasan dari gate. Verdict YES lanjut ke `writing-skills`.
   - Usulan konvensi: tulis proposal (format di bawah) sebagai file di
     `proposals/` repo seoboost-skill-set — nama `YYYY-MM-DD-<slug>.md`, aturan di
     `proposals/README.md` — lalu sampaikan di laporan sesi. Tanpa keputusan
     operator, tidak ada yang berubah.
   - `agent-memory/`: catat faktanya, ikuti prosedur sync repo itu.

4. **Tandai.** Setelah rute selesai (atau proposal tertulis), tambahkan marker di
   akhir entri 09 yang diproses:
   ```
   [dipanen → <tujuan>, YYYY-MM-DD]
   ```
   Nilai `<tujuan>`: nama skill yang diperbarui (mis. `seoboost-gdrive`),
   `seoboost-skill-candidate`, `proposal <judul-singkat>`, `agent-memory`, atau
   `buang (<alasan singkat>)`. Isi entri tidak disunting dan tidak dihapus — marker
   ditambahkan, audit trail utuh. Entri ber-marker tidak dipanen ulang.

5. **Lapor ringkas.** Format di bawah. Nol panen dilaporkan sebagai nol — sesi yang
   berjalan mulus memang jarang meninggalkan pelajaran baru.

## Format laporan panen

```markdown
## Panen pelajaran — <DD MMM YYYY>

Sumber: 09 (<N> entri belum dipanen), koreksi operator (<N>), insiden (<N>), pola berhasil (<N>)

| Pelajaran | Bukti | Kelas | Rute | Status |
|---|---|---|---|---|
| <satu baris> | <entri 09 / kutipan / path> | perbaiki-skill-existing | seoboost-skill-updater → seoboost-gdrive | selesai |

Menunggu keputusan operator: <daftar proposal, atau "tidak ada">
Dibuang: <N> (alasan di marker masing-masing)
```

## Format proposal konvensi

```markdown
## Proposal konvensi — <judul singkat> (<DD MMM YYYY>)

**Masalah:** <apa yang berulang salah atau mahal; bukti: kejadian 1 (tanggal, project), kejadian 2 (…)>
**Usulan:** <file canon yang diubah + teks perubahan konkret>
**Dampak:** <apa yang berubah dalam cara kerja, siapa terpengaruh>
**Alternatif yang ditolak:** <1-2 baris>

Status: MENUNGGU KEPUTUSAN
```

## Anti-pattern

1. **Semua entri jadi kandidat skill baru** — gate `seoboost-skill-candidate` ada untuk
   menolak; verdict default di sana NO. Panen yang sehat menghasilkan lebih banyak
   perbaikan-skill-existing dan buang daripada skill baru.
2. **Mengedit canon langsung "karena perubahannya kecil"** — sekecil apa pun,
   canon lewat proposal.
3. **Marker mendahului eksekusi** — entri ditandai `dipanen → seoboost-skill-updater`
   padahal updater belum dijalankan; laporan jadi bohong. Tandai setelah selesai.
4. **Memanen ulang entri ber-marker** — buang waktu dan berisiko rute ganda.
5. **Panen di dalam fork-checkpoint** — checkpoint punya budget 10 menit untuk
   menyelamatkan state; panen punya waktunya sendiri.
6. **Menulis ulang atau menghapus entri 09 saat menandai** — record historis
   ditambahi marker, tidak diganti (Critical Don't #4 di CLAUDE.md).
7. **Menumpuk panen berbulan-bulan** — biaya klasifikasi naik dan konteks kejadian
   memudar; ritme pemicu ada supaya tiap panen kecil dan murah.
8. **Menganggap nol panen sebagai kegagalan** — memaksakan panen menghasilkan skill
   sampah yang mencemari namespace.

## Related Skills

- `seoboost-skill-updater` — lengan eksekusi: sunting skill existing + propagasi ke repo.
- `seoboost-skill-candidate` — gate skill baru (3 kriteria, default NO) → `writing-skills`.
- `seoboost-skill-ecosystem-audit` — kesehatan ekosistem dari luar (versi, drift,
  deprecated); pasangan bulanan skill ini.
- `seoboost-fork-checkpoint` — menulis/memverifikasi entri 09 saat boundary sesi; panen
  penuh terjadi di skill ini.
- `seoboost-sprint-close` — ritual tutup sprint yang memanggil skill ini sebagai langkah panen.
- `superpowers:systematic-debugging` — insiden siap dipanen setelah fase akar
  masalahnya selesai.

---
Dibuat 29 Agu 2026 via council review; direvisi 30 Agu 2026 dari panen pertamanya sendiri
(temuan T-005: berkas temuan untuk repo tanpa `agent-documentation/`).
