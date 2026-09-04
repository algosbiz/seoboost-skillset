---
name: seoboost-context-enrichment
description: Use when an agent needs to quickly build or refresh context about the SEO Boost ecosystem before or during work — platform/product state, a client project's current state, managing-partner/business context, or internal communication history. Triggers — "perkaya konteks", "enrich context", "load konteks project X", "apa status ekosistem SEO Boost", "apa yang sudah pernah dibangun", "konteks bisnis/partner/stakeholder", starting a session on any SEO Boost project without fresh context, resuming after a long gap, cross-project questions, or onboarding a new agent/machine. NOT for logging decisions/comms (seoboost-decision-tracking / seoboost-communication-log), NOT for saving state pre-fork (seoboost-fork-checkpoint), NOT for cataloguing reusables (seoboost-cross-project-reuse) — this skill READS context in; those WRITE it out.
---

# SEO Boost Context Enrichment (Ekosistem, Project, Partner, Komunikasi Internal)

## Prinsip inti

Konteks SEO Boost tersebar di 5 lapisan yang SEMUANYA sudah ada — skill ini tidak menambah
sumber baru, ini PETA RUTE bacanya. Dua aturan main:

1. **Index dulu, disk belakangan.** Baca sumber terkurasi yang murah (registry,
   catalog, log ber-format) SEBELUM mdfind/find seluruh disk. Baseline terukur
   (17 Jul 2026): tanpa rute ini agent menghabiskan 117–151k token per pertanyaan
   konteks, 3 dari 4 batch-nya blind discovery, dan tetap melewatkan channel
   lintas-mesin.
2. **Dokumen ≠ hari ini.** Klaim state ("running", "sudah deploy", "belum mulai")
   WAJIB di-cross-check live (lapisan 4) atau di-stempel tanggal sumbernya.

## Lapisan sumber (baca berurutan: murah → mahal)

| # | Lapisan | Lokasi / tool | Isi |
|---|---|---|---|
| 0 | Injected | System prompt: CLAUDE.md global + MEMORY.md index | Konvensi kerja, iron laws, pointer memory. JANGAN re-read dari disk. |
| 1 | Cross-machine | `<clone>/agent-memory/`: `AGENT-ONBOARDING.md` → `seoboost-skill-set-management.md` (Tier-1) → `seoboost-proactive-memory-<machine>.md` (Tier-2: clone path, host quirks, PROJECT-ROOTS) → `REUSABLE-CATALOG.md` → `cross-agent/` | Satu-satunya channel yang identik di semua mesin SEO Boost. |
| 2 | Per-project | `<root>/ProjectDocs/agent-documentation/` (legacy pra-25 Jul 2026: `<root>/.implementation-plan/<slug>/agent-documentation/`) urutan **00-START-HERE → 05-CURRENT-STATE → 03-DECISIONS-LOG → 06-COMMUNICATION-LOG** + `PROGRESS.md`; work lanes (apa yang sudah dibangun): `scripts/{src,data,out}` + `build/` + `output/<tipe>/` per `seoboost-project-onboarding`; kedalaman teknis: skill `seoboost-devset-<project>`; memory per-project: `~/.claude/projects/<encoded-cwd>/memory/` | State, keputusan D-XXX, timeline komunikasi, artefak kerja. |
| 3 | Session memory | claude-mem (`mem-search` / `get_observations` / timeline), `episodic-memory:search-conversations`, `ctx_search` | "Pernah dibahas / di-solve di sesi mana?" |
| 4 | Live | `git -C <repo> log -1 --format=%ci` + `status`, `launchctl list`, `lsof -iTCP:<port>`, `docker ps`, `tail` log | Fakta detik ini. WAJIB sebelum menyebut sesuatu "running/current". |

Resolve `<clone>` (path repo `seoboost-skill-set`) dari Tier-2 file mesin ini (mis. macOS:
`~/.claude/seoboost-skill-set`). Ragu: `find "$HOME" -maxdepth 3 -type d -name seoboost-skill-set`.

## Empat lane — pilih sesuai pertanyaan

