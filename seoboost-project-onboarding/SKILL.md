---
name: seoboost-project-onboarding
description: Use when starting a new project for SEO Boost clients (especially with Indonesian stakeholders) to set up structured documentation skeleton in the visible ProjectDocs/ folder, or when migrating legacy .implementation-plan/ docs to ProjectDocs/. Triggers when user mentions starting verification/automation/data project, says "new project", "buat project baru", "migrasi ke ProjectDocs", or asks to organize implementation plan with comprehensive agent handover support.
---

# SEO Boost Project Onboarding

## Overview

Setup skeleton dokumentasi di `ProjectDocs/` (folder VISIBLE di root project) dengan dua
pembaca sekaligus: **agent baru** harus bisa rebuild context dalam 30-60 menit reading
time tanpa halusinasi, dan **klien non-teknis** harus bisa browse status project via
Finder/Drive. Battle-tested di project klien SEO Boost (8+ jam session, 24+ decisions, fork
tanpa context loss).

**Pembagian peran dengan skill natif harness (jangan duplikasi):**
- Menyusun & mengeksekusi implementation plan → `superpowers:brainstorming` →
  `superpowers:writing-plans` → `superpowers:executing-plans`. Skill ini TIDAK mengatur
  cara menulis plan.
- Skill ini hanya memuat yang khas SEO Boost: konvensi `ProjectDocs/` (25 Jul 2026),
  10 file `agent-documentation/`, decision log `D-XXX`, comm log, lane source-code/output.
- Plan hasil `writing-plans` disimpan di `ProjectDocs/plans/YYYY-MM-DD-<slug>.md` —
  filename ini jadi sumber derivasi nama Sprint (Sprint Completion Convention, CLAUDE.md
  global). Project ber-sprint menutup tiap sprint via ritual `seoboost-sprint-close`.
- `ProjectDocs/` = source-of-truth lintas agent & mesin (ikut repo project). Memory
  directory harness itu per-user — JANGAN simpan state project di sana.

## Konvensi Folder (sejak 25 Jul 2026)

`ProjectDocs/` visible di root project menggantikan `.implementation-plan/` hidden
(ditetapkan operator, 25 Jul 2026, sesi Bali Kerthi Byomantara: folder hidden tak terlihat
klien/tim non-teknis di Finder/Drive). Multi-workstream: `ProjectDocs/<workstream>/`.

**Project lama yang masih `.implementation-plan/`:** migrasi zero-loss pakai
`PROMPT-MIGRASI-PROJECTDOCS.md` di root clone `seoboost-skill-set` (mv/git mv bukan
copy+delete, verifikasi file count + size, koreksi hanya referensi load-bearing,
dokumen historis JANGAN di-rewrite).

## When to Use

**Always:** project baru dengan klien external; plan yang span multiple sessions;
multi-stakeholder communication (WA group, email); butuh decision audit trail.

**Skip:** quick script one-off (< 1 jam, tidak dijalankan ulang); throwaway experiment.

**Internal tooling (BUKAN skip):** doc-skeleton penuh boleh dilewati, TAPI section
"Source Code & Output Lanes" tetap berlaku, dan kalau lolos ambang reuse → catalog via
`seoboost-cross-project-reuse`.

## Folder Structure

