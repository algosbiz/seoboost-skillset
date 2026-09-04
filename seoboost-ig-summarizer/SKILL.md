---
name: seoboost-ig-summarizer
description: Use when a user shares an Instagram post URL (reel, carousel, or single image) and wants its content extracted, summarized, or discussed/brainstormed — captions, comments, carousel slides, on-screen text, and any GitHub repos mentioned. Works without Instagram login via Chrome automation. Triggers on "summarize this instagram post", "what's in this reel", "rangkum IG post ini", or a bare instagram.com/p/ or /reel/ link.
---

# SEO Boost Instagram Post Summarizer

Extract content from any Instagram post URL and produce a structured summary. Supports reels, carousels, single images. No Instagram login required.

Host: **Claude Code** via `use_browser` (superpowers-chrome MCP). All browser actions are `{action, selector?, payload?}` calls to that one tool.

## Fallback FIRST when `use_browser` is unavailable (no Chrome on this host)

`use_browser` needs the **obra `superpowers-chrome`** plugin **and a Chrome binary** on the
machine — not present on every host (e.g. headless VPS / the Telegram channels server). **Before
giving up, try a plain `WebFetch` of the post URL** — Instagram exposes the **caption + author +
og: meta** to an unauthenticated fetch, which is enough for most "summarize this post" requests
(single image / reel where the caption *is* the content). Verified working 2026-06-29.

```
WebFetch(url="https://www.instagram.com/p/<id>/", prompt="author, full caption, hashtags, links/repos mentioned, what it's about")
```

What WebFetch CANNOT get (needs `use_browser`): slide-by-slide **carousel** text, **comments**,
and on-screen text inside a **reel video**. If the user needs those, say so and ask them to enable
superpowers-chrome (install runbook: add marketplace `obra/superpowers-marketplace`, install
`superpowers-chrome`, install Chrome, enable for the agent + allowlist `use_browser`). Otherwise
deliver the caption-based summary and note the limitation.

When `use_browser` IS available, use the full flow below for complete extraction.

## When to use
- User shares an Instagram post URL and wants a summary
- Post contains tools/repos/resources to identify
- User wants to discuss or brainstorm about the post content

## Step 1 — Navigate
`{action:"navigate", payload:"<instagram_url>"}`
The first paint shows content before the login wall hardens. Then `{action:"extract", payload:"markdown"}` to capture the initial state.

## Step 2 — Close the login dialog (if it blocks content)
`{action:"eval", payload:"document.querySelector('[role=\"dialog\"] button')?.click()"}`

**IMPORTANT:** On Instagram, always interact via `eval` (raw JS `.click()`), **not** the `click` action — CSS-ref clicks go stale after Instagram's DOM churn. If the DOM empties after closing, re-`navigate` to the URL.

## Step 3 — Extract metadata from the first extract
From the markdown/HTML, parse: author (username + verified), caption + hashtags, top visible comments, post-type indicator (a `<video>` = reel; multiple images = carousel), timestamp ("6w", "2d").

## Step 4 — Handle post type

