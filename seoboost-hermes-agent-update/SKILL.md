---
name: seoboost-hermes-agent-update
description: Use when updating/upgrading a self-hosted Hermes Agent (Nous Research WhatsApp gateway) to a newer upstream version on a SHARED-codebase multi-profile deployment. Operator runbook for Claude Code + operator — council-first review, RE-PORT not rebase, backup + rollback armed, supervised dual-profile cutover, custom-patch ("paten") re-port checklist. Triggers on "update hermes", "upgrade hermes agent", "naikkan versi hermes", "hermes upstream update", "bump hermes to latest", "hermes ada banyak update". ALSO covers post-cutover regressions where an upstream DEFAULT flipped under a key we never set — classic symptom "agent balas di DM tapi diam di grup setelah update" (group_policy open→pairing) — plus the DM-vs-group smoke-test split and the bridge/gateway log triage for "agent tidak merespons". ALSO use when ADDING a new profile to that shared deployment ("tambah profile hermes baru", "setup agent untuk klien X", "profil hermes ketiga") — a new HERMES_HOME inherits data isolation but NOT the safety posture — the tenant firewall is keyed per-profile and silently empty for new keys, `hermes-<platform>` toolsets are identical to `hermes-cli` (61 tools, zero restriction), config.yaml comments are erased on rewrite, the allowlist must be duplicated across two config blocks read by two different gates, and client-facing profiles need `gateway_restart_notification` + `cron.wrap_response` turned off. ALSO covers LINUX/systemd hosts (the launchctl↔`systemctl --user` mapping, `hermes gateway install`, the `Linger=yes` requirement without which the agent never returns after a reboot, and the nvm node path baked into the generated unit) and FRESH-INSTALL traps on that path — `aiohttp` missing from `pip install -e .` so the gateway boots "clean" with a dead messaging path, the `mode` key having NO yaml translation so setting it to bot in config.yaml is inert while the bridge silently stays in self-chat, and session linking being QR-only (no 8-digit pairing code exists; the QR cannot be relayed through a chat agent). ALSO covers model fallback wiring — `fallback_model` is failure-triggered and NOT modality-aware, `auxiliary.vision` is the key that handles images, and enabling `auxiliary.free_only` disables the auxiliary fallback rather than making it free. ALSO use when a running agent goes silent — "agent tidak merespons", "agent diam", "sudah di-ack tapi hasilnya tidak pernah sampai", a bridge that is a zombie (process alive, socket dead, systemd still reporting active), or a WhatsApp session that logged out (Baileys code 401, "Logged out. Delete session and restart") where restarting can never help and only re-pairing does — including how to build the watchdog that tells those two apart and alerts over a channel that is not the dead one.
---

# seoboost-hermes-agent-update — Safe Hermes upstream update runbook

**OPERATOR runbook executed by Claude Code WITH the operator on standby.** NOT an autonomous
agent action: a live Hermes agent cannot stop + rebuild its own running code. If the live
agent is asked to "update yourself", it must defer to this supervised process.

Grounded in a **proven dual-profile cutover** (v0.12 → v0.16.0 family) — both profiles
validated live. Every command below was actually executed and verified in production.

> **Local context note:** Client-identifying smoke-test values (exact lookup queries,
> pricing) are placeholders here. The LOCAL copy on the operator machine keeps the real
> values — adjust per local context. See repo placeholder convention.

## When to invoke
- Operator: "update/upgrade hermes ke versi terbaru", "hermes ada banyak update", "bump hermes".
- Periodic: upstream is many releases ahead and we want security fixes + features.

## When NOT to invoke
- Editing OUR patches only (no upstream bump) → just edit + restart, no full runbook.
- Config-only change (model, threshold) → edit config.yaml + restart.
- The live agent asking to self-update → REFUSE, defer to operator + Claude Code.

---

## ⚠️ THE ONE CRITICAL FACT — shared codebase, multi-profile
On a multi-tenant Hermes deploy, every profile (e.g. a default profile on bridge :3000 and a
second profile `ai.hermes.<name>` on bridge :3001) runs from the SAME code dir
`~/.hermes/hermes-agent` + the SAME venv. They differ only by `HERMES_PROFILE` env +
config/session paths (default `~/.hermes/{config.yaml,.env}`, second
`~/.hermes-<name>/{config.yaml,.env}`).

**Any code change or `pip install` affects ALL profiles. Any rollback reverts ALL.
ALWAYS test every profile after every change.** The second profile serves live client
customers — operator mandate: it must not regress.

### On Linux the service layer is systemd — translate before running anything below

Every command in this runbook is written for macOS/launchd. The fleet also runs Hermes on
Ubuntu hosts, where the isolation model is identical (`HERMES_HOME` per profile, shared
code + venv) but the service commands are not:

| macOS / launchd | Linux / systemd (user scope) |
|---|---|
| `launchctl kickstart -k gui/$(id -u)/ai.hermes.<name>` | `systemctl --user restart hermes-gateway` |
| `launchctl bootout gui/$(id -u)/ai.hermes.<name>` | `systemctl --user stop hermes-gateway` |
| `launchctl bootstrap …` | `systemctl --user start hermes-gateway` |
| `KeepAlive` | `Restart=always` + `RestartSec=5` |
| plist under `~/Library/LaunchAgents/` | unit under `~/.config/systemd/user/` |
| (survives logout by default) | **`loginctl enable-linger <user>` — required** |