```
ProjectDocs/
├── agent-documentation/          ← MANDATORY agent handover docs
│   ├── 00-START-HERE.md          ← Entry point, "Last updated" timestamp
│   ├── 01-CONTEXT-PROJECT.md     ← Stakeholder, business goal, persona
│   ├── 02-DOMAIN-KNOWLEDGE.md    ← Domain rules, business logic spec
│   ├── 03-DECISIONS-LOG.md       ← D-001+ format dengan quote literal
│   ├── 04-TECHNICAL-ARCHITECTURE.md  ← Stack + PETA ENVIRONMENT (lihat template)
│   ├── 05-CURRENT-STATE.md       ← TL;DR status + active blockers
│   ├── 06-COMMUNICATION-LOG.md   ← Timeline percakapan klien
│   ├── 07-SCHEMA-MIGRATION.md    ← HANYA kalau project punya data schema (lazy)
│   ├── 08-HANDOFF-CHECKLIST.md   ← Actionable next steps prioritized
│   └── 09-TEMUAN-EVALUASI-PROSES.md  ← Temuan proses/teknis/reporting
├── plans/                        ← output superpowers:writing-plans (lazy, saat plan pertama)
├── PROGRESS.md                   ← Phase tracking dengan tabel status per task
├── README.md                     ← Klien-facing overview (template di bawah)
├── CHANGELOG.md                  ← Document/release versioning history
├── build/                        ← doc-builder (build-<doc>.mjs) — WRITE ke output/<tipe>/
├── output/                       ← deliverable klien — PER-TIPE, JANGAN flat
│   ├── README.md                 ← index: AKTIF / DIGANTIKAN
│   ├── 01-discovery/ … 05-correspondence/  ← folder tipe lahir saat dokumen pertama
│   └── assets/                   ← diagram, gambar (BUKAN dokumen utama)
├── scripts/                      ← SOURCE CODE lane (lazy: hanya kalau ada script)
│   ├── src/  data/  out/         ← kode / input (di-commit) / generated (GITIGNORED)
│   └── requirements.txt, README.md, .gitignore  ← saat lolos ambang reuse
└── <workstream>/                 ← workstream tambahan
```

> **Output WAJIB per-tipe** begitu ada ≥2 jenis dokumen — lihat `seoboost-versioned-output`
> Scenario 5. Build script formal-docs HARUS tulis ke `output/<tipe>/`.

**Lazy creation berlaku umum: file/folder optional yang ABSEN = state valid.** Hanya
`agent-documentation/` (minus 07), `PROGRESS.md`, `README.md`, `CHANGELOG.md`, dan
`output/` yang lahir saat skeleton. Jangan bikin file/folder kosong demi "lengkap".

## Project multi-workstream

Satu hubungan klien sering memuat lebih dari satu badan kerja: edisi acara yang berulang
tiap tahun, produk yang dibangun terpisah, atau bidang seperti legal dan riset. Jangan
memaksakan semuanya ke satu `05-CURRENT-STATE` dan satu `PROGRESS.md`. Bentuknya bertingkat.

| Tinggal di tulang punggung `agent-documentation/` akar | Tinggal di tiap `<workstream>/` |
|---|---|
| `01` konteks klien, `02` domain, `04` arsitektur | `README.md` dan `PROGRESS.md`, **wajib** |
| `06` log komunikasi (satu grup WA, satu kronologi) | `output/` deliverable workstream itu |
| `09` temuan proses lintas workstream | `agent-documentation/` sendiri bila memang perlu |
| `03` keputusan tingkat project, awalan **`DP-XXX`** | `03` keputusan lokal, awalan `D-XXX` |
| `00` yang **merutekan** ke workstream aktif, bukan menyalin isinya | `05` status workstream itu |

Empat aturan yang menahan bentuk ini supaya tidak berantakan:

1. **Rujukan keputusan wajib menyebut workstream.** `D-081` di satu workstream adalah
   keputusan yang sama sekali berbeda dari `D-081` di workstream lain. Tulis
   `D-081 (program-b-2026-verification)`, jangan nomor telanjang.
2. **`agent-documentation` workstream isinya lazy.** Hanya berkas yang benar-benar dipakai.
   Linter tidak menuntut daftar wajib di situ, tetapi larangan awalan dobel tetap berlaku.
3. **`ProjectDocs` tidak pernah bersarang di dalam `ProjectDocs`.** Yang bertingkat adalah
   `agent-documentation`. Nama yang sama di dua tingkat memaksa manusia dan alat menebak.
4. **Workstream lahir dengan README dan PROGRESS, sejak hari pertama.** Menambahkannya
   belakangan berarti berbulan-bulan tanpa ada yang tahu isi direktori itu apa.

Ditetapkan 2 Sep 2026 dari bentuk nyata yang sudah berjalan di project Klien B. Konvensi penuh
ada di `CLAUDE.md` bagian Project Setup Convention butir 4.

## Source Code & Output Lanes (WAJIB)

**Aturan tulang punggung (satu kalimat, load-bearing):**

