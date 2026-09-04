#!/bin/bash
# SessionStart hook — lapor keadaan repo skill bersama, SEKALI, di awal sesi.
#
# Kenapa ada: kerja bisa menumpuk berminggu-minggu di satu mesin tanpa ada yang
# memberi tahu. Semua pemeriksaannya sudah berupa perintah satu baris, tapi semuanya
# menuntut operator ingat menjalankannya. Hook ini yang mengingat, bukan operator.
#
# Aturannya: DIAM kalau semuanya bersih. Cuma bersuara kalau ada yang perlu diketahui.
# Dipasang 2026-08-14 atas rekomendasi dewan pola kerja.

R="$HOME/.claude/seoboost-skill-set"
[ -d "$R/.git" ] || exit 0

# fetch dengan pagar: jangan pernah minta password, dan menyerah setelah ~5 detik
# kalau jaringannya lambat — sesi tidak boleh tertahan gara-gara hook ini.
GIT_TERMINAL_PROMPT=0 git -C "$R" \
  -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=5 \
  fetch -q --no-tags 2>/dev/null

read -r behind ahead <<<"$(git -C "$R" rev-list --left-right --count origin/main...HEAD 2>/dev/null)"
dirty="$(git -C "$R" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

behind="${behind:-0}"; ahead="${ahead:-0}"; dirty="${dirty:-0}"

# Semuanya beres → diam. Ini bagian yang penting: kalau hook ini cerewet tiap sesi,
# operator akan berhenti membacanya, dan saat benar-benar ada masalah dia ikut terlewat.
[ "$behind" = "0" ] && [ "$ahead" = "0" ] && [ "$dirty" = "0" ] && exit 0

msg="[repo skill bersama]"
[ "$dirty"  != "0" ] && msg="$msg $dirty berkas belum di-commit."
[ "$ahead"  != "0" ] && msg="$msg $ahead commit belum di-push (kerja ini cuma ada di mesin ini)."
[ "$behind" != "0" ] && msg="$msg $behind commit dari mesin lain belum ditarik — jalankan: git -C ~/.claude/seoboost-skill-set pull && ./sync-skills.sh"
msg="$msg Sebutkan ini ke operator dalam satu baris di awal jawaban pertama, bahasa awam, lalu lanjutkan tugasnya."

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$msg"