Prefer upstream's own installer over a hand-written unit: `hermes gateway install
--start-on-login` generates the systemd unit, and `hermes gateway {start,stop,restart,status}`
wraps it. The generated unit already sets `Restart=always`, `RestartSec=5` and
`StartLimitIntervalSec=0` (no rate limit, so it never gives up after a burst of crashes).

Two Linux-specific traps:
- **`Linger=yes` is the whole boot story.** `enabled` alone only means "start when the user
  session starts". Without linger there is no user session after a reboot until someone
  logs in — the agent stays down and nothing reports an error. Check with
  `loginctl show-user <user> --property=Linger`.
- **The generated unit bakes an absolute nvm node path** into `Environment=PATH`
  (e.g. `~/.nvm/versions/node/v24.13.0/bin`). Upgrading or pruning that node version breaks
  the bridge spawn — the same class as the bundled-node trap on the macOS host. Re-run
  `hermes gateway install --force` after any node change.

Prove restart-resilience instead of assuming it: `kill -9` the MainPID and confirm a new
PID plus `/health` returning to `connected`. That tests crash recovery without a reboot.

---

## ⚠️ ADDING a profile is not the same as inheriting its protections

Learned the hard way while standing up a third, client-facing profile. A new
`HERMES_HOME` gets you isolation of *data*. It does **not** get you the safety posture
the older profiles appear to have. Each item below is a real gap found by inspection,
not theory.

### The tenant firewall is keyed BY PROFILE and silently absent for new ones

`tools/approval.py`:

```python
_CROSS_TENANT_DENY = { "default": [...], "bpn": [...] }
patterns = _CROSS_TENANT_DENY.get(profile, [])   # NEW profile → EMPTY LIST
```

A profile with no key gets **no firewall at all** — `cat ~/.hermes-<other>/.env`
executes freely. Nothing warns you. Add a key for every new profile, denying the other
tenants' data roots while leaving the shared runtime (`~/.hermes/hermes-agent/`,
`~/.hermes/node/`) reachable — the venv lives there.

Adding a key is **purely additive**: existing profiles' lists are untouched. Still
regression-test them (a handful of asserted allow/deny cases per profile takes a minute
and proves you changed nothing else).

**Known limit — do not oversell this to the operator:** the firewall only guards
`terminal`. `detect_dangerous_command()` is not on the `read_file` / `search_files`
path, so those tools still reach denied paths. Closing that needs a toolset restriction
or a check at the file-tool layer.

### `hermes-<platform>` toolsets are NOT narrower than `hermes-cli`

Verified by resolving both: **identical, 61 tools each, zero difference.** Both include
`terminal`, `process`, `execute_code`, `read_file`, `write_file`, `patch`,
`search_files`, `computer_use`, and the full browser suite.

So `platform_toolsets: {whatsapp: [hermes-whatsapp]}` — which reads like a restriction —
restricts **nothing**. A messaging-facing agent has the same blast radius as the CLI.

Genuinely narrow bundles exist: `safe` (4 tools: image_generate, vision_analyze,
web_extract, web_search), `web` (2), `memory` (1). Note `skills` contains `skill_manage`,
which can mutate skills — prefer `skill_view` / `skills_list` if read-only is enough.

Check before assuming:
```python
import toolsets as T
print(sorted(T.resolve_toolset("hermes-whatsapp")))
```

### Comments in `config.yaml` DO NOT SURVIVE

Hermes rewrites `config.yaml` whenever it persists a runtime setting — e.g. the agent
offering to build a user profile writes `onboarding.seen.profile_build_offered: true`.
The YAML serializer drops **every comment** in the file.

Observed: an entire set of documented safety warnings, precedence notes, and per-entry
rationale vanished in one rewrite. Values survived; documentation did not.

**Never encode a safety-critical warning as a config comment.** Put the narrative in a
file Hermes never touches, and make the invariant **mechanical** — a small script that
asserts it and exits non-zero, run in front of every restart:

```bash
python check-config.py && launchctl kickstart -k gui/$(id -u)/ai.hermes.<name>
```

### One access gate, two config sources — duplicate on purpose

There are two independent filters, and they read from different places:

| Layer | Reads from |
|---|---|
| Bridge (Node, `matchesAllowedUser`) | env `WHATSAPP_ALLOWED_USERS`, mirrored from the top-level `whatsapp:` block |
| Gateway (Python, `_is_dm_allowed`) | `platforms.whatsapp.extra` |

Precedence: `platforms.whatsapp.extra` > env > top-level `whatsapp:`. Write the allowlist
in **both** blocks with identical values, or the two gates enforce different rules. Both
are fail-closed (empty list = deny all), which is why a half-configured profile is safe
but a half-*edited* one is not.

Keep `.env` free of `WHATSAPP_ALLOWED_USERS`, `WHATSAPP_ALLOW_ALL_USERS`, and the
`*_POLICY` keys — env outranks the YAML block and will widen access invisibly.

### Some keys have NO YAML path at all — writing them in config.yaml is INERT

Worse than a key whose default flipped is a key the loader never reads. `_apply_yaml_config`
(`plugins/platforms/whatsapp/adapter.py`) translates an explicit, finite list into
`WHATSAPP_*` env vars — verified on v0.20.1:

```
require_mention · mention_patterns · free_response_chats
dm_policy · allow_from · group_policy · group_allow_from
```

**`mode` is NOT in that list.** The adapter and the bridge both read only
`WHATSAPP_MODE` (env), defaulting to `self-chat`. So `mode: bot` written into
`config.yaml` — in either block — does nothing.

The symptom is designed to mislead. In `self-chat` the bridge processes only your own
messages to yourself, so DMs from the owner's other number are dropped at the bridge —
while the SAME log line proudly reports the allowlist loaded correctly:

```
🌉 WhatsApp bridge listening on port 3000 (mode: self-chat)   ← the truth
🔒 Allowed users: 628xxx, 628yyy                              ← looks configured
```

Every config-level check passes. `/health` says `connected`. Only that one `mode:` field
tells you the profile is deaf.

**Rule: verify `mode` from `~/.hermes*/whatsapp/bridge.log`, never from config.** And when
a setting appears to have no effect, grep `_apply_yaml_config` before debugging anything
else — the question "is this key even read?" is cheaper than any control-flow trace.

### `require_mention` is GROUP-ONLY

`gateway/platforms/whatsapp_common.py`: DMs that pass the policy gate return early —
*"DMs that pass the policy gate are always processed"*. Mention checking happens only on
the group branch.

So set `require_mention: true` **preemptively** on any profile that might get a group
later. It costs nothing for DMs, and it closes the trap where enabling a group while the
value is still `false` makes the agent answer every single message in it.

Caveat: chats listed in `free_response_chats` **bypass** `require_mention` entirely.

### Allowlist entries: harvest the identifier, never guess it

WhatsApp delivers senders as `<digits>@lid`. On a freshly paired session the
`lid-mapping-*.json` files may not yet resolve a phone-form allowlist entry, so writing
the allowlist from phone numbers is a guess that fails silently.

Reliable procedure: ask the person to send **one** message, let it be rejected, then
harvest the real identifier from `bridge.log`:

```
{"event":"ignored","reason":"allowlist_mismatch","chatId":"...@lid","senderId":"...@lid"}
```

Two things make this practical at team scale:
- `WHATSAPP_DEBUG=1` in the profile `.env` makes the bridge log per-message JSON. Turn it
  off once the allowlist is settled.
- The session dir carries `lid-mapping-<id>_reverse.json` → phone number. Resolving
  harvested LIDs through it turns an opaque list into recognizable numbers the operator
  can match to names.

**The log carries the WhatsApp push name too** (`gateway.log`: `inbound message: ...
user=<name>`), which is tempting — but a push name is chosen by its owner and is not
proof of identity. Confirm with a human before treating it as such.

**Do not confuse the two roles when collecting numbers.** The account that scans the QR
*is* the agent; the numbers in `allow_from` are the people allowed to command it. Asking
the operator for "the agent's number" and then writing that answer into `allow_from`
produces a profile that is simultaneously wrong in both directions. Ask which role a
number plays before writing it anywhere.

### Linking a session: QR only — there is NO 8-digit pairing code

`scripts/whatsapp-bridge/bridge.js` links a session **only** by QR
(`qrcode-terminal`, printed by `node bridge.js --pair-only`). Baileys exposes
`requestPairingCode`, but the bridge never calls it — confirmed on v0.20.1.

Do not promise the operator a phone-number pairing code. The word "pairing" throughout
this codebase means `WHATSAPP_DM_POLICY=pairing` (how unknown DMs are treated) — an
unrelated concept that reads like device linking in a grep.

**The QR cannot be relayed through a chat agent.** It refreshes every ~20–30 s, so by the
time it is captured, sent, read and pointed at a camera it has expired — and capturing a
half-written frame yields a corrupt block that looks like a rendering bug. Verified the
hard way: a scrape caught 32 of 33 rows mid-write. Have the operator run the command in
their own terminal, where the QR redraws in place:

```bash
cd ~/.hermes/hermes-agent/scripts/whatsapp-bridge && node bridge.js --pair-only
```

It needs 63 columns; a narrower window wraps the rows and makes it unscannable. On
success it writes `creds.json` and exits. **Never run a second bridge against the same
session dir while pairing** — two Baileys processes sharing one session corrupt the
credentials.

Confirm the linked identity from `creds.json` rather than trusting the scan:
```bash
python3 -c "import json;d=json.load(open('$HERMES_HOME/whatsapp/session/creds.json'));print(d['me'])"
```

### Client-facing profiles need two noise switches flipped

Both default to on and both leak operator-flavoured text to end users:

| Key | Effect when left default |
|---|---|
| `platforms.<p>.gateway_restart_notification: true` | every restart sends `⚠️ Gateway shutting down — Your current task will be interrupted.` to whoever has an active session |
| `cron.wrap_response: true` | cron output is wrapped in `Cronjob Response: <name>`, `(job_id: …)`, a divider, and a `To stop or manage this job…` footer |

Set both to `false` on any profile a client talks to.

**Muting the notification does not stop the interruption.** `launchctl kickstart` still
cancels in-flight agent turns (`RuntimeError: Gateway is shutting down; executor
unavailable`) — the user just sees silence instead of an English warning. Before
restarting a profile with live users, check for activity:

```bash
tail -3 ~/.hermes-<name>/logs/gateway.log
curl -s localhost:<port>/health          # queueLength should be 0
```

### The failure CLASS: one-tenant patches inherited by the second profile

The items above are not separate bugs. They are one class, and it surfaced
**four times in a single evening** on a client-facing profile, every time in
front of the client:

| Patch | Lives in | What the client profile got |
|---|---|---|
| Mention label, hardcoded to the first tenant's agent name | whatsapp adapter | messages addressing it by ANOTHER tenant's agent name; its own markers never matched, so every group reply was dropped |
| Cross-tenant firewall, keyed by profile | approval layer | `.get(profile, [])` → empty list → firewall inert |
| Confidentiality boilerplate naming the parent company | gateway run | canned "this is <parent company>'s operational protocol" served into a client group — the anti-leak filter WAS the leak |
| `vault.auto_inject` absent (not `false` — absent) | profile config | vault prefetch reached ANOTHER tenant's vault; agent reported that vault's existence and activity to the user |

None failed at boot. Every one passed health checks. All four needed a real
conversation to surface.

**Sweep for them BEFORE a client profile goes live:**
```bash
grep -rniE '<parent-brand>|<first-agent-name>' \
  ~/.hermes/hermes-agent/{gateway,tools,plugins}/ | grep -v test
