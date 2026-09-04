---
name: seoboost-sprint-close
description: Use when closing a sprint on any SEO Boost project that runs sprint methodology (Project G, Project E, Project H, etc.) — executes the mandatory Sprint Completion Reporting Convention from CLAUDE.md verbatim: fresh end-to-end audit (lint + typecheck + test --force + build on BOTH repos, RAM-aware), live e2e of critical scenarios, green CI with Run ID, documentation-consistency audit, git 0 ahead/0 behind, stage-name derivation for session suffix, and the explicit report format. Triggers: "sprint X selesai", "tutup sprint", "wrap up sprint", "lanjut autonomous sampai sprint selesai", or a closure-phase plan task (e.g. "E1: Sprint N close"). NOT for mid-sprint phase reports (use the per-phase Reporting Format), NOT for generic done-claims outside a sprint boundary (use superpowers:verification-before-completion directly), NOT a weekly retro (gstack /retro is barred for SEO Boost sprint completion).
---

# SEO Boost Sprint Close

## Overview

Sumber konvensi: bagian **"Sprint Completion Reporting Convention"** di `~/.claude/CLAUDE.md` (established Project G D-031, 23 Mei 2026, berlaku lintas-project SEO Boost tanpa pengecualian). Skill ini menjalankan konvensi itu apa adanya — urutan audit, format laporan, dan derivasi nama tahap semuanya dari sana.

**Core principle:** "Sprint done" adalah klaim yang harus bisa gugur. Setiap butir audit punya perintah, output yang dianggap lulus, dan jejak yang masuk laporan. Bukti yang dipakai wajib dari run **di pesan saat ini** — hasil run kemarin, cache, atau ingatan "tadi hijau" tidak berlaku.

User menamai ulang session Claude dengan suffix nama tahap (mis. "...Sprint 1 auth & data foundation") untuk pencarian historis. Laporan tanpa nama tahap = session tidak bisa ditemukan lagi.

## When to Use

- User berkata "sprint X selesai", "tutup sprint", "wrap up sprint", "lanjut autonomous sampai sprint selesai"
- Plan sampai pada closure phase (mis. `E1: Sprint N close + Sprint N+1 handover`)
- Kamu sendiri hendak mengklaim sprint selesai dalam kerja autonomous

**Jangan pakai untuk:**
- Laporan per-phase di tengah sprint — itu format "Reporting Format" per-phase di CLAUDE.md, lebih ringan
- Klaim selesai di luar batas sprint (bugfix tunggal, task kecil) — langsung `superpowers:verification-before-completion`
- Retro mingguan — `/retro` gstack dilarang untuk sprint completion SEO Boost (anti-pattern tercatat di CLAUDE.md)

## Langkah 0 — Derivasi Nama Tahap

Format: `Sprint <number> <nama-tahap>` — nama tahap **lowercase, spasi sebagai pemisah, ampersand untuk multi-scope**. Sumber: filename plan, atau H1 plan kalau filename terlalu pendek untuk scope yang luas.

| Sumber | Nama tahap |
|---|---|
| `plans/2026-05-22-sprint-0-foundation.md` | `Sprint 0 foundation` |
| `plans/2026-05-22-sprint-1-auth.md` (H1: "Sprint 1 — Auth & Data Foundation Implementation Plan") | `Sprint 1 auth & data foundation` |
| `plans/2026-05-23-sprint-2-trades.md` | `Sprint 2 journal & trades parity` |

Turunkan nama ini SEBELUM audit — dia masuk baris pertama laporan.

## Langkah 1 — Audit Pipeline Fresh (KEDUA repo)

Jalankan di repo BE **dan** repo FE (project satu repo: jalankan set yang sama sekali):

```bash
pnpm lint
pnpm typecheck
pnpm test --force        # --force = tanpa cache; hasil cache bukan bukti
pnpm build
```

**RAM-aware wajib** (Mac ~16GB — disiplin dari CLAUDE.md). Whole-suite memang diizinkan di titik ini karena sprint close = final verify, tapi langkah test-nya dijalankan dengan cap — ini cara menjalankan suite di atas, bukan run tambahan:

```bash
NODE_OPTIONS='--max-old-space-size=2048' pnpm exec jest \
  --maxWorkers=1 --workerIdleMemoryLimit=768MB --silent

pkill -f "jest" 2>/dev/null; sleep 1   # setelah tiap run
```

Lulus = exit code 0 dan angka test tercatat (X pass / Y total per repo). Ada yang merah → berhenti, jalankan `superpowers:systematic-debugging`, dan setelah perbaikan ulangi langkah ini dari awal. Audit yang lompat ke langkah berikutnya sambil "nanti dibereskan" bukan audit.

## Langkah 2 — Live E2E Skenario Kritis

Jalankan skenario end-to-end paling kritis untuk scope sprint terhadap server yang benar-benar hidup — contoh dari konvensi: signup → login → protected route untuk sprint auth. Catat skenario apa yang dijalankan dan hasilnya.

Setelah selesai, matikan proses yang kamu buka dan pastikan port lepas:

```bash
pkill -f "nest start" 2>/dev/null
lsof -iTCP:<port> -sTCP:LISTEN    # harus kosong
```

## Langkah 3 — CI Hijau + Run ID

Verifikasi run GitHub Actions untuk **commit terakhir per repo**, bukan run lama yang kebetulan hijau:

```bash
gh run list --limit 3    # di tiap repo; cocokkan SHA dengan git log -1
```

Lulus = run untuk HEAD berstatus success. Catat **Run ID / link** per repo — laporan tanpa Run ID berarti butir CI belum terbukti.

## Langkah 4 — Audit Konsistensi Dokumentasi

