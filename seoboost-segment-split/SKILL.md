---
name: seoboost-segment-split
description: Use when ONE big file (e.g. app.js, a monolith) is edited by MANY parallel chats/sessions and the shared-file collisions + coord merge-queue are the real bottleneck slowing everyone down. This skill physically splits the monolith into per-section files so each chat OWNS one file and patches it directly (no merge serialization), keeps a coord-owned shared "core" file, and defines a cross-chat handoff-prompt protocol for the rare edit that must touch another file — so each chat's context stays lean and intact. Triggers — "pecah code per-section", "file kegedean dipakai rame-rame", "kerja paralel per chart/section tanpa tabrakan", "modularisasi biar paralel", "split monolith per fitur", "bikin prompt lintas chat biar konteks utuh", "coord jadi bottleneck merge", "kerja lebih agresif tapi jangan tabrakan". NOT for a one-off refactor unrelated to parallel work. Related — standing multi-session conventions = seoboost-agent-coordination; live handoff-relay setup = seoboost-agent-coordination; save state before fork = seoboost-fork-checkpoint; layered architecture rationale = fullstack-dev-skills:architecture-designer.
---

# SEO Boost Segment Split — pecah monolith jadi per-section biar paralel tanpa tabrakan

## The core insight (baca ini dulu)

When many chats work on the same product and it feels **slow**, the cause is usually
NOT the people or the coordination discipline — it is the **one giant shared file**
everyone must touch. As long as every feature lives in `app.js`, any two chats editing
it collide, so you need a collision map + a coord merge-queue + mailbox relays. That
overhead **is** the slowness.

**Fix the structure, not the process:** split the monolith so each section lives in its
own file. Then each chat owns one file, patches it directly, and commits — no merge
queue, no collision map for 95% of the work. Coord shrinks to owning one small **core**
file and arbitrating the rare cross-file edge. This is feature-folder modularization
applied to a no-build frontend. It makes the team *aggressive* safely.

The price: a **one-time, cross-cutting refactor** to do the split (coord-owned, careful,
verified). After that, parallel work is nearly collision-free.

## When to use / when NOT

USE when: ≥3 chats edit the same big file · a collision map / merge-queue already exists ·
patches keep waiting on coord · context blows up because each chat must read the whole
monolith. NOT when: single-session work · the file is already modular · the split cost
outweighs the parallelism (few contributors, rarely touched).

## The model in one picture

```
BEFORE                          AFTER
app.js (1 file, everyone)       core.js        ← coord owns (state, router, pollers, wire, bootstrap)
  → collision map               insight.js     ← insight chat owns, edits directly
  → coord merge-queue           kalender.js    ← kalender chat owns
  → mailbox relays              makro.js       ← makro chat owns
  → SLOW                        …one file per section…
                                index.html     ← still one file (HTML rarely conflicts), coord owns shell
Cross-file edit? → the chat writes a HANDOFF PROMPT for the owning chat (see §Handoff).
```

Ownership rule, non-negotiable: **you edit only YOUR file.** Need something in another
file or in core? You do NOT reach in — you write a handoff prompt (below). This keeps
each chat's context small and its file conflict-free.

## Phase 0 — MAP before you cut (delegate; keep coord context lean)

NEVER cut blind. Spawn a sub-agent (Sonnet) to read the monolith and answer these 6
questions; have it write a map file and return a 1-screen summary (don't pull the raw
file into coord's context):

1. **Load mechanism** — how is the file loaded? Plain classic `<script>` (global scope)
   or `type="module"`? Wrapped in one big IIFE or top-level declarations? (Classic +
   top-level = a no-build multi-`<script>` split works with zero syntax rewrites.)
2. **Section map** — for each section: which functions belong to it, line range, LOC.
3. **Shared core** — the state object, view router (`switchView`), `wire()`/`init()`
   bootstrap, the poller/action registry, and generic helpers used by ≥2 sections. This
   becomes `core.js`.
4. **Cross-section coupling** — which section functions call functions OWNED BY ANOTHER
   section (not core)? Each such edge is a future handoff. Note which are already
   `typeof`-guarded vs. unguarded (unguarded = load-order dependency).
5. **Feasibility verdict** — YES/NO/CONDITIONAL + exact blockers + recommended file list
   & load order.
6. **HTML/CSS** — is the markup cleanly sectioned? Where does CSS live? (Usually leave
   HTML as one file; splitting it buys little because DOM subtrees rarely merge-conflict.)

## Phase 1 — PREP the monolith so it's cleanly cuttable (coord)

Do these BEFORE cutting; each is mechanical, not a redesign:

- **Decompose the monolith `wire()`** — if listeners for several sections are inline in
  one `wire()`, extract `sectionWire()` per section; leave only nav/topbar/global wiring
  in core's `wire()`. (Sections that already have `insWire()`/`initX()` are the pattern.)
- **Move shared helpers to core** — any helper called by ≥2 sections (trade-viz utils,
  `postNarrate`, formatters) goes to `core.js`, regardless of where it physically sits now.
- **Relocate misfiled functions** — a function physically sitting in section A's block but
  only ever called by section B is B's; move it. (Grep call sites — do NOT trust physical
  position or the anchor line numbers, which drift as the file grows.)