> **Script tidak pernah satu folder dengan data yang dibacanya atau file yang
> dihasilkannya.** Kode di `scripts/src/`, input di `scripts/data/`, output klien di
> `output/`, artefak buangan di `scripts/out/` (gitignored). Kalau satu folder berisi
> `.py` di sebelah `.json` di sebelah `.docx` — itu SALAH.

**Dua lane, dibedakan by PERAN bukan bahasa:** `build/` = doc-builder yang hasilnya
deliverable versioned → `output/<tipe>/`; `scripts/` = pipeline data yang hasilnya
intermediate regenerable → `scripts/out/`.

**Aturan penempatan 4-kata** (taruh di puncak `README.md` project):

```
kode→scripts/ · input→data/ · hasil→output/ · junk→cache/(gitignored)
```

**`.gitignore` ikut skeleton** (cache di-ignore SEBELUM pernah dibuat):
`__pycache__/`, `*.pyc`, `.venv/`, `venv/`, `scripts/out/`, `.DS_Store`.
`scripts/data/` DI-COMMIT (input); `scripts/out/` TIDAK (regenerable).

**Birth-liftable (thresholded):** `README.md` + entry point + `requirements.txt` di
`scripts/` hanya WAJIB saat script lintas ambang reuse (`seoboost-cross-project-reuse`).
Script sekali-pakai 20-baris tidak butuh README; cataloguing = birth event README.
Script rapi + liftable = kandidat pustaka tool internal SEO Boost.

## Bootstrap Steps

### Step 1: Get Required Info from User

Tanya concise (jangan asumsi): (1) project name slug; (2) nama klien + organisasi +
role; (3) kanal komunikasi klien (WA group mana? email siapa?) dan mana kanal untuk
laporan resmi; (4) ritme laporan ke klien (mingguan? per milestone? hanya saat
diminta?) — kesepakatan ritme dicatat sebagai decision di `03`, eksekusinya via
`seoboost-laporan-klien`; (5) project pakai sprint? (ya → tutup tiap sprint via
`seoboost-sprint-close`); (6) deadline keras?; (7) bahasa dokumentasi; (8) stack
indicative. Kalau user tidak detail → default reasonable + minta konfirmasi.

### Step 2: Create Structure

```bash
mkdir -p ProjectDocs/agent-documentation
```

### Step 3: Generate Skeleton Files

**Aturan anti-placeholder (load-bearing):** setiap file skeleton WAJIB memuat minimal
satu fakta konkret dari Step 1 — nama klien real, channel real, tanggal real, goal
real. `[Klien Name]`, `<TBD>`, atau "(akan diisi)" tanpa konteks konkret di sebelahnya
= skeleton GAGAL. Placeholder hanya sah untuk data yang memang belum ada, dan harus
menyebut dari mana ia akan diisi (mis. "menunggu spec dari narahubung klien via WA group X").

**00-START-HERE.md** wajib include: "Last updated" timestamp (+timezone), Quick Summary
TL;DR (klien + task + status), reading order semua file dengan estimasi waktu, critical
constraints, key files & locations, **Next immediate action**, anti-patterns project ini.

**README.md (ProjectDocs root — klien bisa baca, ragam konsultan):** nama project,
klien + organisasi, tujuan bisnis 1 paragraf, peta folder 1 baris per folder, tanggal
mulai, kontak SEO Boost. Ini file pertama yang dilihat klien via Finder/Drive.

**03-DECISIONS-LOG.md** — embed format supaya decision pertama tidak perlu lookup:

```markdown
# 03 — Decisions Log

Keputusan resmi dari <nama klien real> dengan timestamp dan source. Format:

## D-XXX — <Title> (<DD MMM YYYY HH:MM WIB/WITA/WIT>)
**Source:** <channel + sender>
> "<quote literal — preserve typo, emoji, capitalization>"
**Konteks:** … / **Decision:** … / **Implementasi:** …

Sequential D-001+, never reuse. Detail: skill `seoboost-decision-tracking`.
```

**04-TECHNICAL-ARCHITECTURE.md** — WAJIB berisi **peta environment & run** (bagian yang
paling sering bikin agent resume halusinasi kalau kosong): repo path + branch mapping
(branch → environment → URL), run command + port per service, lokasi `.env`/secret
(**referensi lokasi saja, JANGAN isinya**), external services + akun yang dipakai,
baru kemudian stack & code organization.

