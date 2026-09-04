#!/usr/bin/env bash
# health_check.sh — verify EVERY Hermes profile healthy after a restart/cutover.
# Skill: seoboost-hermes-agent-update. Run post-cutover + post-rollback.
# Auto-discovers ai.hermes.* launchd services — no hardcoded profile names.
set -uo pipefail
U="$(id -u)"
LOG="$HOME/.hermes/logs/gateway.log"
VENV_PY="$HOME/.hermes/hermes-agent/venv/bin/python3"
PORTS=(3000 3001)   # EDIT: bridge ports, one per profile
fail=0
ok(){ printf '  ✓ %s\n' "$1"; }
warn(){ printf '  ⚠ %s\n' "$1"; }
err(){ printf '  ✗ %s\n' "$1"; fail=1; }

echo "=== Hermes multi-profile health check ($(date '+%Y-%m-%d %H:%M:%S')) ==="

# 1. Gateway processes
N="$(pgrep -f 'hermes_cli.main gateway' | wc -l | tr -d ' ')"
[ "$N" -ge 1 ] && ok "$N gateway process(es) alive" || err "0 gateway processes"

# 2. launchd state for every discovered ai.hermes.* service
SVCS="$(launchctl list 2>/dev/null | awk '/ai\.hermes\./{print $3}')"
[ -n "$SVCS" ] || warn "no ai.hermes.* launchd services discovered"
for svc in $SVCS; do
  st="$(launchctl print "gui/$U/$svc" 2>/dev/null | awk -F'= ' '/state =/{print $2; exit}')"
  [ "$st" = "running" ] && ok "$svc: running" || err "$svc: state='${st:-not-loaded}'"
done

# 3. Bridge ports listening
for port in "${PORTS[@]}"; do
  lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 \
    && ok "bridge port $port listening" || warn "bridge port $port NOT listening"
done

# 4. Version
if [ -x "$VENV_PY" ]; then
  V="$("$VENV_PY" -m pip show hermes-agent 2>/dev/null | awk '/^Version:/{print $2}')"
  [ -n "$V" ] && ok "hermes-agent version $V" || warn "could not read hermes-agent version"
fi
GITDESC="$(git -C "$HOME/.hermes/hermes-agent" describe --tags --always 2>/dev/null)"
[ -n "$GITDESC" ] && ok "git: $GITDESC ($(git -C "$HOME/.hermes/hermes-agent" branch --show-current 2>/dev/null))"

# 5. Recent fatal errors in log (last 60 lines)
if [ -f "$LOG" ]; then
  HITS="$(tail -60 "$LOG" | grep -icE 'traceback|fatal|exited unexpectedly|no module named' || true)"
  [ "$HITS" -eq 0 ] && ok "no fatal errors in last 60 log lines" \
    || warn "$HITS error-ish line(s) in recent log — inspect: tail -60 $LOG"
fi

# 6. Safety custom-patch markers present in live code
P="$(grep -cE 'dangercmd-gate|free-response-drop|channel-bound-persona' \
     "$HOME/.hermes/hermes-agent/gateway/run.py" 2>/dev/null || echo 0)"
[ "${P:-0}" -ge 1 ] && ok "safety-patch markers present in gateway/run.py" \
  || err "safety-patch markers MISSING — re-port incomplete!"

echo ""
if [ "$fail" -eq 0 ]; then
  echo "✅ All profiles healthy. Hand to operator for live WA smoke test (every profile + brand-isolated group + dangercmd)."
else
  echo "❌ Health check FAILED — consider rollback (see ROLLBACK-PROCEDURE-*.md)."
fi
exit "$fail"
