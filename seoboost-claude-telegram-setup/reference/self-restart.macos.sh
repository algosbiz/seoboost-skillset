#!/usr/bin/env bash
# macOS self-restart of the Telegram channel host (launchd, not systemd).
#
# The channels agent lives INSIDE the launchd job. A plain in-process
# `launchctl kickstart` would race with the agent's own death (it gets killed
# mid-command). So we detach: spawn a background sleeper that fires the restart
# ~3s later, fully independent of this job being torn down. The 3s delay lets the
# agent send a "restarting" reply to Telegram before it is terminated.
#
# Narrowly allowlist ONLY this exact path in ~/.claude/settings.json.
set -euo pipefail

nohup bash -c 'sleep 3; launchctl kickstart -k gui/'"$(id -u)"'/com.seoboost.telegram-channel' \
  >/dev/null 2>&1 &
disown
echo "restart scheduled in ~3s (detached)"