```
Every hit is a candidate. And diff the new profile's config line-by-line
against an established one: **set every data/access key explicitly, including
the ones whose default already happens to be right.** A key you never wrote is
a key the next upstream bump — or the next tenant — is free to reinterpret. On
a multi-tenant host, "not set" often resolves to "use tenant one's".

### Mention detection: match a SENTINEL, never the agent's name

Matching the agent's own name in message text fails in both directions:

- **False positives** — any message that merely *talks about* mentioning the
  agent fires it. An onboarding post reading "sebut @X Agent to reach it" got
  answered, in a channel whose entire purpose was staying quiet.
- **False negatives** — WhatsApp renders a mention using the *sender's* saved
  contact name. Every person spells it differently, or hasn't saved it at all.

Anchoring to position does not save it either: the gateway injects thousands of
characters (task reminders, vault prefetch) between the channel persona and the
user's words, so "start of text" is not the user's message.

What works: have the adapter inject a **sentinel no human types** —
`[addressed to you]`, mirroring the existing `[reply to you]` — driven off
WhatsApp's own mention metadata, and match only that. Verified:
```
inbound 'Test'                                  -> Suppressed      (silent)
inbound '[addressed to you] @X Agent tolong…'   -> Sending 337 ch  (answered)
```
The mention metadata IS available (the bridge helper forwards
`contextInfo.mentionedJid`, and bot ids carry both phone and LID forms) — if a
grep suggests otherwise, check the helper module before concluding it is
missing.

### Two client-channel annoyances that look like breakage

**The typing bubble is never cleared.** On a free-response channel the agent
processes every message and only suppresses at the output layer — but the
indicator fires at *processing* start and was only ever cleared as a side
effect of a reply going out. Suppressed reply → nothing sent → bubble hangs
forever, on every message it was never going to answer. Fix both ends: turn the
indicator off for client profiles, and give the bridge's typing endpoint a
`state` parameter so a stuck bubble can be cleared with `paused`.

**The confidentiality filter over-fires.** Its tech-density heuristic counts
words like `agent`, `tool`, `skill`, `memory`, `token`, `prompt` and replaces
the WHOLE response at three hits — unavoidable for an assistant literally named
"<X> Agent" whose job is agendas and notes. Make the threshold and the
replacement text per-profile. Keep the explicit blocklist as-is; only the
heuristic needs loosening.

### Process: a client channel is not a test environment

Most of the above was diagnosed live in the client's WhatsApp group, in front
of their director. It did not need to be. Gate behaviour is fully provable from
the log (`Suppressed` vs `Sending response`), and answer quality is testable in
a DM that runs the same model, persona and filters.

**Prove from logs → test content in DM → touch the client channel only for
final confirmation.** And change ONE thing at a time: two simultaneous changes
here produced a wrong diagnosis that discarded the correct fix and left the
agent mute in the group.

### Google Workspace: per-profile token, over-broad default scopes, silent death

The bundled `productivity/google-workspace` skill is copied **independently into each
profile**, so scopes can be narrowed per profile without touching the others. Worth doing:
the default asks for **eight** scopes including `gmail.send` — i.e. the agent can send
mail as the account owner. Request only what the profile uses.

Token lives at `HERMES_HOME/google_token.json` — properly isolated. The manual
`--auth-url` / `--auth-code` flow means consent can happen on any device; only the
resulting token must land on the agent host.

**Refresh handling is asymmetric.** Access tokens (1 h) refresh transparently on every
call. If the *refresh* token dies, `get_credentials()` prints `Token is invalid. Re-run
setup.` and calls `sys.exit(1)` — no retry, no alert. The agent then answers from
nothing and nobody learns re-auth is needed. Pair every Google-enabled profile with a
watchdog cron using `--script … --no-agent` (stdout empty = silent, stdout non-empty =
delivered), which also keeps the refresh token from ageing out through disuse.

Scope choice affects *survivability*, not just security: `drive` (full) is **restricted**
and cannot be published without Google verification, so an unverified app stays in Testing
and its refresh tokens expire every 7 days. `drive.file` is non-sensitive and publishes
cleanly. Publishing an unverified app removes the 7-day expiry — users just click through
one warning screen.

---

## Non-negotiable principles (hard-won)
1. **Council-first.** Before deciding, dispatch parallel research agents: (a) upstream scout
   (what changed, how many commits/releases, breaking changes) + (b) patch-surface collision
   (our custom patches × upstream churn → per-file collision matrix). Decide path from synthesis.
2. **RE-PORT, not rebase.** A heavy `gateway/run.py` fork (+1000s of lines) vs upstream's
   rewrites = merge-conflict hell on rebase. Instead: checkout the upstream target, then
   re-apply our logical features (patch inventory) onto it. `patch --fuzz=3` for drifted
   context, hand-port the `.rej` rejects.
3. **Backup + rollback FIRST.** Never touch prod until ALL rollback assets exist + verified.
   Run `scripts/preflight_backup.sh` → tag + dep freeze + every config/env + full tarball + doc.
4. **Staging worktree.** Do ALL prep in a separate git worktree (`~/dev/hermes-vX-report`).
   Prod dir `~/.hermes/hermes-agent` stays untouched until the supervised cutover.
5. **Dry-boot gate.** Before launchd/systemd start, boot once in foreground to catch missing
   deps. Two real cases now: `No module named 'psutil'` on a cutover (fixed by
   `pip install -e .`), and `No module named 'aiohttp'` on a FRESH v2026.8.13 install —
   `pip install -e .` did NOT pull it, and it had to be installed by hand.
   The aiohttp one is the instructive shape: the gateway reported a clean boot and stayed
   up, only `[Whatsapp] Failed to start bridge` was buried in the log, so the process was
   alive and healthy-looking while the entire messaging path was dead. An import check
   cannot find this; only a real boot can.
6. **Supervised cutover ONLY.** The operator must be standby for the live cutover + smoke
   test. NO unsupervised live cutover (production serves customers; a 3am break = outage
   before anyone catches it). Prep/staging can be autonomous; the live flip cannot.
7. **Multi-profile smoke test = the human gate.** Cutover is NOT "done" until the operator
   validates live WA on EVERY profile + key surfaces. Boot-clean ≠ behavior-correct.

---

## PHASE 0 — Council review + decision (autonomous prep OK)
Dispatch 2 parallel research agents (see a dispatching-parallel-agents skill):
- **Agent A "upstream scout"**: fetch upstream, summarize commits since our tag, list
  releases, flag breaking changes, identify target tag.
- **Agent B "patch-surface"**: inventory OUR patches in gateway/run.py + run_agent.py +
  bridge.js + skills, build a collision matrix vs upstream churn per file.

Synthesize → write a plan doc. Present the operator the decision paths (stopgap-now vs
full-report-now vs stay) + a chair recommendation. **Wait for greenlight before Phase 1.**

## PHASE 1 — Backup + staging (autonomous OK)
```bash
# 1. ALL rollback assets (idempotent, date-stamped):
bash ~/.claude/skills/seoboost-hermes-agent-update/scripts/preflight_backup.sh

