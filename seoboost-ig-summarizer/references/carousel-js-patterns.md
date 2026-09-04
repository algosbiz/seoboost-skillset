# Instagram Carousel Extraction — Battle-Tested JavaScript Patterns

All patterns run via `{action:"eval", payload:"<JS>"}` on the superpowers-chrome `use_browser` tool — never the `click` action on Instagram (refs go stale after DOM churn).

## Click Next button
```js
Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'Next')
  ?.click()
```

## Click Go Back button
```js
Array.from(document.querySelectorAll('button'))
  .find(b => b.getAttribute('aria-label') === 'Go back')
  ?.click()
```

## Extract current slide alt text
```js
Array.from(document.querySelectorAll('img'))
  .map(img => img.alt)
  .filter(a => a && a.includes('Photo by') && a.length > 150)
  .pop()
  ?.substring(0, 500)
```
- `a.length > 150` filters thumbnails/icons
- `.pop()` gets the most recently loaded (active) slide
- Date-specific filtering: add `&& a.includes('June 06')` with the post's date

## Close login dialog
```js
document.querySelector('[role="dialog"] button')?.click()
```

## Debug: count images
```js
document.querySelectorAll('img').length
```

## Debug: list all button labels
```js
Array.from(document.querySelectorAll('button'))
  .map(b => b.getAttribute('aria-label') || b.innerText?.substring(0,20) || 'unlabeled')
  .join(' | ')
```

## Loop skeleton (Claude Code) — battle-tested

**Two traps that cost real time (2026-06-22):**

- **An async loop inside ONE `eval` returns `undefined`.** `payload` with `await sleep()` + `return` is not awaited by the harness, and the clicks don't stick. Don't do `for(...){next();await sleep()}` in a single call.
- **The dedup key collapses to 1** if you key on the raw alt prefix — every slide starts `"Photo by <Author> on <Date>. May be ..."`. Strip that prefix, key on the body.

**Working pattern: a `window` accumulator + one click per round-trip** (state survives across `use_browser` calls, even a Chrome session rollover):

1. Setup once (substitute the post's `<Author>`/`<Date>`):
```js
window.__slides=new Map();
window.__harvest=()=>Array.from(document.querySelectorAll('img')).map(i=>i.alt)
  .filter(a=>a&&a.includes('<Date>')&&a.length>120)
  .forEach(a=>{const b=a.replace(/^Photo by <Author> on <Date>\.\s*(May be (an image of |a graphic of |a Twitter screenshot of |an? )?)?/,''); const k=b.substring(0,50); if(!window.__slides.has(k)) window.__slides.set(k,b);});
window.__next=()=>Array.from(document.querySelectorAll('button')).find(b=>b.getAttribute('aria-label')==='Next')?.click();
```
2. Loop, ONE call per slide: `window.__harvest(); window.__next(); 'slides='+window.__slides.size`
3. Stop when the count stops rising; final `window.__harvest()` after the last click.
4. Dump: `JSON.stringify(Array.from(window.__slides.values()))`.

**Note:** `eval` returning `[object Object]` → wrap in `JSON.stringify(...)`.
