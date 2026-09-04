#!/usr/bin/env bash
# TEMPLATE — install to ~/.claude/channels/telegram/self-restart.sh and `chmod +x`.
#
# Clean, detached self-restart of the Telegram channel host. The channels agent
# lives INSIDE telegram-channel.service's cgroup, so a plain in-cgroup
# `systemctl --user restart` would be killed together with the agent mid-call
# (race -> the restart may never register). systemd-run schedules the restart in
# its OWN transient timer unit that fires ~3s later, fully independent of — and
# surviving — this service being torn down. The 3s delay also lets the agent send
# a "restarting" reply to the channel before it is terminated.
#
# Narrowly allowlist ONLY this exact path in ~/.claude/settings.json so the agent
# can run THIS and nothing else without a prompt. Do not add args or generalize.
set -euo pipefail

exec systemd-run --user --quiet --collect --on-active=3s \
  systemctl --user restart telegram-channel.service