# 2. Fetch upstream + create staging worktree at the TARGET tag:
cd ~/.hermes/hermes-agent
git fetch upstream --tags
git worktree add ~/dev/hermes-vX-report -b seoboost-port-vX <TARGET_TAG>
```
Run long git/tar foreground with generous timeouts. Background nohup jobs can be killed
mid-write → corrupted tarball once. Foreground + verify (`gzip -t`).

## PHASE 2 — ADDITIVE re-port (low risk) — in staging
New files our fork adds but upstream lacks (agent skills live in `~/.hermes/skills`, not git):
copy/recreate. Mechanical. `py_compile` each.

## PHASE 3 — INVASIVE re-port (careful surgery) — in staging
Re-apply the patch inventory onto the target's `gateway/run.py`, `run_agent.py` (+ relocated
modules — upstream refactors move anchors, e.g. a recent release moved the agent loop into
`agent/conversation_loop.py`), `scripts/whatsapp-bridge/bridge.js`.
- `git apply` for clean hunks; `patch --fuzz=3` for drift; hand-port `.rej`.
- **Preserve every `.rej` to `~/.hermes/backups/` even if hand-ported** (audit + retry).
- After each file: `python -m py_compile <file>` / `node --check bridge.js`.
- **Re-port checklist (the custom-patch inventory — verify each lands):**
  - [ ] dangerous-command gate (non-home group dangerous-command auto-deny) — P0 SAFETY
  - [ ] output sanitizer layers + free-response output-drop
  - [ ] channel-bound persona (`_CHANNEL_BOUND_PERSONA`, [brand-isolated client group])
  - [ ] vault auto-inject skip (resume/archive/fileshare intents)
  - [ ] second-profile suppression gates (busy-ack + long-running timer, non-home)
  - [ ] skill_manager guardrail (source_url required) + constants module
  - [ ] compression-warning emit suppress (also covered by config threshold)
  - [ ] session-reset notice restricted to the home channel
        (`[paten/reset-notice-home-only]` in `gateway/run.py`) — CONFIDENTIALITY

**Status messages bypass every output sanitizer.** The sanitizer layers only see LLM
responses. Anything the gateway emits directly — auto-reset notices, compression warnings,
busy-acks — reaches the chat untouched. The reset notice names `config.yaml`, `session_reset`,
the model id, the provider and the context size; it leaked into a client group on 2026-08-06.
Config alone cannot stop it: `reset_reason in {"suspended","resume_pending_expired"}` bypasses
`policy.notify` entirely, and both fire on every gateway restart — i.e. every update and every
watchdog kickstart. After any upstream bump, re-check which gateway-emitted strings can reach
a non-home chat, and gate them fail-CLOSED on the home channel.
- **Check for upstream i18n** (a recent release added `locales/<lang>.yaml` +
  `agent/i18n.py` + `HERMES_LANGUAGE`). If present, prefer a localized `locales/<id>.yaml` +
  `HERMES_LANGUAGE=<id>` over hardcoded localized strings — cleaner + update-proof.

## PHASE 4 — Config rebuild
Reconcile config.yaml against new upstream defaults. **Re-assert OUR model config every time**
(updates can reset it): provider + primary model + fallback + vision/aux model +
`smart_model_routing` + `compression.threshold`. Do for EVERY profile. Keep keys in `.env`
(never in config committed to git).

### Fallback is FAILURE-triggered, not modality-aware — they are different keys

Two mechanisms that sound alike and are not:

| Key | Fires when | Shape |
|---|---|---|
| `fallback_model` | the provider FAILS (429 / 529 / 503 / connection) | single dict **or an ordered chain list** of `{provider, model}` |
| `auxiliary.vision.{provider,model}` | the turn carries an IMAGE the main model can't take | dedicated backend that describes the image for a text-only model |

Putting a vision model second in `fallback_model` does **not** make image handling work —
the chain is tried in order on failure and knows nothing about modalities. If the primary
is down and the next link is text-only (DeepSeek v4 is `input_modalities: ['text']`), it is
`auxiliary.vision` that saves the turn, not the chain.

Check the primary's real modalities before designing any of this rather than assuming; on
OpenRouter, `GET /v1/models` → `architecture.input_modalities` is authoritative, and it has
already contradicted a reasonable guess (MiMo v2.5 accepts image/audio/video natively, so
its vision backend is a *fallback*, not the main path — and `image_routing.py` prefers
native pixels whenever the main model reports `supports_vision`).

**`auxiliary.free_only: true` does the OPPOSITE of what the name suggests.** It does not
downgrade the auxiliary fallback to a free model — it **refuses the fallback entirely**
whenever the configured model is not a `:free` SKU, and marks the provider unhealthy for
60 s (`agent/auxiliary_client.py::_try_openrouter`). Since the default
(`_OPENROUTER_MODEL`) is a paid Gemini flash SKU, setting `free_only` alone silently
removes a safety net. To actually get "free but still present", set **both**
`free_only: true` and `auxiliary.openrouter_model: <something>:free`.

Related noise worth reading correctly: `PAID lane engaged for auxiliary task` is emitted
when the paid lane is *constructed*, once per model per process — not when it is billed.
The very next log lines usually show the auxiliary task being served by the main model.
Do not report it to the operator as spend that already happened.

### ⚠️ UPSTREAM DEFAULT FLIPS — the failure class boot-clean cannot catch
**The most dangerous breakage in a Hermes update is not a merge conflict. It is a default
that changed underneath a key we never set.** Everything compiles, every module imports,
both profiles report `whatsapp connected`, `health_check.sh` passes — and a whole intake
path is silently dead.

Proven case (v2026.6.19 → v2026.8.3): the WhatsApp **group** policy default flipped.
```
OLD  gateway/platforms/whatsapp.py       WHATSAPP_GROUP_POLICY default = "open"
NEW  plugins/platforms/whatsapp/adapter.py   default = "pairing"
     gateway/platforms/whatsapp_common.py → if group_policy == "pairing": return False
