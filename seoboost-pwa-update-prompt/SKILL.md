---
name: seoboost-pwa-update-prompt
description: Use when a PWA should tell the user "a new version is available, reload" after a deploy — when a Next.js + next-pwa/Workbox app updates silently (or not at all) and users are stuck on stale assets, when you see post-deploy "ChunkLoadError"/white screen from silent skipWaiting, or when adding a non-intrusive update banner. Triggers — "versi baru tersedia", "PWA update notification", "new version available banner", "service worker update prompt", "app stuck on old version", "workbox waiting". For version display/SemVer see seoboost-app-version-stamp.
metadata:
  type: reference
---

# PWA "new version available" prompt (workbox-window waiting event)

## Overview

After a deploy, a PWA should let the user **choose** when to load the new version, instead
of swapping assets silently mid-session (which causes `ChunkLoadError`/white screens when
old HTML requests chunk hashes the new build dropped). The robust, battle-tested pattern:
let the new service worker **wait**, detect it via `workbox-window`'s `waiting` event, show
a banner, and on tap apply it (`skipWaiting` → `controlling` → reload).

**Core principle:** the SW precache manifest changes every build (asset hashes change), so
"a new SW is waiting" is the exact, native update signal. You do **not** need version.json
polling or a git SHA to detect updates — only to *display* a version ([[seoboost-app-version-stamp]]).

## When to use / not

Use for: Next.js PWA via `@ducanh2912/next-pwa` (or any Workbox-generated SW); you want a
controlled "reload to update" prompt; iOS standalone PWA support matters.

Don't use when: not a PWA / no service worker; or you genuinely want fully-silent
auto-update with no prompt (then keep `skipWaiting:true` and accept the mid-session-swap
risk — usually the wrong trade).

## The key reversal (and why)

next-pwa defaults / a common setup is `skipWaiting:true` + auto `register:true`. For a
*prompt*, reverse both:

| Setting | Value | Why |
|---|---|---|
| `skipWaiting` | **false** | The new SW must WAIT so there's a window to show the banner. `true` self-activates → `waiting` fires-then-resolves → no stable banner. **Mutually exclusive with a prompt.** |
| `register` | **false** | You register via workbox-window yourself (one registrar). Leaving `register:true` while also `new Workbox()` = double-registration / missed events. |
| `clientsClaim` | keep `true` | Only affects first install (no controller yet) → takes control without reload. Safe. |

**Trade-off (state it honestly):** updates are no longer fully silent. A user who ignores
the banner stays on the old version until they tap it or relaunch. In exchange you stop
silent mid-session asset swaps (the actual cause of post-deploy chunk failures). "Update
without logout" is preserved — a one-tap reload keeps the session. For a PWA this is the
correct, conventional trade.

## next.config.js

```js
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: false,            // we register via workbox-window
  cacheOnFrontEndNav: true,
  disable: process.env.NODE_ENV === 'development', // SW off in dev → whole flow no-ops
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: false,       // let the new SW WAIT so we can prompt
    clientsClaim: true,       // first-install only; safe to keep
  },
});
```

`next build` still generates `public/sw.js` with `register:false` — you just register it
yourself. (Verify post-deploy: `curl /sw.js` → 200.)

## The hook (workbox-window)

