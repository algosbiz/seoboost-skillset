# 09 — Agent Coordination Board — <PROJECT NAME>

> **VOLATILE.** Who is live and what they hold RIGHT NOW. Not durable project
> state — decisions/blockers/comms still live in their numbered files
> (03/05/06/08). Every concurrent session MUST read this before touching shared
> work and update it as they go. Coordination is cooperative-by-convention: it
> only works if every session uses it. See skill `seoboost-agent-coordination`.
>
> **Timestamps:** `YYYY-MM-DD HH:MM TZ` (WITA/WIB/WIT explicit).

---

## SESSION REGISTRY

One row per session. Heartbeat = last time this session updated the board.
Status: `active` | `paused` | `done`. Stale = heartbeat old + status still active
+ never checked out → treat its claims as suspect, confirm with operator before
overriding.

| Session label | Role / scope | Status | Started | Last heartbeat |
|---|---|---|---|---|
| <e.g. eng-mesin-surat> | <e.g. engineering: surat-engine + verifikasi> | active | <ts> | <ts> |
| <e.g. article-usecase> | <e.g. marketing: article use-case SEO Boost x Klien B> | active | <ts> | <ts> |

---

## WORK CLAIMS

What each session is CURRENTLY touching. Granularity fine enough to prevent
collision (file / repo / surface). A claim is a lock-by-convention: see a fresh
claim on what you want → coordinate first, don't barge in. Drop your claim when
you move on or check out.

| Session | Claim (file / repo / surface) | Since | Note |
|---|---|---|---|
| <session label> | <e.g. surat-engine/ repo (push rights)> | <ts> | <e.g. live deploy, don't edit concurrently> |
| <session label> | <e.g. website SEO Boost article draft> | <ts> | <e.g. read-only on engineering docs> |

---

## MESSAGES / HANDOFFS

Async notes between sessions. Chronological (newest at bottom). Tag the target
session. The human (operator) is the real-time broker — for anything urgent in
another session NOW, ask him to relay; don't assume the target reads this in time.

- `<ts>` **@<target-session>** — <message>. (from: <your session>)
- `<ts>` **@all** — <broadcast note>. (from: <your session>)
