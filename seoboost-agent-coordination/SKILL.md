---
name: seoboost-agent-coordination
description: Use when MORE THAN ONE Claude session is working on the SAME SEO Boost project at the same time (or might be) and the sessions must coordinate so they don't conflict, duplicate work, or contradict each other. Triggers — "ada agent/sesi lain di project ini", "cek agent lain", "koordinasi antar sesi", "aku kerja paralel dengan agent lain", "siapa lagi yang pegang project ini", "claim pekerjaan ini biar tidak tabrakan", before starting work that another session might also touch, or at session start/end of a multi-session project. NOT for single-session work, and NOT for spawning subagents within one session (that is the Agent tool).
---

# SEO Boost Agent Coordination (Multi-Session, Same Project)

## What this is — and the hard truth first

Two Claude sessions on the same project **cannot see each other directly.** There
is no telepathy, no shared screen, no live channel. A session can only learn what
another session did through a **shared artifact both sessions read and write.**

So "coordinate systematically" = **all sessions read the same coordination board
before acting, and write to it as they act.** That is the entire mechanism. This
skill is the protocol for that board — it does not create a new capability, it
disciplines the use of one that already exists (the filesystem + memory search).

**If a session does not follow the protocol, coordination silently fails.** The
board only works if every session uses it. There is no enforcement — it is a
convention, like the decision log.

## MUST-CHECK rule — auto-trigger dari per-machine memory

Saat kamu load per-machine memory (`seoboost-proactive-memory-<label>.md`) di awal sesi
dan melihat field **`ACTIVE_COORDINATION:`** yang berisi nilai (bukan "none" / tidak kosong):

**Cek dulu jenis channel-nya (2026-07):**

- **Channel PLATFORM** (mis. `ACTIVE_COORDINATION: <channel> @ Agent Board platform …`) — koordinasi
  live ditangani oleh **runner selalu-on** mesin ini (`~/.agent-board-runner/`), yang menjalankan
  turn untuk **agent-agent yang terdaftar di mesin itu** — satu mesin bisa punya banyak agent,
  dan slug agent BUKAN nama mesin (otoritasnya tool `list_agents`, lihat `seoboost-agent-coordination` §1)
  lewat dashboard `agent-board.internal`. Kamu (sesi ad-hoc) **tidak perlu** git-pull /
  poll mailbox tiap task; cukup **sadar** ada koordinasi aktif dan, kalau pekerjaanmu beririsan
  dengan channel itu, lihat channel di dashboard (atau minta operator relay). Runner-lah peserta
  tetapnya, bukan tiap sesi. Lewati langkah git-pull/mailbox di bawah.
- **Channel LEGACY file-mailbox** (nilai lama tanpa `@ Agent Board platform`) — jalankan langkah
  legacy berikut:

1. ☐ **STOP sebelum task apapun.** Kamu bagian dari koordinasi cross-agent yang aktif.
2. ☐ `cd <clone> && git pull --ff-only` — board/mailbox mungkin sudah diupdate partner.
3. ☐ Baca `agent-memory/cross-agent/<channel>/MANIFEST.md` (nama channel ada di
   `ACTIVE_COORDINATION:`).
4. ☐ Baca board project ini: `agent-documentation/09-AGENT-COORDINATION.md` (jika ada).
5. ☐ Baca file terbaru di folder partner: `from-<partner>/` dalam channel mailbox.
6. ☐ Baru kerjakan task — tapi update claim + heartbeat-mu di board sebelum mulai.

**Ini berlaku SETIAP sesi, SETIAP task start, selama `ACTIVE_COORDINATION` aktif.**
Tidak ada pengecualian — "ini fix kecil aja" adalah momen paling sering terjadi
collision lintas sesi.

## The coordination channels (in priority order)

Use the FIRST one that answers your question. Do not build new infrastructure.

0. **The Agent Board platform (LIVE — primary for CROSS-MACHINE / cross-agent since 2026-07).**
   The dashboard at `agent-board.internal` (Postgres source-of-truth) with a
   per-machine runner (`~/.agent-board-runner/`) that answers channel + 1-on-1 turns for the
   agents REGISTERED on that machine — an agent's slug is NOT the machine name, and one
   machine hosts several agents (authority: the `list_agents` tool; full explanation in
   `seoboost-agent-coordination` §1). Real-time, cross-machine, no git relay,
   no human-as-clock. Agents post via
   the MCP server (`POST /api/mcp`, `X-MCP-Key`; Cloudflare-Access Bypass path). This is
   where live cross-agent messaging actually happens now — it replaces the git file-mailbox
   for that purpose. Channels 1–4 below remain the PROJECT-LOCAL board (who-holds-what within
   ONE repo) + the offline/legacy backstops; the platform does not replace the project board,
   it replaces the cross-machine relay.

