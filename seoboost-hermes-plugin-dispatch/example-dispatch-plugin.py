"""/claude — dispatch an instruction to headless Claude Code on this machine.

Shape (decided with the operator, 2026-08-16):

  headless      Each command runs ``claude -p`` in the project's directory and
                exits. Measured spawn overhead is 0.17 s / 322 MB transient on
                this host, so a persistent session would cost more (held RAM),
                not less — and reading results from stdout is exact, where
                screen-scraping a tmux pane is not.
  per-project   Commands for the SAME project serialise behind one lock;
                different projects run in parallel. Two Claude processes
                editing one repo is the failure this prevents.
  ack + result  The handler returns an immediate acknowledgement; the final
                summary is pushed back through the WhatsApp bridge when the run
                finishes, because a run can outlive any request/response window.

The runner posts results straight to the bridge's ``POST /send`` endpoint
rather than reaching into gateway internals — the bridge is a stable HTTP
surface, gateway internals are not.
"""

from __future__ import annotations

import contextvars
import json
import logging
import os
import re
import subprocess
import threading
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

HERMES_HOME = Path(os.environ.get("HERMES_HOME", str(Path.home() / ".hermes")))
REGISTRY_PATH = Path.home() / ".agent-stack" / "projects.toml"
LOG_PATH = HERMES_HOME / "logs" / "claude-runner.log"
BRIDGE_PORT = os.environ.get("CLAUDE_RUNNER_BRIDGE_PORT", "3000")
BRIDGE_SEND_URL = f"http://127.0.0.1:{BRIDGE_PORT}/send"

# A Claude run is allowed to be slow — it is doing real work — but not endless.
RUN_TIMEOUT_SECONDS = int(os.environ.get("CLAUDE_RUNNER_TIMEOUT", "2700"))  # 45 min
# WhatsApp messages are chunked by the bridge, but an unbounded transcript is
# noise rather than signal; keep the tail, which is where the conclusion lives.
MAX_REPLY_CHARS = 3000

# Where to deliver the result. The gateway deliberately clears the
# HERMES_SESSION_* context at the top of _handle_message (cross-session leak
# guard) and only binds it later, when the agent turn starts — but slash
# commands are dispatched BEFORE that. So the session helpers return nothing
# here and we capture the origin ourselves from `pre_gateway_dispatch`, which
# fires earlier in the same asyncio task.
#
# A ContextVar, not a global: concurrent messages are separate tasks, and a
# global would let a reply land in whichever chat spoke most recently.
_origin: contextvars.ContextVar = contextvars.ContextVar(
    "claude_runner_origin", default=("", ""))

# One lock per project slug. Same slug → serialise; different slug → parallel.
_locks: Dict[str, threading.Lock] = {}
_locks_guard = threading.Lock()
# Queue depth per slug, so the ack can say how many runs are ahead.
_waiting: Dict[str, int] = {}


def _log(message: str) -> None:
    """Append to the runner log (the file the tmux viewer tails)."""
    try:
        LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
        stamp = time.strftime("%Y-%m-%d %H:%M:%S")
        with LOG_PATH.open("a", encoding="utf-8") as fh:
            fh.write(f"[{stamp}] {message}\n")
    except Exception:  # logging must never break a run
        logger.debug("claude-runner: could not write log", exc_info=True)


def _load_registry() -> Dict[str, str]:
    try:
        with REGISTRY_PATH.open("rb") as fh:
            data = tomllib.load(fh)
        projects = data.get("projects") or {}
        return {str(k).lower(): str(v) for k, v in projects.items()}
    except FileNotFoundError:
        return {}
    except Exception as exc:
        _log(f"registry parse error: {exc}")
        return {}


def _lock_for(slug: str) -> threading.Lock:
    with _locks_guard:
        lock = _locks.get(slug)
        if lock is None:
            lock = threading.Lock()
            _locks[slug] = lock
        return lock


def _parse(raw_args: str) -> Tuple[str, str, bool, str]:
    """Split ``[slug:] [lanjut] instruction`` into (slug, instruction, resume, unknown).

    A slug candidate is a SINGLE token followed by ':' — so an ordinary
    instruction containing a colon ("buat endpoint: /health") is not mistaken
    for one, because "buat endpoint" contains a space.

    When the candidate is a single token but is NOT in the registry, we do NOT
    silently fall back to `default`: with bypassed permissions that would run
    the instruction against the wrong repository. The candidate is returned in
    ``unknown`` so the caller can refuse and say why.
    """
    text = (raw_args or "").strip()
    registry = _load_registry()
    slug = "default"
    unknown = ""

    match = re.match(r"^([A-Za-z0-9._-]+)\s*:\s*(.*)$", text, re.DOTALL)
    if match:
        candidate = match.group(1).lower()
        if candidate in registry:
            slug = candidate
            text = match.group(2).strip()
        else:
            unknown = candidate

    resume = False
    resume_match = re.match(r"^(lanjut|lanjutkan|continue)\b[\s,:-]*(.*)$", text,
                            re.IGNORECASE | re.DOTALL)
    if resume_match:
        resume = True
        text = resume_match.group(2).strip()

    return slug, text, resume, unknown


