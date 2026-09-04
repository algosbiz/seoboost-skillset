#!/usr/bin/env bash
# Hook PreCompact — pengingat seoboost-fork-checkpoint tepat sebelum compact.
# Versi script (di-versikan di repo) menggantikan pesan inline lama di settings.json
# (hook 13 Jul 2026) supaya satu sumber untuk semua mesin SEO Boost.
set -euo pipefail
cat >/dev/null 2>&1 || true
cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PreCompact","additionalContext":"Sebelum compact pada project SEO Boost: jalankan seoboost-fork-checkpoint dulu (urutan penyelamatan: 03-DECISIONS-LOG + 06-COMMUNICATION-LOG dulu, lalu 00/05/08, tandai entri 09 baru [belum dipanen], jalankan projectdocs-lint). Quote literal dan angka yang belum tercatat akan hilang dari ringkasan compact."}}
JSON
exit 0
