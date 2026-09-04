---
name: seoboost-minio-proxy-photo
description: Use when an image, file, or object stored in MinIO/S3 behind Docker loads in server-side curl/tests but is broken in the browser, when a presigned URL returns 404 / ERR_NAME_NOT_RESOLVED / SignatureDoesNotMatch, when an `<img src>` points at an internal host like `minio:9000`, or when you must serve stored photos/files to BOTH an anonymous public page and a logged-in admin UI. Triggers — "foto tidak tampil", "image broken behind docker", "presigned 404", "minio:9000 in browser".
metadata:
  type: reference
---

# MinIO/S3 photo serving behind Docker — proxy, don't presign

## Overview

A presigned URL from a MinIO/S3 client inside Docker Compose embeds the **internal**
service host (`http://minio:9000`). That host resolves on the Compose network but **not
in the browser**. Result: 200 from server-side curl/tests, **broken image in the
browser** — a success that lies. You lose a debugging session because every server-side
check passes.

**Core principle:** the browser must never touch MinIO directly. Stream the object
**through your API** (the only thing that can reach MinIO), and enforce access at the app
layer. Two consumers, two auth models:

- **Public/anonymous** (a share-link form, a receipt page): a **stateless HMAC-signed,
  short-lived URL** to a stream endpoint. No login, capability-scoped to one object.
- **Logged-in admin**: a **cookie-authenticated stream endpoint** behind the normal auth
  guard. The `<img>` sends the session cookie automatically.

## When to use / not

Use when: storage is reachable only inside Docker (or any private network) but images/
files must render in a browser; you need anonymous AND authenticated access to the same
objects.

Don't use when: the bucket is genuinely public and CDN-fronted (then a plain public URL is
fine), or the object never reaches a browser (server-to-server only — internal presigned
URL is fine).

## The trap (why the obvious fixes are wrong)

| Tempting "first fix" | Why it fails |
|---|---|
| String-replace `minio:9000` → public host in the returned URL | SigV4 **signs the host header**. Swapping the host post-signing ⇒ `SignatureDoesNotMatch`. |
| Generate presigned URL against a public MinIO endpoint | Now MinIO must be internet-exposed (TLS, CORS, hotlink/enumeration risk). A presigned URL is a bearer token anyone can replay until expiry — weak for admin data. |
| Make the bucket public | Anyone can enumerate/read every object. No per-object or per-tenant control. |

The proxy pattern sidesteps all three: MinIO stays private, access is decided in your code.

## Pattern A — public, HMAC-signed stream URL

