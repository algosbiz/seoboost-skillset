---
name: seoboost-communication-log
description: Use when user shares chat history (WhatsApp, email, meeting transcript) from a client conversation that needs to be logged into the project's communication timeline. Triggers when user pastes chat with timestamps, says "berikut update di group", "ini balasan klien", "WA terbaru", or asks to update communication log.
---

# SEO Boost Communication Log

## Overview

Capture timeline percakapan klien di `agent-documentation/06-COMMUNICATION-LOG.md` dengan format chronological + grouped by topic/event. Pattern ini memungkinkan agent baru rebuild konteks percakapan klien dalam 5-10 menit reading time.

**Core principle:** Timeline preserves causality. Tahu kapan apa dibilang oleh siapa adalah kunci untuk understand decision context.

## When to Use

**Always log saat:**
- User paste/forward WhatsApp chat dengan klien
- User share email exchange dengan klien
- Meeting dengan klien (transcript atau notes)
- User summarize percakapan offline ("tadi ngobrol sama Bu X, dia bilang ...")

**Skip:**
- Chat internal team SEO Boost (kecuali ada decision affecting project)
- Chat yang tidak ada substance (small talk, no project-related content)

## File Structure

`agent-documentation/06-COMMUNICATION-LOG.md` mengikuti format:

```markdown
# 06 — Communication Log

Timeline percakapan dengan klien.

**Reading order:** chronological ascending (terlama di atas, terbaru di bawah).

---

## Channels

| Channel | Members | Use Case |
|---|---|---|
| WA Group "X" | <list> | Diskusi resmi |
| Email <to> | <recipients> | Document exchange |
| Meeting <when> | <attendees> | Strategic discussion |

---

## <Tanggal — DD MMM YYYY>

### <Topic / Event Name> (<bagian hari: pagi / siang / sore / malam>)

**HH:MM** <Sender>: "<quote literal>"

**HH:MM** <Sender>: "<quote next message>"

→ **Decision D-XXX:** <kalau ada decision dari topic ini>
→ **Status:** <state setelah event ini>

---
```

## Key Conventions

### 0. Bahasa — `seoboost-tulis-indonesia` wajib untuk ringkasan dan analisis

Log ini dibaca agent lain dan sering menjadi bahan dokumen klien di kemudian hari, jadi
ragamnya diatur `seoboost-tulis-indonesia` (ragam **curah gagasan**: fragmen boleh, tetapi
spekulasi wajib ditandai terpisah dari fakta).

Batas yang khas untuk log komunikasi:

- **Kutipan asli tidak pernah disunting.** Apa pun yang ditulis pihak lain disalin apa adanya,
  termasuk salah ketik, campur bahasa, dan singkatan. Aturan bahasa berlaku pada ringkasan,
  konteks, dan analisis yang kamu tulis sendiri — bukan pada kutipan.
- **Tandai mana kutipan, mana tafsiranmu.** Log yang mencampur keduanya akan dikutip sebagai
  fakta oleh agent berikutnya.
- Konvensi istilah klien di `seoboost-formal-docs` **tidak** berlaku di sini; ini catatan internal,
  bukan dokumen yang dibaca pihak itu.

### 1. Chronological Ascending

Terbaru di **bawah**, bukan di atas. Reasoning: agent baru baca top-to-bottom jadi natural narrative dari awal project ke sekarang. Tambah entries di bottom.

### 2. Topic Grouping per Day

Tiap tanggal punya 1+ section dengan label topik:

```markdown
## 7 Mei 2026

### Snapshot Final dari Zidan (dini hari)
...

### Production Run Tier 1 (dini hari setelah snapshot diterima)
...

### Manual Review V10 Durasi (siang)
...
```

Topik label harus descriptive (bukan generic "WA Update").

### 3. Bagian Hari Klarifikasi

Kalau timestamp bisa ambiguous (mis. 1:00 di malam vs siang), tambah label:
- `(dini hari)` — 00:00 - 06:00
- `(pagi)` — 06:00 - 11:00
- `(siang)` — 11:00 - 15:00
- `(sore)` — 15:00 - 18:00
- `(malam)` — 18:00 - 24:00

### 4. Quote Literal

Sama dengan rules `seoboost-decision-tracking`:
- Preserve typo, emoji, capitalization
- Pakai blockquote untuk emphasis quote panjang
- Boleh annotate dengan `[brackets]` untuk konteks

### 5. Sender Format

