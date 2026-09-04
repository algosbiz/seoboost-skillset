---
name: seoboost-hermes-plugin-dispatch
description: Use when writing a Hermes Agent plugin that registers a slash command, particularly one that answers asynchronously — background work, a spawned process, or a dispatch to another agent such as Claude Code. Also use when a Hermes plugin command acknowledges fine and the job finishes with exit 0 but the result never reaches the chat, when HERMES_SESSION_CHAT_ID reads empty inside a command handler, when a plugin reply lands in the wrong conversation, or when a newly written plugin command appears unregistered. Covers register_command, pre_gateway_dispatch, plugin.yaml layout, and delivering a late reply through the platform bridge.
---

# Hermes plugin slash commands that answer later

## Overview

A Hermes plugin can register a slash command in ~20 lines. The hard part is not
registration — it is **answering after the handler has already returned**.

**Core principle: a slash-command handler does not know which chat it is in, and no
error will tell you.** Everything you would naturally reach for returns an empty
string, the command runs perfectly, and the reply is dropped on the floor.

## When to use

- Adding any `/command` to Hermes via a plugin
- The command starts work that outlives one request (a subprocess, an agent run, an HTTP call)
- Symptom: acknowledgement arrives, job completes, **no result ever appears in the chat**
- Symptom: `HERMES_SESSION_CHAT_ID` is empty inside the handler
- Symptom: a reply shows up in someone else's conversation

**Not for:** Hermes upstream upgrades or WhatsApp policy/config work — that is
`seoboost-hermes-agent-update`. Not for hardening what a remote channel may command — that is
`seoboost-remote-agent-hardening`.

## The one critical fact

`gateway/run.py::_handle_message` calls **`reset_session_vars()` on its first line**, as a
deliberate cross-session leak guard, and binds the real session identity much later, when
the agent turn begins. Slash commands are dispatched **between those two points**.

```
_handle_message()
  └─ reset_session_vars()        ← HERMES_SESSION_* cleared, on purpose
  └─ … slash command dispatch …  ← YOUR HANDLER RUNS HERE (no session context)
  └─ … agent turn …              ← session identity bound (too late for you)
```

So `get_session_env("HERMES_SESSION_CHAT_ID")` returning `""` is **not a bug and will
never be fixed** — it is the leak guard working. Any plugin that needs to know "who am I
replying to" must capture that itself.

This is structural. It applies to every Hermes version and every platform.

## Solution — capture the origin from `pre_gateway_dispatch`

That hook fires earlier in the *same asyncio task*, and its kwargs carry the event.

```python
import contextvars

# ContextVar, NOT a module global — see the concurrency warning below.
_origin = contextvars.ContextVar("plugin_origin", default=("", ""))

def _capture_origin(**kwargs):
    """pre_gateway_dispatch — observe only, return None so dispatch proceeds."""
    source = getattr(kwargs.get("event"), "source", None)
    chat_id = getattr(source, "chat_id", "") or ""
    platform = getattr(source, "platform", None)
    platform = getattr(platform, "value", platform) or ""
    if chat_id:
        _origin.set((str(platform), str(chat_id)))
    return None

def register(ctx):
    ctx.register_hook("pre_gateway_dispatch", _capture_origin)
    ctx.register_command("mycmd", handler=_handle, description="…",
                         args_hint="[target] instruction")
```

`_handle(raw_args)` then reads `_origin.get()` and hands the chat id to whatever
finishes the work later.

### Concurrency — the trap that passes every test you will run

A module-level global works flawlessly with one message and **misdelivers under
concurrency**. Two chats messaging at once, and the second overwrites the first's chat id
before the first run finishes — someone's reply lands in the other person's conversation.

Concurrent messages are separate asyncio tasks, so a `ContextVar` gives each one its own
value. Prove it rather than trusting it:

```python
async def main():
    a, b = await asyncio.gather(task_for_chat_A(), task_for_chat_B())
    assert a[1] != b[1], "origins bled across tasks"
```

## Delivering the late reply

