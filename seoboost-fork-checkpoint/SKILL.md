---
name: seoboost-fork-checkpoint
description: Use before forking session to a new Claude instance OR before /compact when working on a long-running SEO Boost project. Ensures all agent-documentation/ files reflect current state so the next agent can rebuild context without loss. Triggers when user says "aku mau fork", "session terlalu panjang", "context window penuh", "/compact", "save state", "checkpoint sebelum lanjut".
---

# SEO Boost Fork Checkpoint

## Overview

Sebelum fork ke session baru atau /compact, selamatkan state ke `agent-documentation/` supaya agent baru bisa pickup tanpa context loss. Battle-tested: agent fresh rebuild full context dalam ~30 menit, zero halu.

**Core principle:** `agent-documentation/` adalah source-of-truth. Agent baru harus bisa menjawab "apa yang selesai, apa yang sedang berjalan, apa berikutnya" hanya dari membaca file.

**Budget: checkpoint selesai < 10 menit.** Checklist yang lebih berat dari itu akan di-skip — dan checkpoint yang di-skip menyelamatkan nol. Tiap file cukup update minimum yang benar (1-5 baris), bukan tulis ulang.

## Pembagian Kerja dengan Fitur Native Claude Code

Claude Code sudah punya context summarization otomatis, memory directory persisten, dan `claude-mem`. Checkpoint ini BUKAN duplikasi — dia menutup persis yang fitur native TIDAK jamin:

| Fitur native menangkap | Hanya checkpoint ini yang menjamin |
|---|---|
| Alur kerja naratif, topik sesi | Quote literal klien (typo, emoji, kapitalisasi asli) |
| Ringkasan keputusan (parafrase) | D-XXX + timestamp + timezone + source channel |
| "Ada test yang jalan" | Angka aktual (mis. "99 LOLOS, 154 BELUM_LOLOS") + path output |
| — | State environment: docker, port listen, git branch/stash, pipeline yang masih jalan |
| — | Onboarding prompt lintas mesin / lintas instance |

**Jangan tulis ulang narasi sesi ke dokumentasi** — summarization native sudah mengurus itu. Seluruh budget 10 menit dipakai untuk kolom kanan.

**Recall tiers untuk agent berikutnya:**
1. `agent-documentation/` = SEO Boost source-of-truth.
2. `claude-mem` + `episodic-memory:search-conversations` = recall percakapan lintas-session.

Saat resume, search memory by topik terakhir DULU sebelum aksi (lihat "Auto-Restore Convention" di CLAUDE.md).

## Continuous Capture — Boundary Adalah Pertahanan Terakhir

Session bisa berakhir tidak mulus (Mac sleep, terminal ke-close, crash, OOM). Jadi **append ke `agent-documentation/` SAAT fakta durable muncul**, jangan tunggu boundary:
- Decision klien → `03-DECISIONS-LOG.md` saat itu juga (format D-XXX, cross-ref `seoboost-decision-tracking`)
- Blocker baru / resolved → `05-CURRENT-STATE.md`
- Temuan proses (insiden, near-miss, pola berhasil) → `09-TEMUAN-EVALUASI-PROSES.md`

Checklist di bawah lalu hanya **memverifikasi kelengkapan**, bukan merekonstruksi dari ingatan.

**Dedupe, jangan menumpuk** — update entry yang sudah ada untuk state yang masih berubah, jangan bikin near-duplicate. Tapi **JANGAN PERNAH overwrite decision yang sudah di-log** — record historis di-append/version, bukan diganti.

## When to Use

**Always sebelum:** fork ke instance baru, `/compact` di session panjang, closing hari dengan unfinished work, handover, pause project beberapa hari.

**Skip kalau:** session < 1 jam, project trivial tanpa multi-stakeholder, tidak ada decision/pivot di session.

## Checklist — Urutan Penyelamatan

Urutan berdasarkan **apa yang hilang permanen kalau tidak diselamatkan sekarang**. Pengalaman sesi 8+ jam (Klien B, 24+ decisions): yang paling sering terlewat justru quote yang hanya ada di context window — state file bisa direkonstruksi, quote tidak.

### A. Hilang permanen kalau tidak ditulis sekarang (KERJAKAN DULU)

