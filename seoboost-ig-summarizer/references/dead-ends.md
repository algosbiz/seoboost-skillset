# Instagram Extraction — Confirmed Dead Ends

These approaches have been tested and definitively **do not work**. Do not retry.

## Third-party viewers

| Service | Result |
|---------|--------|
| bibliogram.art | Redirect loop → empty page |
| ddinstagram.com | Empty response |
| imginn.com | Cloudflare challenge wall |
| dumpor.com | Same fate |
| Threads cross-post | "invalid_post" for IG-only content |

## Instagram API endpoints

| Endpoint | Result |
|----------|--------|
| oembed (`api.instagram.com/oembed?url=...`) | HTTP 500 |
| `?__a=1&__d=1` query params | Login wall still blocks |
| gallery-dl | "HTTP redirect to login" — needs auth cookies |

## Navigation tricks

| Technique | Result |
|-----------|--------|
| `?img_index=N` URL param | Always shows slide 1 |
| `click` action on CSS refs | Stale/"unknown element" after DOM changes — use `eval` + `.click()` |

## Search engines for reposts

DuckDuckGo, Google, Bing all serve captcha/challenge pages from automation environments. Not reliable.

## The ONLY approach that works

The `use_browser` `eval` JavaScript click-through loop. Navigate → tolerate login dialog → JS click + extract → repeat.
