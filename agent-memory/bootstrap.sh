#!/usr/bin/env bash
# Idempotent agent-memory bootstrap for Claude Code.
# Wires the two agent-memory files (shared + this machine's per-machine) into the
# memory dir of each SEO Boost project, so second-memory auto-loads everywhere.
#
# Usage:
#   bash agent-memory/bootstrap.sh <label>           # all SEO Boost project memory dirs
#   bash agent-memory/bootstrap.sh <label> <slug>    # one specific project-slug dir name
#
# Safe to re-run: skips dirs already wired, never overwrites MEMORY.md entries.
set -uo pipefail

LABEL="${1:-}"
ONE_SLUG="${2:-}"
if [ -z "$LABEL" ]; then
  echo "usage: bash agent-memory/bootstrap.sh <label> [project-slug]" >&2
  exit 1
fi

REPO="$(cd "$(dirname "$0")/.." && pwd)"            # repo root (parent of agent-memory)
AM="$REPO/agent-memory"
SHARED="$AM/seoboost-skill-set-management.md"
PERMACH="$AM/seoboost-proactive-memory-$LABEL.md"
PROJ_ROOT="$HOME/.claude/projects"

if [ ! -f "$SHARED" ];  then echo "missing: $SHARED" >&2; exit 1; fi
if [ ! -f "$PERMACH" ]; then echo "missing per-machine file: $PERMACH (create it first, see README)" >&2; exit 1; fi

# Which memory dirs to wire?
dirs=()
if [ -n "$ONE_SLUG" ]; then
  d="$PROJ_ROOT/$ONE_SLUG/memory"
  [ -d "$d" ] || { echo "no memory dir for slug: $ONE_SLUG (open it in Claude Code once first)" >&2; exit 1; }
  dirs+=("$d")
else
  # All SEO Boost project memory dirs. Portable across path conventions:
  #   macOS : ...WORKSPACE-SEOBoost-SEOBoost-Projects-X  (matched by *SEOBoost* and *SEOBoost-Projects-*)
  #   Linux : ...Workspaces-SEOBoost-Projects-X     (matched by *SEOBoost-Projects-*)
  # The default unions these patterns (deduped). If your projects live elsewhere,
  # override: SEOBOOST_PROJECT_GLOBS="*Foo* *Bar*" bash agent-memory/bootstrap.sh <label>
  if [ -n "${SEOBOOST_PROJECT_GLOBS:-}" ]; then
    read -r -a globs <<< "$SEOBOOST_PROJECT_GLOBS"
  else
    globs=("*SEOBoost*" "*SEOBoost-Projects-*" "*SEOBoost-Projects-*")
  fi
  while IFS= read -r d; do dirs+=("$d"); done < <(
    for g in "${globs[@]}"; do
      # shellcheck disable=SC2086  # $g must stay unquoted so the glob expands
      ls -d "$PROJ_ROOT"/$g/memory 2>/dev/null
    done | sort -u
  )
fi

[ ${#dirs[@]} -eq 0 ] && { echo "no SEO Boost project memory dirs found under $PROJ_ROOT"; exit 0; }

wired=0; skipped=0
for MEM in "${dirs[@]}"; do
  changed=0
  # symlink shared + per-machine (only if not already the right symlink)
  for src in "$SHARED" "$PERMACH"; do
    base="$(basename "$src")"
    link="$MEM/$base"
    if [ -L "$link" ] && [ "$(readlink "$link")" = "$src" ]; then :; else
      ln -sf "$src" "$link"; changed=1
    fi
  done
  # add MEMORY.md pointer lines only if absent (never overwrite existing entries)
  MD="$MEM/MEMORY.md"; [ -f "$MD" ] || touch "$MD"
  grep -qF "seoboost-skill-set-management.md" "$MD" || {
    printf -- '- [SEO Boost agent-memory SHARED](seoboost-skill-set-management.md) — shared cross-machine reference (read at start of SEO Boost work)\n' >> "$MD"; changed=1; }
  grep -qF "seoboost-proactive-memory-$LABEL.md" "$MD" || {
    printf -- '- [SEO Boost agent-memory THIS MACHINE](seoboost-proactive-memory-%s.md) — per-machine memory (read at start; append durable learnings, commit & push)\n' "$LABEL" >> "$MD"; changed=1; }

  slug="$(basename "$(dirname "$MEM")")"
  if [ "$changed" -eq 1 ]; then wired=$((wired+1)); echo "  ✓ wired   $slug"; else skipped=$((skipped+1)); echo "  • already $slug"; fi
done

echo ""
echo "Done. wired=$wired  already-ok=$skipped  (total ${#dirs[@]})"
echo "Note: symlinks/pointers live OUTSIDE the repo (in ~/.claude/projects) — nothing to commit here."
