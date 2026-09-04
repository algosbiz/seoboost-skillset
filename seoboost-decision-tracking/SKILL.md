---
name: seoboost-decision-tracking
description: Use when capturing a decision from a client (Indonesian or otherwise) that affects project scope, behavior, or implementation. Triggers when user shares WA/email/meeting quote with client decision, says "Bu [Klien] setuju ...", "klien decide ...", "sudah disetujui ...", or asks to log a decision in agent-documentation/03-DECISIONS-LOG.md.
---

# SEO Boost Decision Tracking

## Overview

Capture setiap keputusan resmi dari klien dengan format **D-XXX** (sequential ID), **timestamp**, **source**, dan **quote literal**. Pattern ini battle-tested di project Klien B dengan 24+ decision tercatat sepanjang sesi 8+ jam — supaya tidak ada decision yang salah tafsir atau lupa saat fork session.

**Core principle:** Quote literal preserves nuance. Paraphrase kehilangan konteks.

## When to Use

**Always log decision saat:**
- Klien approve/reject usulan via WA/email/meeting
- Klien beri instruksi spesifik (mis. "pakai opsi A", "strict X", "skip Y")
- Klien klarifikasi pertanyaan kita
- Klien pivot scope/requirement
- Klien beri threshold/parameter spesifik (angka, format, dll)

**Don't log:**
- Acknowledgment kosong ("ok", "siap") yang tidak ada substance
- Pertanyaan klien yang belum dijawab kita (itu masuk Communication Log, bukan Decision)
- Internal team decision (itu di technical doc, bukan client decision log)

## Decision Format

Pakai format ini di `agent-documentation/03-DECISIONS-LOG.md`:

```markdown
## D-XXX — <Title Singkat & Descriptive> (<DD MMM YYYY HH:MM Timezone>)

**Source:** <Channel & sender>

> "<quote literal dari klien — preserve typo, emoji asli klien, kapitalisasi>"

**Konteks:** <1-2 paragraf — apa yang ditanya kita, kenapa klien decide ini>

**Decision:**
- <bullet point keputusan eksplisit>
- <bullet point lain>

**Implementasi:**
- <file/code yang harus diubah>
- <skip kalau decision tidak butuh code change>

**Implikasi:**
- <impact ke timeline / status / hasil — opsional kalau jelas>
```

## Numbering Convention

- Format: `D-001`, `D-002`, ..., `D-XXX` (3-digit zero-padded)
- Sequential, never reuse number
- Order chronological by timestamp
- Kalau supersede decision lama, **JANGAN delete** D lama. Tambah D baru yang reference D lama (mis. "D-018 supersedes D-007 untuk threshold").

**Project multi-workstream: penomoran lokal, rujukan wajib lengkap.** Project yang punya
beberapa workstream memakai dua deret terpisah:

- `DP-XXX` di `agent-documentation/` akar, untuk keputusan tingkat project yang berlaku
  lintas workstream (mis. konvensi dokumentasi, pemilihan stack, kesepakatan komersial).
- `D-XXX` di `<workstream>/agent-documentation/`, lokal untuk workstream itu saja.

Deret `D-XXX` tiap workstream berjalan sendiri. `D-081` di satu workstream adalah keputusan
yang sama sekali berbeda dari `D-081` di workstream lain, dan menyebut nomor telanjang akan
menyesatkan pembaca berikutnya. **Selalu tulis lengkap: `D-081 (program-b-2026-verification)`.**
Aturan ini lahir di project Klien B, yang menampung 250 keputusan di tiga log terpisah, lalu
dibakukan 2 Sep 2026 (lihat `CLAUDE.md` bagian Project Setup Convention butir 4).

## Bahasa — `seoboost-tulis-indonesia` wajib di luar kutipan

Catatan keputusan dibaca agent lain berbulan-bulan kemudian, ketika tidak ada lagi yang ingat
konteksnya. Ragam dan kejelasannya diatur `seoboost-tulis-indonesia`.

Empat pertanyaan kejelasan dari skill itu justru paling menentukan di sini, karena catatan
keputusan yang kabur akan ditafsirkan salah:

- **Setiap "ini"/"itu"/"hal tersebut" merujuk pada apa?** Ganti dengan bendanya.
- **Setiap kalimat pasif — siapa pelakunya?** "Diputuskan untuk menunda" menyembunyikan siapa
  yang memutuskan; di catatan keputusan, itulah informasi utamanya.
- **Setiap perbandingan — dibandingkan dengan apa?**
- **Setiap keterangan waktu — kapan tepatnya?** Pakai tanggal, bukan "segera" atau "nanti".