1. **The coordination board** — `agent-documentation/09-AGENT-COORDINATION.md` in
   the project. Single file. Session registry + work claims + inter-agent
   messages. THIS is the source of truth for "who is doing what right now."
   (Template in `assets/09-AGENT-COORDINATION.template.md`.)
2. **`agent-documentation/` state files** — `05-CURRENT-STATE.md`,
   `08-HANDOFF-CHECKLIST.md`, `03-DECISIONS-LOG.md`, `06-COMMUNICATION-LOG.md`.
   What the project's durable state is (vs. the board, which is volatile "who's
   live now").
3. **`episodic-memory:search-conversations`** + `claude-mem` — search what OTHER
   sessions actually said/did, by topic. Use when the board is thin or you suspect
   a session ended without checking out. Pasif + delayed (only sees ended/saved
   sessions), so it is a backstop, not the primary.
4. **Ask the human (operator)** — he is the real broker. He sits in every session
   and on WhatsApp. If the board and memory disagree, or you need a sibling session
   to do something NOW, the reliable path is: tell operator, he relays. Do not
   pretend you messaged another agent directly.

**Historical note (now SUPERSEDED).** This skill used to say "don't reach for
mc-bridge / Mission Control / MCP `send_message` — not wired to SEO Boost projects, log it
as a separate decision if the need is ever real." That need **materialized and was
built**: the **Agent Board platform** (channel 0 above) IS the wired, sanctioned live
cross-agent channel (MCP `post_message`/`read_channel` over `POST /api/mcp`). Use it
for cross-machine live messaging. What still holds: don't hand-roll a NEW ad-hoc
IPC/daemon/bridge — the platform (cross-machine) or the file-mailbox (offline) already
covers coordination.

## The board: `agent-documentation/09-AGENT-COORDINATION.md`

One file, three sections:

- **SESSION REGISTRY** — one row per active session: session label, role/scope,
  status (active / paused / done), last-heartbeat timestamp. A session is "stale"
  if its heartbeat is old and it never checked out — treat its claims as suspect,
  confirm with the human before stealing its work.
- **WORK CLAIMS** — what each session is CURRENTLY touching, at a granularity that
  prevents collision: which files / which repo / which surface (mesin surat vs
  verifikasi vs article). A claim is a lock-by-convention: see a fresh claim on
  something you want → coordinate first, don't just barge in.
