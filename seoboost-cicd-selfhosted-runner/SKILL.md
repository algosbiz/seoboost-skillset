---
name: seoboost-cicd-selfhosted-runner
description: Use when setting up CI/CD for a SEO Boost project via GitHub Actions on the production server — registering a per-repo self-hosted runner (replicated from an existing runner, no download), writing the push-to-main deploy workflow, or debugging a runner/deploy that does not fire.
---

# CI/CD via GitHub Actions Self-Hosted Runner (SEO Boost Convention)

## Overview

SEO Boost deploys run ON the production server: **one self-hosted runner per repo**, each a systemd
service. Deploy = push to `main`. The workflow builds the Docker image on the host and restarts the
container. Core principles: **runtime secrets never enter CI** (they live on the host, `--env-file`),
and **the run fails loudly** — any non-200 in the verify step fails the deploy.

## When to Use

- New project needs CI/CD on a server that already runs other SEO Boost runners
- A deploy workflow exists but never triggers (runner offline/mis-registered)
- Migrating a manually-deployed container (see `seoboost-deploy-docker-cloudflared`) to push-to-deploy

## SEO Boost Conventions

| Item | Convention |
|---|---|
| Runner location | `Projects/<Project>/action-runner-<project>/<role>-runner/` |
| Runner name | `<project>-<role>` (e.g. `acme-frontend`) |
| systemd unit | auto-generated: `actions.runner.<owner>-<repo>.<runner-name>.service` |
| Workflow file | `.github/workflows/deploy.yml`, trigger `push: main` + `workflow_dispatch` |
| `runs-on` | `self-hosted` is enough — the runner is repo-scoped, no extra labels needed |
| Secrets | runtime → host `~/.config/<app>/secrets.env` (600); build args (`NEXT_PUBLIC_*`) → workflow text (they are public by definition) |

## Procedure

### 1. Replicate runner binaries (no 200MB download)

Copy an existing runner dir, **excluding every per-instance file**:

```bash
rsync -a \
  --exclude '_work' --exclude '_diag' \
  --exclude '.runner' --exclude '.credentials' --exclude '.credentials_rsaparams' \
  --exclude '.env' --exclude '.path' --exclude '.service' \
  --exclude '.setup_info' --exclude '.runner_migrated' \
  <existing-runner>/ <new-runner-dir>/
```

Copying `.runner`/`.credentials` makes the new runner impersonate the old repo — the #1 mistake.

### 2. Registration token via API (PAT with repo admin)

```bash
curl -sS -X POST -H "Authorization: token $PAT" \
  https://api.github.com/repos/<owner>/<repo>/actions/runners/registration-token
# 201 → {"token":"...", "expires_at":"+1h"}
```

403/404 → PAT lacks admin; ask the repo admin to grab a token from
*Settings → Actions → Runners → New self-hosted runner* and hand it over. Token is valid **1 hour**.

### 3. Configure + install as service

```bash
cd <new-runner-dir>
./config.sh --url https://github.com/<owner>/<repo> --token <REG_TOKEN> \
  --name <runner-name> --unattended
sudo ./svc.sh install <user> && sudo ./svc.sh start
systemctl is-active actions.runner.<owner>-<repo>.<runner-name>.service
```

Verify registration server-side (status flips `offline → online` a few seconds after start):

```bash
curl -sS -H "Authorization: token $PAT" \
  https://api.github.com/repos/<owner>/<repo>/actions/runners
```

### 4. The deploy workflow

```yaml
name: Deploy to Production
on:
  push: { branches: [main] }
  workflow_dispatch:
concurrency:
  group: deploy-production       # serialize deploys; never cancel a running one
  cancel-in-progress: false
jobs:
  deploy:
    runs-on: self-hosted
    timeout-minutes: 30
    env:
      APP_DIR: /path/to/standing/clone
      SITE_URL: https://app.example.com
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 1 }

      - name: Sync standing clone to pushed commit (commit gate)
        run: |
          set -euo pipefail
          cd "$APP_DIR"
          git fetch origin main
          git reset --hard "$GITHUB_SHA"

      - name: Build image
        run: |
          set -euo pipefail
          cd "$APP_DIR"
          DOCKER_BUILDKIT=1 docker build \
            --build-arg NEXT_PUBLIC_SITE_URL="$SITE_URL" \
            -t <app>:latest .

      - name: Restart container
        run: |
          set -euo pipefail
          docker rm -f <app> 2>/dev/null || true
          docker run -d --name <app> --restart unless-stopped \
            -p 127.0.0.1:<port>:3000 \
            --env-file /home/<user>/.config/<app>/secrets.env \
            <app>:latest
          sleep 8
          docker ps --filter name=<app>

      - name: Verify (local + public — non-200 FAILS the run)
        run: |
          set -euo pipefail
          for p in / /health; do
            code=$(curl -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:<port>$p")
            echo "local $p -> $code"; [ "$code" = "200" ] || exit 1
          done
          ss -tln | grep -q '127\.0\.0\.1:<port>' || { echo "FAIL: public bind"; exit 1; }
          for p in / ; do
            code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$SITE_URL$p")
            echo "public $p -> $code"; [ "$code" = "200" ] || exit 1
          done

      - name: Cleanup dangling images
        run: docker image prune -f || true
```

### 5. First push IS the test

Push the workflow → watch until green, then prove the deploy came from CI:

```bash
curl -sS -H "Authorization: token $PAT" \
  "https://api.github.com/repos/<owner>/<repo>/actions/runs?per_page=1"   # completed success
docker ps --filter name=<app>     # Status "Up <seconds>" = freshly recreated by the runner
git -C $APP_DIR log -1            # standing clone == pushed SHA
```

## Workflow Design Rules (fixes to older SEO Boost workflows)

- **Sync the standing clone** (`git reset --hard "$GITHUB_SHA"`). Older workflows cd into the
  standing clone and rebuild WITHOUT pulling — they redeploy stale code while CI shows green.
- **`docker image prune -f` only.** `-af` deletes other projects' images on a shared runner host.
- **`DOCKER_BUILDKIT=1`** explicitly — hosts without the buildx plugin fall back to the legacy
  builder, which chokes on `RUN --mount`. (Plugin installs user-level to `~/.docker/cli-plugins/`.)
- **Secrets:** workflow references the host secrets file path; values never appear in YAML, logs,
  or GitHub secrets. Verify by name+length only.
- **Verify step is the gate.** Local first (app correctness), then public domain (routing). Pair
  with `seoboost-verify-deploy` for the full matrix.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Copied `.runner`/`.credentials` to new runner | Exclude per-instance files; runner else impersonates the old repo |
| Runner "offline" right after `svc.sh start` | Long-poll takes a few seconds — re-query the runners API |
| Registration token reused later | It expires in 1h and is single-registration — mint a new one |
| `prune -af` in cleanup | Dangling-only `-f`; the host is shared |
| Build green but old code live | Standing clone was never synced to `$GITHUB_SHA` |
| Reporting success because the run is green | Also prove container recreated + site 200 (run can pass while verifying the wrong thing) |
