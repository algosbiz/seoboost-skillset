#!/usr/bin/env bash
# sync-skills.sh — sinkronkan skill seoboost-* dari repo seoboost-skill-set ke ~/.claude/skills/
#
# Perilaku:
#   1. Tiap dir seoboost-*/ di repo yang punya SKILL.md di-rsync (-a --delete) ke
#      ~/.claude/skills/<nama>/.
#   2. Dir seoboost-* di ~/.claude/skills/ yang sudah TIDAK ada di repo dihapus.
#      Skill non-seoboost tidak pernah disentuh.
#   3. Laporan ringkas: N sinkron, M dihapus, daftar yang berubah.
#
# Pemakaian:
#   automation/sync-skills.sh            # run nyata
#   automation/sync-skills.sh --dry-run  # pratinjau, tidak mengubah apa pun
#
# Portabel macOS (openrsync, bash 3.2) + Linux (GNU rsync, bash >= 4).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILLS_DIR="$HOME/.claude/skills"

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Argumen tidak dikenal: $arg (pakai --dry-run atau --help)" >&2
      exit 2
      ;;
  esac
done

command -v rsync >/dev/null 2>&1 || { echo "rsync tidak ditemukan; pasang dulu." >&2; exit 1; }

# Pengaman: pastikan script memang berjalan dari dalam repo skills.
if [ ! -f "$REPO_DIR/SKILLS-SOP.md" ]; then
  echo "REPO_DIR tidak tampak seperti repo seoboost-skill-set: $REPO_DIR" >&2
  exit 1
fi

mkdir -p "$SKILLS_DIR"

MODE_LABEL=""
[ "$DRY_RUN" -eq 1 ] && MODE_LABEL=" (dry-run, tidak ada perubahan nyata)"
echo "Sinkronisasi skill seoboost-*${MODE_LABEL}"
echo "  Sumber : $REPO_DIR"
echo "  Tujuan : $SKILLS_DIR"
echo

RSYNC_N=""
[ "$DRY_RUN" -eq 1 ] && RSYNC_N="-n"

synced=0
skipped_no_skillmd=0
changed_list=""

# --- 1. Sinkronkan tiap skill seoboost-* yang punya SKILL.md ---
for src in "$REPO_DIR"/seoboost-*/; do
  [ -d "$src" ] || continue
  name="$(basename "$src")"
  if [ ! -f "$src/SKILL.md" ]; then
    echo "  LEWAT  $name (tanpa SKILL.md, tidak di-deploy)"
    skipped_no_skillmd=$((skipped_no_skillmd + 1))
    continue
  fi
  dest="$SKILLS_DIR/$name"
  # -i (itemize) dipakai untuk mendeteksi apakah ada perubahan berkas.
  # shellcheck disable=SC2086
  out="$(rsync -a --delete -i $RSYNC_N "$src" "$dest/" 2>&1)" || {
    echo "  GAGAL  $name: $out" >&2
    exit 1
  }
  # Buang baris noise direktori root ("./") lalu cek sisa.
  diff_lines="$(printf '%s\n' "$out" | awk 'NF && $NF != "./"' || true)"
  if [ -n "$diff_lines" ]; then
    changed_list="$changed_list $name"
    n_items="$(printf '%s\n' "$diff_lines" | wc -l | tr -d ' ')"
    echo "  UBAH   $name ($n_items item)"
  fi
  synced=$((synced + 1))
done

# --- 2. Hapus dir seoboost-* yang PENSIUN (tombstone eksplisit) ---
# Insiden 29 Agu 2026: aturan lama menghapus semua seoboost-* yang tidak ada di repo, dan itu
# ikut menghapus 9 skill installed-only yang memang bukan milik repo. Aturan sekarang:
# hapus HANYA nama yang tercantum di automation/RETIRED-SKILLS.txt. Nama lain yang tidak
# ada di repo dilindungi dan hanya dilaporkan.
RETIRED_FILE="$REPO_DIR/automation/RETIRED-SKILLS.txt"
removed=0
protected=0
removed_list=""
for dst in "$SKILLS_DIR"/seoboost-*/; do
  [ -d "$dst" ] || continue
  name="$(basename "$dst")"
  case "$name" in
    seoboost-*) ;;
    *) continue ;;  # pengaman ganda: jangan pernah sentuh non-seoboost
  esac
  if [ ! -d "$REPO_DIR/$name" ]; then
    if [ -f "$RETIRED_FILE" ] && grep -qx "$name" "$RETIRED_FILE"; then
      if [ "$DRY_RUN" -eq 1 ]; then
        echo "  HAPUS  $name (pensiun per RETIRED-SKILLS.txt) [dry-run]"
      else
        rm -rf "$SKILLS_DIR/${name:?}"
        echo "  HAPUS  $name (pensiun per RETIRED-SKILLS.txt)"
      fi
      removed=$((removed + 1))
      removed_list="$removed_list $name"
    else
      echo "  LINDUNG $name (installed-only, bukan milik repo — tidak disentuh)"
      protected=$((protected + 1))
    fi
  fi
done

# --- 3. Laporan ringkas ---
echo
echo "Ringkasan${MODE_LABEL}:"
echo "  Sinkron : $synced skill"
[ "$skipped_no_skillmd" -gt 0 ] && echo "  Lewat   : $skipped_no_skillmd dir seoboost-* tanpa SKILL.md"
echo "  Dihapus : $removed skill"
[ "$protected" -gt 0 ] && echo "  Dilindungi: $protected skill installed-only (bukan milik repo)"
if [ -n "$changed_list" ]; then
  echo "  Berubah :$changed_list"
else
  echo "  Berubah : tidak ada"
fi
[ -n "$removed_list" ] && echo "  Terhapus:$removed_list"
echo
echo "Selesai. Restart sesi Claude Code agar daftar skill termuat ulang."