**1. `03-DECISIONS-LOG.md`** — Aturan pemaksa: **hitung** berapa decision klien muncul di sesi ini, cocokkan dengan jumlah entry D-XXX baru. Selisih ≠ 0 → tulis dulu, jangan lanjut. Lengkapi juga D-XXX yang masih draft (section Implementasi kosong).

**2. `06-COMMUNICATION-LOG.md`** — Sama: hitung chat WA/email yang di-paste atau dibahas di sesi ini vs entry baru di log. Format lihat `seoboost-communication-log`.

### B. State terkini

**3. `05-CURRENT-STATE.md`** —
- TL;DR table status major task (✅ / 🟡 / ⏸)
- Active Blockers + Resolved Blockers, dengan angka aktual
- **Environment State** (WAJIB — lihat section berikut): docker, port, git, pipeline yang jalan

**4. `00-START-HERE.md`** —
- `Last updated: <timestamp + timezone>` + `Updated by: <label sesi>`
- TL;DR status terkini + **NEXT IMMEDIATE ACTION**
- Self-check: agent baru baca file ini, tahu harus apa dalam 5 menit?

### C. Handover

**5. `08-HANDOFF-CHECKLIST.md`** — State Saat Ini (✅/⏸), Priority 1/2/3 untuk agent berikutnya, pitfalls baru sesi ini.

**6. `PROGRESS.md`** (project root) — phase status, approval log, blockers sync dengan 05.

**7. `09-TEMUAN-EVALUASI-PROSES.md`** — insiden/near-miss/pola berhasil baru; temuan yang sudah selesai dicoret (strikethrough, jangan hapus — audit trail). Tiap entri baru diberi marker `[belum dipanen]` — cukup itu. Panen (klasifikasi + rute ke updater/candidate, marker berubah jadi `[dipanen → <tujuan>, YYYY-MM-DD]`) adalah kerja `seoboost-skill-evolution` saat sprint close atau sesi khusus; mengerjakannya saat checkpoint membakar budget 10 menit.

### D. Hanya kalau ada perubahan

`02-DOMAIN-KNOWLEDGE.md` (business rule berubah), `04-TECHNICAL-ARCHITECTURE.md` (stack/struktur), `07-SCHEMA-MIGRATION.md` (schema), custom docs.

### E. Hygiene direktori — cek cepat, bukan beres-beres

```bash
# berkas lepas di direktori masukan, dan direktori masukan tanpa README
find . -maxdepth 2 -path './from-*' -type f -not -name 'README.md' 2>/dev/null
for d in from-*/; do [ -d "$d" ] && { [ -f "$d/README.md" ] || echo "tanpa indeks: $d"; }; done

# berkas lepas di akar project — hanya README yang boleh berdiri sendiri
find . -maxdepth 1 -type f -not -name 'README.md' -not -name '.*' 2>/dev/null

# versi lama yang masih menumpuk di permukaan.
# Kuncinya slug DAN ekstensi. Satu dokumen boleh terbit beberapa bentuk pada versi yang sama
# — Matriks GAP terbit .pdf untuk dibaca dan .xlsx untuk diisi — dan mengabaikan ekstensinya
# membuat pasangan yang sah itu dilaporkan sebagai versi menumpuk. Ketahuan saat uji checkpoint
# 1 Sep 2026: enam laporan, keenamnya positif palsu.
find ProjectDocs/output -maxdepth 2 -type f -name '*_v[0-9]*' -not -path '*/arsip/*' 2>/dev/null \
  | sed -E 's|(.*)/(.+)_v[0-9]+\.[0-9]+_[0-9-]+\.([a-z]+)$|\1 \2 \3|' \
  | sort | uniq -c | awk '$1>1'

# sisa berkas antara: .html yang tertinggal di samping PDF-nya
find ProjectDocs/output -name '*.html' -not -path '*/arsip/*' 2>/dev/null

# akar tiap arsip/ hanya boleh berisi map — berkas yang berdiri di sana tidak akan pernah
# dirapikan sendiri oleh alat perapian, sebab alat itu hanya mengenali nama berpola versi
# ditulis tanpa $1 dengan sengaja: penanda posisi seperti $1 di dalam berkas skill ikut
# tersubstitusi oleh argumen saat skill dipanggil, dan perintah yang tersalin dari tampilannya
# menjadi rusak tanpa terlihat rusak
find ProjectDocs/output -type d -name arsip | while read -r a; do
  find "$a" -maxdepth 1 -type f
done
```