✅ Good:
- `**HH:MM** Bu [Klien]: "..."`
- `**HH:MM** operator (OPERATOR): "..."` (kalau username OPERATOR juga muncul)
- `**HH:MM** [Klien Tim]: "..."` (sertakan organisasi kalau ada multiple nama orang)

❌ Bad:
- `**HH:MM** Klien: "..."` (terlalu generic)
- `**HH:MM** Bu: "..."` (tidak jelas siapa)

### 6. Decision Cross-Reference

Kalau topic menghasilkan decision, tambah arrow di bawah:

```markdown
→ **Decision D-018:** Threshold binary tanpa zona PERLU_REVIEW...
→ **Status:** Spec final V4-V7 jelas, bisa lanjut update kode.
```

Decision detail tetap di `03-DECISIONS-LOG.md`. Communication log cuma reference.

### 7. Important Quotes Bold

Quote yang mengandung decision atau pivot penting di-**bold**:

```markdown
**12:44** Bu [Klien]: ⭐ **"Saya pilih Opsi A yang cepat."**
```

Star emoji ⭐ optional di awal untuk visual scanning. (Note: emoji di sini OK karena ini source quote dari klien — bukan emoji SEO Boost internal yang dihindari.)

## Workflow When User Shares Chat

User paste chat dari WA/email. Steps:

### Step 1: Identify Date and Topic

- Apa tanggalnya? (ambil dari timestamp di chat, atau tanya user)
- Apa topic utamanya? (decision request? klarifikasi? lapor status? new info?)

### Step 2: Locate Insertion Point

Di `06-COMMUNICATION-LOG.md`:
- Tanggal sama dengan section terakhir? → Tambah sub-section baru di bawah
- Tanggal baru? → Tambah section baru `## <Tanggal>` di bottom
- Topik continuation dari sub-section existing? → Append messages di sub-section yang sama

### Step 3: Format Chat Messages

Convert raw WA/email format ke format standar:

**Raw WA paste:**
```
[07/05/26, 14.38.19] Bu [Klien Lead]: V6 pilihan a sesuai arahan awal saya...
[07/05/26, 14.38.35] OPERATOR: siap thank you bu reconfirmation nya
```

**Format standar:**
```markdown
**14:38** Bu [Klien]: **"V6 pilihan a sesuai arahan awal saya di dokumen Pedoman ini, croscheck saja yang dibatalkan sesuai kesepakatan"**
**14:38** operator: "siap thank you bu reconfirmation nya"
```

Notes:
- Strip square brackets dengan tanggal lengkap (sudah ada di section header)
- Convert `14.38.19` ke `**14:38**` (HH:MM bold, drop seconds)
- Strip surname kalau redundant ("Bu [Klien Lead]" → "Bu [Klien]" — kecuali ambiguous)
- Bold quote yang penting

### Step 4: Add Context Block

Sebelum messages, kasih short context paragraph:

```markdown
### Klarifikasi Pertanyaan Opsi a (V4 Bidang Strict, malam)

**Konteks:** Bu [Klien] tanya 2 hal tentang opsi (a) strict yang kami usulkan untuk V4 Bidang:
- Apakah asumsinya form benar dan surat salah?
- Bagaimana cara revisinya?

operator (OPERATOR): jawaban dikirim via WA group...

**(timestamps not captured for outbound replies)**

**16:29** Bu [Klien]: "tolong random check yg penelitinya berdua..."
```

Konteks paragraph helps agent baru understand "kenapa percakapan ini terjadi".

### Step 5: Add Status Footer (Optional)

Setelah messages, kalau ada outcome jelas:

```markdown
→ **Decision D-020:** Logic V5/V6/V7 strict — require TTD Peneliti 2 untuk tim 2 orang.
→ **Status:** Approval full batch V4-V7 + V9 received. Mulai execution.
```

### Step 6: Update Cross-Reference Files

Kalau ada decision baru:
- Tambah ke `03-DECISIONS-LOG.md` (lihat skill `seoboost-decision-tracking`)
- Update `05-CURRENT-STATE.md` jika resolve blocker
- Update `08-HANDOFF-CHECKLIST.md` jika unblock action item

### Step 7: Lapor User

Lapor singkat:
- File yang di-update
- Decision baru (kalau ada)
- Action item yang berubah karena chat ini

## Example: Real Pattern from [Project A] Project