- **Decide dead code** — functions with zero call sites: confirm with operator, then delete or
  park them in the most-likely owner file. Don't delete in the same commit as the cut
  (one kind of change at a time).
- **Kill load-order traps** — for unguarded cross-section calls, either add the existing
  `typeof fn === 'function'` guard idiom (preferred — makes load order free) or fix the
  order so the callee's file loads first.

## Phase 2 — CUT into files + wire the loader (coord, no build step)

- One file per section + `core.js`. Same global scope as before (classic scripts share
  `window`), so **no export/import rewrites** for a classic-script monolith.
- Replace the single `<script src="app.js">` with ordered tags. **Load `core.js` LAST** —
  its `init()`/bootstrap runs at parse time and calls into every section, so every
  section must already be defined. Section files can otherwise load in any order (once
  guards are in place).
- Keep `index.html` as one file (coord owns the shell: `<head>`, CSS, nav rail,
  `<main>` wrapper + the 9 `<section>` blocks). CSS inline stays with the shell.
- Keep the OLD `app.js` out of the load list once the new files cover it (grep to prove
  every top-level function moved exactly once — no dupes = no double-declaration).

## Phase 3 — VERIFY (never hand a "should work" to operator)

- `node --check` each new JS file · reload `:8765` · `read_console_messages` clean (no
  ReferenceError = nothing left undefined by a bad split) · click through EVERY view and
  confirm it renders · run the unit suite if backend was touched (it wasn't, for a pure
  frontend split). Only then tell operator "refresh :8765" in plain language.
- De-risk option: carve out ONE small section first (a pilot), verify the loader works
  live, then batch the rest. Cheaper to catch a loader mistake on 150 lines than 4000.

## The ongoing model — after the split

- **Per-chat:** edit only your file; commit straight to `patch/<section>` (or direct, per
  operator's aggression setting). No coord merge-queue for in-file work.
- **Coord:** owns `core.js` + `index.html` shell; reviews only core changes + arbitrates
  handoffs; merges are now trivial (disjoint files).
- **Cross-file edge (the ONLY thing that needs coordination):** you must NOT edit another
  chat's file or core yourself. Write a **handoff prompt** (below) and give it to operator to
  paste into the owning chat. That chat makes the change in its own file, on its own
  context. Your context stays intact and lean.

## Handoff prompt template (paste-ready, for the cross-file edge)

> **[HANDOFF dari `<your-section>` → `<owner-section>`]**
> Aku (`<your-section>`) butuh perubahan di FILE-mu (`<owner-file>`), bukan file-ku, jadi
> kutitipkan biar konteks kita masing-masing tetap utuh.
> - **Apa:** `<function/behavior yang diminta>` di `<owner-file>`.
> - **Kenapa:** `<how your section consumes it>`.
> - **Kontrak:** signature/return `<...>`; panggilanku sudah kuguard `typeof` jadi aman
>   kalau kamu belum siap.
> - **Bukan** perubahan core/router — murni di file-mu. Setelah selesai, balas 1 baris
>   "done + signature final" biar aku lepas guard kalau perlu.

Rule of thumb: if a change touches `core.js` or the router, it is coord's, not a
peer-to-peer handoff — flag coord.

## Pitfalls (each one has bitten a real split)

- **Load order:** core LAST; a section calling an unguarded peer needs that peer earlier
  or a `typeof` guard. A `ReferenceError` on reload = an ordering/guard miss.
- **Physical ≠ logical:** functions and even CSS blocks sit near the wrong section; grep
  call sites, don't trust position. Anchor line numbers drift — re-verify against the live
  file every time.
- **Dead code masquerading as a section's job** — zero-caller functions inflate a
  section's apparent scope; confirm and drop.
- **Double-declaration = the classic live syntax error:** every top-level symbol must
  move to exactly one file. If a commit was already cherry-picked, don't also merge its
  branch. (See seoboost-agent-coordination lesson.)
- **Don't split HTML/CSS just because you split JS** — usually net-negative for a no-build
  app; the JS split is where the parallelism win is.

## Worked example — SANTARA `terminal/app.js` (2026-07-14)

4589-line classic script, top-level decls, one bootstrap IIFE at the end. Split into
`core.js` + 9 section files (insight/kalender/makro/journal/loop/home/sources/sop/
teknikal), `core.js` loaded last. Prep needed: extract `journalWire/sopWire/sourcesWire`
from the 108-line `wire()`; move trade-viz utils (`posView/planViz/pairDigits/…`) +
`postNarrate/aiSrcBadge` to core; relocate `renderEventLog/EVLOG_*` from the Journal
zone to `loop.js` (Loop-owned, misfiled); guard Loop→Insight calls in `renderLoopInternal`;
`renderBrainSum/mapEntries/mmCard` are dead code (confirm before delete). `index.html`
stays one file (9 clean `<section>` blocks, CSS inline). Verdict was CONDITIONAL YES —
mostly mechanical. Full map: scratchpad `appjs-split-map.md`.
