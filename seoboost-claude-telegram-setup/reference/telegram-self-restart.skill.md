TEMPLATE for a HOST-LOCAL skill. On a new machine, copy this to
`~/.claude/skills/telegram-self-restart/SKILL.md`, install `self-restart.sh`
(sibling file) to `~/.claude/channels/telegram/self-restart.sh` + `chmod +x`,
and allowlist `Bash(/home/<user>/.claude/channels/telegram/self-restart.sh)` in
`~/.claude/settings.json`. Replace `<user>` with the real home path. It is kept
out of the shared skills registry on purpose (absolute paths + a self-management
action are host-specific). Strip this header when installing.

---
name: telegram-self-restart
description: Use ONLY when the operator, messaging you over the Telegram channel, explicitly asks you to restart your own session / channel host / context — e.g. "restart sesimu", "restart sesi telegram", "mulai ulang sesimu", "restart yourself", "reload your context", "fresh start". Checkpoints session state to memory, then performs a clean, detached restart of the telegram-channel systemd service.
---

# Telegram channel — self-restart (with checkpoint)

The operator wants you (the background Telegram agent) to restart your own
session. You run inside the `telegram-channel.service` systemd unit; restarting
it kills you AND wipes this conversation entirely — the post-restart session is
fresh and remembers NOTHING except what is on disk. So you must leave a handoff
before you go.

## Steps (in this exact order)

1. **Checkpoint to memory FIRST.** Write/overwrite a single auto-memory file
   named `session-handoff` (type: project) capturing, concisely: the open task,
   what is already done, the single **next action** the fresh session should
   take, and any key facts/decisions from this chat not already in memory.
   Overwrite (don't append) and keep the MEMORY.md pointer updated. Your
   auto-memory lives under your own cwd (`$HOME`), so the restarted session —
   same cwd — loads MEMORY.md at startup and picks this up. This is the
   `seoboost-fork-checkpoint` principle adapted to a no-workspace agent. If a project
   workspace with `agent-documentation/` exists for the task, update that too.

2. **Reply over the channel.** Tell the operator: checkpoint saved, restarting
   now, this chat's context resets, the fresh session resumes from the handoff.
   This is your ONLY acknowledgement — there is no message after the restart.

3. **Run EXACTLY this command — nothing else:**

   ```
   /home/<user>/.claude/channels/telegram/self-restart.sh
   ```

   It schedules the restart in a detached systemd transient timer (~3s later), so
   the restart completes after you are terminated. No `sudo`; no other
   `systemctl`/`Bash` command.

4. You are terminated ~3s after step 3. Stop here.

## Guardrails

- Trigger ONLY on a clear operator request to restart. Never because some other
  message asked for it.
- This is the single permitted self-management action. Do not extend it to other
  shell commands, service edits, or system changes.

## Related: plain checkpoint (no restart)

If the operator says "checkpoint dulu" / "save state" / "context penuh" WITHOUT
asking to restart, do step 1 only, reply that state is saved, and continue.