```markdown
## 7 Mei 2026

### Klarifikasi Scope V6 + Threshold Fuzzy Match (siang sore)

**Konteks:** Sebelum jalankan V4-V7 dengan AI, operator minta klarifikasi 2 hal: (1) scope V6 apakah strict full validation atau cukup ada TTD saja, (2) threshold fuzzy match untuk nama/judul.

operator kirim 2 pertanyaan ke group dengan opsi konkret + rekomendasi.

**14:38** Bu [Klien]: kirim screenshot komentar V6 di Google Doc Pedoman (dengan 3 sub-cek asli)
**14:38** Bu [Klien]: ⭐ **"V6 pilihan a sesuai arahan awal saya di dokumen Pedoman ini, croscheck saja yang dibatalkan sesuai kesepakatan"**
**14:38** operator: "siap thank you bu reconfirmation nya"

**14:42** Bu [Klien]: ⭐ **"Threshold kecocokan:**
**• Nama seharusnya 100% tapi mungkin ada typo, berapa persen ya typo 90%, di bawah itu langsung BELUM LOLOS**
**• Judul makalah lebih longgar 75% aja, LOLOS atau BELUM LOLOS"**
**14:42** Bu [Klien]: ⭐ **"jadi tidak pakai review lagi"**
**14:42** operator: "siap"

→ **Decision D-017:** V6 scope full validation per Pedoman asli (data match + TTD lengkap), hanya sub-cek crosscheck Daftar Peserta yang dihapus.
→ **Decision D-018:** Threshold binary tanpa zona PERLU_REVIEW — Nama ≥90% LULUS, Judul ≥75% LULUS, di bawah threshold langsung BELUM LOLOS.
→ **Status:** Spec final V4-V7 jelas, bisa lanjut update kode dengan threshold + full validation rules.
```

## Angka dari klien menutup persis yang disebut kalimatnya

Angka yang datang lewat chat sering terbaca lebih luas daripada bunyinya, dan selisihnya baru
ketahuan di hari pelaksanaan.

Nyata: pihak penyelenggara menyampaikan *"tamu dan peserta total ada 60 orang"*. Godaan langsungnya
mengganti perkiraan lama dengan 60 lalu menganggap pos konsumsi selesai. Kalimatnya menyebut **tamu
dan peserta**; tenaga pelaksana berjumlah sekitar 82 orang dan tidak disebut sama sekali. Katering
60 porsi berarti 82 orang tidak kebagian, dan itu ketahuan di hari H.

**Aturannya, saat mencatat angka dari klien ke log:**

1. Salin kalimatnya utuh, jangan hanya angkanya. Yang menentukan cakupan adalah kata-kata di
   sekelilingnya, bukan bilangannya.
2. Sebelum angka itu dipakai menutup sebuah pos, tulis di baris Status **apa yang TIDAK disebut**
   kalimat itu.
3. Angka turunan yang kamu jumlahkan sendiri ditulis sebagai jumlahan SEO Boost, bukan sebagai fakta yang
   pernah dikonfirmasi klien. Contoh: `Angka 82 adalah jumlahan SEO Boost atas daftar tenaga, belum pernah
   dikonfirmasi.`

---

## Anti-Patterns

1. ❌ **Reverse chronological** (terbaru di atas) — confuses narrative flow
2. ❌ **Skip context paragraph** — agent baru tidak tahu kenapa chat ini terjadi
3. ❌ **Strip emoji from client quote** — preserve original
4. ❌ **Generic topic labels** ("WA Update", "Chat") — pakai descriptive label
5. ❌ **Forget to cross-reference decisions** — comm log dan decisions log harus link

## Self-Check After Logging

- ☐ Apakah quotes literal (typo, emoji, capitalization preserved)?
- ☐ Apakah ada context paragraph sebelum messages?
- ☐ Apakah timestamp format konsisten (HH:MM bold)?
- ☐ Apakah sender format konsisten (Bu/Pak Nama, atau operator username)?
- ☐ Apakah decision baru ter-cross-reference ke 03-DECISIONS-LOG.md?
- ☐ Apakah status blocker di 05-CURRENT-STATE.md masih akurat?

## Trigger Phrases yang Match Skill Ini

- "berikut update di group [WhatsApp/email]"
- "ini balasan klien ..."
- "WA terbaru: ..."
- "tambahkan ke communication log"
- "log percakapan ini"
- "klien forward [chat/email]"
- "ini chat dengan [klien]"

## Related Skills

- `seoboost-decision-tracking` — kalau dari chat ada decision baru
- `seoboost-project-onboarding` — initial setup file structure
- `seoboost-fork-checkpoint` — pre-fork harus include semua percakapan terbaru