**Tiga aturan tata letak, ditetapkan operator 1 September 2026.** Sasarannya satu: operator dapat
menemukan berkas tanpa bertanya.

1. **Tidak ada berkas berdiri sendiri di luar direktori, kecuali `README.md`.** Berlaku di akar
   project dan di tiap direktori keluaran. Berkas lepas memaksa operator memindai, bukan menuju.

2. **Direktori yang memuat dokumen berversi wajib punya `arsip/` sendiri.** Bukan satu arsip
   terpusat di akar: arsipnya menempel pada direktori dokumennya, supaya yang mencari versi lama
   sebuah dokumen mencarinya di tempat dokumen itu berada. Hanya versi tertinggi tiap dokumen yang
   berdiri di permukaan; sisanya turun ke `arsip/`.

3. **Isi `arsip/` juga ditata, tidak boleh menjadi tong.** Kelompokkan **per dokumen** —
   `arsip/<slug>/<berkas>` — sebab pertanyaan yang paling sering muncul adalah "versi lama dokumen
   ini yang mana", bukan "apa saja yang terbit bulan lalu". Nama berkas sudah memuat versi dan
   tanggal, jadi urutannya jatuh dengan sendirinya di dalam map. Untuk direktori yang isinya
   dokumen sekali terbit dan tidak berseri, pengelompokan per bulan (`arsip/YYYY-MM/`) lebih masuk
   akal; pilih satu dan pakai seragam dalam satu direktori.

4. **Akar `arsip/` sendiri hanya berisi map, tidak ada satu berkas pun berdiri di sana.**
   Aturan ini menutup celah yang lahir dari aturan 3: alat perapian mengelompokkan berkas yang
   namanya berpola versi, dan berkas yang namanya TIDAK berpola versi dibiarkan di tempatnya —
   yaitu menganggur di akar arsip, selamanya, tanpa ada yang menandai. Arsip yang dirapikan lalu
   pelan-pelan menjadi tong lagi dari pintu belakang.

   Berkas yang mendarat di akar arsip selalu berarti salah satu dari dua hal, dan keduanya
   diperbaiki di pangkalnya, bukan dengan memindahkan berkasnya:

   - **Namanya tidak berpola versi.** Perbaiki penamaannya di pembangun yang menerbitkannya,
     supaya terbitan berikutnya masuk pola. Lihat `seoboost-versioned-output`.
   - **Ia memang bukan berkas terbitan** — berkas antara, draf, atau berkas sumber yang
     tersesat. Tempatnya bukan di arsip sama sekali.

Contoh yang benar:

```
ProjectDocs/output/05-correspondence/
├── README.md                                  ← satu-satunya berkas yang boleh berdiri sendiri
├── Matriks-GAP_KLIEN-A_KLIEN A/
│   ├── ..._v5.5_2026-08-31.pdf                ← versi tertinggi tiap ekstensi, di permukaan
│   ├── ..._v5.5_2026-08-31.xlsx
│   └── arsip/
│       ├── ..._v4.4_2026-08-26.pdf            ← terurut menurut namanya, yang memuat versi
│       └── ..._v5.4_2026-08-31.pdf
└── Status-Proyek_KLIEN-A_KLIEN A/
    ├── ..._v4.1_2026-08-31.pdf
    └── arsip/
        └── ..._v4.0_2026-08-31.pdf
```

**Aturannya berulang dan seragam.** Direktori MANA PUN yang memuat berkas berversi mendapat
submap per dokumen, jadi susunan bermakna yang sudah ada tetap hidup:
`06-sop/per-stakeholder/Klien A SOP/<Nama-SOP>/` dengan arsipnya sendiri di dalamnya.

**Perapian dijalankan alat permanen, bukan skrip sekali pakai.** Nyata dan mahal: 1 September
2026 skrip perapian ditulis ke direktori sementara, dipakai sekali untuk mengarsipkan 1.462
berkas, lalu hilang saat mesin dimulai ulang beberapa jam kemudian. Sore harinya versi lama
menumpuk lagi dan operator menghadapi kekacauan yang sama dua kali dalam satu hari. Perapian
versi terjadi setiap kali dokumen dibangun ulang, yaitu beberapa kali sehari pada sesi sibuk —
itu alat, bukan tindakan sekali jalan. Tempatnya di repo bersama berkas pembangun, dengan mode
uji kering (`--kering`) supaya dapat dilihat dampaknya sebelum berkas berpindah.

