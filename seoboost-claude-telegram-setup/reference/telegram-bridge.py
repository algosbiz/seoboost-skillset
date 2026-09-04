#!/usr/bin/env python3
"""
Telegram <-> Claude Code bridge (headless `claude -p`) — FALLBACK when Claude Code's
"Channels" feature is unavailable/gated off (see seoboost-claude-telegram-setup Pre-flight).

It reproduces the useful part of the official telegram channel plugin WITHOUT Channels:
long-poll Telegram, gate senders against access.json -> allowFrom (allowlist-only; silently
drops everyone else, never issues pairing codes), run each message through `claude -p`, reply.

Extras over the plain channel host:
  - images/PDFs: downloaded to inbox/ and Read by the agent (Opus vision sees screenshots)
  - per-chat project routing: bridge-projects.json {chat_id: {"cwd","label"}} runs a dedicated
    group in a project's cwd with its own session (no cross-chat mixing)

Install:  cp this -> ~/.claude/channels/telegram/bridge.py ; edit CLAUDE/WORKDIR below.
Run:      systemd user service, Type=simple, ExecStart=/usr/bin/python3 .../bridge.py, linger on.
State (all under ~/.claude/channels/telegram/):
  .env                 TELEGRAM_BOT_TOKEN=...
  access.json          {"allowFrom": ["<numeric id>", ...]}     (re-read every loop)
  bridge-offset        last Telegram update offset
  bridge-sessions.json {chat_id: claude_session_uuid}           (conversation continuity)
  bridge-projects.json {chat_id: {"cwd": "...", "label": "..."}} (optional per-chat scoping)

⚠️ TRUST GOTCHA: headless `claude -p` IGNORES a cwd's permissions.allow/deny unless that cwd is
trusted — set projects["<abs-cwd>"].hasTrustDialogAccepted=true in ~/.claude.json for WORKDIR and
every routed cwd, and give each its own .claude/settings.json (broad allow + secret deny).
"""
import json, os, sys, time, uuid, shutil, threading, subprocess
import urllib.request, urllib.parse, urllib.error

HOME      = os.path.expanduser("~")
STATE_DIR = os.path.join(HOME, ".claude/channels/telegram")
ENV_FILE  = os.path.join(STATE_DIR, ".env")
ACCESS    = os.path.join(STATE_DIR, "access.json")
OFFSET_F  = os.path.join(STATE_DIR, "bridge-offset")
SESS_F    = os.path.join(STATE_DIR, "bridge-sessions.json")
INBOX     = os.path.join(STATE_DIR, "inbox")
PROJECTS_F = os.path.join(STATE_DIR, "bridge-projects.json")
MODELS_F   = os.path.join(STATE_DIR, "bridge-models.json")     # {chat_id: alias}

# Selectable models per chat via /model; "default" = no --model flag (account default).
# Update the IDs to the current Claude model line as it evolves.
MODELS = {
    "opus":    ("claude-opus-4-8",           "Opus — most capable"),
    "sonnet":  ("claude-sonnet-4-6",         "Sonnet — fast & cheaper"),
    "haiku":   ("claude-haiku-4-5-20251001", "Haiku — lightest/cheapest"),
    "default": (None,                        "account default"),
}
TRANSCRIPT_F = os.path.join(STATE_DIR, "bridge-transcript.json")  # {chat_id: [recent group lines]}
RESPOND_F    = os.path.join(STATE_DIR, "bridge-respond.json")     # {chat_id: "all"}  (group reply mode)
BUFFER_MAX   = 60          # keep last N group messages as rolling context for the agent
BOT_ID = None              # filled at startup from getMe
BOT_USERNAME = ""

# --- EDIT THESE for your host ------------------------------------------------
CLAUDE   = shutil.which("claude") or "/usr/local/bin/claude"   # absolute path to the claude CLI
WORKDIR  = os.path.join(HOME, "telegram-agent")  # trusted cwd w/ .claude/settings.json (allow+deny)
ADD_DIRS = [HOME]                                # dirs the agent may touch (broad: whole home)
# -----------------------------------------------------------------------------
TURN_TIMEOUT = 900     # seconds per claude turn
TG_LONGPOLL  = 30      # getUpdates long-poll seconds
MAX_TG       = 4000    # Telegram hard cap 4096; chunk under it

SYS_APPEND = (
    "You are the operator's personal ops assistant, reached over Telegram. Replies render as "
    "plain Telegram messages: be concise, no heavy markdown tables. You have broad shell and file "
    "access (some credential files are blocked by policy). Do the task and report the result briefly."
)