def _send_to_chat(chat_id: str, message: str) -> None:
    """Push a message back through the WhatsApp bridge."""
    if not chat_id:
        _log("no chat id — result not delivered (see log above for content)")
        return
    payload = json.dumps({"chatId": chat_id, "message": message}).encode("utf-8")
    request = urllib.request.Request(
        BRIDGE_SEND_URL, data=payload,
        headers={"Content-Type": "application/json"}, method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read().decode("utf-8", "replace")
        _log(f"delivered to {chat_id}: {body[:200]}")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:300]
        _log(f"bridge rejected send ({exc.code}) to {chat_id}: {detail}")
    except Exception as exc:
        _log(f"bridge send failed to {chat_id}: {exc}")


def _truncate(text: str) -> str:
    text = text.strip()
    if len(text) <= MAX_REPLY_CHARS:
        return text
    kept = text[-MAX_REPLY_CHARS:]
    return f"…(dipotong, {len(text) - MAX_REPLY_CHARS} karakter awal dihilangkan)\n\n{kept}"


def _run(slug: str, cwd: str, instruction: str, resume: bool, chat_id: str) -> None:
    """Execute one Claude run, then deliver the outcome. Runs off-thread."""
    # NOTE: _waiting is incremented by the caller (the slash handler), not here.
    # Incrementing in this thread races the handler's read of the queue depth,
    # so the acknowledgement would report "0 ahead" while a run was in flight.
    # _waiting counts runs that are queued OR in flight for this slug, and is
    # incremented by the caller so the acknowledgement can report an accurate
    # depth. It is decremented only when the run is completely finished —
    # decrementing on lock acquisition would make an in-flight run invisible
    # and every acknowledgement would claim an empty queue.
    lock = _lock_for(slug)
    acquired_at = time.monotonic()
    try:
        with lock:
            waited = time.monotonic() - acquired_at
            header, body = _execute(slug, cwd, instruction, resume, waited)
    finally:
        with _locks_guard:
            _waiting[slug] = max(0, _waiting.get(slug, 1) - 1)

    reply = f"{header}\n\n{_truncate(body)}"
    # Log the outcome too — this log is what `tmux attach -t claude-runner`
    # shows, and a pane that only says "DONE" is not worth attaching to.
    _log(f"RESULT slug={slug}\n{reply}\n{'-' * 60}")
    _send_to_chat(chat_id, reply)


def _execute(slug: str, cwd: str, instruction: str, resume: bool,
             waited: float) -> Tuple[str, str]:
    """Run Claude once and return (header, body). Assumes the slug lock is held."""
    command = ["claude", "-p", instruction,
               "--dangerously-skip-permissions", "--output-format", "text"]
    if resume:
        command.append("--continue")

    _log(f"RUN slug={slug} cwd={cwd} resume={resume} waited={waited:.1f}s "
         f"instruction={instruction[:200]!r}")
    started = time.monotonic()
    try:
        completed = subprocess.run(
            command, cwd=cwd, capture_output=True, text=True,
            timeout=RUN_TIMEOUT_SECONDS,
        )
        elapsed = time.monotonic() - started
        stdout = (completed.stdout or "").strip()
        stderr = (completed.stderr or "").strip()
        _log(f"DONE slug={slug} rc={completed.returncode} elapsed={elapsed:.1f}s")

        if completed.returncode == 0:
            return (f"✅ *{slug}* selesai ({elapsed:.0f} dtk)",
                    stdout or "(Claude selesai tanpa keluaran teks.)")
        return (f"❌ *{slug}* gagal (exit {completed.returncode}, {elapsed:.0f} dtk)",
                stderr or stdout or "(tanpa keluaran)")
    except subprocess.TimeoutExpired:
        _log(f"TIMEOUT slug={slug} elapsed={time.monotonic() - started:.1f}s")
        return (f"⏱️ *{slug}* dihentikan — melewati batas {RUN_TIMEOUT_SECONDS // 60} menit",
                "Proses dibunuh. Pekerjaan yang sudah tertulis ke disk tetap ada.")
    except FileNotFoundError:
        _log("claude binary not found on PATH")
        return (f"❌ *{slug}* gagal",
                "Perintah `claude` tidak ditemukan di PATH service Hermes.")
    except Exception as exc:
        _log(f"ERROR slug={slug}: {type(exc).__name__}: {exc}")
        return f"❌ *{slug}* gagal", f"{type(exc).__name__}: {exc}"


