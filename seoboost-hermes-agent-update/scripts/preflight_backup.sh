#!/usr/bin/env bash
# preflight_backup.sh — create + verify ALL rollback assets before a Hermes upstream update.
# Idempotent + date-stamped. Run BEFORE touching prod. Skill: seoboost-hermes-agent-update.
# Auto-discovers every Hermes profile home (~/.hermes and ~/.hermes-*) — no hardcoded names.
set -uo pipefail

D="$(date +%Y%m%d)"
CODE_DIR="$HOME/.hermes/hermes-agent"
BACKUP_DIR="$HOME/.hermes/backups"
VENV_PY="$CODE_DIR/venv/bin/python3"
[ -x "$VENV_PY" ] || VENV_PY="$(command -v python3)"
mkdir -p "$BACKUP_DIR"
fail=0
ok(){ printf '  ✓ %s\n' "$1"; }
err(){ printf '  ✗ %s\n' "$1"; fail=1; }

echo "=== Hermes preflight backup ($D) ==="

# 1. Git tag (instant code rollback) — idempotent
cd "$CODE_DIR" || { err "cannot cd $CODE_DIR"; exit 1; }
TAG="pre-update-$D"
HEAD_SHA="$(git rev-parse --short HEAD 2>/dev/null)"
if git rev-parse "$TAG" >/dev/null 2>&1; then
  ok "tag $TAG already exists ($(git rev-parse --short "$TAG"))"
else
  git tag -a "$TAG" -m "Pre-update snapshot $D (HEAD $HEAD_SHA). Rollback point." \
    && ok "tag $TAG created at $HEAD_SHA" || err "git tag failed"
fi

# 2. Dependency freeze (restore exact venv)
REQ="$BACKUP_DIR/requirements-snapshot-$D.txt"
if "$VENV_PY" -m pip freeze > "$REQ" 2>/dev/null && [ -s "$REQ" ]; then
  ok "dep freeze: $(wc -l < "$REQ" | tr -d ' ') pkgs → $REQ"
else err "pip freeze produced empty/failed file"; fi

# 3. Every profile's config + env (AUTO-DISCOVERED: ~/.hermes and ~/.hermes-*)
shopt -s nullglob
found=0
for home in "$HOME"/.hermes "$HOME"/.hermes-*; do
  [ -d "$home" ] || continue
  base="$(basename "$home")"                 # .hermes  or  .hermes-<name>
  for f in config.yaml .env; do
    if [ -f "$home/$f" ]; then
      dst="$BACKUP_DIR/${f//./_}-${base}-$D.bak"
      cp "$home/$f" "$dst" && { ok "backed up $base/$f"; found=$((found+1)); } || err "cp $home/$f"
    fi
  done
done
[ "$found" -ge 1 ] || err "no profile config/env found to back up"

# 4. Full tarball (catastrophic restore) — exclude junk; verify integrity
TAR="$BACKUP_DIR/hermes-agent-FULL-$D.tar.gz"
echo "  … building full tarball (may take a minute) …"
if tar --exclude='*/__pycache__' --exclude='*.pyc' \
       -czf "$TAR" -C "$HOME/.hermes" hermes-agent 2>/dev/null; then
  gzip -t "$TAR" 2>/dev/null && ok "tarball OK ($(du -h "$TAR" | cut -f1)) → $TAR" \
    || err "tarball failed gzip -t integrity check"
else err "tar create failed"; fi

# 5. Generate dated rollback procedure doc (lists discovered profiles + services)
DOC="$BACKUP_DIR/ROLLBACK-PROCEDURE-$D.md"
SVCS="$(launchctl list 2>/dev/null | awk '/ai\.hermes\./{print $3}' | tr '\n' ' ')"
{
  echo "# Hermes Rollback Procedure — snapshot $D"
  echo ""
  echo "## Critical: SHARED codebase"
  echo "All profiles run from $CODE_DIR, differ only by HERMES_PROFILE."
  echo "**Any rollback reverts ALL profiles. Test every profile after restore.**"
  echo ""
  echo "## Assets ($D)"
  echo "- Git tag: \`$TAG\` (HEAD $HEAD_SHA) — instant code rollback"
  echo "- Dep freeze: $REQ"
  echo "- Configs/envs: see $BACKUP_DIR/*-$D.bak (one pair per profile)"
  echo "- Full tarball: $TAR"
  echo "- launchd services detected: ${SVCS:-<none>}"
  echo ""
  echo "## SCENARIO 1 — Code rollback (most common)"
  echo '```bash'
  echo "cd $CODE_DIR && git stash; git checkout $TAG"
  echo "$VENV_PY -m pip install -r $REQ"
  echo "hermes gateway stop"
  for s in $SVCS; do [ "$s" = "ai.hermes.gateway" ] && continue; echo "launchctl kickstart -k gui/$(id -u)/$s"; done
  echo "hermes gateway start"
  echo '```'
  echo ""
  echo "## SCENARIO 2 — Config rollback"
  echo "Restore the relevant \`*-$D.bak\` back to each profile home, then restart (Scenario 1)."
  echo ""
  echo "## SCENARIO 3 — Catastrophic (dir corrupt)"
  echo '```bash'
  echo "hermes gateway stop"
  for s in $SVCS; do [ "$s" = "ai.hermes.gateway" ] && continue; echo "launchctl bootout gui/$(id -u)/$s 2>/dev/null"; done
  echo "cd $HOME/.hermes && mv hermes-agent hermes-agent-BROKEN-\$(date +%s)"
  echo "tar -xzf $TAR"
  echo "(cd hermes-agent/scripts/whatsapp-bridge && npm install) 2>/dev/null"
  echo "# re-bootstrap each launchd plist from ~/Library/LaunchAgents/"
  echo '```'
  echo ""
  echo "## Verify after rollback (ALWAYS every profile)"
  echo "1. \`pgrep -f hermes_cli.main\` → expect one PID per profile"
  echo "2. \`tail $HOME/.hermes/logs/gateway.log\` → 'whatsapp connected' + 'Gateway running'"
  echo "3. Live WA test each profile → replies, identities isolated"
} > "$DOC"
[ -s "$DOC" ] && ok "rollback doc → $DOC" || err "rollback doc write failed"

echo ""
if [ "$fail" -eq 0 ]; then
  echo "✅ ALL rollback assets ready + verified. Safe to proceed with update."
else
  echo "❌ One or more assets FAILED — DO NOT proceed until fixed."
fi
exit "$fail"
