---
name: seoboost-ux-law
description: The 10 core UX laws (Jakob, Hick, Fitts, Miller, Proximity, Von Restorff, Serial Position, Tesler, Doherty, Peak-End) as the SEO Boost quick-reference + application checklist for designing or reviewing ANY interface — dashboards, dense financial tables, forms, approval flows, pricing pages, mobile nav, landing pages. Use when you want a principled reason for a layout, choice count, target size, emphasis, ordering, response feedback, or how a flow ends — or when auditing why a screen feels off. Triggers — "UX law", "hukum UX", "Jakob's/Hick's/Fitts's/Miller's law", "Doherty threshold", "Peak-End rule", "Von Restorff", "serial position", "law of proximity", "kenapa UX ini kurang", "audit UX", "terlalu banyak pilihan", "tombol susah dipencet", "loading terasa lambat", "form kepanjangan". For usability heuristics (Nielsen/Krug severity audit) see seoboost-ux-heuristics; for visual polish (hierarchy/spacing/color) see impeccable; for aesthetic direction see the native frontend-design skill; for landing-page sections see seoboost-web-sections; for the accounting-report UI standard see seoboost-financial-report-ui.
metadata:
  type: reference
---

# SEO Boost UX Laws — 10 principles for building & reviewing interfaces

The ten most useful, evidence-based UX laws in one place, tuned for what SEO Boost actually
ships: multi-tenant SaaS (Project E — project management + double-entry accounting for
Indonesian SMEs: dashboards, dense financial tables, approval flows, forms), plus client
landing pages and mobile apps.

**Core principle:** every layout, choice count, target size, emphasis, ordering, and
loading state should have a *reason*, not a vibe. These laws are that reason. Use them two
ways — **prescriptively** (decide how to build a screen) and **diagnostically** (explain
why an existing screen feels slow, confusing, or cheap, then fix it).

This is a reference/checklist skill. It does not replace a real usability audit
([[seoboost-ux-heuristics]]) or visual-polish pass (`impeccable`) — it gives the
*principled why* underneath both.

## The 10 laws at a glance

| # | Law | In one line | Primary lever |
|---|-----|-------------|---------------|
| 1 | **Jakob's Law** | Users expect yours to work like the apps they already know | Match conventions |
| 2 | **Hick's Law** | More (equal-weight) choices → longer decisions | Reduce / group choices |
| 3 | **Fitts's Law** | Bigger + closer targets are faster & safer to hit | Target size & placement |
| 4 | **Miller's Law** | Only ~4-7 chunks fit in working memory | Chunk information |
| 5 | **Law of Proximity** | Things placed near each other read as one group | Group with whitespace |
| 6 | **Von Restorff Effect** | The one that differs gets noticed & remembered | One focal accent |
| 7 | **Serial Position Effect** | First & last items are remembered best | Order by priority (edges) |
| 8 | **Tesler's Law** | Complexity is conserved — product *or* user absorbs it | Absorb into the system |
| 9 | **Doherty Threshold** | Feedback under ~400ms keeps users in flow | Instant / optimistic feedback |
| 10 | **Peak-End Rule** | An experience is judged by its peak moment + its end | Design the peak & the ending |

> Full detail per law (principle · why · do · avoid · SEO Boost application · checklist ·
> caveat, with primary sources) → **`reference/ten-laws.md`**. Read that before applying
> a specific law; this page is the map.

## Apply them in three layers (don't skip to polish)

A screen that "follows all ten" but feels wrong usually applied them in the wrong order.
Work outside-in:

1. **STRUCTURE first** (get the bones consistent before any styling):
   **Jakob** (match the conventions your users already hold) · **Hick** (limit & group
   choices) · **Fitts** (reachable, right-sized targets) · **Tesler** (absorb inherent
   complexity into the system, keep an expert path) · **Miller** (chunk) · **Proximity**
   (group with whitespace).
2. **EMPHASIS next**, sparingly, on top of a *settled* structure:
   **Von Restorff** (exactly one focal accent per view) · **Serial Position** (priority
   items at the edges / first-and-last). Emphasis only works while it stays scarce — it is
   never a fix for a confusing layout.
3. **FEEL last**, to tune:
   **Doherty** (sub-400ms feedback, optimistic UI, skeletons) · **Peak-End** (finish
   strong, soften the single worst moment).

**Precedence rule when two laws pull against each other:**
`safety & auditability > convention (Jakob) > structure > emphasis > feel.`
Concretely: never let an optimistic "saved" state (feel) mask a financial write that could
fail; never let auto-magic (Tesler) hide the audit trail; never let a sweetened ending
(Peak-End) paper over an unfixed worst moment.

## Key tensions (where laws fight — and how to resolve)

- **Hick vs Miller** — fewer options vs don't-delete-capability → **group into ~5-7
  labeled clusters**: lowers *perceived* count without removing features.
- **Fitts vs density** — big targets vs packed ledgers → **enlarge the hit area**
  (full-row/full-cell tap targets) *without* inflating visual row height.
- **Jakob vs Von Restorff** — be familiar vs make the key thing break the pattern →
  keep layout conventional, spend your **one** distinctiveness budget on the single focal
  element (primary CTA, recommended tier).
