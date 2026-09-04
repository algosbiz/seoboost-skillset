#!/usr/bin/env bash
# WhatsApp bridge watchdog for the Hermes gateway.
#
# Why this exists: the bridge can die while systemd still reports the gateway
# "active" — the Python gateway process stays up and simply respawns a bridge
# that WhatsApp immediately rejects. On 2026-08-19 that loop ran 35 times over
# two days and nobody knew; the operator found out by noticing silence.
# `GET /health` is the only honest signal.
#
# The important behaviour is NOT restarting. It is telling apart:
#   RECOVERABLE  — bridge wedged/crashed  -> restart, bounded
#   NEEDS HUMAN  — WhatsApp session logged out (Baileys code 401)
#                  -> restarting can NEVER fix this. Stop trying, alert, wait
#                     for a human to re-pair. Retrying just hides the problem.
#
# Alerts go over TELEGRAM on purpose: WhatsApp is the thing that breaks, so it
# cannot be its own courier.

set -uo pipefail

HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"
HEALTH_URL="http://127.0.0.1:${WA_BRIDGE_PORT:-3000}/health"
BRIDGE_LOG="$HERMES_HOME/whatsapp/bridge.log"
STATE_DIR="$HERMES_HOME/state"
FAIL_FILE="$STATE_DIR/wa-watchdog.fails"
ALERT_FILE="$STATE_DIR/wa-watchdog.last-alert"   # de-dupe: one alert per condition
SERVICE="hermes-gateway"
MAX_RESTARTS=3          # consecutive restarts before escalating to a human
TG_ENV="$HOME/.claude/channels/telegram/.env"
TG_ACCESS="$HOME/.claude/channels/telegram/access.json"

PAUSE_FILE="$STATE_DIR/wa-watchdog.pause"

mkdir -p "$STATE_DIR"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }

# Maintenance gate. During pairing the operator runs `bridge.js --pair-only`
# against the same session dir; a watchdog restart at that moment puts TWO
# Baileys processes on one session and corrupts the credentials. Disabling the
# timer by hand works until someone forgets — a flag file is checked every tick.
#   touch   $STATE_DIR/wa-watchdog.pause   # before pairing / upgrades
#   rm      $STATE_DIR/wa-watchdog.pause   # after
if [ -f "$PAUSE_FILE" ]; then
  log "paused ($PAUSE_FILE present) — no probe, no restart, no alert"
  exit 0
fi

notify() {
  # $1 = condition key (de-dupe), $2 = message
  local key="$1" msg="$2"
  [ -f "$ALERT_FILE" ] && [ "$(cat "$ALERT_FILE")" = "$key" ] && return 0
  echo "$key" > "$ALERT_FILE"

  local token chat
  token=$(grep -m1 '^TELEGRAM_BOT_TOKEN=' "$TG_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"'\''')
  chat=$(python3 -c "import json;print(json.load(open('$TG_ACCESS'))['allowFrom'][0])" 2>/dev/null)
  if [ -z "${token:-}" ] || [ -z "${chat:-}" ]; then
    log "ALERT (no telegram channel configured): $msg"
    return 0
  fi
  if curl -s -m 20 -X POST "https://api.telegram.org/bot${token}/sendMessage" \
          --data-urlencode "chat_id=${chat}" \
          --data-urlencode "text=${msg}" >/dev/null 2>&1; then
    log "alerted via telegram: $key"
  else
    # Alert failed to leave the machine — un-stick the de-dupe so the next
    # tick tries again, otherwise a transient network blip silences us forever.
    rm -f "$ALERT_FILE"
    log "telegram alert FAILED: $key (will retry next tick)"
  fi
}

clear_alert() { rm -f "$ALERT_FILE"; }

# A logged-out session is terminal — but only if it belongs to the CURRENT
# bridge lifetime. bridge.log is append-only, so logouts from earlier incidents
# survive re-pairing forever; a naive tail/grep would read those stale lines and
# refuse to restart a bridge that merely wedged. Anchor on the most recent
# "listening on port" line: a logout only counts if it came after that.
session_logged_out() {
  [ -f "$BRIDGE_LOG" ] || return 1
  awk '/listening on port/ { seen = 0 }
       /Logged out/        { seen = 1 }
       END                 { exit !seen }' "$BRIDGE_LOG"
}

# Is outbound internet reachable at all? A bridge that cannot reach WhatsApp
# because the HOST is offline is not a Hermes fault, and no restart can fix it.
# Telegram doubles as the probe: it is the courier we would need anyway, so if
# this fails we could not have alerted regardless.
internet_up() { curl -fs -m 8 -o /dev/null "https://api.telegram.org"; }

fails=$(cat "$FAIL_FILE" 2>/dev/null || echo 0)

if curl -fs -m 10 "$HEALTH_URL" | grep -q '"status":"connected"'; then
  if [ "$fails" -ne 0 ]; then
    log "bridge healthy again after $fails failure(s)"
    # An alarm with no all-clear teaches the operator to ignore alarms. Only
    # send this when we actually raised one, so recovery is never a surprise.
    if [ -f "$ALERT_FILE" ]; then
      prev=$(cat "$ALERT_FILE")
      clear_alert
      notify "recovered" "🟢 Hermes WhatsApp PULIH — normal lagi setelah $fails kegagalan (sebelumnya: $prev). Tidak ada tindakan yang diperlukan."
      clear_alert   # let the next incident alert freely
    fi
  fi
  echo 0 > "$FAIL_FILE"
  clear_alert
  exit 0
fi

# --- unhealthy from here ---------------------------------------------------

if ! internet_up; then
  # The host has no outbound network. Restarting churns the bridge for nothing
  # and the alert could not leave the machine anyway. Record and wait it out;
  # normal handling resumes the moment connectivity returns.
  log "bridge unhealthy BUT host has no outbound network — restart withheld (nothing to fix here)"
  exit 0
fi

if session_logged_out; then
  # Restarting is futile. Say so, once, and stop.
  notify "logged_out" \
"🔴 Hermes WhatsApp MATI — sesi ter-logout (Baileys 401)

Restart TIDAK akan memperbaiki ini. Perlu pairing ulang:

1) cek HP nomor agent → WhatsApp → Perangkat Tertaut
2) systemctl --user stop hermes-gateway
3) rm -rf $HERMES_HOME/whatsapp/session
4) cd $HERMES_HOME/hermes-agent/scripts/whatsapp-bridge && node bridge.js --pair-only
5) scan QR, lalu: systemctl --user start hermes-gateway

Watchdog berhenti mencoba sampai sesi dipulihkan."
  log "session logged out — restart withheld deliberately, waiting for human"
  exit 0
fi

fails=$((fails + 1))
echo "$fails" > "$FAIL_FILE"
log "bridge unhealthy (consecutive failures: $fails)"

if [ "$fails" -le "$MAX_RESTARTS" ]; then
  log "restarting $SERVICE (attempt $fails/$MAX_RESTARTS)"
  systemctl --user restart "$SERVICE"
  exit 0
fi

notify "restart_exhausted" \
"🔴 Hermes WhatsApp MATI — $fails kali gagal, $MAX_RESTARTS restart tidak menolong

Bukan kasus logout. Perlu diperiksa manual:
  systemctl --user status hermes-gateway
  tail -50 ~/.hermes/whatsapp/bridge.log
  tail -50 ~/.hermes/logs/gateway.log

Watchdog berhenti me-restart agar tidak menutupi penyebabnya."
log "restart budget exhausted — escalated to human, no further restarts"
