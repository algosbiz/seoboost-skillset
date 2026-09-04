#!/usr/bin/env bash
# install-design-stack.sh
#
# Installs the EXTERNAL design/UI skills that `seoboost-uiux-design-router` routes to.
# These skills are NOT in this repo. They come from public skills.sh registries,
# so `git pull` + sync-skills.sh will never bring them in. Run this once per machine.
#
# Established 2026-08-07 after n8n-seoboost reported the router dead-ending: it
# referenced 25 skills that exist only on the machine where the router was authored.
#
# Usage:
#   bash install-design-stack.sh            # install everything
#   bash install-design-stack.sh --check    # report what is missing, install nothing
#
# Requires: node/npx. Nothing else. No API key.

set -uo pipefail

CHECK_ONLY=0
[ "${1:-}" = "--check" ] && CHECK_ONLY=1

SKILLS_DIR="$HOME/.claude/skills"

# source_repo : skill1 skill2 ...
# Keep this list in sync with seoboost-uiux-design-router/SKILL.md "Prerequisites".
BUNDLES=(
  "pbakaus/impeccable|impeccable"
  "nextlevelbuilder/ui-ux-pro-max-skill|ui-ux-pro-max"
  "vercel-labs/agent-skills|web-design-guidelines"
  "emilkowalski/skills|emil-design-eng apple-design animation-vocabulary pick-ui-library"
  "greensock/gsap-skills|gsap-core gsap-timeline gsap-scrolltrigger gsap-plugins gsap-performance gsap-react gsap-utils gsap-frameworks"
)

# Leonxlnx/taste-skill ships 13 skills that all belong to the same taste bundle;
# installing them individually would drift as upstream adds more. Use --all.
TASTE_REPO="Leonxlnx/taste-skill"

missing_list() {
  local miss=()
  for entry in "${BUNDLES[@]}"; do
    for s in ${entry#*|}; do
      [ -e "$SKILLS_DIR/$s" ] || miss+=("$s")
    done
  done
  for s in design-taste-frontend minimalist-ui industrial-brutalist-ui \
           high-end-visual-design gpt-taste redesign-existing-projects \
           stitch-design-taste image-to-code imagegen-frontend-web \
           imagegen-frontend-mobile brandkit full-output-enforcement; do
    [ -e "$SKILLS_DIR/$s" ] || miss+=("$s")
  done
  # `set -u` makes "${miss[@]}" an error when the array is empty (bash < 4.4),
  # which is exactly the healthy case. Guard it.
  [ ${#miss[@]} -eq 0 ] || printf '%s\n' "${miss[@]}"
}

echo "=== SEO Boost design stack ==="
echo "skills dir: $SKILLS_DIR"
echo

BEFORE=$(missing_list | grep -c . || true)
echo "missing before: $BEFORE"

if [ "$CHECK_ONLY" = "1" ]; then
  [ "$BEFORE" -gt 0 ] && { echo; echo "Missing:"; missing_list | sed 's/^/  - /'; }
  echo
  echo "Check only. Nothing installed. Re-run without --check to install."
  exit 0
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: npx not found. Install Node.js first, then re-run." >&2
  exit 1
fi

FAILED=()

for entry in "${BUNDLES[@]}"; do
  repo="${entry%%|*}"
  skills="${entry#*|}"
  args=()
  for s in $skills; do args+=(--skill "$s"); done
  echo
  echo "--- $repo ---"
  if ! npx -y skills add "$repo" "${args[@]}" -a claude-code -g -y 2>&1 | tail -6; then
    FAILED+=("$repo")
  fi
done

echo
echo "--- $TASTE_REPO (--all) ---"
if ! npx -y skills add "$TASTE_REPO" --all -a claude-code -g -y 2>&1 | tail -6; then
  FAILED+=("$TASTE_REPO")
fi

AFTER=$(missing_list | grep -c . || true)
echo
echo "=== result ==="
echo "missing before: $BEFORE"
echo "missing after:  $AFTER"
[ "$AFTER" -gt 0 ] && { echo; echo "Still missing:"; missing_list | sed 's/^/  - /'; }
[ ${#FAILED[@]} -gt 0 ] && { echo; echo "Repos that errored: ${FAILED[*]}"; }

cat <<'MANUAL'

=== NOT covered by this script (deliberate) ===

1. 21st.dev MCP  (component generation, Tier 3)
   Needs YOUR OWN API key from https://21st.dev. Never commit a key to this repo.
     claude mcp add --transport http 21st https://21st.dev/api/mcp -s user \
       --header "x-api-key: <your-key>"

2. graphify  (codebase knowledge graph, not a design skill)
     pipx install graphifyy   # or: pip install --user graphifyy
     graphify install
   Then ensure the Python bin dir is on PATH.

3. Restart
   On machines where skills are real copies, new skills register only after a
   Claude Code restart. On machines where ~/.claude/skills entries are symlinks
   into the repo, they may register live. Restart anyway if unsure.
MANUAL
