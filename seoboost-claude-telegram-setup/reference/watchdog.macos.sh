#!/usr/bin/env bash
# macOS watchdog for the Telegram channel host. Runs every 5 min via launchd
# (com.seoboost.telegram-watchdog). Install to ~/.claude/channels/telegram/watchdog.sh.
#
# ── WHY THIS EXISTS (learned the hard way, 2026-07-06) ──────────────────────
# The `claude --channels` session HANGS after being used a while (long convo,
# heavy task, or aging session). Failure mode: process alive (STAT Ss+), poller
# alive, but the agent stops turning inbound DMs into turns and its transcript
# mtime freezes. Two distinct hang sub-modes were seen:
#   1. pending>0: poller can't/doesn't pull  → old pending-based check caught it
#   2. pending=0: poller PULLS the message (offset advances, pending back to 0)
#      but never injects it as an agent turn → the message is silently lost and
#      the OLD pending-based watchdog NEVER fired. THIS is the nasty one.
# A manual restart can also leave an ORPHAN poller (old PID) still holding the
# getUpdates lock while the fresh host has none → still silent.
#
# ── DESIGN: SAFE, never touches getUpdates ──────────────────────────────────
# An earlier attempt polled getUpdates(offset=-1) to detect "a new message
# arrived but wasn't processed". REJECTED: a second getUpdates consumer RACES the
# poller and can STEAL/LOSE the user's message. Also offset=-1 returns empty once
# consumed, so it's unreliable anyway. This version decides purely from local
# process state + transcript mtime — zero Telegram API calls.
#
# Restarts ONLY on genuinely-broken process state:
#   (A)  no `bun server.ts` poller
#   (A2) >1 poller (rival/orphan) — kill all by PID, restart clean
#   (B)  bot.pid != running poller (stray)
#
# A transcript-freshness ("restart if stale") check was DELIBERATELY REMOVED — it
# causes a restart-loop (a just-restarted idle session is also stale → re-triggers
# every N min; verified 14h loop). Staleness != hang. The real silent-bot causes
# are (1) missing dontAsk, (2) rival Claude.app poller, (3) agent not calling reply;
# fix those (see SKILL.md Step 6b "3 REAL causes"), not with a watchdog heuristic.
# e.g. cwd /Users/alice -> ~/.claude/projects/-Users-alice/. Derived below from
# $HOME. Set TELEGRAM_WATCHDOG_EXCLUDE to your interactive dev-session jsonl id so
# the watchdog reads the CHANNELS agent's transcript, not your dev session.
set -uo pipefail

LABEL="com.seoboost.telegram-channel"
UID_N="$(id -u)"
BOTPID_F="$HOME/.claude/channels/telegram/bot.pid"
LOG="$HOME/Library/Logs/seoboost-telegram-watchdog.log"
MIN_POLLER_AGE=300      # don't restart a host younger than this (let it settle)

ts() { date '+%Y-%m-%d %H:%M:%S'; }
say() { echo "$(ts) $*" >> "$LOG"; }
restart() { say "RESTART ($1)"; launchctl kickstart -k "gui/$UID_N/$LABEL" >/dev/null 2>&1; }

now=$(date +%s)

# --- A: poller present? ---
server_pids=$(ps -eo pid,command | grep 'bun server.ts' | grep -v grep | awk '{print $1}')
if [ -z "$server_pids" ]; then restart "no poller"; exit 0; fi

# --- A2: multiple pollers? ---
n_poll=$(echo "$server_pids" | grep -c .)
if [ "$n_poll" -gt 1 ]; then
  for p in $server_pids; do kill -9 "$p" 2>/dev/null; done
  for p in $(ps -eo pid,command | grep 'telegram/.*silent start' | grep -v grep | awk '{print $1}'); do kill -9 "$p" 2>/dev/null; done
  restart "multiple pollers ($n_poll)"; exit 0
fi

# --- B: bot.pid match? ---
if [ -f "$BOTPID_F" ]; then
  recorded=$(cat "$BOTPID_F" 2>/dev/null)
  if [ -n "$recorded" ] && ! echo "$server_pids" | grep -qx "$recorded"; then
    restart "bot.pid mismatch (rec=$recorded run=$server_pids)"; exit 0
  fi
fi

# --- poller age (don't restart a just-booted host) ---
poller_pid=$(echo "$server_pids" | head -1)
pstart=$(ps -o lstart= -p "$poller_pid" 2>/dev/null)
page=0
if [ -n "$pstart" ]; then
  pepoch=$(date -j -f '%a %b %d %T %Y' "$pstart" +%s 2>/dev/null || echo "$now")
  page=$(( now - pepoch ))
fi
if [ "$page" -lt "$MIN_POLLER_AGE" ]; then
  say "OK (poller young ${page}s, settling)"; exit 0
fi

# --- (C) transcript-freshness restart: REMOVED on purpose ---
# A "restart if transcript hasn't grown in N minutes" check causes a RESTART-LOOP:
# a freshly-restarted idle session is also stale (no new DM -> flat transcript), so
# it re-triggers every N minutes (verified: 14h loop, bot never up long enough to
# answer). Staleness != hang. The real silent-bot causes are (1) missing dontAsk,
# (2) rival Claude.app poller, (3) agent not calling reply — fix those, not this.
# This watchdog now only acts on genuinely-broken process state (A/A2/B above).
say "OK (poller $poller_pid healthy, age ${page}s)"
