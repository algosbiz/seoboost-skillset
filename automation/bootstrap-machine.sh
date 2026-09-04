#!/usr/bin/env bash
# bootstrap-machine.sh — Siapkan mesin SEO Boost baru/lama agar siap pakai repo seoboost-skill-set.
#
# Idempoten: aman dijalankan berulang kali. Tidak pernah menyentuh file di luar
# lingkup repo ini dan ~/.claude/skills (lewat sync-skills.sh).
#
# Tahapan:
#   1. git pull --ff-only (kalau REPO_DIR adalah repo git)
#   2. panggil automation/sync-skills.sh (rsync skill seoboost-* ke ~/.claude/skills)
#   3. --design-stack: panggil automation/install-design-stack.sh (opsional, default lewati)
#   4. tunjuk automation/hooks/README.md untuk wiring hook manual
#   5. verifikasi akhir + checklist
#
# Portabel macOS (bash 3.2 bawaan) + Linux. Tidak pakai flag GNU-only.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

DESIGN_STACK=0
SHOW_HELP=0

usage() {
  cat <<'EOF'
Pemakaian: automation/bootstrap-machine.sh [opsi]

Menyiapkan mesin SEO Boost (baru atau lama) agar sinkron dengan repo seoboost-skill-set:
menarik commit terbaru, menyinkronkan skill ke ~/.claude/skills, dan mencetak
checklist verifikasi. Aman dijalankan berulang kali (idempoten).

Opsi:
  --design-stack   Ikut jalankan automation/install-design-stack.sh (unduh
                    stack design tambahan; butuh jaringan, dilewati secara
                    default karena bisa lambat di jaringan lama).
  -h, --help       Tampilkan bantuan ini lalu keluar.

Tahapan yang dijalankan:
  1. git pull --ff-only (hanya jika direktori repo ini adalah repo git)
  2. automation/sync-skills.sh (sinkron skill seoboost-* ke ~/.claude/skills)
  3. automation/install-design-stack.sh (hanya dengan --design-stack)
  4. Menunjuk automation/hooks/README.md untuk wiring hook Claude Code
     (wiring ~/.claude/settings.json dilakukan manual oleh operator, BUKAN
     oleh script ini)
  5. Verifikasi akhir: hitung skill tersinkron, cek binary claude, checklist

Catatan:
  - Script ini mengasumsikan sudah dijalankan dari dalam clone repo yang ada
    (tidak melakukan git clone awal).
  - Tidak pernah menjalankan git push atau menyentuh skill non-seoboost-* di
    ~/.claude/skills.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --design-stack)
      DESIGN_STACK=1
      ;;
    -h|--help)
      SHOW_HELP=1
      ;;
    *)
      echo "Argumen tidak dikenal: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ "$SHOW_HELP" -eq 1 ]; then
  usage
  exit 0
fi

# --- util pencetak status ------------------------------------------------

CHECKLIST=()
OVERALL_OK=1

log_step() {
  printf '\n== %s ==\n' "$1"
}

record() {
  # record <status: OK|LEWATI|PERINGATAN|GAGAL> <pesan>
  local status="$1"
  local msg="$2"
  CHECKLIST+=("[$status] $msg")
  if [ "$status" = "GAGAL" ]; then
    OVERALL_OK=0
  fi
}

# --- 1. git pull --ff-only -------------------------------------------------

log_step "1/5 Tarik commit terbaru"

if [ -d "$REPO_DIR/.git" ]; then
  if git -C "$REPO_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    if git -C "$REPO_DIR" pull --ff-only 2>&1; then
      record OK "git pull --ff-only berhasil (atau sudah up to date)"
    else
      record PERINGATAN "git pull --ff-only gagal (cek jaringan atau divergensi lokal) — lanjut dengan kode lokal yang ada"
    fi
  else
    record LEWATI "$REPO_DIR bukan work tree git yang valid, lewati pull"
  fi
else
  record LEWATI "$REPO_DIR bukan repo git (tidak ada .git), lewati pull"
fi

# --- 2. sync-skills.sh -------------------------------------------------

log_step "2/5 Sinkronkan skill ke ~/.claude/skills"

SYNC_SCRIPT="$SCRIPT_DIR/sync-skills.sh"
if [ -f "$SYNC_SCRIPT" ]; then
  if bash "$SYNC_SCRIPT"; then
    record OK "automation/sync-skills.sh selesai dijalankan"
  else
    record GAGAL "automation/sync-skills.sh gagal (exit code bukan 0)"
  fi
else
  record PERINGATAN "automation/sync-skills.sh belum ada di $SCRIPT_DIR — lewati sinkronisasi (jalankan ulang bootstrap setelah script tersedia)"
fi

# --- 3. design stack (opsional) -----------------------------------------

log_step "3/5 Stack design opsional (--design-stack)"

DESIGN_SCRIPT="$SCRIPT_DIR/install-design-stack.sh"
if [ "$DESIGN_STACK" -eq 1 ]; then
  if [ -f "$DESIGN_SCRIPT" ]; then
    if bash "$DESIGN_SCRIPT"; then
      record OK "automation/install-design-stack.sh selesai dijalankan"
    else
      record PERINGATAN "automation/install-design-stack.sh gagal — cek jaringan, boleh diulang manual nanti"
    fi
  else
    record PERINGATAN "--design-stack diminta tapi automation/install-design-stack.sh belum ada, dilewati"
  fi
else
  record LEWATI "--design-stack tidak diminta, stack design dilewati (default)"
fi

# --- 4. pointer wiring hook ----------------------------------------------

log_step "4/5 Wiring hook Claude Code (manual)"

HOOKS_README="$SCRIPT_DIR/hooks/README.md"
if [ -f "$HOOKS_README" ]; then
  echo "Hook pre-push-guard dan pre-compact-reminder tersedia di automation/hooks/."
  echo "Wiring ke ~/.claude/settings.json dilakukan MANUAL oleh operator — ikuti:"
  echo "  $HOOKS_README"
  record OK "Pointer wiring hook tersedia di automation/hooks/README.md (wiring manual oleh operator)"
else
  record PERINGATAN "automation/hooks/README.md belum ada — wiring hook belum bisa dirujuk"
fi

# --- 5. verifikasi akhir ---------------------------------------------------

log_step "5/5 Verifikasi akhir"

SYNCED_COUNT=0
if [ -d "$SKILLS_DIR" ]; then
  for d in "$SKILLS_DIR"/seoboost-*/; do
    [ -d "$d" ] || continue
    SYNCED_COUNT=$((SYNCED_COUNT + 1))
  done
fi
record OK "Skill seoboost-* tersinkron di $SKILLS_DIR: $SYNCED_COUNT"

if command -v claude >/dev/null 2>&1; then
  CLAUDE_PATH="$(command -v claude)"
  record OK "Binary claude ditemukan: $CLAUDE_PATH"
else
  record PERINGATAN "Binary claude tidak ditemukan di PATH — pasang Claude Code sebelum lanjut"
fi

printf '\n== Checklist bootstrap-machine.sh ==\n'
for line in "${CHECKLIST[@]}"; do
  printf '%s\n' "$line"
done

echo
echo "Catatan: restart sesi Claude Code agar skill yang baru disinkronkan aktif."

if [ "$OVERALL_OK" -eq 1 ]; then
  exit 0
else
  exit 1
fi