**Penjaga terbitan wajib ikut membaca `arsip/`.** Sesudah versi lama turun ke arsip, penjaga yang
hanya memeriksa permukaan akan menganggap nomor versi itu bebas dan membiarkannya dipakai ulang.
Nomor versi yang pernah terbit melekat selamanya, termasuk sesudah berkasnya diarsipkan.

Bersih → lanjut. Kotor dan budget habis → **catat sebagai priority di 08**, jangan bakar waktu checkpoint untuk merapikan. Saat merapikan (di luar checkpoint), aturan tetap:
1. **Berkas masuk tidak pernah diganti namanya** — nama asli (termasuk typo) adalah jejak ke percakapan asalnya; yang dirapikan penempatan mapnya.
2. Duplikat persis: buang byte-nya (verifikasi md5), **catat faktanya** di README direktori asal.
3. Berkas asli diarsipkan ke `arsip/`, bukan dihapus.
4. Sebelum memindahkan apa pun: `grep -rn '<path-lama>' ProjectDocs --include='*.md'` — pindah tanpa update rujukan = dokumentasi menunjuk ruang kosong tanpa ada yang gagal.
5. **Periksa juga jalur relatif DI DALAM berkas yang dipindahkan**, bukan hanya rujukan dari luar ke
   berkas itu. Nyata: dua log dipindahkan antar-akar dengan checksum diverifikasi utuh, tetapi isinya
   memuat puluhan jalur relatif (`deliverables/...`, `dokumen-referensi/...`) yang berpangkal ke
   direktori lama. Sesudah pindah, jalur itu menunjuk ruang kosong. Tidak ada yang gagal, tidak ada
   pesan galat, dan ketahuannya baru saat pemeriksaan rujukan mati di checkpoint berikutnya.
   Berkas yang memuat banyak jalur relatif **diberi penanda pangkal di kepalanya** saat dipindahkan:
   *"Jalur relatif di entri X sampai Y berpangkal ke `<direktori lama>`."* Itu lebih aman daripada
   menyunting puluhan entri catatan historis.
6. **Sesudah mengganti nama direktori: bangun ulang, lalu HITUNG berkasnya.** Pencarian teks atas
   jalur tidak dapat menemukan nama yang **dirakit saat build**. Nyata (KLIEN A, 2 Sep 2026):
   55 rujukan jalur ditemukan dan diperbarui, terasa lengkap, tetapi `sop-doc-engine.mjs` merakit
   nama direktori dari medan `unit` lewat template literal, dan pembangun bagan merakitnya dari
   `Arus ` ditambah nama bagan. Keduanya tidak memuat untai yang dapat dicari sebagai jalur.
   Pembangunan ulang berikutnya membuat **36 berkas kembar** di direktori bernama lama, tanpa satu
   pun pesan galat — dari sudut pandang pembangun, ia berhasil. Yang membongkarnya cuma hitungan:
   jumlah SOP melonjak dari 43 menjadi 79.
7. **Daftar TOLAK diperiksa terpisah dari daftar BACA.** Nama direktori di dalam penjaga keamanan
   tidak dipakai untuk membaca berkas, melainkan untuk **menolaknya**. Membiarkannya menunjuk nama
   lama tidak membuat apa pun gagal; ia hanya berhenti menolak. Nyata: skrip unggah Drive memuat
   daftar `TERLARANG_JALUR` berisi nama direktori catatan internal, penjaga yang menahannya agar
   tidak ikut terunggah ke folder yang dibaca klien. Kalau baris itu tidak ikut diganti, catatan
   internal akan terunggah dan tidak ada satu pun tanda bahwa itu terjadi. Sapu polanya:

   ```bash
   grep -rniE 'terlarang|excluded?|skip|ignore|deny|blocklist|blacklist' <direktori kode>
   ```

   lalu cocokkan tiap nilainya dengan nama baru.
8. **Sebelum menghapus direktori kembar, buktikan padanannya ada — dan jangan pakai md5.** PDF
   menyimpan waktu pembuatan, sehingga hasil build ulang selalu beda byte walau isinya sama. Yang
   menjawabnya dalam satu perintah: cocokkan **nama berkas beserta nomor versinya**.