def log(*a):
    print("[bridge]", *a, file=sys.stderr, flush=True)

def load_token():
    for line in open(ENV_FILE):
        line = line.strip()
        if line.startswith("TELEGRAM_BOT_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    log("FATAL: no TELEGRAM_BOT_TOKEN in", ENV_FILE); sys.exit(1)

TOKEN = load_token()
API   = "https://api.telegram.org/bot" + TOKEN

def tg(method, params=None, timeout=40):
    data = urllib.parse.urlencode(params or {}).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request("%s/%s" % (API, method), data=data), timeout=timeout) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        log("tg HTTPError", method, e.code, e.read()[:200]); return None
    except Exception as e:
        log("tg error", method, repr(e)); return None

def download_attachment(file_id, default_ext=".bin"):
    """getFile -> download bytes into inbox/, return local path (or None)."""
    r = tg("getFile", {"file_id": file_id})
    if not (r and r.get("ok")):
        return None
    fp = r["result"].get("file_path")
    if not fp:
        return None
    os.makedirs(INBOX, exist_ok=True)
    dest = os.path.join(INBOX, uuid.uuid4().hex + (os.path.splitext(fp)[1] or default_ext))
    try:
        with urllib.request.urlopen("https://api.telegram.org/file/bot%s/%s" % (TOKEN, fp), timeout=90) as resp, \
             open(dest, "wb") as f:
            f.write(resp.read())
        log("downloaded ->", dest); return dest
    except Exception as e:
        log("download error", repr(e)); return None

def prune_inbox(days=7):
    try:
        cutoff = time.time() - days * 86400
        for n in os.listdir(INBOX):
            p = os.path.join(INBOX, n)
            if os.path.isfile(p) and os.path.getmtime(p) < cutoff:
                os.remove(p)
    except Exception:
        pass

def allowlist():
    try:    return set(map(str, json.load(open(ACCESS)).get("allowFrom", [])))
    except Exception: return set()

def load_json(path, default):
    try:    return json.load(open(path))
    except Exception: return default