### 4a. Reel / video
Video can't be read as text. Extract caption + comments. For on-screen text/code in the video frame: take a screenshot, then **Read the auto-captured PNG** to read what's shown.
`{action:"screenshot", payload:"/tmp/ig-frame.png"}` → then Read `/tmp/ig-frame.png`.
(superpowers-chrome also auto-saves a viewport `.png` in the session dir after every action — Read that if you didn't take an explicit shot. There is no separate "vision" action; you read the image yourself.)

### 4b. Carousel (multiple slides)
Instagram lazy-loads slides — only 1–2 exist in the DOM at once. Click through one by one. **A 12-slide carousel needs ~12 round-trips** — there is no shortcut.

**TWO hard-won rules (battle-tested 2026-06-22, do not skip):**

1. **Do NOT use a self-contained async loop inside one `eval`.** A `payload` with `await sleep()` + `return` resolves to `undefined` — the harness doesn't await it, and the clicks don't persist. Instead: stash a **`window`-scoped accumulator** once, then drive it with **separate `eval` round-trips** (one click per call). `window` state survives across `use_browser` calls (even across a Chrome session-dir rollover).

2. **Dedup key must skip the constant prefix.** Every slide's alt starts with the SAME text: `"Photo by <Author> on <Date>. May be ..."`. Keying the seen-set on `alt.substring(0,55)` collapses every slide to one entry. **Strip the prefix first, then key on the body.**

Setup the accumulator once (replace `<Author>`/`<Date>` with the post's actual values from Step 3 — the date filter also excludes the "More posts" thumbnails):
```js
window.__slides=new Map();
window.__harvest=()=>Array.from(document.querySelectorAll('img')).map(i=>i.alt)
  .filter(a=>a&&a.includes('<Date>')&&a.length>120)
  .forEach(a=>{const body=a.replace(/^Photo by <Author> on <Date>\.\s*(May be (an image of |a graphic of |a Twitter screenshot of |an? )?)?/,''); const k=body.substring(0,50); if(!window.__slides.has(k)) window.__slides.set(k,body);});
window.__next=()=>Array.from(document.querySelectorAll('button')).find(b=>b.getAttribute('aria-label')==='Next')?.click();
window.__harvest(); 'init '+window.__slides.size
```
Then loop, ONE call per slide (gives the next image time to load between click and harvest):
`{action:"eval", payload:"window.__harvest(); window.__next(); 'slides='+window.__slides.size"}`
Repeat until the count stops rising. Final harvest after the last click: `window.__harvest(); 'done '+window.__slides.size`. Dump: `JSON.stringify(Array.from(window.__slides.values()))`. Previous slide = `aria-label==='Go back'`. See `references/carousel-js-patterns.md`.

### 4c. Single image
Alt text is already in the initial DOM:
`{action:"eval", payload:"Array.from(document.querySelectorAll('img')).map(i=>i.alt).filter(a=>a&&a.includes('Photo by')&&a.length>150)"}`

## Step 5 — Comments
Collect visible comments (username, text, timestamp, likes if shown). Load more with `{action:"eval", payload:"window.scrollTo(0, document.body.scrollHeight)"}` then re-`extract`.

## Step 6 — Cross-reference GitHub repos (when mentioned)
Prefer `gh` CLI (authenticated, no 60/hr limit):
```bash
gh repo view OWNER/REPO --json nameWithOwner,stargazerCount,forkCount,primaryLanguage,description,licenseInfo,repositoryTopics,updatedAt
# search by name when no URL given:
gh search repos REPO_NAME --sort stars --limit 5 --json fullName,stargazersCount,description
```
Fallback to the public API only if `gh` is unavailable (`curl -s https://api.github.com/repos/OWNER/REPO`).

## Step 7 — Output
```
📱 INSTAGRAM POST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━
👤 Author: @username (verified?)
🕐 Posted: <timestamp>
📌 Type: Reel / Carousel (N slides) / Single Image

📝 Caption:
<full caption + hashtags>

🖼️ Content:
<extracted from slides/video/screenshots>

💬 Key Comments:
1. @user — text
...

🔗 Referenced Resources:
• Repo — ⭐ stars — description — URL

💡 Summary:
<what it is, why it matters>
```

## Pitfalls
- **`click` action fails on IG** — use `eval` + `.click()`. Refs go stale after DOM changes.
- **Carousel is lazy-loaded** — 1–2 slides in DOM; click through, can't grab all at once.
- **Login dialog blocks viewport** — close via JS; if DOM empties, re-navigate.
- **"More posts" pollutes image extraction** — filter alt by the post's date (add `&& a.includes('June 06')`) to exclude unrelated images.
- **No vision action** — read the auto-saved screenshot PNG yourself; don't expect a `browser_vision`-style tool.
- **Third-party viewers don't work** (bibliogram, ddinstagram, imginn, gallery-dl, oembed, `?img_index=N`) — see `references/dead-ends.md`. Don't waste time.
- **GitHub anon API = 60 req/hr** — use `gh` CLI instead.
