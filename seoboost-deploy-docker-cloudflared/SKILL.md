---
name: seoboost-deploy-docker-cloudflared
description: Use when deploying or redeploying a dockerized microservice to a production server exposed via Cloudflare Tunnel, when following a deploy runbook (DEPLOY-AGENT.md style), or when a container exits immediately after start on a fail-closed service.
---

# Deploying a Docker Service Behind Cloudflared

## Overview

Production deploy of a containerized HTTP service where the ONLY public path is a Cloudflare Tunnel. Core principle: **fail-closed everywhere** — wrong commit stops the deploy, missing secrets crash the boot, the port never binds publicly, and success is only reported after verification passes.

## When to Use

- Deploying/redeploying a microservice (FastAPI, Express, etc.) behind cloudflared
- A runbook specifies an expected commit SHA, secrets env, smoke script
- Container exits immediately after `docker run` (fail-closed boot)
- Rotating an API key for a running production container

## The Commit Gate (do this FIRST, never skip)

```bash
git fetch origin main && git pull --ff-only
git log -1 --format="%H%n%s"
```

HEAD must equal the SHA the requester named. **If it doesn't match: STOP and report — do not build, do not "deploy what's there".** Real failure mode: the requester forgot to push; HEAD was the *rollback* target, not the feature commit. Building it would have looked like success while deploying nothing.

## Secrets

- Generate once: `openssl rand -hex 32` per secret.
- Store outside the repo: `~/.config/<service>/secrets.env`, `chmod 600` (dir `700`).
- **Never print values** — verify by name + length only:
  ```bash
  grep -E '^MY_' secrets.env | while IFS='=' read -r k v; do printf '%s len=%s\n' "$k" "${#v}"; done
  ```
- If a secrets file already exists, **reuse it — never regenerate** (HMAC/signing secrets invalidate already-issued artifacts like signed QR codes).
- Rotation: rotate ONLY the key that leaked/needs sending (e.g. API key). Backup file with timestamp first, `sed -i` the one line, restart container, then verify **new key → 200 AND old key → 401**. Both checks, local and public.

## Run Pattern

```bash
set -a; . ~/.config/<service>/secrets.env; set +a
docker rm -f <name> 2>/dev/null
docker run -d --name <name> --restart unless-stopped \
  -p 127.0.0.1:8000:8000 \
  -e APP_ENV=production -e SECRET_A="$SECRET_A" ... \
  <image>:<tag>
sleep 15
docker ps --filter name=<name>   # expect: Up (healthy)
```

- `-p 127.0.0.1:8000:8000` — localhost-only. The app listening on `0.0.0.0` *inside* the container is fine; the host bind is what matters. Verify: `ss -tln | grep :8000` → must show `127.0.0.1:8000`, not `0.0.0.0`.
- `--restart unless-stopped` + enabled docker service = survives host reboots unattended.
- Container exits instantly? `docker logs <name>` — almost always a missing env var on a fail-closed app. Fix env, rerun. Don't patch the app to boot without it.

## Redeploy Cycle (per release)

pull → confirm SHA → `docker build` → `docker rm -f` + `docker run` (identical env, same secrets) → wait ~15s healthy → smoke local → smoke public → feature-specific verification → report. Rollback = same cycle pointed at the previous known-good SHA.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Deploying whatever HEAD is | Gate on the expected SHA; STOP on mismatch |
| Regenerating secrets on redeploy | Reuse secrets.env; signing secrets are immutable for the event |
| Echoing secrets "just to confirm" | Confirm by name + length only |
| `-p 8000:8000` (public bind) | Always `127.0.0.1:` prefix; verify with `ss` |
| Reporting success after build | Success = verification green, nothing less (see seoboost-verify-deploy) |
| `set -euo pipefail` breaking sourced shell snapshots | Run strict mode only inside your own subshell/script |

**REQUIRED SUB-SKILL when wiring the tunnel:** seoboost-edit-multi-tunnel
**REQUIRED SUB-SKILL before reporting done:** seoboost-verify-deploy

## Ambil log insiden SEBELUM deploy, bukan sesudahnya

Nyata dan mahal, Klien B 1 September 2026. Sebuah permintaan menjawab 500 pukul 14.20 dan sedang
ditelusuri. Deploy yang tidak berhubungan di-push pukul 15.11, CI membuat ulang kontainer `be`
pukul 15.13.42, dan **seluruh log kontainer lenyap bersamanya**. Permintaan "tolong ambil
lognya sebelum tergulung" ditulis sesudah deploy yang menghapusnya sudah berjalan.

Driver log bawaan `json-file` menyimpan log **di dalam** kontainer. `docker compose up -d`
membuat kontainer baru, bukan menyalakan ulang yang lama, jadi lognya tidak selamat. Tidak ada
salinan di journald kalau drivernya bukan journald, dan cloudflared tidak mencatat status per
permintaan.

**Aturannya:**

> Sebelum men-deploy ke lingkungan yang lognya tidak persisten, ambil dulu log dari insiden apa
> pun yang belum selesai ditelusuri. Deploy dan penyelidikan tidak pernah mendesak pada menit
> yang sama, dan urutannya bisa dipilih.

**Penampung sementara yang tidak menyentuh kontainer.** Kalau insiden sedang berjalan dan
deploy tidak bisa ditunda, pasang pengikut log di sisi host sebelum deploy:

```bash
setsid nohup sh -c 'docker logs -f --timestamps <nama-kontainer> >> <berkas>' >/dev/null 2>&1 &
chmod 600 <berkas>
```

Ia menangkap dari saat dipasang ke depan, tidak mengubah setelan kontainer, dan tidak
memerlukan pembuatan ulang. Yang mengikuti **nama** kontainer bisa menyambung ulang sendiri
sesudah deploy; yang mengikuti id-nya tidak.

**`chmod 600` bukan hiasan.** Log aplikasi yang melayani pendaftaran memuat data orang, dan pada
project Klien B memuat data anak. Berkas log yang lahir 644 di server bersama adalah kebocoran yang
menunggu.

**Persistensi log yang sebenarnya** (driver berbeda, atau volume) mengubah setelan kontainer dan
menuntut pembuatan ulang. Itu pekerjaan yang dijadwalkan, bukan yang dikerjakan di tengah
insiden atau menjelang hari acara.