- **MESSAGES / HANDOFFS** — async notes between sessions ("@article-session: surat
  facts are in 04-TECHNICAL-ARCHITECTURE, don't expose secrets"). Chronological.

The board is **volatile** (who's live now), distinct from `05-CURRENT-STATE.md`
which is **durable** (what the project's state is). Don't merge them.

## Protocol

### On session start (or when told another session exists)
1. ☐ Read `09-AGENT-COORDINATION.md`. If absent, create it from the template and
   register yourself (you may be first).
2. ☐ Register your session: add/refresh your row in SESSION REGISTRY with a clear
   scope ("engineering — mesin surat + verifikasi" vs "marketing — article use-case").
3. ☐ Scan WORK CLAIMS. Anything you intend to touch already claimed by a live
   session? → go to "Before touching shared work."
4. ☐ If the board is thin or you suspect an unlisted session,
   `episodic-memory:search-conversations` by the project + topic to see recent
   sibling activity before acting.

### Before touching shared work (a file/repo/surface another session might hold)
1. ☐ Check WORK CLAIMS for a fresh claim on it.
2. ☐ No claim → add your own claim, then proceed. Claiming IS the coordination.
3. ☐ Existing fresh claim by another live session → **do not edit.** Leave a
   MESSAGE stating what you need, and either pick non-conflicting work or ask Pak
   operator to broker. Concurrent edits to the same file across sessions = lost work;
   the board exists to prevent exactly this.
4. ☐ Existing claim but the session looks stale (old heartbeat, no checkout) →
   confirm with operator before taking it over. Don't assume dead.

### As you work
- Keep your claim current. Finished a file, moved to another → update the claim,
  don't leave a stale lock that blocks a sibling.
- Durable facts still go to their normal homes (`03-DECISIONS-LOG.md`, etc.) per
  `seoboost-fork-checkpoint` — the board is coordination, not a replacement for the
  decision log.

### On session end / pause / handoff
1. ☐ Check OUT: set your registry status to done/paused, drop your active claims.
   A session that ends without checking out leaves ghost locks that freeze
   siblings — checkout is not optional.
2. ☐ Leave a MESSAGE if a sibling needs to pick something up.
3. ☐ Run `seoboost-fork-checkpoint` for the durable state as usual.

## Heartbeat / staleness

A session "active" but with a heartbeat hours old probably died (Mac sleep,
terminal closed, crash). Its claims are suspect. Rule: **stale + never-checked-out
= confirm with the human before overriding, never silently steal.** Refresh your
own heartbeat whenever you update the board so you don't look stale to siblings.

## Honest limits — say these out loud, don't oversell

- This is **cooperative, not enforced.** A sibling session that ignores the board
  is invisible to it. The board catches disciplined sessions, not rogue ones.
- Cross-session awareness is **eventually-consistent at best** — you see a sibling's
  move only after they wrote it down (board) or the session ended (memory). There
  is no real-time push.
- For anything that must happen in a sibling session NOW, the reliable broker is
  **operator**, not an agent-to-agent message. State that plainly; don't imply you
  pinged another Claude directly when you didn't.
- `episodic-memory` only sees sessions that have ended/been saved — a live sibling
  mid-work won't show up there yet. That's why the board (written as-you-go) is
  primary and memory is the backstop.

## Playbook from real runs

`LESSONS.md` (this skill dir) — what good cross-session work looks like, drawn
from actual runs (e.g. the Klien B/Program B-Bali run where one session caught the other
about to publish the wrong event's participant numbers). Read it for the *why*
behind the protocol and the efficiency math. Update it when a run teaches
something new.

## Coordination Digest — laporan ke operator

Board (`09-AGENT-COORDINATION.md`) adalah state volatile sesi. Operator (operator)
butuh view kumulatif: apa yang dikerjakan, apa yang blocked, apa potensi yang ditemukan.
Ini hidup di shared tier:

**`agent-memory/cross-agent/COORDINATION-DIGEST.md`**

Append satu entri setiap kali kamu:
- Selesai task signifikan selama koordinasi aktif
- Menemukan blocker yang berdampak ke partner atau project
- Melihat peluang integrasi / reuse lintas project
- Menutup atau pause channel koordinasi

Format entri:
```
[TANGGAL] [CHANNEL: <name>] [AGENT: <label-mu>] [STATUS: UPDATE|OPEN|CLOSE|BLOCKED]
DIKERJAKAN: ringkasan satu baris apa yang sudah dilakukan
HAMBATAN:   blocker (atau "—" jika tidak ada)
POTENSI:    peluang integrasi/reuse (atau "—") → kandidat untuk REUSABLE-CATALOG
TINDAK LANJUT: apa yang perlu terjadi selanjutnya, oleh siapa
---
```

Digest adalah **append-only** — jangan edit entri lama. Operator membaca ini dari atas
ke bawah untuk mendapat gambaran tanpa perlu membuka setiap folder channel. Entri
POTENSI yang non-kosong adalah kandidat langsung untuk `agent-memory/REUSABLE-CATALOG.md`
(gunakan `seoboost-cross-project-reuse` untuk katalogkan dengan benar).

## Anti-patterns

- ❌ Claiming to "check the other agent" by guessing — if you didn't read the board
  or search memory, you checked nothing. Say what you actually inspected.
- ❌ Editing a file another live session has a fresh claim on "because it's quick."
  Quick + concurrent = the classic lost-write. Coordinate first.
- ❌ Building mc-bridge / a daemon / a custom IPC channel for this. Ladder: the
  shared file already solves it.
- ❌ Treating the board as durable project state — it's volatile "who's live."
  Decisions/blockers still go to their numbered files.
- ❌ Leaving a session without checking out → ghost locks. Always checkout.
- ❌ Overriding a stale claim silently. Confirm with the human first.

## Relationship to other skills

- `seoboost-fork-checkpoint` — handoff WITHIN a lineage (this session → next session of
  the same role, across /compact or fork). This skill = coordination ACROSS
  concurrent sessions of DIFFERENT roles at the same time. Complementary: checkpoint
  saves durable state; coordination prevents live collision.
- `seoboost-communication-log` / `seoboost-decision-tracking` — client comms + decisions.
  Unchanged. The board references them, doesn't replace them.
- The Agent tool (subagents) — that's parallelism INSIDE one session with a shared
  context. This skill is for SEPARATE sessions with NO shared context. Different
  problem.
- `seoboost-agent-coordination` — ACTIVATES a live bidirectional channel between two
  agents + sets `ACTIVE_COORDINATION:` in per-machine memory (yang memicu MUST-CHECK
  rule ini). Ketika `seoboost-agent-coordination` dijalankan, SKILL INI otomatis berlaku.
- `seoboost-devset-<project>` — OPERASI platform Agent Board di balik channel 0 (deploy topology, services,
  feature flags, verification harness); skill ini hanya konvensi koordinasi, bukan cara men-deploy-nya.
- `COORDINATION-DIGEST.md` — hasil akhir dari tiap sesi koordinasi yang aktif.
  Lihat section "Coordination Digest" di atas untuk format dan kapan menulis.
