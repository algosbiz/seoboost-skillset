#!/usr/bin/env bash
# PreCompact hook for the channels agent. Fires right before auto-compact.
# Writes a session-handoff auto-memory so the post-compact agent keeps context.
# The channels agent cwd is $HOME, so its memory dir is
# ~/.claude/projects/-Users-hash/memory/. We drop a single overwritten note.
#
# Hooks get JSON on stdin; we don't need it — just stamp a checkpoint marker.
set -uo pipefail
MEMDIR="$HOME/.claude/projects/-Users-hash/memory"
mkdir -p "$MEMDIR"
cat > "$MEMDIR/session-handoff.md" <<EOF
---
name: session-handoff
description: Channels agent checkpoint before auto-compact — resume context
metadata:
  type: project
---

Auto-compact fired at $(date '+%Y-%m-%d %H:%M:%S %Z'). This is the Telegram
channels agent (cwd \$HOME). After compact, continue serving Telegram DMs
normally. If the user asks "apa yang tadi", the pre-compact conversation was
summarized by the harness — check the compacted context. No manual task was
mid-flight unless a later note says so.
EOF
exit 0
