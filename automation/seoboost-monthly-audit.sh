#!/usr/bin/env bash
# seoboost-monthly-audit.sh — audit bulanan ekosistem skill SEO Boost (headless).
#
# Menjalankan `claude -p` dengan prompt audit (seoboost-skill-ecosystem-audit +
# panen seoboost-skill-evolution), menulis laporan ke
# ProjectDocs/skill-ecosystem-audit-<YYYY-MM>/LAPORAN-BULANAN.md, tanpa push.
# Stdout+stderr run dicatat ke ~/.claude/logs/seoboost-monthly-audit-<tanggal>.log.
#
# Dipanggil oleh launchd (com.seoboost.monthly-audit.plist) atau manual.
# Dokumentasi: automation/MONTHLY-AUDIT.md. Jangan memuat launchd tanpa
# persetujuan operator — run headless memakai kuota API.

set -euo pipefail

# Resolve repo dari lokasi script sendiri (script ada di $REPO/automation/).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TANGGAL="$(date +%Y-%m-%d)"
BULAN="$(date +%Y-%m)"
LOG_DIR="$HOME/.claude/logs"
LOG_FILE="$LOG_DIR/seoboost-monthly-audit-$TANGGAL.log"
BATAS_DETIK=1800  # 30 menit

mkdir -p "$LOG_DIR"

log() {
  # Tulis ke log sekaligus terminal (kalau ada).
  printf '%s %s\n' "[$(date '+%Y-%m-%d %H:%M:%S')]" "$*" | tee -a "$LOG_FILE"
}

# Guard: binary claude harus ada.
if ! command -v claude >/dev/null 2>&1; then
  log "GAGAL: binary 'claude' tidak ditemukan di PATH. Audit dibatalkan."
  exit 1
fi

LAPORAN_REL="ProjectDocs/skill-ecosystem-audit-$BULAN/LAPORAN-BULANAN.md"
PROMPT="Jalankan audit bulanan repo skills SEO Boost ini. Langkah: (1) jalankan skill seoboost-skill-ecosystem-audit untuk audit penuh ekosistem skill; (2) jalankan panen pelajaran dengan skill seoboost-skill-evolution; (3) tulis laporan gabungan ke $LAPORAN_REL — buat direktorinya bila belum ada. DILARANG melakukan git push atau operasi remote lain; semua hasil cukup tersimpan lokal di working tree."

log "Mulai audit bulanan. Repo: $REPO_DIR. Laporan target: $LAPORAN_REL. Batas: $((BATAS_DETIK / 60)) menit."

# Timeout portabel macOS+Linux: perl alarm (coreutils `timeout` tidak ada di
# macOS stok). SIGALRM menghentikan proses claude saat batas terlampaui.
rc=0
(
  cd "$REPO_DIR"
  perl -e 'alarm shift @ARGV; exec @ARGV or die "exec gagal: $!\n"' \
    "$BATAS_DETIK" claude -p "$PROMPT"
) >>"$LOG_FILE" 2>&1 || rc=$?

if [ "$rc" -eq 0 ]; then
  log "Selesai: audit bulanan berhasil. Log: $LOG_FILE"
elif [ "$rc" -eq 142 ]; then
  # 142 = 128 + SIGALRM(14): dihentikan oleh alarm.
  log "GAGAL: audit dihentikan karena melewati batas $((BATAS_DETIK / 60)) menit. Log: $LOG_FILE"
else
  log "GAGAL: claude -p keluar dengan exit code $rc. Periksa log: $LOG_FILE"
fi

exit "$rc"
