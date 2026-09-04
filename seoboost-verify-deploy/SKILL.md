---
name: seoboost-verify-deploy
description: Use when about to report a production deploy or redeploy as successful, or when verifying a deployed HTTP service end-to-end — health endpoints, auth gates, port binds, and generated content (PDF/HTML) — from both localhost and the public domain.
---

# Verifying Production Deploys

## Overview

A deploy is not done when the container is up — it is done when every check the requester listed is green, with evidence. Core principle: **never report success before all checks pass; report failures verbatim with output.** Run the same checks twice: against `127.0.0.1` (is the app right?) and against the public domain (is the routing right?). A local-only pass with a public failure means tunnel/DNS, not app.

## Standard Check Matrix

| Check | Command sketch | Expect |
|---|---|---|
| Health | `curl -fsS $BASE/health` | 200 + expected body |
| Docs locked in prod | `curl -o /dev/null -w '%{http_code}' $BASE/docs` | 404 (also check `/openapi.json`) |
| Auth gate | POST without API key header | 401 |
| Auth works | POST with key from secrets.env (never echo it) | 200 |
| Old key after rotation | POST with previous key | 401 |
| Port bind | `ss -tln \| grep :PORT` | `127.0.0.1:PORT`, never `0.0.0.0` |
| Smoke script | `API_KEY=... ./smoke.sh $BASE` | its explicit ALL-PASSED line |

Run matrix locally first, then publicly. Use `-w '%{http_code}'` checks so every expectation is a comparable number, not eyeballed output.

## Verifying Generated Content (don't trust HTTP 200)

A 200 with a broken PDF/HTML is a failed deploy. Inspect the artifact:

- **PDF is real:** `head -c4 file.pdf` → `%PDF`; `pdfinfo` for sanity.
- **Images/logos embedded:** `pdfimages -list file.pdf` — count rows with type `image` (each PNG-with-alpha also adds an `smask` row; don't count those). "Logo added" claims are verified by image count + dimensions, e.g. a new 600×600 logo appearing.
- **Text/layout assertions:** `pdftotext -layout file.pdf -` then grep. Layout claims (hanging indent, removed text) are checkable: `awk '{match($0,/[^ ]/); print NR, RSTART}'` shows the start column of each line — continuation lines of a value must start at the value column, not the label margin.
- **Defaults vs overrides:** when a field is parameterized, test BOTH payloads — default (field omitted → old text appears) and custom (new text appears AND old default does NOT leak).
- **HTML endpoint:** assert `<!DOCTYPE html>` + expected branding string + the requested path param echoed; assert it is NOT a JSON error body.

## Negative Tests Are Half the Job

Every "X now works" needs its "not-X still rejected" twin: invalid hash → 404, missing key → 401, malformed input → 422, old rotated key → 401. A feature verified only on the happy path is unverified.

## Reporting

- Lead with outcome: all green / what failed.
- Table of every requested check: result vs expected.
- Evidence for shared-infra claims (e.g. service uptimes proving nothing else restarted).
- Secrets: state where they're stored and that they're recorded — **never the values**.
- If anything is red: STOP, report verbatim error output, propose rollback target. Do not bury a failure inside a success summary.

## Common Mistakes

| Mistake | Fix |
|---|---|
| "Container healthy → done" | Healthy ≠ correct; run the matrix |
| Public checks only | Local-first isolates app vs routing failures |
| Counting smask rows as images | Filter `$3=="image"` in pdfimages output |
| Verifying happy path only | Pair every positive with its negative test |
| Pasting secret values as "proof" | Name + length + storage path only |
| Reporting success with one check pending | All green or it's not done |