def _handle_slash(raw_args: str) -> str:
    """/claude handler — returns immediately; the run continues off-thread."""
    registry = _load_registry()
    text = (raw_args or "").strip()

    if not text or text.lower() in {"help", "-h", "--help"}:
        listing = "\n".join(f"  • {k} → {v}" for k, v in sorted(registry.items())) \
            or "  (registry kosong)"
        return (
            "*/claude* — kirim instruksi ke Claude Code di mesin ini.\n\n"
            "Pemakaian:\n"
            "  `/claude <instruksi>`\n"
            "  `/claude <proyek>: <instruksi>`\n"
            "  `/claude <proyek>: lanjut <instruksi>`  (sambung sesi sebelumnya)\n\n"
            f"Proyek terdaftar:\n{listing}\n\n"
            "Perintah untuk proyek yang sama dikerjakan berurutan; "
            "proyek berbeda jalan paralel."
        )

    if text.lower() in {"projects", "proyek", "list"}:
        if not registry:
            return f"Registry kosong atau tidak terbaca: {REGISTRY_PATH}"
        rows = "\n".join(
            f"  • {k} → {v}{'' if Path(v).is_dir() else '  ⚠️ tidak ada'}"
            for k, v in sorted(registry.items())
        )
        return f"Proyek terdaftar ({REGISTRY_PATH}):\n{rows}"

    slug, instruction, resume, unknown = _parse(text)

    if unknown:
        known = ", ".join(sorted(registry)) or "(kosong)"
        return (
            f"❌ Proyek '*{unknown}*' tidak terdaftar — perintah TIDAK dijalankan.\n\n"
            f"Terdaftar: {known}\n\n"
            f"Daftarkan dulu di `{REGISTRY_PATH}`, atau hapus '{unknown}:' "
            f"kalau memang ingin jalan di proyek *default*."
        )

    if not instruction:
        return "Instruksinya kosong. Contoh: `/claude agent-board: tambahkan health check`"

    cwd = registry.get(slug)
    if not cwd:
        known = ", ".join(sorted(registry)) or "(kosong)"
        return f"Proyek '{slug}' tidak ada di registry. Yang terdaftar: {known}"
    if not Path(cwd).is_dir():
        return f"Direktori proyek '{slug}' tidak ditemukan: {cwd}"

    platform, chat_id = _origin.get()
    if not chat_id:
        # Fallbacks for surfaces that do bind the session first (CLI, cron).
        try:
            from gateway.session_context import get_session_env
            chat_id = get_session_env("HERMES_SESSION_CHAT_ID", "")
            platform = platform or get_session_env("HERMES_SESSION_PLATFORM", "")
        except Exception:
            chat_id = os.environ.get("HERMES_SESSION_CHAT_ID", "")

    if not chat_id:
        _log("WARNING: no chat id available — result will only reach the log")
    elif platform and platform != "whatsapp":
        _log(f"WARNING: origin platform is {platform!r}, not whatsapp — "
             f"the result is delivered through the WhatsApp bridge regardless")

    # Claim the queue slot BEFORE spawning, so the depth reported below is
    # accurate rather than whatever the new thread happens to have reached.
    with _locks_guard:
        _waiting[slug] = _waiting.get(slug, 0) + 1
        ahead = max(0, _waiting[slug] - 1)

    thread = threading.Thread(
        target=_run, args=(slug, cwd, instruction, resume, chat_id),
        name=f"claude-runner:{slug}", daemon=True,
    )
    thread.start()

    queue_note = f"\n⏳ Antre di belakang {ahead} perintah untuk proyek ini." if ahead else ""
    resume_note = " (menyambung sesi sebelumnya)" if resume else ""

    return (f"🚀 Diteruskan ke Claude Code{resume_note}\n"
            f"📁 Proyek: *{slug}* — `{cwd}`\n"
            f"Hasilnya aku kirim ke sini setelah selesai.{queue_note}")


def _capture_origin(**kwargs):
    """pre_gateway_dispatch hook — record which chat this message came from.

    Fires before slash-command dispatch, in the same asyncio task, so the
    ContextVar it sets is exactly what /claude reads a moment later. Returns
    None so dispatch proceeds untouched — this hook only observes.
    """
    try:
        source = getattr(kwargs.get("event"), "source", None)
        chat_id = getattr(source, "chat_id", "") or ""
        platform = getattr(source, "platform", None)
        platform = getattr(platform, "value", platform) or ""
        if chat_id:
            _origin.set((str(platform), str(chat_id)))
    except Exception:
        logger.debug("claude-runner: could not capture origin", exc_info=True)
    return None


def register(ctx) -> None:
    ctx.register_hook("pre_gateway_dispatch", _capture_origin)
    ctx.register_command(
        "claude",
        handler=_handle_slash,
        description="Teruskan instruksi ke Claude Code di mesin ini.",
        args_hint="[proyek:] instruksi",
    )
