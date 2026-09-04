# Hooks Claude Code — penegakan Iron Law SEO Boost

Dua hook yang menegakkan konvensi secara mekanis (bukan lagi mengandalkan ingatan agent).
Dibuat 29 Agu 2026 (wave-3); wiring per mesin dilakukan operator/orkestrator, bukan agent.

## 1. pre-push-guard.sh — Iron Law #4 (PreToolUse, matcher Bash)

Memblok perintah Bash yang benar-benar menjalankan push, KECUALI perintahnya diawali
token `SEOBOOST_PUSH_OK=1`. Alurnya: agent minta izin push di percakapan, operator setuju, agent
menjalankan ulang dengan token di depan. Tanpa persetujuan, push tidak akan pernah jalan
diam-diam, apa pun mode permission sesinya.

- Fail-open: stdin bukan JSON valid akan diloloskan, sebab hook tidak boleh membrick sesi.
- Butuh `node` di PATH (ada di semua mesin SEO Boost).

**Revisi 3 Sep 2026, positif palsu diperbaiki.** Versi pertama mencocokkan pola ke mana pun
di dalam teks perintah, jadi menulis dokumen yang MEMBICARAKAN push ikut diblokir. Kejadian
nyata: menulis operating prompt yang butir pertamanya menyebut push ditolak hook, padahal
tidak ada satu pun perintah git di situ. Catatan lama di berkas ini menganggap positif palsu
wajar dan menyuruh memakai token sebagai jalan keluar. Itu keliru: token yang dipakai sebagai
kebiasaan berhenti menjadi persetujuan, dan Iron Law #4 ikut kosong artinya.

Dua penyaringan menggantikannya, keduanya sengaja bias ke arah memblokir:

1. Badan heredoc dibuang sebelum dicocokkan, kecuali baris pembukanya memanggil penafsir
   (`bash`, `node`, `python`, dan sejenisnya). `cat > berkas <<EOF` dibuang badannya,
   `bash <<EOF` tidak, sebab badan yang disalurkan ke penafsir memang dijalankan.
2. Sisanya dipecah jadi statement, dan yang dihitung hanya `push` sebagai **subperintah
   git** pada posisi perintah. Opsi global seperti `-C` dilewati berikut argumennya.
   Dengan begitu `git log --grep=push` lolos, sedangkan `git push`, `git -C dir push`,
   dan `env X=1 git push` tetap diblokir.

**Uji sebelum mengubah hook ini:**

```bash
python3 automation/hooks/uji-pre-push-guard.py               # wajib 16/16
python3 automation/hooks/uji-pre-push-guard.py <hook-lama>   # wajib TIDAK 16/16
```

Perintah kedua bukan basa-basi. Set uji yang lolos penuh di versi lama maupun baru tidak
membedakan apa pun dan belum membuktikan perbaikan. Versi 29 Agu mendapat 14/16.

## 2. pre-compact-reminder.sh — pengingat checkpoint (PreCompact)

Menyuntik konteks pengingat `seoboost-fork-checkpoint` tepat sebelum compact. Menggantikan
pesan inline di settings.json (hook 13 Jul 2026) dengan script ber-versi di repo ini.

## Wiring ke ~/.claude/settings.json

Gabungkan blok berikut ke key `hooks` (JANGAN menimpa hook lain yang sudah ada, mis.
`UserPromptSubmit`). Ganti path bila lokasi clone repo berbeda dari M4
(`~/.claude/seoboost-skill-set`).

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "/Users/hash/.claude/seoboost-skill-set/automation/hooks/pre-push-guard.sh" }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          { "type": "command", "command": "/Users/hash/.claude/seoboost-skill-set/automation/hooks/pre-compact-reminder.sh" }
        ]
      }
    ]
  }
}
```

## Melepas

Hapus entri terkait dari `~/.claude/settings.json` (atau buka `/hooks` di Claude Code).
Backup settings sebelum wiring: `cp ~/.claude/settings.json ~/.claude/settings.json.bak-<tanggal>`.

## Uji cepat

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"git push origin main"}}' | ./pre-push-guard.sh
# keluaran memuat "deny"
echo '{"tool_name":"Bash","tool_input":{"command":"SEOBOOST_PUSH_OK=1 git push origin main"}}' | ./pre-push-guard.sh
# keluaran kosong (lolos)
```