**05-CURRENT-STATE.md:** `**Last sync:** <timestamp+tz>` + tabel TL;DR status + section
Active Blockers. Kalau plan sedang berjalan: link ke `plans/<file>` + posisi batch —
jangan salin isi plan ke sini.

**06-COMMUNICATION-LOG.md:** header "Timeline percakapan dengan <klien>. Chronological
ascending (terbaru di bawah)." — isi via `seoboost-communication-log`. Laporan status keluar
ke klien (ritme sesuai kesepakatan kickoff) disusun via `seoboost-laporan-klien`, yang
setelah terkirim mencatatkannya juga ke file ini.

**08-HANDOFF-CHECKLIST.md:** (1) next actions ter-prioritas dengan konteks kenapa;
(2) "JANGAN lakukan" list (jebakan yang sudah diketahui); (3) pertanyaan terbuka ke
klien yang menunggu jawaban.

**09-TEMUAN-EVALUASI-PROSES.md:** section A Temuan Proses / B Teknis / C Cara Melapor /
D Yang Sudah Bekerja Baik / E Usulan Project Berikutnya / F Catatan Terbuka. Diisi SAAT
temuan muncul, bukan akhir project. `seoboost-skill-evolution` memanen entri file ini
(saat sprint close / sesi khusus) dan merutekannya — antara lain ke
`seoboost-skill-candidate` untuk temuan matang lintas-project.

**Marker panen, tulis sejak entri pertama.** Tiap entri baru diakhiri `[belum dipanen]`.
Penanda itu antrean, bukan hiasan: `seoboost-fork-checkpoint` memverifikasinya di Self-Check,
dan panen mengubahnya jadi `[dipanen → <tujuan>, YYYY-MM-DD]` setelah rutenya selesai.
Isi entri tidak pernah disunting saat ditandai, marker hanya ditambahkan. Berkas yang
lahir tanpa konvensi ini memaksa panen berikutnya menebak mana yang sudah diproses.
Sertakan satu kalimat aturan itu di header file supaya penulis entri berikutnya melihatnya
tanpa membuka skill mana pun.

### Step 4: PROGRESS.md, CHANGELOG.md

PROGRESS.md pakai phase structure dengan tabel `| Task | Status | Tanggal | Catatan |`
per Phase, mulai dari `Phase 0 — Persiapan & Approval`.

### Step 5: Verify, lalu lapor

Fresh evidence (verification-before-completion): `ls -la ProjectDocs/
ProjectDocs/agent-documentation/` + pastikan tiap file non-empty dan lolos aturan
anti-placeholder. Jalankan juga linter ProjectDocs:
`node <repo seoboost-skill-set>/automation/projectdocs-lint.mjs ProjectDocs --full`
(contoh di M4: `~/.claude/seoboost-skill-set/automation/projectdocs-lint.mjs`; lokasi clone
bisa berbeda per mesin). Skeleton belum boleh dilaporkan jadi sebelum linter 0 error.
Lapor: path file dibuat (dengan count), yang masih menunggu konteks
(+ dari mana akan diisi), action item pertama.

## Handover Fidelity Rules

- **Kontrak freshness:** `00` dan `05` membawa timestamp. Saat resume, kalau timestamp
  lebih tua dari aktivitas terakhir (git log, mtime file lain) → verify state real dulu
  (`git log`, `docker ps`, `lsof`) SEBELUM percaya isi doc. Doc basi yang dipercaya
  mentah = sumber halusinasi #1.
