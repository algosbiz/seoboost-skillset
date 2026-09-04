#!/usr/bin/env bash
# Switch the Telegram host to the BRIDGE (python claude -p) — macOS/launchd.
# Uses DISABLE (not just bootout) so the losing service does NOT come back after a
# reboot and cause a 409 rival-poller outage. See SKILL.md "after a REBOOT…409".
set -euo pipefail
U=$(id -u)
echo "→ stopping AND disabling channels + watchdog (survives reboot)..."
for L in com.seoboost.telegram-channel com.seoboost.telegram-watchdog; do
  launchctl bootout  "gui/$U/$L" 2>/dev/null || true
  launchctl disable  "gui/$U/$L" 2>/dev/null || true
done
sleep 2
# kill stray channels pollers by EXPLICIT PID (never pkill -f: it matches this shell)
for p in $(ps -eo pid,command | grep -E 'bun server.ts|telegram/.*silent start|claude --no-chrome --channels' | grep -v grep | awk '{print $1}'); do
  kill -9 "$p" 2>/dev/null || true
done
sleep 1
echo "→ enabling + starting bridge..."
launchctl enable    "gui/$U/com.seoboost.telegram-bridge" 2>/dev/null || true
launchctl bootstrap "gui/$U" ~/Library/LaunchAgents/com.seoboost.telegram-bridge.plist 2>/dev/null || true
launchctl kickstart -k "gui/$U/com.seoboost.telegram-bridge"
echo "✅ now on BRIDGE (python). rollback: use-channels.sh"
echo "   verify disabled: launchctl print-disabled gui/$U | grep telegram"