- **Von Restorff vs Serial Position** — contrast vs position → two combinable levers;
  use contrast to *rescue* a mid-list item deliberately, never by accident.
- **Doherty (optimistic UI) vs financial safety** → optimistic on writes only if it
  **reconciles + rolls back visibly**; for irreversible postings (period close, bulk void)
  drop optimism and use a deliberate confirm beat.
- **Tesler over-absorption vs auditability** → absorb the common case but always keep an
  expert/manual path + a visible audit trail. In accounting, never hide journal mechanics.
- **Proximity vs density** → when whitespace is scarce, fall back to common-region cues
  (subtotal bands, zebra striping) instead of gaps alone.

## SEO Boost surface cheat-sheet (which laws dominate where)

- **Dense financial table** (Neraca / Laba Rugi / Buku Besar): Proximity + Von Restorff
  (isolate exception rows) + Miller (chunk IDs). Support: Jakob (debit/credit order,
  negatives in red/parens) + Fitts (full-row tap). Density caps big gaps → use subtotal
  bands / zebra.
- **Approval flow**: Von Restorff (one solid *Approve*) + Fitts (Approve large; Reject/Void
  separated + confirm). Support: Serial Position (key check first, sign-off last) + Jakob
  (inbox-like) + Peak-End (soft, recoverable rejection) + Proximity (group request meta).
- **Onboarding** (new company / employee / signup): Hick (one decision per step) + Miller
  (4-5 step stepper). Support: Tesler (defaults, pre-fill, auto-validate) + Doherty
  (instant per-step feedback) + Peak-End (end on "you're all set", not an upsell).
- **Pricing page**: Von Restorff ("Most popular" badge + elevation) + Serial Position
  (recommended tier first/at an end). Support: Jakob + Proximity. **Ethics:** highlight the
  most *suitable* tier, not merely the most profitable.
- **Mobile nav**: Jakob (bottom tab bar, top-right account) + Fitts (thumb zone, ≥44×44pt,
  edge-anchored bars). Support: Serial Position (most-used at the outer ends) + Miller (~5
  tabs) + Hick.
- **Save action**: Doherty (optimistic <400ms, reconcile in background) + Fitts (full-width
  bottom-thumb button). Support: Von Restorff (one solid Save) + Tesler (auto-validate /
  auto-balance) + Peak-End (explicit success state). **Safety:** irreversible post → confirm
  beat instead of optimism.

## How to use (workflow)

1. **Frame the surface** — which of the six surfaces above is this? Pull its dominant laws.
2. **Structure → emphasis → feel** — walk the three layers in order; open
   `reference/ten-laws.md` for the do/avoid of each law you're applying.
3. **Resolve conflicts** with the tensions list + the precedence rule (safety wins).
4. **Review** — run the master checklist below; for each ✗, name the law and the fix.
5. **Hand off** — for a full usability score use [[seoboost-ux-heuristics]]; for visual
   hierarchy/spacing/color fixes use `impeccable`.

## Master review checklist (one line per law)

- [ ] **Jakob** — nav/search/account/accounting conventions match what users already know?
- [ ] **Hick** — no view forces a choice among >~7 equal-weight options; there's a default?
- [ ] **Fitts** — primary targets ≥44px, in reach; destructive actions separated + guarded?
- [ ] **Miller** — long IDs chunked; >7-field forms split into labeled sections?
- [ ] **Proximity** — gap *between* groups clearly larger than gap *within*; labels glued to fields?
- [ ] **Von Restorff** — exactly one dominant accent per view; emphasis not diluted; not color-only?
- [ ] **Serial Position** — priority items at the edges/first-last, not buried in the middle?
- [ ] **Tesler** — system absorbs inherent complexity (auto-calc/validate); expert path + audit trail kept?
- [ ] **Doherty** — every action acknowledged <~400ms; slow views show skeletons, not blank/blocking spinners?
- [ ] **Peak-End** — flow ends on a designed success state; the single worst moment is softened?

## Related SEO Boost skills

- [[seoboost-ux-heuristics]] — Nielsen/Krug usability audit with severity scoring (the *audit*; this is the *why*).
- `impeccable` — visual hierarchy, spacing, color, depth (the *how it looks*; replaces
  seoboost-refactoring-ui, removed 28 Aug 2026).
- `frontend-design` (native Anthropic) — distinctive aesthetic direction & typography.
- [[seoboost-web-sections]] — compose landing-page sections; [[seoboost-web-typography]] for type.
- [[seoboost-financial-report-ui]] — the SEO Boost house standard for accounting-report screens (where these laws land hardest).

## Origin & legal

The ten laws are public scientific findings (Fitts 1954, Miller 1956, Hick–Hyman 1952-53,
Wertheimer 1923, von Restorff 1933, Kahneman 1993, Doherty & Thadani 1982, Tesler,
Nielsen 2000) — not copyrightable. This skill was **written from primary sources** (verified
against lawsofux.com and the original papers); it was *prompted by* a "10 UX Laws" carousel
seen in the wild but copies no one's prose. Guidance and all SEO Boost applications are original.
Primary citations live per-law in `reference/ten-laws.md`.