| Lane | Pertanyaan khas | Rute |
|---|---|---|
| **EKOSISTEM / PLATFORM** | "apa saja produk SEO Boost", "status Project E / ReCounting / agent-stack", "apa yang bisa di-reuse" | 1 (Tier-1+2 → `REUSABLE-CATALOG.md`) → 3 (mem-search nama produk) → 4 (live cek repo yang disebut) |
| **PROJECT** | "lanjutkan project X", "state project X sekarang" | Tier-2 **PROJECT-ROOTS** → 2 (00→05→03→06 + staleness check) → cek `ACTIVE_COORDINATION` (field absen di Tier-2 = perlakukan "none"; ≠ none → protokol seoboost-agent-coordination dulu) → 4 |
| **PARTNER / BISNIS** | "konteks bisnis klien Y", "siapa stakeholder", "model bisnis / aspirasi operator" | 0 (memory user/aspirasi) → 2 (03-DECISIONS-LOG + README project terkait) → 3 (episodic: nama orang/PT) |
| **KOMUNIKASI INTERNAL** | "apa kata klien terakhir", "history koordinasi antar agent/mesin" | 2 (06-COMMUNICATION-LOG) → 1 (`cross-agent/<channel>/`) → 3 |

## Depth — WAJIB tetapkan di langkah pertama

| Depth | Budget | Cakupan | Kapan |
|---|---|---|---|
| **quick** | 1 batch, ≤ ~10k token | Lapisan 0–1 + `00-START-HERE.md` lane terkait | Pertanyaan faktual tunggal, sanity check |
| **standard** (default) | 2–3 batch | Rute lane penuh + staleness check + minimal 1 live check | Mulai kerja di 1 project/topik |
| **deep** | 4+ batch, multi-lane | Semua lane relevan + episodic + live semua repo tersebut | Onboarding mesin/agent baru, audit ekosistem, cross-project design |

Stop rule: dua batch berturut-turut tidak menghasilkan fakta baru yang mengubah brief
→ berhenti, tulis brief.

## Protokol

1. ☐ Tentukan **lane + depth** dari pertanyaan — sebut eksplisit sebelum retrieval.
2. ☐ Lapisan 1 dulu: baca Tier-1 + Tier-2 + `REUSABLE-CATALOG.md` sesuai lane.
   Butuh freshest / >24 jam: `cd <clone> && git pull --ff-only`. Pull gagal (clone
   sedang di branch feature / tanpa upstream)? → `git fetch origin` lalu baca working
   tree apa adanya; JANGAN checkout/switch branch milik sesi lain. Enrichment =
   mandat READ — rsync sync skills (AGENT-ONBOARDING §1b) hanya untuk sesi yang
   memang akan kerja di repo itu, bukan saat sekadar memperkaya konteks.
3. ☐ Lane PROJECT: resolve root dari **PROJECT-ROOTS** (Tier-2). Entry tidak ada?
   → discover lalu APPEND ke Tier-2 (section bawah). JANGAN langsung mdfind.
4. ☐ Retrieval via `ctx_batch_execute` — raw bytes tinggal di sandbox. Satu command
   = satu aksi flat; JANGAN for-loop zsh di dalam command batch (terbukti parse
   error, buang 1 round-trip). File besar → `head`/`tail`/`grep`, bukan `cat` penuh.
   Maksimal ~5 query per batch — lebih dari itu hasil tool overflow ke file (terbukti
   75KB @ 8 query). Hasil `ctx_search` nihil ≠ fakta tidak ada — fallback `grep`
   langsung ke file sumber.
5. ☐ **Staleness check (WAJIB lane PROJECT):** bandingkan tanggal `05-CURRENT-STATE.md`
   vs entry `D-XXX` terakhir di `03-DECISIONS-LOG.md` vs `git log -1 --format=%ci`
   repo kode. Yang termuda = acuan; 05 lebih tua dari 03 → tulis flag `[STALE]` di brief.
   Project tanpa skeleton standar (tidak ada 05/03)? Pakai file keputusan/progress
   yang ADA (mis. `decisions.md`, `PROGRESS.md`) + mtime + `git log`; flag gap
   struktur di brief (rutenya `seoboost-project-onboarding`, bukan enrichment).
