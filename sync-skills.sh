#!/usr/bin/env bash
# Sync SEO Boost skills: repo (source of truth) -> ~/.claude/skills (what the Skill tool loads).
#
# The repo `seoboost-skill-set` is the SUPERSET (count it: `ls -d seoboost-*/ | wc -l`).
# The Skill tool only loads
# from ~/.claude/skills. This script mirrors every repo `seoboost-*` skill into that dir so
# the router never points at a skill the tool can't load.
#
# MODEL: edit skills in the REPO, not in ~/.claude/skills. Run this after every
#        `git pull`. Active copies are disposable mirrors of the repo.
#
# Usage:
#   ./sync-skills.sh            # add missing + update existing (safe: never deletes)
#   ./sync-skills.sh --missing  # ONLY copy skills absent from ~/.claude/skills (no overwrite)
#
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/.claude/skills"
MODE="${1:-update}"
mkdir -p "$DEST"

added=0; updated=0
for dir in "$REPO"/seoboost-*/; do
  name="$(basename "$dir")"
  if [ -e "$DEST/$name" ]; then
    if [ "$MODE" = "--missing" ]; then continue; fi
    cp -R "$dir." "$DEST/$name/"; updated=$((updated+1))
  else
    cp -R "$dir" "$DEST/$name"; added=$((added+1))
  fi
done
echo "Synced: $added added, $updated updated -> $DEST"
echo "Note: repo is source of truth. Edit skills in the repo, then re-run this. Never edit ~/.claude/skills directly."