Batasnya sama seperti log komunikasi: **kutipan asli tidak pernah disunting** (lihat aturan di
bawah), dan konvensi istilah klien `seoboost-formal-docs` tidak berlaku karena ini catatan internal.

## Quote Literal Rules

**Preserve exactly:**
- Original capitalization (mis. "BELUM LOLOS" caps lock klien)
- Typo (mis. "boleeeeh" — kalau sengaja casual)
- Emoji klien (mis. 🙏, 😃)
- Singkatan klien (mis. "yg", "dgn", "bbrp")
- Bahasa campur (Indonesia + English)

**Boleh annotate dengan `[brackets]`:**
- Penjelasan jika konteks ambigu: `"V6 ok ditunggu ya [referring to question b]"`
- Translasi kalau perlu: `"sami sami bli [Balinese: 'sama-sama bro']"`

**JANGAN:**
- Paraphrase ("klien bilang dia setuju") — quote literally
- Sanitize informal language ("pakai opsi A bu" — keep as is)
- Strip emoji ("oke 🙏" → "oke") — keep emoji asli

## Title Convention

Title 5-10 kata, descriptive, mention scope:

✅ Good:
- `D-018 — Threshold Fuzzy Match Binary LULUS/BELUM`
- `D-020 — Aturan TTD Peneliti 2 di V5/V6/V7 Strict`
- `D-013 — Resolusi 5 Pertanyaan Klarifikasi (PKBM, PDF, Toleransi, TikTok, Entri Kosong)`

❌ Bad:
- `D-018 — Threshold` (terlalu vague)
- `D-020 — Bu [Klien] approve TTD strict bla bla bla yang panjang banget` (terlalu panjang)
- `D-013 — Klarifikasi` (tidak menyebut scope apa)

## Timestamp Convention

**Format:** `DD MMM YYYY HH:MM <Timezone>`

✅ Good:
- `7 Mei 2026 16:41 WITA`
- `2026-05-07 16:41 WITA` (alternative ISO format)

❌ Bad:
- `Tadi sore` (vague)
- `7/5/2026` (ambiguous DD/MM vs MM/DD)
- `16:41` (no date, no timezone)

**Timezone untuk klien Indonesia:** WIB / WITA / WIT — selalu eksplisit.

## Source Convention

Sumber decision harus jelas channel + sender. Format:

```
**Source:** WA group <group name> — <sender name>
**Source:** Email dari <sender email> — Subject: "<subject>"
**Source:** Meeting <medium> dengan <attendees>, <date>
**Source:** Komentar Google Docs di <doc name> — <commenter>
```

## Implementation Section

Bagian "**Implementasi**" harus actionable:

✅ Good:
```
**Implementasi:**
- Update `pipeline/tier1/02_v1_jenjang.py` line ~30 (ALLOWED_JENJANG list)
- Tambah PKBM dan homeschooling
- Hapus PERLU_REVIEW status untuk PKBM (auto-LULUS)
```

❌ Bad:
```
**Implementasi:**
- Apply ke pipeline
- Update kode
```

## Workflow When User Shares Decision

User paste/forward chat klien yang berisi decision. Steps:

1. **Identify scope** — apa yang klien decide? Refer to existing question/issue?
2. **Cek nomor terakhir** di `03-DECISIONS-LOG.md` untuk dapat next D-XXX
3. **Tulis entry** dengan format strict di atas
4. **Append** ke akhir file (chronological order)
5. **Cross-reference** kalau perlu update file lain:
   - `02-DOMAIN-KNOWLEDGE.md` jika decision ubah business rule
   - `05-CURRENT-STATE.md` jika decision resolve blocker
   - `06-COMMUNICATION-LOG.md` decision juga muncul di timeline percakapan
   - `08-HANDOFF-CHECKLIST.md` jika decision unblock action item

6. **Lapor user** apa yang sudah di-update (file path + decision ID)

## Example: Real Pattern from [Project A] Project