> Ketiga butir di atas berbagi satu sebab: alat ukurnya melapor berhasil sambil mengukur hal yang
> salah — pencarian teks tidak melihat nama yang dirakit saat build, daftar tolak berhenti menolak
> tanpa galat, md5 selalu berbeda pada PDF. Alasan umumnya ada di `seoboost-verification-instruments`
> (bagian "Hiding a dead layer"); langkah kerjanya tinggal di sini, tempat perapian benar-benar
> terjadi.

## Environment & Git State (WAJIB tercatat di 05)

Failure mode nyata saat fork: agent baru kill server yang sedang di-tes klien, tidak tahu ada uncommitted changes di worktree, atau menunggu pipeline yang sebenarnya sudah mati. Jalankan dan tulis ringkasannya ke section "Environment State" di `05-CURRENT-STATE.md`:

```bash
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
lsof -iTCP -sTCP:LISTEN -P | grep -v '^COMMAND' | awk '{print $1, $9}' | sort -u
git status -sb && git stash list && git log --oneline -3
```

Yang wajib tertulis:
- Container/server yang **harus tetap hidup** vs yang boleh/harus di-kill (+ port)
- Branch aktif + uncommitted changes + stash (kalau ada: kenapa belum di-commit)
- Pipeline/job yang masih jalan: apa, sejak kapan, perkiraan selesai, output ke mana

## Verifikasi — Bukti, Bukan Perasaan

```bash
# tanggal harus HARI INI, bukan stale
grep "Last updated" agent-documentation/00-START-HERE.md

# jumlah entry decision — cocokkan dengan hitungan sesi (langkah A.1)
grep -c '^## D-' agent-documentation/03-DECISIONS-LOG.md

# placeholder yang belum diisi = checkpoint belum selesai
grep -rn "D-XXX\|<timestamp>\|<isi di sini>" agent-documentation/
```

Setiap path yang dirujuk dokumentasi harus benar-benar ada. Nol rujukan mati, bukan "kelihatannya sudah benar".

## Generate Onboarding Prompt

```
Lanjutkan project <Project Name> untuk <Klien>.

Working directory:
<absolute path>

Tolong lakukan urutan berikut sebelum aksi apapun:
1. Baca agent-documentation/00-START-HERE.md (entry point)
2. Baca agent-documentation/05-CURRENT-STATE.md (status, blocker, environment state)
3. Baca agent-documentation/06-COMMUNICATION-LOG.md (konteks WA terbaru)
4. Baca agent-documentation/08-HANDOFF-CHECKLIST.md (action items prioritized)

Status singkat:
- <bullet status pipeline / progress, dengan angka>
- <output location>

STATUS SAAT INI: <STANDBY/IN PROGRESS/BLOCKED> menunggu <X>

Konvensi penting:
- <sapaan klien> / <naming> / <hindari emoji> / <stack & env vars>

Setelah baca dokumentasi, lapor balik konfirmasi pemahaman sebelum lanjut aksi.
```

Harus specific: path absolute, status nyata, angka nyata. Lalu lapor ke user: file yang ter-update (path), onboarding prompt siap copy-paste, area yang perlu manual verify.

## /compact vs Fork

- **Fork** kalau: session > 6 jam, banyak decision dengan quote, > 100 messages teknis kompleks, atau user ragu halu. Fork = agent baru rebuild dari file — risk rendah kalau dokumentasi solid.
- **`/compact` OK** untuk session pendek-sedang yang mostly high-level. Ingat: compact = summary = parafrase; quote literal dan angka hanya selamat kalau sudah di file.

## Checkpoint vs `seoboost-sprint-close`

- **Checkpoint (skill ini):** selamatkan konteks sesi — quote, decision, state — sebelum fork, /compact, atau sesi berhenti. Sprint boleh masih setengah jalan.
- **`seoboost-sprint-close`:** ritual bukti tutup sprint (audit fresh, CI, nama tahap) sesuai Sprint Completion Reporting Convention. Trigger: "sprint X selesai", "tutup sprint".
- Sprint tutup DAN sesi berakhir → jalankan `seoboost-sprint-close` dulu; ritual itu memanggil checkpoint ini di akhirnya.

## Anti-Patterns