```
Our configs never set `group_policy` (the old default was already what we wanted), so after
cutover **every group message was rejected before the mention gate was even reached**. DMs
kept working — the policies are separate — which makes the symptom look like a mention-parsing
bug and sends you hunting in the wrong file. Both profiles were affected; only one was noticed,
because the other happened to be tested over DM.

Then a **second, newer gate** fires the moment you fix the first one: `open` is refused at
startup unless allow-all is opted into explicitly (`gateway/run.py`, `_OWN_POLICY_OPEN_ENV`) —
`<PLATFORM>_ALLOW_ALL_USERS` per platform, or `GATEWAY_ALLOW_ALL_USERS` for all. Setting
`group_policy: open` alone puts the gateway into a crash-loop:
`Refusing to start: … 'open' but neither GATEWAY_ALLOW_ALL_USERS nor <PLATFORM>_ALLOW_ALL…`.
Prefer the **per-platform** variable; `GATEWAY_*` widens every platform at once.

**Diagnostic recipe — use this BEFORE reading control flow.** Three plausible-looking
hypotheses (missing mention extraction, JID-normalisation asymmetry, incomplete event
payload) were all wrong and cost real downtime; diffing the defaults answered it in one shot:
```bash
# every default that changed on a policy/gate knob, old prod tag vs new target
git show <pre-update-tag>:gateway/platforms/<platform>.py | grep -nE '_policy *=|getenv\('
git show <target-tag>:plugins/platforms/<platform>/adapter.py | grep -nE '_policy *=|_wenv\('
# then: which of those knobs do our configs NOT set explicitly? those are the live risks
grep -rnE 'group_policy|dm_policy|require_mention' ~/.hermes*/config.yaml ~/.hermes*/.env
```
**Rule: after any upstream bump, every policy/gate knob we rely on must be set EXPLICITLY in
config, even when the current default already matches.** A default we never wrote down is a
default upstream is free to flip. Add a comment naming the release that forced the change so
the next operator knows why the line exists.

Sanity-check the same way for: `dm_policy`, `require_mention`, allowlist emptiness semantics
(upstream moved "empty allowlist" from *allow-all* to *deny-all*), and any `*_ALLOW_ALL_*` gate.

### The rule above is necessary but NOT sufficient — two blind spots

**Blind spot 1: "is this value right?" is the wrong question. Ask "which keys does the
mature profile have that the new one doesn't?"**

Every check we built compared a value against an expectation. None of them enumerated keys
present in the established profile and *absent* in the new one. Absent keys don't fail a
value check — they inherit an upstream default, silently, and the two profiles diverge.

Proven three times on one deploy, each time the same shape:

| Key | Mature profile | Client profile | Consequence |
|---|---|---|---|
| `vault.auto_inject.enabled` | `false` | *absent* | prefetch reached the OTHER tenant's vault; agent reported its existence + activity to the client |
| `agent.gateway_notify_interval` | `600` | *absent* → `180` | "⏳ Working — N min" heartbeats fired in the client group |
| `display.platforms.<p>.busy_*` | *absent too* | *absent* | both exposed; only the client channel made it visible |

The diff is one command and it is worth running on every profile creation AND every bump:

```bash
# keys present in the mature profile but MISSING in the new one
python3 - <<'PY'
import yaml
def flat(d,p=""):
    for k,v in (d or {}).items():
        n=f"{p}.{k}" if p else k
        yield from (flat(v,n) if isinstance(v,dict) else [(n,v)])
