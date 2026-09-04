---
name: seoboost-edit-multi-tunnel
description: Use when adding or changing an ingress hostname on a server that runs MULTIPLE cloudflared tunnels or services, where touching the wrong tunnel config or restarting the wrong systemd unit can take down unrelated production apps.
---

# Editing Multi-Tunnel Cloudflared Safely

## Overview

On a multi-tunnel server, every cloudflared change is a production change to *something else* unless proven otherwise. Core principle: **read everything, identify the exact target, change one file, restart one unit, prove the others never restarted.** If you cannot identify the target tunnel with certainty: STOP and ask — never guess.

## When to Use

- Adding `newapp.example.com → http://localhost:PORT` on a server with several tunnels
- `systemctl list-units | grep cloudflared` returns more than one service
- `/etc/cloudflared/` contains multiple config directories

## Procedure

### 1. Enumerate (read-only) + capture baseline

```bash
systemctl list-units --type=service | grep -i cloudflared
ps aux | grep "[c]loudflared"        # shows --config path per process → maps service ↔ config dir
ls /etc/cloudflared/                  # one subdir per tunnel is the common layout
# Baseline BEFORE any change — you'll compare against this in step 6:
for s in <all tunnel units>; do echo "$s: $(systemctl show $s -p ActiveEnterTimestamp --value)"; done
```

Map: systemd unit ↔ config file ↔ tunnel UUID (`tunnel:` line in config). The hostname's parent domain tells you which tunnel owns it.

### 2. Read the target config fully

```bash
cat /etc/cloudflared/<target>/config.yml
```

Confirm: the hostname doesn't already exist; note the catch-all `- service: http_status:404` (must stay LAST); note `tunnel:` UUID and `credentials-file:`.

### 3. Build the proposed config OUT OF PLACE

Write the modified version to `/tmp/`, inserting the new ingress block **before the catch-all**:

```yaml
  - hostname: newapp.example.com
    service: http://localhost:8000
```

Never edit the live file directly; never delete or reorder existing ingress entries.

### 4. Validate BEFORE installing

```bash
cloudflared --config /tmp/proposed.yml tunnel ingress validate
```

**Gotcha:** `--config` must come BEFORE the `tunnel` subcommand. `cloudflared tunnel ingress validate --config X` silently ignores the flag and prints help. Expect output `OK`.

### 5. Install with backup, route, restart ONE unit

```bash
sudo cp /etc/cloudflared/<t>/config.yml /etc/cloudflared/<t>/config.yml.bak-$(date +%Y%m%d-%H%M%S)
sudo cp /tmp/proposed.yml /etc/cloudflared/<t>/config.yml
sudo cloudflared --config /etc/cloudflared/<t>/config.yml tunnel route dns <TUNNEL_UUID> newapp.example.com
sudo systemctl restart cloudflared-<target>.service     # ONLY this unit
```

`route dns` saying "already configured to route" is success, not an error.

### 6. Prove the blast radius was zero

```bash
for s in <all tunnel units>; do
  systemctl is-active $s
  systemctl show $s -p ActiveEnterTimestamp --value   # others must show OLD timestamps
done
```

`active` alone is not proof — a unit that crashed and restarted is also `active`. The unchanged `ActiveEnterTimestamp` on every non-target unit is the evidence to put in your report.

## Red Flags — STOP and Ask

- You're not 100% sure which unit/config owns the hostname's domain
- The "fix" involves restarting more than one cloudflared unit
- You're about to remove or reorder existing ingress entries
- The catch-all 404 would end up anywhere but last
- `sudo` unavailable → report the prepared diff + exact commands instead of working around permissions

## Common Mistakes

| Mistake | Fix |
|---|---|
| `systemctl restart cloudflared` (generic) | Restart the exact unit name only |
| Editing live config in place | /tmp proposal → validate → backup → install |
| Trusting `is-active` as "untouched" | Compare ActiveEnterTimestamp before/after |
| Flag after subcommand ignored | `cloudflared --config X tunnel ...` |
| Skipping validate ("it's just YAML") | One indent error 404s every hostname on that tunnel |