def save_json(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w") as f: json.dump(obj, f)
    os.replace(tmp, path)

def read_offset():
    try:    return int(open(OFFSET_F).read().strip())
    except Exception: return None

def write_offset(off):
    with open(OFFSET_F + ".tmp", "w") as f: f.write(str(off))
    os.replace(OFFSET_F + ".tmp", OFFSET_F)

def send_reply(chat_id, text):
    text = text if text.strip() else "(empty — agent produced no output)"
    for i in range(0, len(text), MAX_TG):
        tg("sendMessage", {"chat_id": chat_id, "text": text[i:i+MAX_TG]})

def typing_loop(chat_id, stop):
    while not stop.is_set():
        tg("sendChatAction", {"chat_id": chat_id, "action": "typing"}, timeout=15)
        stop.wait(4)

def run_claude(chat_id, text):
    sessions = load_json(SESS_F, {})
    key = str(chat_id)
    sid = sessions.get(key)

    # per-chat project scoping: chat_id -> {"cwd","label"}; unmapped -> WORKDIR
    proj = load_json(PROJECTS_F, {}).get(key) or {}
    cwd = proj.get("cwd") or WORKDIR
    sysp = SYS_APPEND
    if proj.get("cwd"):
        sysp += (" FOCUS: this chat is scoped to project '%s' at %s (your working directory). "
                 "Keep all work in this project; do not wander into other projects."
                 % (proj.get("label", "?"), cwd))
    base = [CLAUDE, "-p", "--permission-mode", "default", "--append-system-prompt", sysp]
    for d in ADD_DIRS: base += ["--add-dir", d]
    mid = MODELS.get(load_json(MODELS_F, {}).get(key, "default"), (None,))[0]
    if mid: base += ["--model", mid]          # per-chat model pin set via /model

    env = dict(os.environ)
    for k in ("ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY"):
        env.pop(k, None)  # force the claude.ai/Max login; never a third-party endpoint

    def invoke(args):
        return subprocess.run(args, input=text, cwd=cwd, env=env,
                              capture_output=True, text=True, timeout=TURN_TIMEOUT)

    args = base + (["--resume", sid] if sid else ["--session-id", (sid := str(uuid.uuid4()))])
    try:
        p = invoke(args)
    except subprocess.TimeoutExpired:
        return "⏳ Timeout (%ss) — task too long; break it into smaller steps." % TURN_TIMEOUT
    if p.returncode != 0 and "--resume" in args:  # session lost -> start fresh
        log("resume failed, fresh session:", p.stderr[-300:])
        sid = str(uuid.uuid4())
        try:
            p = invoke(base + ["--session-id", sid])
        except subprocess.TimeoutExpired:
            return "⏳ Timeout (%ss)." % TURN_TIMEOUT
    sessions[key] = sid; save_json(SESS_F, sessions)
    if p.returncode != 0:
        log("claude rc=%d stderr=%s" % (p.returncode, p.stderr[-500:]))
        return "⚠️ Agent error (rc=%d). %s" % (p.returncode, (p.stderr or "").strip()[-300:])
    return p.stdout.strip()

def parse_command(text):
    """'/model', '/model sonnet', '/model:sonnet', '/model@bot sonnet' -> (cmd, arg)."""
    if not text.startswith("/"):
        return None, None
    body = text[1:].strip()
    idx = len(body)
    for ch in (" ", ":", "\n"):
        i = body.find(ch)
        if i != -1: idx = min(idx, i)
    cmd = body[:idx].split("@", 1)[0].lower().strip()
    arg = (body[idx+1:] if idx < len(body) else "").lstrip(": ").strip()
    return cmd, arg

def cur_model(key):
    return load_json(MODELS_F, {}).get(key, "default")

def handle_command(chat_id, cmd, arg):
    """True if a recognized local command (not forwarded to the agent)."""
    key = str(chat_id)
    if cmd in ("help", "start"):
        send_reply(chat_id,
            "Commands:\n"
            "/model — list models + the active one\n"
            "/model <opus|sonnet|haiku|default> — switch model for THIS chat\n"
            "/project <abs-path> — scope THIS chat to a project folder (e.g. a dedicated group)\n"
            "/project off — back to the default workspace\n"
            "/observe all — reply to EVERY message in this group\n"
            "/observe mention — (default in groups) reply only when @mentioned/replied; still reads all as context\n"
            "/reset — start a fresh conversation (forget context)\n"
            "/status — this chat's model + project\n"
            "/help — this help\n\n"
            "Anything else (text or image) is a task for the agent.")
        return True
    if cmd == "model":
        if not arg:
            c = cur_model(key)
            lines = ["Active model: %s (%s)" % (c, MODELS.get(c, ("", ""))[1]), "", "Available:"]
            for a, (mid, desc) in MODELS.items():
                lines.append("- /model:%s -> %s%s" % (a, desc, "  <= active" if a == c else ""))
            send_reply(chat_id, "\n".join(lines))
        else:
            a = arg.lower().strip()
            if a not in MODELS:
                send_reply(chat_id, "Unknown model '%s'. Choices: %s" % (a, ", ".join(MODELS)))
            else:
                m = load_json(MODELS_F, {}); m[key] = a; save_json(MODELS_F, m)
                send_reply(chat_id, "OK — this chat now uses '%s' (%s). Applies from your next message."
                           % (a, MODELS[a][0] or "account default"))
        return True
    if cmd == "reset":
        s = load_json(SESS_F, {}); s.pop(key, None); save_json(SESS_F, s)
        send_reply(chat_id, "Session reset — next message starts a fresh conversation.")
        return True
    if cmd == "status":
        proj = load_json(PROJECTS_F, {}).get(key) or {}
        send_reply(chat_id, "Chat: %s\nModel: %s\nProject: %s\nWorkdir: %s"
                   % (key, cur_model(key), proj.get("label", "(default)"), proj.get("cwd") or WORKDIR))
        return True
    if cmd == "project":
        # Self-service per-chat project scoping: the bridge knows the chat_id natively, so a
        # dedicated group can scope itself with one message — no operator terminal, no restart.
        projects = load_json(PROJECTS_F, {})
        if not arg:
            cur = projects.get(key)
            send_reply(chat_id, ("This chat is scoped to: %s\ncwd: %s" % (cur.get("label"), cur.get("cwd")))
                       if cur else "This chat uses the default workspace (%s).\nSet one with: /project <abs-path>" % WORKDIR)
            return True
        if arg.lower() in ("off", "clear", "none", "default"):
            projects.pop(key, None); save_json(PROJECTS_F, projects)
            s = load_json(SESS_F, {}); s.pop(key, None); save_json(SESS_F, s)
            send_reply(chat_id, "Project scope cleared — back to the default workspace."); return True
        cwd = os.path.abspath(os.path.expanduser(arg))
        if not os.path.isdir(cwd):
            send_reply(chat_id, "Not a directory: %s\nGive an absolute path, e.g. /home/<user>/.../ProjectX" % cwd)
            return True
        label = os.path.basename(cwd.rstrip("/")) or cwd
        projects[key] = {"label": label, "cwd": cwd}; save_json(PROJECTS_F, projects)
        try:  # give the cwd the agent's permission posture (copy from WORKDIR if absent)
            os.makedirs(os.path.join(cwd, ".claude"), exist_ok=True)
            dst = os.path.join(cwd, ".claude", "settings.json")
            if not os.path.exists(dst):
                open(dst, "w").write(open(os.path.join(WORKDIR, ".claude", "settings.json")).read())
        except Exception as e:
            log("project settings copy failed", repr(e))
        try:  # TRUST the cwd in ~/.claude.json (else its allow/deny are silently ignored)
            cj = os.path.join(HOME, ".claude.json"); d = json.load(open(cj))
            d.setdefault("projects", {}).setdefault(cwd, {})["hasTrustDialogAccepted"] = True
            json.dump(d, open(cj, "w"), indent=2)
        except Exception as e:
            log("project trust set failed", repr(e))
        s = load_json(SESS_F, {}); s.pop(key, None); save_json(SESS_F, s)  # fresh session in new cwd
        send_reply(chat_id, "OK — this chat is now scoped to '%s'\ncwd: %s\nNext message runs there (fresh session). No restart." % (label, cwd))
        return True
    if cmd == "observe":
        r = load_json(RESPOND_F, {})
        if not arg:
            send_reply(chat_id, "Group reply mode: %s\n/observe all = reply to every message; "
                       "/observe mention = reply only when @mentioned/replied (still reads all as context)."
                       % (r.get(key) or "mention")); return True
        a = arg.lower().strip()
        if a == "all":
            r[key] = "all"; save_json(RESPOND_F, r)
            send_reply(chat_id, "OK — replying to ALL messages here (from allowlisted senders).")
        elif a in ("mention", "off", "default"):
            r.pop(key, None); save_json(RESPOND_F, r)
            send_reply(chat_id, "OK — replying only when @mentioned/replied/command here (still reading all as context).")
        else:
            send_reply(chat_id, "Use: /observe all  or  /observe mention")
        return True
    return False  # unknown /command -> fall through to the agent as plain text

def sender_name(msg):
    f = msg.get("from") or {}
    n = " ".join(x for x in (f.get("first_name"), f.get("last_name")) if x).strip()
    if n: return n
    if f.get("username"): return "@" + f["username"]
    return str(f.get("id", "?"))

def is_group_chat(msg):
    return (msg.get("chat") or {}).get("type") in ("group", "supergroup")

def is_addressed(msg):
    """In a group: is the bot explicitly addressed (reply-to-bot or @mention)?"""
    if ((msg.get("reply_to_message") or {}).get("from") or {}).get("id") == BOT_ID:
        return True
    text = msg.get("text") or msg.get("caption") or ""
    for e in (msg.get("entities") or []) + (msg.get("caption_entities") or []):
        if e.get("type") == "mention" and BOT_USERNAME:
            if text[e["offset"]:e["offset"] + e["length"]].lower() == ("@" + BOT_USERNAME).lower():
                return True
        if e.get("type") == "text_mention" and (e.get("user") or {}).get("id") == BOT_ID:
            return True
    return False

def buffer_add(chat_id, line):
    b = load_json(TRANSCRIPT_F, {}); k = str(chat_id)
    b[k] = (b.get(k, []) + [line])[-BUFFER_MAX:]
    save_json(TRANSCRIPT_F, b)

def buffer_take(chat_id):
    b = load_json(TRANSCRIPT_F, {}); lst = b.pop(str(chat_id), [])
    save_json(TRANSCRIPT_F, b); return lst

def react(chat_id, message_id, emoji):
    if not message_id: return
    tg("setMessageReaction", {"chat_id": chat_id, "message_id": message_id,
                              "reaction": json.dumps([{"type": "emoji", "emoji": emoji}])})

def handle(update):
    msg = update.get("message") or update.get("edited_message")
    if not msg: return
    chat_id = msg["chat"]["id"]; mid = msg.get("message_id")
    uid = str((msg.get("from") or {}).get("id", ""))
    allow = allowlist()
    caption = (msg.get("text") or msg.get("caption") or "").strip()
    group = is_group_chat(msg)

    # slash-commands: only from allowlisted senders, handled locally (never forwarded)
    if caption.startswith("/") and uid in allow:
        cmd, arg = parse_command(caption)
        if handle_command(chat_id, cmd, arg):
            log("cmd from", uid, cmd, repr(arg)); return

    if group:
        # GROUP: absorb EVERY message as rolling context; reply only when allowed.
        # mode "all" = reply to every allowlisted sender; "mention" (default) = only when addressed.
        mode = load_json(RESPOND_F, {}).get(str(chat_id)) or "mention"
        respond = (uid in allow) and (mode == "all" or is_addressed(msg))
        if not respond:
            if caption or msg.get("photo") or msg.get("document"):
                buffer_add(chat_id, "%s: %s" % (sender_name(msg), caption or "[attachment]"))
            return                                  # context only, no reply
    else:
        if uid not in allow:                        # DM: allowlisted only, replies to everything
            log("drop non-allowlisted DM", uid); return

    paths = []
    if msg.get("photo"):
        paths.append(download_attachment(msg["photo"][-1]["file_id"], ".jpg"))
    doc = msg.get("document")
    if doc and (doc.get("mime_type", "").startswith("image/") or doc.get("mime_type") == "application/pdf"):
        paths.append(download_attachment(doc["file_id"], ".bin"))
    paths = [p for p in paths if p]

    if not caption and not paths:
        if any(msg.get(k) for k in ("sticker", "voice", "video", "audio", "video_note", "document")):
            send_reply(chat_id, "Bridge handles text, images, and PDFs. This attachment type isn't supported yet.")
        return

    react(chat_id, mid, "👀")                        # ack: seen / working

    parts = []
    if group:
        ctx = buffer_take(chat_id)
        if ctx:
            parts.append("[Group conversation context (READ to understand the situation; do NOT reply to "
                         "each line — focus on the addressed message below):]\n" + "\n".join(ctx))
    body = caption
    if paths:
        listing = "\n".join("- %s" % p for p in paths)
        body = (body + "\n\n" if body else "") + ("[The user attached %d file(s). Use the Read tool on "
                "EACH path to VIEW it, then respond based on what you see:]\n%s" % (len(paths), listing))
    parts.append(("[Message addressed to you from %s:]\n%s" % (sender_name(msg), body)) if group else body)
    prompt = "\n\n".join(parts)

    log("%s from %s" % ("group" if group else "dm", uid), repr(caption[:60]), "att=%d" % len(paths))
    stop = threading.Event()
    threading.Thread(target=typing_loop, args=(chat_id, stop), daemon=True).start()
    try:
        reply = run_claude(chat_id, prompt)
    except Exception as e:
        log("handle error", repr(e)); reply = "⚠️ Internal error: %r" % e
    finally:
        stop.set()
    send_reply(chat_id, reply)
    react(chat_id, mid, "✅")                         # done
    log("replied to", uid, "%d chars" % len(reply))

def startup():
    global BOT_ID, BOT_USERNAME
    me = tg("getMe"); r = (me or {}).get("result", {})
    BOT_ID = r.get("id"); BOT_USERNAME = r.get("username", "")
    log("bridge online as @%s (id %s)" % (BOT_USERNAME or "?", BOT_ID))
    prune_inbox()
    tg("setMyCommands", {"commands": json.dumps([
        {"command": "model",   "description": "List / switch model (opus|sonnet|haiku|default)"},
        {"command": "project", "description": "Scope this chat to a project folder (/project <abs-path>)"},
        {"command": "observe", "description": "Group reply mode: /observe all | mention"},
        {"command": "reset",   "description": "Start a fresh conversation"},
        {"command": "status",  "description": "This chat's model + project"},
        {"command": "help",    "description": "Command help"},
    ])})
    off = read_offset()
    if off is None:  # first run: drain backlog so old messages aren't replayed
        ups = (tg("getUpdates", {"timeout": 0}, timeout=20) or {}).get("result", [])
        off = (ups[-1]["update_id"] + 1) if ups else 0
        if ups: write_offset(off); log("drained %d backlog updates" % len(ups))
    for chat in allowlist():
        tg("sendMessage", {"chat_id": chat, "text": "🤖 Bridge online. Send a message to start."})
    return off

def main():
    off = startup()
    while True:
        r = tg("getUpdates", {"offset": off, "timeout": TG_LONGPOLL}, timeout=TG_LONGPOLL + 15)
        if not r or not r.get("ok"):
            time.sleep(3); continue
        for u in r["result"]:
            off = u["update_id"] + 1
            write_offset(off)
            try:    handle(u)
            except Exception as e: log("loop handle error", repr(e))

if __name__ == "__main__":
    main()
