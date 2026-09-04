---
name: seoboost-telegram-morning-insight-briefing
description: Companion sub-skill of seoboost-claude-telegram-setup. Use to set up a recurring, niche-tailored morning insight briefing that headless Claude auto-generates from live web search and pushes to a Telegram chat on a schedule — for your own stack or a CLIENT's sector. INTERVIEW the operator first (niche, topics, stack, region, language, schedule, recipient), then generate per-profile prompts + systemd timers. Triggers — "buat briefing harian/mingguan telegram", "morning insight briefing", "scheduled briefing", "kirim ringkasan berita otomatis ke telegram", "briefing untuk klien <sektor>".
---

# Telegram Morning Insight Briefing (niche-tailored, SEO Boost Convention)

> Companion **sub-skill of `seoboost-claude-telegram-setup`** — set the channel up first
> (a bot token + a recipient `chat_id` is all this strictly needs), then add this
> scheduled briefing on top.

## Overview

A permanent, server-side briefing: a **systemd user timer** fires on schedule →
runs **headless `claude -p`** with web tools only → pushes the result to a Telegram
chat via the **Bot API**. No interactive approvals, survives restart/reboot/expiry.
Built per **profile** so one machine can serve several clients, each with its own
niche, topics, language, schedule, and recipient.

**Core principle:** don't hardcode topics — **interview the operator first**, then
template the prompt from their answers. The same machinery serves a fintech client,
an F&B client, or your own dev stack; only the per-profile prompt changes.

## When to Use / Prerequisites

- A Telegram bot token + a recipient `chat_id` (a bot from `seoboost-claude-telegram-setup`
  works; the briefing only *pushes* via Bot API, so two-way chat is optional).
- `claude` CLI logged in; a working `systemd --user` instance with **linger** on
  (`loginctl enable-linger $USER`) so timers fire at boot without a login.
- Pairs with `seoboost-claude-telegram-setup`. If the SAME bot also runs an interactive
  channels agent, complete its REQUIRED sub-skill `seoboost-remote-agent-hardening`.

## Step 0 — INTERVIEW the operator (the whole point)

Before writing any config, ask the operator (use `AskUserQuestion` / structured
prompts; capture answers into a profile). One profile = one client+frequency.

1. **Recipient** — target `chat_id` (or reuse `allowFrom[0]` from an existing
   channel's `access.json`). Same bot token, or a client-specific bot?
2. **Profile id** — short slug, e.g. `acme-daily`, `myco-weekly` (names all files/units).
3. **Niche / sector** — e.g. fintech, F&B, logistik, healthtech, retail/UMKM, agritech, edutech.
4. **Angles to monitor** (pick any): AI/LLM; security/CVE for a specific stack;
   regulation in country/region X; market & competitors; pricing/commodities;
   funding/M&A; product launches in the niche.
5. **Tech stack** (if security/CVE is in scope) — list it (e.g. n8n, Next.js, Postgres…).
6. **Region / regulators** to watch (e.g. Indonesia: UU PDP, Kominfo PSE, coretax).
7. **Language** of the output (ID / EN / other).
8. **Schedule** — frequency + local time + timezone (e.g. daily 07:00 Asia/Jakarta;
   weekly Mon 08:00 Asia/Makassar).
9. **Quality rules** — max bullets; require a live source per item (recommended);
   what to send when nothing material (the "quiet" message).

> Default the safe rules even if unasked: live-source-or-drop, no fabrication,
> plain text (no markdown), and a clear quiet-day message.

## Step 1 — Generate the per-profile prompt

Fill `reference/prompt.template.md` from the answers and save it to
`~/.claude/telegram-briefing/profiles/<profile-id>/prompt.md`. Keep the
quality-rule block intact (live-source, no-fabrication, no-markdown, output-only).

## Step 2 — Generic runner + per-profile config

Install once: `reference/run-briefing.sh` → `~/.claude/telegram-briefing/run-briefing.sh`
(`chmod +x`). It takes a profile id, reads `profiles/<id>/prompt.md` and
`profiles/<id>/profile.env` (`CHAT_ID`, optional `BOT_TOKEN`, optional
`ALLOWED_TOOLS`), generates with `claude -p --allowedTools WebSearch WebFetch`, and
pushes via Bot API. Per profile, write `profiles/<id>/profile.env` from
`reference/profile.env.example`.

## Step 3 — systemd template service + per-profile timer

Install the template unit once: `reference/telegram-briefing@.service` →
`~/.config/systemd/user/`. Per profile+schedule, create a timer (see
`reference/profile.timer.example`) that points at `telegram-briefing@<id>.service`:

```ini
[Timer]
OnCalendar=*-*-* 07:00 Asia/Jakarta     # systemd >=252 accepts a tz here
Persistent=true
Unit=telegram-briefing@acme-daily.service
[Install]
WantedBy=timers.target
```

Then:

```bash
systemctl --user daemon-reload
systemctl --user enable --now telegram-briefing-<id>.timer
systemctl --user list-timers 'telegram-briefing*'      # confirm next-run
```

## Step 4 — Test + verify

```bash
systemctl --user start telegram-briefing@<id>.service   # run once now
tail -n5 ~/.claude/telegram-briefing/briefing.log       # expect: sent http=200
```

Confirm the message lands in the target chat. Errors → `briefing.err.log`.

## Multi-client

Everything is keyed by `<profile-id>`: `profiles/<id>/`, `telegram-briefing@<id>.service`
(one template, many instances), `telegram-briefing-<id>.timer`. Add a client = new
profile dir + new timer; no code changes. Different clients can use different bot
tokens (set `BOT_TOKEN` in their `profile.env`) and different recipients.

## Gotchas (each cost time the first run)

- **No rival poller:** run the service at `WorkingDirectory=%h` (home). If the
  telegram plugin is enabled there, `claude -p` would spawn a `getUpdates` poller
  that 409-conflicts with any live channels host. Keep the plugin disabled at the
  briefing cwd (see `seoboost-claude-telegram-setup` workspace isolation).
- **Plain text, not markdown:** Telegram `sendMessage` without `parse_mode` shows
  `*asterisks*` literally; markdown mode 400s on unescaped chars in links. Tell the
  model to emit plain text + emoji.
- **4096-char cap:** truncate (the runner does, at 4000).
- **Timezone:** `OnCalendar=… Asia/Jakarta` needs systemd ≥ 252; on older systemd
  convert to UTC math instead.
- **Permissions:** only `WebSearch`/`WebFetch` are needed — never broad `Bash` for a
  scheduled, web-reading job. `--allowedTools` keeps `-p` from prompting.
- **Two messages same morning** if a daily and a weekly land on the same day — by
  design; tell the operator.