```ts
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Workbox } from 'workbox-window'; // transitive dep of next-pwa

type Status = 'idle' | 'available' | 'reloading';

export function useServiceWorkerUpdate() {
  const [status, setStatus] = useState<Status>('idle');
  const wbRef = useRef<Workbox | null>(null);
  const reloadingRef = useRef(false);
  const updateOfferedRef = useRef(false); // first-install also fires `controlling` — don't reload then

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;            // dev no-op
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const wb = new Workbox('/sw.js');
    wbRef.current = wb;
    const onWaiting = () => { updateOfferedRef.current = true; setStatus('available'); };

    wb.addEventListener('waiting', onWaiting);
    // @ts-expect-error emitted at runtime for an already-waiting SW
    wb.addEventListener('externalwaiting', onWaiting);
    wb.addEventListener('controlling', () => {
      if (!updateOfferedRef.current || reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    });

    wb.register().catch(() => {});   // ⚠️ listeners attached ABOVE, before register()
    return () => {
      wb.removeEventListener('waiting', onWaiting);
      // @ts-expect-error
      wb.removeEventListener('externalwaiting', onWaiting);
    };
  }, []);

  const update = useCallback(async () => {
    setStatus('reloading');
    const wb = wbRef.current;
    const hardRefresh = async () => {            // iOS standalone fallback
      try {
        const regs = await navigator.serviceWorker?.getRegistrations();
        await Promise.all((regs ?? []).map((r) => r.unregister()));
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {}
      finally {
        const u = new URL(window.location.href);
        u.searchParams.set('_v', Date.now().toString()); // defeat iOS bfcache restore
        window.location.replace(u.toString());
      }
    };
    if (!wb) return void hardRefresh();
    try { wb.messageSkipWaiting(); } catch { return void hardRefresh(); }
    // Safety net: if `controlling` never fires (iOS standalone), force a hard refresh.
    window.setTimeout(() => { if (!reloadingRef.current) void hardRefresh(); }, 2500);
  }, []);

  return { status, update, dismiss: useCallback(() => setStatus('idle'), []) };
}
```

## The banner (reuse your toast lib)

A headless component mounted once in the root layout. With sonner, a persistent toast is
the least-intrusive surface (no layout shift, dismissible, gets `role`/`aria-live` for
free). Lift it above any mobile bottom nav + iOS safe area:

```tsx
toast('Versi baru tersedia', {
  description: 'Muat ulang untuk memakai versi terbaru.',
  duration: Infinity,
  position: 'bottom-center',
  style: { marginBottom: 'calc(5rem + env(safe-area-inset-bottom))' }, // clear bottom nav
  action: { label: 'Muat ulang', onClick: () => update() },
  cancel:  { label: 'Nanti',     onClick: () => dismiss() },
});
```

## Verify (it can't be tested in dev — SW is off there)

1. **SW registers** (the reversal didn't break the PWA): load the deployed app, check
   `navigator.serviceWorker.controller` is non-null and points at `/sw.js`.
2. **Banner end-to-end** needs a *second* deploy: deploy A → load app → deploy B (any
   change → new sw.js hash) → on the tab running A, `registration.update()` (or a
   navigation/the hook's periodic check) → `waiting` → banner appears.
3. iOS standalone: tap "Muat ulang" → reloads to the new version (fallback covers a stalled
   handshake).

## Common mistakes (the footguns)

- **Leaving `skipWaiting:true`** → no waiting window → banner never stably shows. Must be
  `false` for a prompt. (This usually *reverses* an earlier "deploys show without logout"
  fix — that's intended; the one-tap reload still avoids logout.)
- **Leaving `register:true`** while also `new Workbox()` → double registration, racing/missed
  `waiting` events. Set `register:false`.
- **Attaching the `waiting` listener AFTER `register()`** → on a fast install the event fires
  before you listen → banner silently never shows. Listeners first, then `register()`.
- **Reloading on the first-install `controlling`** → unwanted reload on first visit. Guard:
  only reload if an update was actually offered (saw `waiting`).
- **No iOS fallback** → on iOS standalone the `skipWaiting`→`controlling` handshake can stall
  → "tap does nothing." Timeout (~2.5s) → unregister SWs + clear caches + `location.replace`
  with a `?_v=` bust.
- **Forgetting dev no-op** → next-pwa disables the SW in dev; guard the hook on
  `NODE_ENV === 'production'` so dev doesn't error.

## Real-world impact

Pattern proven twice in SEO Boost: POViez (via Serwist's `waiting`, on iOS PWAs in production) and
Project F (via `workbox-window`, verified end-to-end live — SW registers with `register:false`,
a `1.0.0`→`1.0.1` deploy produced a new `sw.js`, and the "Versi baru tersedia" banner
rendered on the stale tab). Serwist is a Workbox fork, so the event model is identical
across both. Pairs with [[seoboost-app-version-stamp]] for showing the version number.