Post to the platform bridge's HTTP endpoint rather than reaching into gateway internals —
the bridge is a stable surface, the internals are not. For WhatsApp the bridge listens on
`127.0.0.1:<bridge port>`:

```python
urllib.request.urlopen(urllib.request.Request(
    f"http://127.0.0.1:{port}/send",
    data=json.dumps({"chatId": chat_id, "message": text}).encode(),
    headers={"Content-Type": "application/json"}, method="POST"), timeout=60)
```

**Log the bridge's response body.** A success looks like
`{"success":true,"messageId":"…"}` — that JSON is the only proof delivery happened.
Absence of an exception proves nothing, and it is what made the original failure invisible.

## Plugin anatomy

| Path | Purpose |
|---|---|
| `$HERMES_HOME/plugins/<name>/plugin.yaml` | manifest — `name`, `version`, `description` |
| `$HERMES_HOME/plugins/<name>/__init__.py` | must define `def register(ctx)` |

Enable it, then restart the gateway (`hermes plugins enable <name>` reports "takes effect
on next session"). Decline the tool-override capability unless you genuinely intercept
built-in tools — a command-only plugin never needs it.

## Verifying registration — the obvious check gives a false negative

Plugin commands do **not** enter `hermes_cli.commands.COMMANDS`; that dict holds built-ins.
Checking it and finding nothing means nothing.

```python
from hermes_cli.plugins import discover_plugins, get_plugin_command_handler
discover_plugins(force=True)
print(get_plugin_command_handler("mycmd"))   # the authoritative check
```

Two more traps while verifying:
- Hermes' one-shot flag is **`-z`**, not `-p` (`-p` is parsed as a subcommand and errors).
- Slash commands are **not dispatched in one-shot mode** — the model answers the text as
  if it were a question, which looks like your command silently failing. Test the handler
  through `get_plugin_command_handler`, and test the full path from a real chat.

## If the command dispatches to another agent

- **Lock per target, not globally.** Two agents editing one repo at once is the failure
  you are preventing; unrelated targets should still run in parallel.
- **Decrement the queue counter when the run FINISHES**, not when it acquires the lock —
  otherwise an in-flight run is invisible and every acknowledgement claims an empty queue.
  Increment it in the handler (synchronously), not in the spawned thread, or it races the
  acknowledgement that reports it.
- **Refuse an unrecognised target instead of falling back to a default.** If the dispatched
  agent runs with permissions bypassed, a silent fallback executes the instruction against
  the wrong repository.
- Measure before choosing persistent-vs-spawned. Process spawn is often ~0.2 s, in which
  case a long-lived session costs more (held RAM) and reads results less reliably.

## Common mistakes

| Mistake | Reality |
|---|---|
| Reading `HERMES_SESSION_CHAT_ID` in the handler | Always empty — session vars are reset before dispatch |
| Module global for the captured origin | Passes single-message tests, misdelivers under concurrency |
| Treating "no exception" as delivered | Log the bridge JSON; that is the only evidence |
| Checking `COMMANDS` for your command | Plugin commands live elsewhere — false negative |
| Testing with `hermes -p "/cmd"` | Wrong flag, and one-shot does not dispatch slash commands |
| Editing the plugin and re-testing without restart | Enable/registration takes effect on the next session |

## Red flags — stop and re-check

- "The ack worked, so the plumbing is fine" — the ack is the handler's return value; it
  proves nothing about the late reply
- "exit 0, so it delivered"
- "It worked when I tested it" (with exactly one message)
- A result that exists only in your log

## Working example

`example-dispatch-plugin.py` in this directory is a complete, running plugin (paths
genericised) that forwards a chat command to headless Claude Code — origin capture,
per-target locking, timeout, truncation, and bridge delivery. Adapt it rather than
starting from a blank file.

## Related

- `seoboost-hermes-agent-update` — upstream upgrades, WhatsApp policy/config, profile setup
- `seoboost-remote-agent-hardening` — bounding what a remote channel is allowed to trigger