6. ☐ Live check (lapisan 4) untuk tiap klaim state yang akan masuk brief.
7. ☐ Tulis **CONTEXT BRIEF** (format bawah). Brief, bukan dump.
8. ☐ Nemu fakta durable lintas-sesi (quirk host, path baru, gotcha)? → append ke tier
   yang benar (Tier-2 / devset / REUSABLE-CATALOG) per `AGENT-ONBOARDING.md` §4.
   Append = edit working tree SAJA. `git commit` hanya di main / branch milikmu
   sendiri; clone sedang di branch sesi lain → biarkan uncommitted + tulis
   `[PENDING-COMMIT]` di brief. Push selalu butuh izin operator (Iron Law #4).

## Format CONTEXT BRIEF (output standar)

```markdown
# CONTEXT BRIEF — <topik> (per <DD MMM YYYY HH:MM TZ>)
**Lane/Depth:** <lane> / <depth>  ·  **Sumber:** <n file> + <n live check>
**TL;DR:** <2-3 kalimat>
**State:** <bullet; tiap klaim ber-stempel tanggal/commit; flag [STALE] / [LIVE-VERIFIED]>
**Keputusan kunci:** <D-XXX terbaru yang mengikat scope ini>
**Open threads / blocker:** <urut prioritas>
**Reusable / konvensi terkait:** <skill + catalog entry yang match>
**Ambiguity:** <yang butuh konfirmasi operator — jangan diasumsikan>
**Next action:** <1 langkah konkret>
```

Aturan brief: maksimal ~40 baris; tanpa kredensial/PII (pointer boleh: "tercatat di
<file>"); tiap klaim state punya stempel sumber+tanggal.

## PROJECT-ROOTS registry (per mesin)

Section `## PROJECT-ROOTS` di `agent-memory/seoboost-proactive-memory-<machine>.md` (Tier-2):
satu baris per project — `<nama> — <path root> — <slug/catatan>`. Registry ini yang
membuat lane PROJECT jadi 1 lookup, bukan mdfind seluruh disk.

Tidak ada / tidak lengkap? Discover sekali (bounded), lalu APPEND (additive — jangan
tulis ulang entry mesin lain):

```bash
find "$HOME" -maxdepth 5 -type d \( -name 'ProjectDocs' -o -name '.implementation-plan' \) \
  -not -path '*/node_modules/*' -not -path '*/Library/*' 2>/dev/null
```

## Anti-patterns (semua terobservasi di baseline test 17 Jul 2026)

- ❌ mdfind/find seluruh disk SEBELUM cek PROJECT-ROOTS + REUSABLE-CATALOG.
- ❌ Melewatkan lapisan 1 (`agent-memory/`) — di mesin tanpa auto-memory lokal yang
  kaya (host Ubuntu), strategi "andalkan memory lokal" collapse total.
- ❌ Menyajikan `05-CURRENT-STATE.md` tua sebagai "state sekarang" padahal
  `03-DECISIONS-LOG.md` punya entry lebih baru (kasus nyata: 05 per 1 Jun vs D-056
  per 28 Jun — selisih 4 minggu).
- ❌ Menyalin kredensial/PII ke brief. Pointer ke lokasinya saja.
- ❌ for-loop zsh di dalam `ctx_batch_execute` → parse error.
- ❌ Depth tak dibatasi — pertanyaan quick tidak boleh jadi riset 150k token.
- ❌ Lane EKOSISTEM/PROJECT tapi cuma baca doc, tak melirik work lanes (`scripts/`,
  `build/`, `output/<tipe>/`) — "apa yang sudah dibangun" hidup di sana, dan layout
  foldernya sendiri sinyal state (mis. `scripts/out/` penuh = pipeline sudah jalan).
- ❌ Re-read CLAUDE.md / MEMORY.md dari disk padahal sudah injected di system prompt.
- ❌ Brief tanpa stempel tanggal per klaim — pembaca tak bisa bedakan fakta 1 Jun
  vs 17 Jul.
- ❌ `git commit` ke branch feature milik sesi lain saat append memory (kejadian
  nyata di GREEN test 17 Jul — harus di-soft-reset). Append working-tree boleh;
  commit hanya di branch sendiri.

## Relasi dengan skill lain

- `seoboost-fork-checkpoint` — sisi WRITE (simpan state sebelum fork/compact); skill ini
  sisi READ. Checkpoint yang rajin = enrichment yang murah.
- `seoboost-cross-project-reuse` — disiplin menulis & mengkonsumsi `REUSABLE-CATALOG.md`;
  lane EKOSISTEM me-rute ke katalognya.
- `seoboost-agent-coordination` / `seoboost-agent-coordination` — kalau enrichment menemukan
  `ACTIVE_COORDINATION` ≠ none, ikuti protokolnya SEBELUM mulai kerja.
- `seoboost-devset-<project>` — kedalaman teknis per project setelah brief.
- `seoboost-project-onboarding` — lane PROJECT menemukan project TANPA
  `ProjectDocs/` (maupun legacy `.implementation-plan/`)? Itu onboarding gap, bukan
  enrichment gap. Masih pakai `.implementation-plan/`? Kandidat migrasi — master
  prompt `PROMPT-MIGRASI-PROJECTDOCS.md` di root clone `seoboost-skill-set`.
- Auto-Restore Convention (CLAUDE.md) — kasus khusus lane PROJECT saat resume;
  skill ini generalisasinya (lintas lane, lintas mesin).