Angka yang dikutip dokumentasi harus sama dengan angka di sumbernya. Tiga pasangan minimum:

```bash
# decision count aktual vs yang dikutip PROGRESS.md / laporan
grep -c '^## D-' agent-documentation/03-DECISIONS-LOG.md

# commit count sprint aktual vs yang dikutip dokumentasi
git rev-list --count <commit-awal-sprint>..HEAD

# version number di CHANGELOG.md vs versi yang tertera di aplikasi/output
```

Linter ProjectDocs bagian dari bukti butir ini:
`node <repo seoboost-skill-set>/automation/projectdocs-lint.mjs ProjectDocs` (contoh di M4:
`~/.claude/seoboost-skill-set/automation/projectdocs-lint.mjs`; lokasi clone bisa berbeda
per mesin) — hasil 0 error dilampirkan di laporan sprint.

Mismatch → **perbaiki sekarang**, lalu hitung ulang. Target yang masuk laporan: mismatch count = 0. Mencatat mismatch tanpa memperbaikinya sama dengan menerbitkan dokumentasi yang diketahui salah.

## Langkah 5 — Git Bersih, 0 Ahead / 0 Behind

```bash
git status -sb                                        # working tree bersih
git rev-list --count origin/<branch>..HEAD            # harus 0 (ahead)
git rev-list --count HEAD..origin/<branch>            # harus 0 (behind)
```

Di kedua repo. Ahead > 0 dan izin push belum ada → **minta izin dulu** (Iron Law #4: tidak ada push tanpa izin eksplisit dari user), jangan mendorong commit diam-diam demi angka 0. Behind > 0 → tarik dan rebase dulu, lalu ulangi Langkah 1 karena basis kodenya berubah.

## Langkah 6 — Laporan (format WAJIB, jangan bikin varian)

```markdown
## Sprint <N> — DONE ✅

**Nama tahap untuk session suffix:** `Sprint <N> <nama-tahap-lowercase>`

Contoh suffix: `Sprint 1 auth & data foundation`, `Sprint 2 journal & trades parity`,
              `Sprint 3 orchestrator core`

(User akan rename Claude session dengan suffix ini untuk historical lookup.)

## Audit hasil
- BE pipeline: ... (fresh evidence dari run saat ini)
- FE pipeline: ...
- Live e2e: ...
- CI: ... (link Run ID)
- Doc consistency: ... (mismatch count = 0)

## Sprint details
- Commits: ...
- Tests: ...
- ...

## Sprint <N+1> next: ...
```

Tiap baris "Audit hasil" diisi angka dan jejak dari Langkah 1-5 pesan ini — bukan "OK" atau "hijau" polos. Bagian `Sprint <N+1> next` diisi dari plan berikutnya kalau sudah ada; kalau belum, tulis apa yang harus direncanakan.

## Langkah 7 — Setelah Laporan

1. **`seoboost-skill-evolution`** — panen pelajaran sprint (entri `09-TEMUAN-EVALUASI-PROSES.md`, koreksi operator, insiden yang selesai). Sprint close adalah salah satu cadence panen resminya.
2. **`seoboost-fork-checkpoint`** — kalau sesi berakhir atau akan fork/compact setelah sprint ini.
3. Ingatkan user menamai ulang session dengan suffix nama tahap dari Langkah 0.

## Anti-Patterns

1. Klaim "Sprint done" dengan bukti dari run sebelumnya — konvensi menuntut fresh evidence dari audit run di pesan saat ini
2. `pnpm test` tanpa `--force` — hasil cache lolos padahal kode berubah
3. Whole-suite tanpa cap RAM — OOM di tengah audit, lalu tergoda memakai hasil parsial
4. Audit hanya satu repo — konvensi bilang kedua repo; FE yang tidak diaudit adalah tempat regresi bersembunyi
5. "CI hijau" tanpa Run ID untuk HEAD — run hijau kemarin bukan bukti untuk commit hari ini
6. Push ke remote demi mengejar 0 ahead tanpa izin user — Iron Law #4 tetap berlaku di sprint close
7. Mencatat mismatch dokumentasi tanpa memperbaikinya — target laporan adalah mismatch = 0, bukan daftar mismatch
8. Laporan tanpa nama tahap, atau nama tahap format bebas — session jadi tidak bisa dicari; format `Sprint <N> <lowercase & ampersand>` sudah ditetapkan
9. Dev server dibiarkan hidup setelah live e2e — konvensi CLAUDE.md: kill proses, biarkan user yang tes
10. Memakai `/retro` gstack sebagai penutup sprint — tercatat sebagai anti-pattern di CLAUDE.md

## Trigger Phrases yang Match Skill Ini

- "sprint X selesai" / "tutup sprint" / "wrap up sprint"
- "lanjut autonomous sampai sprint selesai"
- Closure phase di plan (mis. `E1: Sprint N close + Sprint N+1 handover`)

## Related Skills

- `superpowers:verification-before-completion` — disiplin bukti generik yang skill ini pakai di tiap langkah; skill ini ritual SEO Boost di atasnya, tidak menggantikannya
- `superpowers:systematic-debugging` — wajib saat ada butir audit yang merah, sebelum perbaikan apa pun
- `seoboost-skill-evolution` — panen pelajaran sprint setelah laporan (Langkah 7)
- `seoboost-fork-checkpoint` — kalau sesi berakhir/fork setelah sprint close
- `seoboost-versioned-output` — kalau sprint menghasilkan file yang dibagikan ke klien, penamaannya lewat sana

---
Dibuat 29 Agu 2026 via council review; direvisi 29 Agu 2026 (wave 4).