1. ❌ **Mengandalkan auto-summary / memory native untuk quote & angka** — summarization mem-parafrase; quote literal klien dan angka aktual hanya selamat di `agent-documentation/`
2. ❌ **Skip update karena "minor session"** — ada decision baru = wajib tulis, walau 1 baris
3. ❌ **Fork tanpa update dokumentasi dulu** — defeats purpose
4. ❌ **Fork tanpa mencatat environment state** — agent baru kill server yang salah, atau kehilangan uncommitted work
5. ❌ **Update state duluan, quote belakangan** — kalau session mati di tengah checkpoint, yang hilang justru yang tak bisa direkonstruksi. Urutan penyelamatan: A dulu
6. ❌ **Lupa timestamp `Last updated`** — agent baru tidak tahu file fresh atau stale
7. ❌ **Onboarding prompt generic** — tanpa path absolute dan status nyata, sama dengan tidak ada
8. ❌ **Checkpoint molor > 10 menit karena beres-beres direktori** — hygiene penuh bukan tugas checkpoint; catat ke 08
9. ❌ **Mengganti nama berkas masuk supaya "seragam"** — memutus jejak ke percakapan asalnya
10. ❌ **Memindahkan berkas tanpa memperbarui rujukannya** — tidak ada yang gagal, jadi tidak ketahuan

## Self-Check Final

- ☐ Jumlah decision sesi = jumlah entry D-XXX baru di `03`? Chat sesi = entry baru di `06`?
- ☐ `05` reflect angka aktual + blocker + **environment state** (docker/port/git/pipeline)?
- ☐ Project multi-workstream: **sebut workstream mana yang statusnya kamu simpan**, dan
  simpan ke `05` workstream itu, bukan ke `05` akar. `05` akar meringkas lintas workstream
  dan menunjuk, tidak menyalin. Rujukan keputusan ditulis lengkap dengan nama workstream-nya.
- ☐ `00` timestamp hari ini + NEXT IMMEDIATE ACTION?
- ☐ `08` priority list + `PROGRESS.md` sync + `09` temuan sesi tercatat ber-marker `[belum dipanen]`?
- ☐ Nol placeholder tersisa, nol rujukan path mati?
- ☐ Linter ProjectDocs 0 error? `node <repo seoboost-skill-set>/automation/projectdocs-lint.mjs
  ProjectDocs` (contoh di M4: `~/.claude/seoboost-skill-set/automation/projectdocs-lint.mjs`;
  lokasi clone bisa berbeda per mesin; tanpa `--full` bila project memakai mode
  workstream). Jalan beberapa detik saja — muat di budget 10 menit.
- ☐ Onboarding prompt generated, specific, siap copy-paste?

Semua ✅ → fork/compact aman.

## Trigger Phrases yang Match Skill Ini

- "aku mau fork session" / "context window terlalu penuh" / "/compact aman tidak?"
- "save state sebelum [X]" / "checkpoint dokumentasi" / "siapkan handover"
- "sebelum lanjut, update dokumentasi"

## Related Skills

- `seoboost-communication-log` — format timeline chat
- `seoboost-decision-tracking` — format D-XXX
- `seoboost-project-onboarding` — kalau session baru = project baru (bukan continuation)
- `seoboost-skill-evolution` — memanen entri 09 (klasifikasi, lalu rute ke `seoboost-skill-updater`/`seoboost-skill-candidate`); jalan saat sprint close, bulanan, atau sesi khusus — di luar budget checkpoint
- `seoboost-sprint-close` — ritual tutup sprint; biasanya memanggil checkpoint ini di akhir sesi
- `seoboost-workplan` — kalau sesi jalan di bawah `WORKPLAN.md`, jangan rekonstruksi status tugasnya: salin dari §2 kontrak itu ke `05-CURRENT-STATE.md` (kriteria sudah bertanda LULUS/BELUM/TERHALANG). Workplan memegang kontrak SATU tugas dan tidak menggantikan checkpoint — decision klien, percakapan, status tugas lain, dan onboarding prompt tetap tanggung jawab checkpoint ini.

---
Direvisi 28 Agu 2026 via council review; direvisi 29 Agu 2026 via council review (wave 2); direvisi 29 Agu 2026 (wave 4).
Direvisi 2 Sep 2026 dari panen KLIEN A (A50): tiga jebakan ganti nama direktori — nama yang
dirakit saat build, nama di dalam penjaga keamanan yang berhenti menolak, dan pembuktian
padanan sebelum menghapus kembaran.