a=dict(flat(yaml.safe_load(open('<MATURE>/config.yaml'))))
b=dict(flat(yaml.safe_load(open('<NEW>/config.yaml'))))
for k,v in sorted(a.items()):
    if k not in b: print(f"MISSING  {k:52} (mature={v!r})")
PY
```
Note the third row: the diff would NOT have caught `busy_*`, because *neither* profile set it.
A config diff finds divergence, not shared exposure. For shared exposure you need the next one.

**Blind spot 2: output-layer suppressors guard the agent's FINAL RESPONSE ONLY.**

System notifications travel a different path and reach the chat regardless. On a client
channel whose whole design is "silent unless addressed", these leak internal machinery in
English, with tool names and iteration counters:

```
↳ Redirected current run (iteration 2/500, running: execute_code).
⏳ Working — 3 min — iteration 9/500, execute_code
```

The silence gate was working correctly the entire time — the agent's *answer* was suppressed.
Three separate knobs emit those, all defaulting ON for chat platforms in
`gateway/display_config.py` (WhatsApp resolves to `_TIER_MEDIUM`):

| Key | Emits |
|---|---|
| `busy_steer_ack_enabled` | "↳ Redirected current run…" when a message lands mid-run |
| `long_running_notifications` | "⏳ Working — N min" heartbeat |
| `busy_ack_detail` | the `iteration N/500` + tool-name detail |

Turning off `tool_progress` and `interim_assistant_messages` does NOT cover these. Set all
five explicitly on any client-facing channel.

**Generalized rule: on a client channel, set explicitly every key that can EMIT TEXT — not
just every key that controls ACCESS.** The access-key rule was already written down and
followed; it did not save us, because the leak came out of a display key.

Corollary for the smoke test: "the agent stayed silent" and "the channel stayed silent" are
different claims. Verify the second. The failure only appears when a run is slow enough to
cross the heartbeat interval, so a fast smoke test cannot surface it — send something
genuinely heavy (a large PDF, a multi-tool task) into a NON-client channel and watch.

### Skill isolation on a shared repo is FAIL-OPEN

If a client profile's `skills.external_dirs` points at the shared `seoboost-skill-set` clone,
`skills.disabled` is the only thing standing between that client's agent and every other
client's material — and it is a **denylist over a set that grows on every `git pull`**.

Hermes has no skill allowlist. `tools/skills_tool.py:_is_skill_disabled` knows only
`disabled` and `platform_disabled`, and the platform list *adds to* the global one rather
than restricting it. There is no "only these skills" mechanism to reach for.

Observed: a routine `git pull` brought 3 commits and 2 new skills. Both were live to the
client agent immediately — one a SEO Boost-internal finance dashboard including its credential
path, plus a skill-router SKILL.md naming five other client projects in plain text.
Nothing failed, nothing logged, and no boot check could have caught it: the config was
still exactly as written and every invariant still passed.

```bash
# run after EVERY pull, for every client profile — lists what is currently reachable
python3 - <<'PY'
import yaml, os, re
cfg=yaml.safe_load(open('<PROFILE_HOME>/config.yaml'))
dis=set(cfg['skills']['disabled']); repo=cfg['skills']['external_dirs'][0]
live=[d for d in sorted(os.listdir(repo))
      if os.path.isdir(f"{repo}/{d}") and not d.startswith('.') and d not in dis]
