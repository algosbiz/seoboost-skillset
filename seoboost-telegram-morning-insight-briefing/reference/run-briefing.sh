#!/usr/bin/env bash
# Generic scheduled-briefing runner. Install to ~/.claude/telegram-briefing/run-briefing.sh (chmod +x).
# Arg = profile id (e.g. "acme-daily"). Reads:
#   profiles/<id>/prompt.md     – the niche-tailored prompt (from the interview)
#   profiles/<id>/profile.env   – CHAT_ID=...  [BOT_TOKEN=...]  [ALLOWED_TOOLS="WebSearch WebFetch"]
# Generates with headless `claude -p` (web tools only -> no shell/file/secret access),
# then pushes to Telegram via Bot API. Driven by systemd template timers; survives reboot.
#
# IMPORTANT: the unit runs this with WorkingDirectory=%h (home), where the telegram
# plugin must be DISABLED — otherwise `claude -p` spawns a getUpdates poller that
# 409-conflicts with a live channels host. See seoboost-claude-telegram-setup.
set -euo pipefail

ID="${1:?usage: run-briefing.sh <profile-id>}"
ROOT="$HOME/.claude/telegram-briefing"
PDIR="$ROOT/profiles/$ID"
LOG="$ROOT/briefing.log"; ERR="$ROOT/briefing.err.log"
CLAUDE="$(command -v claude || echo /usr/local/bin/claude)"
mkdir -p "$ROOT"

[ -f "$PDIR/prompt.md" ] || { echo "[$(date -u +%FT%TZ)] $ID: no prompt.md" >>"$ERR"; exit 1; }

# Shared token fallback from an existing channel .env, then per-profile overrides.
BOT_TOKEN=""; CHAT_ID=""; ALLOWED_TOOLS="WebSearch WebFetch"
[ -f "$HOME/.claude/channels/telegram/.env" ] && { set -a; . "$HOME/.claude/channels/telegram/.env"; set +a; BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"; }
[ -f "$PDIR/profile.env" ] && { set -a; . "$PDIR/profile.env"; set +a; }
BOT_TOKEN="${BOT_TOKEN:-${TELEGRAM_BOT_TOKEN:-}}"
[ -n "$BOT_TOKEN" ] && [ -n "$CHAT_ID" ] || { echo "[$(date -u +%FT%TZ)] $ID: missing BOT_TOKEN/CHAT_ID" >>"$ERR"; exit 1; }

echo "[$(date -u +%FT%TZ)] $ID: generating…" >>"$LOG"

TEXT="$("$CLAUDE" -p "$(cat "$PDIR/prompt.md")" \
  --allowedTools $ALLOWED_TOOLS \
  --output-format text 2>>"$ERR" || true)"

TEXT="$(printf '%s' "$TEXT" | sed -e 's/[[:space:]]*$//')"
if [ -z "${TEXT//[[:space:]]/}" ]; then
  echo "[$(date -u +%FT%TZ)] $ID: EMPTY output — not sending (see $ERR)" >>"$LOG"; exit 1
fi
[ "${#TEXT}" -gt 4000 ] && TEXT="${TEXT:0:3950}"$'\n\n…(truncated)'

HTTP="$(curl -s -o "$ROOT/.last_resp.json" -w '%{http_code}' --max-time 40 \
  -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text=${TEXT}" \
  --data-urlencode "disable_web_page_preview=true")"

echo "[$(date -u +%FT%TZ)] $ID: sent http=$HTTP chars=${#TEXT}" >>"$LOG"
[ "$HTTP" = "200" ] || { cat "$ROOT/.last_resp.json" >>"$ERR" 2>/dev/null; exit 1; }
