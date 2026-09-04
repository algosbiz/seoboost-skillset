#!/usr/bin/env bash
# Switch the Telegram host back to CHANNELS (bun --channels) — macOS/launchd.
# Uses DISABLE (not just bootout) so the bridge does NOT revive after a reboot
# and cause a 409 rival-poller outage. See SKILL.md "after a REBOOT…409".
set -euo pipefail
U=$(id -u)
echo "→ stopping AND disabling bridge (survives reboot)..."
launchctl bootout "gui/$U/com.seoboost.telegram-bridge" 2>/dev/null || true
launchctl disable "gui/$U/com.seoboost.telegram-bridge" 2>/dev/null || true
sleep 2
for p in $(ps -eo pid,command | grep -E 'python.*bridge.py' | grep -v grep | awk '{print $1}'); do
  kill -9 "$p" 2>/dev/null || true
done
sleep 1
echo "→ enabling + starting channels..."
launchctl enable    "gui/$U/com.seoboost.telegram-channel" 2>/dev/null || true
launchctl bootstrap "gui/$U" ~/Library/LaunchAgents/com.seoboost.telegram-channel.plist 2>/dev/null || true
launchctl kickstart -k "gui/$U/com.seoboost.telegram-channel"
echo "✅ now on CHANNELS (bun). rollback: use-bridge.sh"
echo "   verify disabled: launchctl print-disabled gui/$U | grep telegram"