sus=re.compile(r'<client-slugs>|devset|deploy|invoice|router|audit|ecosystem', re.I)
print("REVIEW:", [s for s in live if sus.search(s)] or "none")
PY
```
Grep the flagged ones for other clients' names before deciding — a name match is a prompt to
look, not a verdict (a `*-design-router` matched the pattern and was clean).

**Structural fix, for any new client profile: do NOT point `external_dirs` at the shared
repo.** Point it at a curated per-client directory holding only what that client needs
(symlinks are fine). That converts fail-open into fail-closed, and makes the shared repo's
growth structurally unable to reach the client. The denylist then protects against mistakes
rather than being the only wall.

## PHASE 5 — Multi-profile smoke (in staging, before cutover)
Dry-boot foreground for EVERY profile, compile-import all touched modules, grep patch markers
present. Fix before cutover.

## PHASE 6 — CUTOVER (OPERATOR STANDBY REQUIRED) — supervised only
```bash
# 0. DISARM ANY HEALTH WATCHDOG FIRST. A watchdog that kickstarts a "down"
#    gateway will restart it mid-`pip install` / mid-`git checkout` and leave a
#    process running on half-written code. Re-arm only after Phase 6b passes.
#    On this host: ai.hermes.wa-watchdog → ~/.hermes/bin/wa-watchdog.sh
#    (polls each bridge /health every 60s, kickstarts after 3 consecutive
#    failures, 10-min cooldown, escalates via a NON-WhatsApp channel).
#    It watches TWO independent failure modes — see note below.
launchctl bootout gui/$(id -u)/ai.hermes.<watchdog-label>   # if one exists
```
**What a `/health` watchdog can and cannot see** (verified against Baileys 7.0.0-rc14):
- **Half-open socket is NOT a blind spot.** Baileys runs its own keep-alive
  (`Socket/socket.js`, `keepAliveIntervalMs` default 30000): it pings every 30s and, if no
  server data arrives for >35s, calls `end(DisconnectReason.connectionLost)`. That fires the
  close event, so `connectionState` — and therefore `/health` — flips to `disconnected`
  honestly within ~35s. Don't build a freshness probe for this; the library already does it.
  (Confirm you have not overridden `keepAliveIntervalMs` in `makeWASocket`.)
- **The real blind spot is the other side of the queue.** `GET /messages` drains with
  `splice(0, length)`. If the bridge stays connected but the GATEWAY stops draining, messages
  pile up to `MAX_QUEUE_SIZE` (100) and the oldest are then dropped **silently** — while
  `status` still reads `connected`. A socket-only check never sees it. `/health` already
  exposes `queueLength`, so this needs no bridge patch: treat `connected` + `queueLength > 0`
  for N consecutive ticks as unhealthy and restart the gateway. Measure your own baseline
  first — on this host it was `queueLength == 0` in 40/40 samples across both profiles, which
  is what justifies a threshold as tight as 3 ticks.
```bash
# (cutover continues)
launchctl bootout gui/$(id -u)/ai.hermes.<watchdog-label>   # if one exists
hermes gateway stop                                   # stops default profile
launchctl bootout gui/$(id -u)/ai.hermes.<name>       # stops second profile
cd ~/.hermes/hermes-agent
git checkout <staging_commit_or_branch>               # bring v.X+patches into prod dir
~/.hermes/hermes-agent/venv/bin/python -m pip install -e .   # install new deps
# DRY-BOOT once foreground to catch missing deps, Ctrl-C, then:
launchctl kickstart -k gui/$(id -u)/ai.hermes.gateway
launchctl kickstart -k gui/$(id -u)/ai.hermes.<name>
bash ~/.claude/skills/seoboost-hermes-agent-update/scripts/health_check.sh
```
Make prod durable (avoid detached HEAD):
```bash
git checkout -b prod-curator-vX
git tag -a cutover-vX-<date> -m "Cutover to <TARGET_TAG> + patches, all profiles validated"
git push -u origin prod-curator-vX && git push origin cutover-vX-<date>
```

## PHASE 6b — OPERATOR LIVE SMOKE TEST (the gate — operator does this)

**Test DM and GROUP separately, on EVERY profile.** They travel different policy paths, so a
DM pass proves nothing about groups (see the group-policy flip in Phase 4). Cover both or the
gate is not a gate.

1. **Default profile, DM** → normal Q → reply, correct identity.
2. **Default profile, GROUP, @mentioned** → must reply. ← catches the group-policy flip;
   this is the single highest-value test in the list.
3. **Second profile, GROUP** → a client-specific lookup query → correct reply, no brand leak.
   Run it in a real client group, NOT the operator's DM.
4. **Brand-isolated client group** → chitchat without @mention → SILENT; addressed query →
   that client's scoped answer (exact values in the LOCAL skill copy).
4b. **Brand-isolated client group, HEAVY unaddressed input** (large PDF / multi-tool task) →
   the channel must stay silent for the WHOLE run, not just at the end. This is a separate
   test from 4 and it is the one that catches steer-acks and "⏳ Working" heartbeats, which
   only fire once a run outlives the notify interval. A fast query passes test 4 and proves
   nothing here. Run it in a staging group, never the client's.
5. **Dangerous cmd** in a non-home group → NO approval-prompt leak (auto-deny). The gate reads
   the status chat-id to decide "is this a group"; if upstream changed that field's contents it
   fails OPEN. Only a live group test proves it still closes.
6. Both bridges `"status":"connected"`, and re-arm the watchdog disarmed in Phase 6.

**Any FAIL → rollback immediately.**

### Reading the "no response" symptom

**Check `/health` FIRST.** If the bridge is dead, all three log checks below come back
empty and every one of them points at the wrong thing:
```bash
curl -s http://127.0.0.1:3000/health    # {"status":"connected"} or nothing at all
systemctl --user is-active hermes-gateway   # can say "active" while the bridge is DEAD
```
`systemctl` is not evidence. The Python gateway stays up and respawns a bridge that
WhatsApp rejects, so the unit looks healthy forever. `/health` is the only honest signal.

Then, silence has three further causes; find which one before touching code:
```bash
grep "inbound message" ~/.hermes/logs/gateway.log | tail   # gateway saw it?
tail ~/.hermes/whatsapp/bridge.log                          # bridge saw it?  (v0.20+ path)
```
- **Bridge log has no `stage:queued` for that chat** → never reached the bridge (connectivity,
  session, or the bot is not in the chat).
- **Bridge queued it but gateway logged no `inbound message`** → the gateway dropped it:
  policy gate first, then mention gate. This is the default-flip case.
- **Gateway logged inbound but no response** → agent/model side, not intake.

Bridge stdout moved: pre-v0.20 it landed in `gateway.log`; from v0.20 it is
`~/.hermes/whatsapp/bridge.log`. Looking in the old place shows an empty log and wastes a cycle.
`WHATSAPP_DEBUG=1` in the profile `.env` + restart makes the bridge emit per-message
`upsert`/`queued`/`ignored` JSON with chat + sender ids — turn it back off afterwards.

### Zombie bridge + logged-out sessions — and why restarting is the wrong reflex

Two failure modes hide behind the same silence, and they need OPPOSITE responses.

**Zombie bridge** — process alive, socket dead, no crash. `Restart=always` / `KeepAlive`
never fires because nothing exited. Only `/health` notices.

**Logged-out session** — WhatsApp invalidated the credentials (Baileys `code 401`,
`❌ Logged out. Delete session and restart to re-authenticate.` in `bridge.log`). The
gateway happily respawns the bridge, which is rejected again, forever.

A real incident: 35 logout cycles across 43 bridge starts over two days. Nothing alerted,
the unit read `active` throughout, and the operator discovered it only by noticing the
agent had gone quiet. **Restarting is not merely useless here — the retry loop is what
makes the failure invisible.**

Its most confusing signature: a command is acknowledged, the work completes successfully,
and the reply never arrives. The bridge died between the ack and the delivery. Check the
runner/plugin log for `Connection refused` on the send before suspecting the agent.

Recovery is re-pairing (QR), never a restart:
```bash
systemctl --user stop hermes-gateway
tar czf ~/backups/hermes/session-$(date +%F).tar.gz -C $HERMES_HOME/whatsapp session
rm -rf $HERMES_HOME/whatsapp/session
cd $HERMES_HOME/hermes-agent/scripts/whatsapp-bridge && node bridge.js --pair-only
systemctl --user start hermes-gateway
```
Confirm the relink from `creds.json` — the device index increments (`…:1@` → `…:2@`),
which distinguishes a fresh link from a stale session that merely reconnected.

**A watchdog is the fix, and its value is in what it REFUSES to do.** Probe `/health` on a
timer, then classify:

| Condition | Action |
|---|---|
| `status` is connected | clear failure counter, clear the alert de-dupe |
| unhealthy, no logout in current bridge lifetime | restart, bounded (3 tries) |
| **logout in current bridge lifetime** | **do NOT restart** — alert a human, stop |
| restart budget exhausted | stop restarting, escalate — never mask the cause |

Five traps when building it, each one found the hard way:

1. **Alert over a DIFFERENT channel.** WhatsApp cannot be its own courier. Use Telegram
   (or a healthy sibling profile). An alert that needs the dead component is not an alert.
2. **`bridge.log` is append-only, so old logouts never disappear.** A naive
   `tail | grep "Logged out"` reads a logout from an incident you already repaired and
   refuses to restart a bridge that merely wedged. Anchor on the current bridge lifetime:
   ```bash
   awk '/listening on port/ { seen = 0 }
        /Logged out/        { seen = 1 }
        END                 { exit !seen }' "$BRIDGE_LOG"
   ```
3. **Give it a maintenance pause flag.** During pairing the operator runs `--pair-only`
   against the same session dir; a watchdog restart at that moment puts two Baileys
   processes on one session and corrupts the credentials. Disabling the timer by hand
   works right up until someone forgets, so check a flag file every tick instead.
4. **Separate "the host is offline" from "the bridge is broken" — check it FIRST.**
   A second real incident: 27 consecutive failures, 3 useless restarts, escalation to a
   human — and the cause was the machine losing outbound network for ~29 minutes. The
   gateway logs `Reconnect whatsapp error: whatsapp connect timed out after 30s` and backs
   off (60s → 120s → 240s → 300s), the bridge keeps starting fine, and no restart can help.
   **The correlation IS the diagnosis: WhatsApp failing and the alert channel failing at
   the same moment means the network, not Hermes.** Probe reachability before deciding —
   the alert endpoint itself is the natural probe, since a failure there means you could
   not have alerted anyway:
   ```bash
   internet_up() { curl -fs -m 8 -o /dev/null "https://api.telegram.org"; }
   ```
   Order matters: offline check BEFORE the logout check and before any restart.
5. **Send an all-clear.** The same incident self-resolved 60 seconds after the alert
   finally got through, and the operator was never told — they were left holding an alarm
   for a problem that no longer existed, with instructions to investigate it. An alarm
   with no resolution notice trains people to ignore alarms, which costs you the next
   real one. Notify on recovery, but only when an alert was actually raised, or the
   channel becomes noise in the other direction.

Reference implementation on the Ubuntu host: `~/.hermes/bin/wa-watchdog.sh` +
`wa-watchdog.{service,timer}` (systemd user, 60 s), pause flag at
`$HERMES_HOME/state/wa-watchdog.pause`.

**Residual risk to state out loud rather than discover later:** an in-machine watchdog
cannot report the machine's own death. If the host goes down, nothing alerts. That needs
external monitoring.

## PHASE 7 — Post-cutover
- Watch 24h. Port cosmetic follow-ups (status messages / i18n) in a later supervised session.
- Update operator notes + append a decision-log entry.
- Retire the old prod branch only after stable.

---

## ROLLBACK (armed before every cutover — 1 command)
```bash
cd ~/.hermes/hermes-agent && git checkout <pre-update-tag> && \
~/.hermes/hermes-agent/venv/bin/python -m pip install -r ~/.hermes/backups/requirements-snapshot-<date>.txt && \
hermes gateway stop && launchctl kickstart -k gui/$(id -u)/ai.hermes.<name> && hermes gateway start
```
Full scenarios (code / config / catastrophic-tarball) are written into a dated
`ROLLBACK-PROCEDURE-<date>.md` by `preflight_backup.sh`. **All profiles revert together —
test every profile after.**

## HARDLINE rules
1. **No cutover without operator standby + a passed multi-profile smoke test.** Period.
2. **No prod-dir edits during prep** — staging worktree only.
3. **Rollback assets verified BEFORE touching prod** (tarball `gzip -t`, tag exists, freeze non-empty).
4. **Re-assert model config + patch inventory** after every update — upstream resets them.
5. **Every profile is sacred** — if a change risks a client profile, stop + escalate. Test all.
6. **Foreground long ops** (git/tar/pip) — background jobs got killed mid-write before.
7. **Preserve every `.rej`** to backups, even hand-ported ones.

## Helper scripts (in this skill)
- `scripts/preflight_backup.sh` — create + verify ALL rollback assets (tag, dep freeze,
  every profile's config/env, full tarball, dated rollback doc). Idempotent. Run BEFORE update.
- `scripts/health_check.sh` — verify EVERY profile healthy after restart/cutover (processes,
  launchd state, bridge ports, version, recent errors, safety-patch markers present).

## Related skills
- `seoboost-fork-checkpoint` — checkpoint/doc before a risky session.
- `seoboost-decision-tracking` — log the update decision (path chosen, rationale).
- `seoboost-verify-deploy` — end-to-end verification discipline before declaring success.