```markdown
## D-020 — Aturan TTD Peneliti 2 di V5/V6/V7 Strict (7 Mei 2026 16:41 WITA)

**Source:** WA group [Project A] X SEO Boost — Bu [Klien Lead]

> "tolong random check yg penelitinya berdua apakah menambahkan manual kolom ttd? tahun lalu begitu rasanya, karena kekeliruan form" (16:29)

> "Setuju, terima kasih ya, silakan lanjut," (16:41, setelah lihat hasil random check)

**Konteks:**
Saat smoke test V5/V6/V7 dengan 5 sample, banyak entri tim 2 orang yang BELUM LOLOS karena AI deteksi tidak ada TTD Peneliti 2. Setelah cek manual template surat [Project A], ditemukan bahwa template default hanya provide 2 slot TTD (Peneliti 1 + Guru Pembimbing). Conflict dengan Pedoman.

**Random Check:** 9 sampel V5 + 9 sampel V6 (dipilih acak oleh tim 2 orang) — 18/18 memodifikasi template menambah slot P2.

**Decision:**
- Logic V5, V6, V7 tetap require TTD Peneliti 2 untuk tim 2 orang
- Peserta yang teliti (modify template) → LULUS
- Peserta yang lalai (template default tanpa slot P2) → BELUM LOLOS, dapat 48 jam perbaiki

**Implementasi:**
- Tidak ada perubahan di kode (logic existing sudah strict)
- Lanjut full batch run setelah konfirmasi ini
```

## Pendamaian — keputusan tidak selesai saat catatannya terbit

Mencatat keputusan hanya separuh pekerjaan. Separuh lagi: **menghadapkan tiap keputusan baru ke
daftar kerja yang masih terbuka**, lalu memperbarui baris yang tertutup olehnya.

Dua kejadian nyata di project KLIEN A, kelas yang sama:

1. **26 Agu 2026.** Jawaban Klien A sudah masuk dan tercatat, tetapi Bagan Arus Keuangan tetap
   menulis "belum ditetapkan" di tiga tempat. Operator yang menemukannya.
2. **1 Sep 2026.** Notulen rapat memuat 72 keputusan; sehari kemudian **enam baris Matriks GAP**
   masih menyatakan sesuatu belum ada padahal rapat itu sudah memutuskannya — termasuk satu baris
   yang menulis "tanpa pernah diputuskan" atas hal yang diputuskan lengkap dengan pembagian
   bebannya. Matriks GAP adalah daftar kerja yang dibawa ke rapat berikutnya; membawa enam baris
   yang sudah dijawab berarti meminta klien memutuskan ulang, dan menurunkan kepercayaan pada
   daftarnya sendiri.

**Akarnya sama:** catatan keputusan dan daftar kerja dibangun dari sumber berbeda — yang satu dari
transkrip rapat, yang satu dari berkas dan jawaban tertulis. Keduanya benar menurut sumbernya, dan
tidak ada langkah yang mempertemukannya.

**Saringan murah yang menemukan keenamnya.** Baris yang tenggatnya sudah lewat DAN teksnya masih
memuat frasa penanda belum-selesai:

```bash
# sesuaikan nama berkas daftar kerjanya
grep -nE 'belum ditetapkan|belum diputus|belum disepakati|belum dipastikan|tanpa pernah diputus' \
  <daftar-kerja> | grep -vE 'dipanen|arsip'
```

Jalankan tiap kali notulen baru terbit, lalu periksa satu per satu terhadap keputusan hari itu.

**Yang diperbarui, bukan dihapus.** Baris yang tertutup sebagian ditulis ulang supaya menyebutkan
apa yang sudah diputuskan DAN apa yang benar-benar tersisa. Menutup barisnya sekaligus menghapus
sisa yang masih terbuka; membiarkannya utuh membuat klien memutuskan ulang. Keduanya salah.

## Anti-Patterns

1. ❌ **Paraphrase decision** — "klien setuju opsi A" tanpa quote → kehilangan nuance
2. ❌ **Skip timestamp** — "tadi pagi" instead of "7 Mei 09:23 WITA"
3. ❌ **Bunch decisions** dalam satu entry — pisah jadi multiple D-XXX kalau topik beda
4. ❌ **Modify decision lama** — kalau klien pivot, buat D baru yang reference yang lama, jangan rewrite
5. ❌ **Tracking informal** — "ada decision baru hari ini" tanpa update file → akan lupa saat fork
6. ❌ **Skip Source** — wajib jelas dari channel mana decision came from

## Self-Check After Logging Decision

- ☐ Quote literal preserved (typo, emoji, singkatan)?
- ☐ Timestamp + timezone jelas?
- ☐ Source channel + sender jelas?
- ☐ Title descriptive (bukan vague)?
- ☐ Implementasi section actionable (bukan abstract)?
- ☐ Cross-reference ke file lain done jika perlu?

## Trigger Phrases yang Match Skill Ini

- "Bu [Klien] bilang ..."
- "klien setuju / decide / approve ..."
- "log decision"
- "tambahkan ke decisions log"
- "ini balasan klien ..."
- "user kirim WA: ..."
- "ada keputusan dari [klien]"

## Related Skills

- `seoboost-communication-log` — sering ada decision juga muncul di comm timeline
- `seoboost-fork-checkpoint` — pre-fork checkpoint harus include semua decision tercatat