- **No secrets:** `ProjectDocs/` ikut repo dan bisa dibaca klien. Credential, token,
  schema rahasia → referensi lokasi saja (mis. "`.env` di root BE, template di
  `.env.example`").
- **Update ritmis:** decision → `03` saat itu juga (`seoboost-decision-tracking`); chat →
  `06` (`seoboost-communication-log`); laporan keluar sesuai ritme kickoff →
  `seoboost-laporan-klien`; sprint selesai → `seoboost-sprint-close` (di dalamnya panen
  pelajaran via `seoboost-skill-evolution`); pre-fork/pre-compact → `seoboost-fork-checkpoint`
  (update 00/03/05/06/08/09 + PROGRESS).

## Naming & Bahasa

- Docs: numbered prefix `00-…` untuk urutan baca. Output klien: `<Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.{ext}` (`seoboost-versioned-output`).
- Konvensi klien Indonesia: "Salam Sehat", "Ibu/Bapak <Nama Depan>" (bukan "Bu/Pak"),
  tanpa emoji, tone formal-friendly.
- **Lapisan `seoboost-tulis-indonesia` + `seoboost-bahasa-jernih` wajib** untuk isi ProjectDocs —
  skeleton hidup berbulan-bulan dan jadi bahan mentah dokumen berlogo; kalke dan pola
  mesin dari hari pertama ikut terbawa. Contoh pola yang paling sering lolos ada di
  katalog buru-dan-ganti `seoboost-bahasa-jernih` — jalankan sapuannya pada isi skeleton.
- Ragam: ProjectDocs internal = curah gagasan (fragmen boleh, spekulasi ditandai);
  README + dokumen keluar = ragam konsultan. Konvensi istilah klien (`seoboost-formal-docs`)
  berlaku saat isi diangkat jadi dokumen berlogo.

## Anti-Patterns (Never Do)

1. Skip dokumentasi karena "task simple" — sering balik kompleks
2. Placeholder generik lolos ke skeleton (`[Klien Name]`, `<TBD>` telanjang) — isi fakta konkret Step 1
3. Replace existing `CLAUDE.md` saat onboarding — append, jangan replace
4. Emoji di file documentation
5. Single huge file untuk semua doc — pecah ke file numbered 00-09
6. Tunda catat temuan ke akhir project — append `09` SAAT temuan muncul
7. `.implementation-plan/` (hidden) untuk project baru — WAJIB `ProjectDocs/`; legacy via `PROMPT-MIGRASI-PROJECTDOCS.md`
8. Credential/secret di ProjectDocs — referensi lokasi saja
9. Menyalin isi plan ke agent-documentation — plan hidup di `plans/`, `05` cukup link + posisi
10. Claim "skeleton selesai" tanpa evidence `ls` fresh
11. File/folder kosong demi "lengkap" — absen = state valid (lazy creation)

## Self-Check After Onboarding

- ☐ Agent baru baca `00-START-HERE.md` → tahu task immediate next?
- ☐ `04` punya peta environment (branch→env→URL, port, lokasi .env) — bukan cuma nama stack?
- ☐ `05-CURRENT-STATE.md` reflect status aktual + timestamp fresh?
- ☐ `README.md` ProjectDocs terbaca oleh klien non-teknis (ragam konsultan)?
- ☐ Tidak ada placeholder generik telanjang di file mana pun?
- ☐ Decision klien yang sudah ada semuanya tercatat di `03`?
- ☐ Tidak ada credential/secret tertulis di ProjectDocs?
- ☐ Struktur folder ikut section "Folder Structure" + lazy creation?

Ada yang belum → fix sebelum lanjut ke task berikutnya.

## Related Skills

- `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans` — planning generik; simpan output di `ProjectDocs/plans/`
- `seoboost-decision-tracking` — capture decision baru dari klien (D-XXX)
- `seoboost-communication-log` — update timeline WA/email
- `seoboost-fork-checkpoint` — sebelum fork session / /compact
- `seoboost-laporan-klien` — produksi laporan status keluar ke klien, ritme dari kickoff
- `seoboost-sprint-close` — ritual tutup sprint: audit fresh + nama tahap + format laporan
- `seoboost-skill-evolution` — panen pelajaran `09` → rute perbaikan ekosistem skill
- `seoboost-versioned-output` — nama file output + struktur `output/<tipe>/` (Scenario 5 — JANGAN flat)
- `seoboost-formal-docs` — dokumen formal (BRD, Discovery, MoM, Proposal); build script tulis ke `output/<tipe>/`
- `seoboost-cross-project-reuse` — catalog script yang lolos ambang reuse

---

Direvisi 28 Agu 2026 via council review; direvisi 29 Agu 2026 via council review (wave 2); direvisi 29 Agu 2026 (wave 4).