Build a signed URL the API hands to anonymous pages. Sign **object id + scope + storage
key + expiry** so the URL is scoped to one object and self-expiring. Verify with a
**constant-time** compare, and **verify before any observable DB work** (so a bad signature
can't be used as an "does this id exist?" oracle).

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Controller, Get, Header, Param, Query, Res, StreamableFile,
  UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';   // examples assume @nestjs/platform-express

// secret = a DEDICATED env secret (e.g. PHOTO_URL_SIGNING_SECRET), NOT your session/JWT key.
// Reusing the auth secret works but violates key separation — give it its own.
private sign(id: string, scopeId: string, key: string, expires: number) {
  return createHmac('sha256', this.signingSecret())
    .update([id, scopeId, key, String(expires)].join('\0'))  // NUL delim: keys may contain "." or "/"
    .digest('hex');
}

buildPhotoUrl(row: { id: string; scopeId: string; key: string | null }) {
  if (!row.key) return null;
  const expires = Math.floor(Date.now() / 1000) + 15 * 60;               // short TTL for PII (15m)
  const sig = this.sign(row.id, row.scopeId, row.key, expires);
  const url = new URL(`/api/photos/${row.id}`, `${this.publicApiBaseUrl()}/`); // PUBLIC api origin
  url.searchParams.set('expires', String(expires));
  url.searchParams.set('signature', sig);
  return url.toString();
}

// stream endpoint (public, unguarded route — the signature IS the auth)
async getPhotoStream(id: string, expires?: string, signature?: string) {
  if (!expires || !signature || !/^\d+$/.test(expires)) throw new UnauthorizedException();
  const exp = Number(expires);
  if (exp < Math.floor(Date.now() / 1000)) throw new UnauthorizedException();   // expired
  const row = await this.repo.findActive(id);
  // Verify BEFORE distinguishing missing/!key — return 401 uniformly so existence doesn't leak.
  const ok = !!row?.key && (() => {
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(this.sign(id, row.scopeId, row.key!, exp), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);   // constant-time
  })();
  if (!ok) throw new UnauthorizedException();
  return this.storage.getFile(this.bucket(), row!.key!);     // stream from MinIO (internal)
}
```

```ts
// controller — stream with StreamableFile; force a SAFE content-type; handle mid-stream errors
const SAFE_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']); // NO image/svg+xml (XSS)

@Get('photos/:id')
@Header('Cache-Control', 'private, max-age=300')
@Header('X-Content-Type-Options', 'nosniff')                 // don't let the browser MIME-sniff
async getPhoto(@Param('id') id: string, @Query('expires') e: string,
               @Query('signature') s: string, @Res({ passthrough: true }) res: Response) {
  const f = await this.svc.getPhotoStream(id, e, s);
  // Anonymous-uploaded bytes served same-origin: allowlist the type, never trust stored metadata.
  const type = SAFE_IMAGE_TYPES.has(f.contentType ?? '') ? f.contentType! : 'application/octet-stream';
  res.setHeader('Content-Type', type);
  res.setHeader('Content-Disposition', 'inline');
  if (f.size) res.setHeader('Content-Length', String(f.size));
  const sf = new StreamableFile(f.stream);
  sf.setErrorHandler((_err, response) => response.end());   // MinIO drops mid-stream → close cleanly
  return sf;
}
```

> `repo` / `storage` / `this.bucket()` / `this.signingSecret()` / `this.publicApiBaseUrl()` are
> placeholders — wire to your project's equivalents.

## Pattern B — admin, cookie-authenticated stream

For the logged-in dashboard, skip signing. Put the same stream endpoint behind the auth
guard; the browser's `<img>` sends the session cookie. **Requirement:** if the API and the
app are on different subdomains (`app.example` ↔ `api.example`), the session cookie must be
**cross-subdomain** (`Domain=.example`, `SameSite=Lax` or `None; Secure`). Otherwise the
`<img>` request carries no cookie → 401, and you debug a "random" auth failure.

## Wiring checklist

- `publicApiBaseUrl()` resolves to the **browser-reachable** API origin (env like
  `API_PUBLIC_URL`), never the internal `minio:9000` or `localhost` in prod.
- Signing secret is a **dedicated** env secret, separate from the session/JWT key.
- Expiry is **inside** the signed payload AND checked on read; keep TTL short for PII.
- Constant-time signature compare (`timingSafeEqual`), and verify **before** any response
  that reveals object existence (no 404-vs-401 enumeration oracle).
- Pattern A route has NO auth guard — but it MUST route through `getPhotoStream`, which
  verifies the signature. Never return the stream before the compare passes.
- Force a **safe content-type allowlist** + `X-Content-Type-Options: nosniff` (anonymous
  uploads served same-origin = stored-XSS risk; block `image/svg+xml`).
- Attach a stream **error handler** (`StreamableFile.setErrorHandler` / `stream.on('error')`)
  so a mid-stream MinIO failure closes the socket instead of hanging (a broken-image lie).
- Stream (don't buffer) large files: `StreamableFile` / piping, not `readFileSync`.

## Common mistakes

- **Returning the raw presigned URL to the browser** — the original bug. 200 on the
  server, broken in the browser.
- **Host string-swap after signing** → `SignatureDoesNotMatch` (SigV4 signs the host).
- **`===` on the signature** — timing side-channel; use `timingSafeEqual` on equal-length
  buffers.
- **Admin photos 401 only in the browser** — cookie isn't cross-subdomain; the `<img>`
  sends nothing. Fix the cookie domain, not the endpoint.
- **Mixed content** — HTTPS page + `http://…:9000` image ⇒ browser blocks it. The proxy
  endpoint inherits your API's TLS, sidestepping this.
- **Serving stored `Content-Type` verbatim** — an attacker who controls an anonymous
  upload's type (`text/html`, `image/svg+xml`) gets stored XSS on your API origin.
  Allowlist the type; send `nosniff`.
- **404-before-signature** — looking up the object before verifying lets anonymous callers
  enumerate which ids exist. Verify first, fail 401 uniformly.
- **Long-lived public URL** — the signed URL is a bearer capability; anyone who sees it
  (logs, `Referer`, history) can replay it until expiry. Keep PII TTL short.
- **Forgetting `Content-Type`** — browser won't render the stream as an image.

> Origin: a multi-hour "photos randomly broken" incident (Project F, 2026) — every server-side
> check returned 200, the browser failed on a `minio:9000` presigned URL. Hardening above
> from a security/backend council review of the original fix.
