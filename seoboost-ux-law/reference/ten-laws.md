# The 10 UX Laws — full reference

Companion to `SKILL.md`. One section per law: **principle → why it matters → do → avoid → SEO Boost application → checklist → caveat & tensions → sources**. Read the law you're applying; use `SKILL.md` for the layering model, tensions, and surface cheat-sheet.

**Contents:** [1. Jakob's Law](#1-jakobs-law) · [2. Hick's Law](#2-hicks-law) · [3. Fitts's Law](#3-fittss-law) · [4. Miller's Law](#4-millers-law) · [5. Law of Proximity](#5-law-of-proximity) · [6. Von Restorff Effect](#6-von-restorff-effect) · [7. Serial Position Effect](#7-serial-position-effect) · [8. Tesler's Law](#8-teslers-law) · [9. Doherty Threshold](#9-doherty-threshold) · [10. Peak-End Rule](#10-peak-end-rule)

---

## 1. Jakob's Law

*Category: Perception/Familiarity (Mental Models)*

**Principle.** Users spend most of their time on products other than yours, so they build their mental models from those and expect your product to work the same way as the sites and apps they already know (Jakob Nielsen, 2000).

**Why it matters.** Familiar patterns let users transfer an existing mental model instead of learning yours, so cognitive effort goes to the task, not the interface. This lowers learning curve, error rate, and support load — decisive for non-expert Indonesian SME users who switch between many tools.

**Do**

- Place navigation where users expect it: logo top-left links home, account/search top-right, hamburger plus bottom tab bar on mobile, sticky header on landing pages.
- Use standard icons with standard meaning (magnifier=search, gear=settings, pencil=edit, trash=delete, +=add) and add text labels wherever an icon is ambiguous.
- Follow control conventions: labels above inputs, primary button bottom-right of a dialog with Cancel to its left, radios for single choice, toggles for on/off, native date pickers.
- Mirror accounting conventions users know from Accurate/Jurnal/Excel: debit-left/credit-right columns, negatives in red or parentheses, running balance in the rightmost column, standard report names (Neraca, Laba Rugi, Arus Kas, Buku Besar).
- Preserve expected browser/OS behavior: working Back button, Ctrl/Cmd+S, autofill, clickable-looking links — do not hijack known shortcuts or gestures.
- When a familiar flow must change, ship the new version alongside the old and let users opt in during a transition window.

**Avoid**

- Reinventing standard controls (custom scrollbars, bespoke dropdowns/date pickers) that behave differently from the platform default.
- Repurposing familiar icons or gestures — a trash icon that archives, a swipe that deletes without confirmation.
- Novel navigation or layouts that move things every release and force relearning.
- Big-bang redesigns dropped on users with no fallback to the previous UI.

**SEO Boost application.** Project E's accounting module should mirror conventions Indonesian SMEs know from Accurate, Jurnal/Mekari, and spreadsheets: debit/credit column order, negative-number formatting, Bahasa report labels (Neraca, Laba Rugi, Arus Kas, Buku Besar), and an invoice layout matching a familiar physical faktur. Tables behave conventionally (sortable headers, sticky totals). Approval flows read like a mail inbox — list + status badge + Approve/Reject. On landing/mobile keep hamburger nav, top-right account, bottom tab bar. When redesigning the dashboard, keep the old layout behind a toggle for one release cycle.

**Checklist**

- [ ] Are nav, search, and account controls where mainstream apps put them?
- [ ] Do icons carry conventional meaning, with text labels where ambiguous?
- [ ] Does the accounting UI match what accountants know (debit/credit order, negative formatting, standard report names)?
- [ ] Have we left standard browser/OS behaviors and shortcuts untouched?
- [ ] If we changed a familiar flow, can users temporarily fall back to the previous version?

**Caveat & tensions.** Convention is a default, not a mandate — copying competitors blindly can entrench a bad pattern or block genuine improvement; the goal is meeting expectations, not being generic. It pulls against the drive to differentiate and against Von Restorff (make the key element stand out): deviate only where the payoff is clear and signposted. 'Expected' is audience- and locale-specific — Indonesian SME accountants' Accurate/spreadsheet habits differ from Silicon Valley SaaS norms, so validate against your users' actual reference set.

**Sources:** https://lawsofux.com/jakobs-law/; Jakob Nielsen, Designing Web Usability: The Practice of Simplicity (2000); https://www.nngroup.com/videos/jakobs-law-internet-ux/

---

## 2. Hick's Law

*Category: Cognition/Decision-Making*

**Principle.** The time to make a decision increases logarithmically with the number and complexity of choices presented (Hick–Hyman: RT = a + b·log₂(n+1)) — so doubling the options adds a roughly constant increment of decision time, not double the time.

**Why it matters.** Overloaded menus, filters, toolbars, and settings stall users at the moment you want them to act. Trimming or grouping choices shortens time-to-decision, lowers cognitive load, and reduces abandonment — the effect bites hardest on first-run flows and time-sensitive actions.

**Do**

- Group a long action bar into a few labeled clusters or an overflow (⋯) menu so users scan ~5-7 groups, not 20 flat equal-weight buttons.
- Set a smart default and visually promote the recommended/most-common option so the typical choice is nearly free.
- Use progressive disclosure: show core fields first, tuck advanced options behind 'Show more'/an accordion.
- Stage onboarding into one decision per step instead of one dense configuration page.
- Order options by frequency or logical sequence (not alphabetically) so the likely pick is found fast.
- Cap primary CTAs to one per view; demote the rest to secondary/tertiary styling.

**Avoid**

- Dumping every feature into one flat toolbar or mega-menu of equal-weight items.
- Several identically-styled CTAs so nothing signals the intended path.
- Over-simplifying into vague labels ('More', 'Options') that convert decision time into search/hunting time.
- Alphabetical or random ordering of high-traffic options.

**SEO Boost application.** Project E accounting-report toolbar (export, filter by period/account/project, group-by, compare, print, column picker, save-view…): collapse ~12 flat icons into 3 grouped menus (View · Filter · Export) with the last-used report period pre-selected as default, so users choose from a handful of labeled groups instead of a wall of equal-weight icons. Same pattern for journal-entry line actions and the RBAC role-permission matrix.

**Checklist**

- [ ] Does any single view force a choice among more than ~7 equally-weighted options?
- [ ] Is there a clear default or a visually-promoted recommended option?
- [ ] Are advanced/rare options hidden behind progressive disclosure?
- [ ] Are options ordered by frequency or logic rather than alphabetically?
- [ ] Is there exactly one primary CTA per screen?

**Caveat & tensions.** Hick's counts equally-weighted options, so chunking (Miller's Law) beats raw count without removing capability — 3 menus of 5 read faster than 15 flat buttons though the total is identical. Tension: pushed too far, minimalism collapses distinct actions into ambiguous labels, relocating decision cost into search/navigation cost. Power users on a familiar dense screen (a spreadsheet-like ledger) may prefer everything visible; the law hurts novices and time-critical decisions most.

**Sources:** https://lawsofux.com/hicks-law/; W. E. Hick (1952), 'On the rate of gain of information'; R. Hyman (1953) — the Hick–Hyman Law

---

## 3. Fitts's Law

*Category: Perception/Motor & Interaction*

**Principle.** The time to move to and acquire a target is a function of the target's distance and size — formally ID = log₂(2A/W) and MT = a + b·ID — so bigger and closer targets are faster and more accurate to hit, while small or distant ones are slower and error-prone (speed–accuracy trade-off).

**Why it matters.** Tap/click speed and accuracy directly drive task completion and error rates. Undersized or awkwardly placed controls cause mis-taps, rage-clicks, and — on destructive actions — costly, sometimes irreversible mistakes.

**Do**

- Make primary touch targets at least ~44×44pt (iOS)/48×48dp (Android); give clickable web controls generous padding.
- Place the primary mobile action in the thumb zone (bottom third); on desktop keep the next action near the current cursor/focus.
- Add ~8px+ spacing between adjacent targets so a finger can't land on the wrong one.
- Exploit 'magic' edges and corners — screen edges act as infinite-width targets for pinned/sticky action bars and edge-anchored menus.
- Make the whole row or card clickable, not a tiny inner link; extend a label's hit area to its checkbox/toggle.
- Keep a control close to its trigger (a dropdown opens adjacent to its button) to minimize travel distance.

**Avoid**

- Tiny icon-only buttons with no padding, especially on mobile.
- Placing the primary CTA far from where the hand/attention rests (e.g. top-right on a tall mobile form).
- Crowding Confirm and Cancel side-by-side with no gap so a fast tap hits the wrong one.
- Making destructive actions (delete, void a posted journal) the same size as — or right next to, or easier to hit than — the safe action.

**SEO Boost application.** Project E mobile: pin the primary action (Save entry, Approve, Submit expense) as a full-width button in the bottom thumb zone instead of a small top-right link. In approval flows, make Approve the large primary target and separate Reject/Void with spacing plus confirmation, so a mis-tap can't post the wrong decision. In dense financial tables, make the entire row tappable to open detail rather than a 12px chevron. Keep bulk-action bars edge-pinned to use the infinite-edge target.

**Checklist**

- [ ] Are primary tap targets ≥44px and comfortably padded?
- [ ] Is the main action reachable in the mobile thumb zone?
- [ ] Is there enough spacing between adjacent and between Confirm/Cancel controls?
- [ ] Are destructive actions kept away from — and made distinct from — the easy safe path?
- [ ] Are full rows/cards clickable instead of tiny inner links?

**Caveat & tensions.** Fitts's push for large, close, easy targets pulls against information density: financial ledgers intentionally pack many small rows/cells to show more per screen (expert efficiency, Tesler) — resolve by enlarging the hit area (full-row targets, tap/hover affordances) without inflating visual row height. It also inverts for dangerous actions: destructive controls should be deliberately smaller/farther/guarded ('anti-Fitts'). And on touch, literal corners can be ergonomically awkward for thumbs — thumb-zone beats the mouse-era corner rule.

**Sources:** https://lawsofux.com/fittss-law/; P. M. Fitts (1954), 'The information capacity of the human motor system…', J. Experimental Psychology

---

## 4. Miller's Law

*Category: Cognition/Memory*

**Principle.** The average person can hold only about 7±2 items in immediate memory at once, so the practical lever is 'chunking' — grouping information into a smaller number of meaningful units so it fits within that limit.

**Why it matters.** Working memory is the interface bottleneck. When a screen forces users to juggle more discrete items than they can hold, they make errors, lose their place, and feel overwhelmed. Chunking lets you present dense information (long IDs, big tables, multi-step flows) in a form the brain can actually process and retain.

**Do**

- Chunk long strings: format account numbers, NPWP/tax IDs, invoice numbers and phone numbers into groups (e.g. '1234 5678 9012', not '123456789012').
- Group form fields into labeled sections ('Company info', 'Bank details', 'Tax') so a 20-field form reads as ~4 chunks, not 20.
- Split long flows into a stepper of 3-5 steps so the user holds only the current step in mind.
- Cap top-level navigation and menu groups at ~5-7 items; nest the rest under headings.
- Use whitespace, dividers and grouped columns to segment dense tables into scannable blocks.
- On dashboards, surface a handful of headline KPIs and push the rest into drill-downs.

**Avoid**

- Treating '7' as a hard cap on functionality — Miller himself warned against using it to justify stripping needed features.
- Rendering long identifiers as one unbroken blob (16-digit account numbers, run-on invoice codes).
- Giant flat dropdowns or navigation with 30+ ungrouped items.
- Wizard steps that each cram 15 fields — chunking the flow but not the content inside each step.

**SEO Boost application.** Project E journal-entry and invoice forms: group fields into labeled fieldsets ('Header', 'Line items', 'Tax & totals') and format long identifiers (invoice no., NPWP, bank account, chart-of-accounts codes) into readable groups. Break new-company and employee onboarding into a 4-5 step stepper instead of one wall of fields. On the accounting dashboard, lead with 4-6 headline figures (cash, revenue, AR, AP) and move the rest into drill-downs.

**Checklist**

- [ ] Are long numeric strings (IDs, account/tax numbers) visually grouped?
- [ ] Is any form with >7 fields broken into labeled sections?
- [ ] Does any menu or list force scanning of more than ~7 ungrouped items?
- [ ] Are multi-step flows chunked into a stepper of 3-5 steps?
- [ ] Did we chunk for comprehension WITHOUT deleting functionality users actually need?

**Caveat & tensions.** The famous '7±2' is widely mis-cited: Miller's real point was chunking, and later research (Cowan, 2001) puts the true working-memory limit closer to 4±1 chunks — so aim lower than 7, not for exactly 7. Pulls against Hick's Law: chunking adds grouping/hierarchy, meaning more navigation depth and clicks, and Hick's says added steps slow decisions — balance fewer-visible-items against more-clicks-to-reach. Never use Miller's Law as an excuse to hide needed functionality.

**Sources:** https://lawsofux.com/millers-law/; George A. Miller (1956), 'The Magical Number Seven, Plus or Minus Two,' Psychological Review 63(2):81-97.; Nelson Cowan (2001), 'The magical number 4 in short-term memory,' Behavioral and Brain Sciences 24(1):87-114.

---

## 5. Law of Proximity

*Category: Perception/Gestalt Grouping*

**Principle.** A Gestalt grouping principle: objects placed near each other are perceived as belonging to the same group — spatial nearness alone signals relatedness, independent of similarity in color or shape (Max Wertheimer, 'Laws of Organization in Perceptual Form,' 1923).

**Why it matters.** Proximity lets users parse a complex layout pre-attentively, before conscious reading. Grouping with whitespace is faster and cleaner than boxes or borders, cuts perceived clutter, and communicates structure — which label owns which field, which numbers belong to which section — without extra visual chrome. Decisive for dense financial tables and long forms.

**Do**

- Make the gap between groups clearly larger than the gap within a group — spend whitespace on separation, not on uniform margins.
- Glue each form field's label and its helper/error text to that field, keeping them closer to it than to any neighbor.
- In tables and reports, tighten row spacing within a section and separate sections with a larger gap or a subtotal band (group asset accounts, gap, then liabilities).
- Keep each unit tight: a KPI's label + value + delta, an icon + its label, a value + its currency, a card's title + metadata + action.
- Group a dialog's primary and secondary buttons together, set apart from unrelated content.
- Reach for whitespace to establish groups before adding borders, boxes, or background fills.

**Avoid**

- Uniform, equal spacing everywhere so nothing reads as a group and hierarchy flattens.
- Labels floating equidistant between two fields, leaving field ownership ambiguous — a classic form failure.
- 'Boxitis' — compensating for weak spacing with heavy borders and containers that add visual noise.
- Separating an action button from the content it acts on, or letting a metric's label and value drift apart.

**SEO Boost application.** In Project E's dense financial tables (Neraca, Laba Rugi, Buku Besar), use proximity to give structure without heavy gridlines: group accounts under their section header with tight row spacing, then insert a larger gap or subtotal band between sections. In forms (journal entries, invoices, employee profiles), keep each label glued to its field with error text directly beneath. On the dashboard, keep each KPI's label, value, and change as one tight cluster with generous space between cards. In approval flows, group request metadata (amount, requester, date) together and place Approve/Reject as an adjacent pair. On landing pages, bind each feature's icon + heading + description into one unit with clear separation between features.

**Checklist**

- [ ] Is the space between groups visibly larger than the space within each group?
- [ ] Does every form label sit closer to its own field than to any neighbor?
- [ ] In tables, are sections separated by spacing or subtotal breaks rather than color alone?
- [ ] Are we using whitespace to group before reaching for borders or boxes?
- [ ] Do a KPI's label, value, and change read as one cluster instead of three drifting elements?

**Caveat & tensions.** Proximity can be overridden by competing Gestalt cues: strong similarity (color/shape) or common region (a shared background or box) can regroup items even when spacing says otherwise — a stray background fill can fight your spacing. It also pulls against information density: very dense tables limit how much whitespace you can spend, so you may need common-region cues (zebra striping, subtotal bands) or Law of Similarity as a backup grouping signal. And too much whitespace fragments what should read as one group — proximity is about relative, not absolute, spacing.

**Sources:** https://lawsofux.com/law-of-proximity/; Max Wertheimer, 'Untersuchungen zur Lehre von der Gestalt' (1923); https://en.wikipedia.org/wiki/Principles_of_grouping

---

## 6. Von Restorff Effect (Isolation Effect)

*Category: Perception/Attention*

**Principle.** When several similar items are presented together, the one that differs from the rest — visually or conceptually — is the most likely to be noticed and remembered.

**Why it matters.** Attention and memory are drawn to contrast, not uniformity. In a UI this steers the eye to the single thing that matters most — a primary button, a recommended plan, a warning — so users act on it and recall it later.

**Do**

- Give the single primary action strong, unique styling (solid fill, brand color) while secondary actions stay ghost/outline/text.
- Mark the 'recommended' pricing tier with a badge, elevation, border or slight scale-up so it wins attention.
- Flag the one row or value that needs attention (overdue, negative balance, error) with color plus an icon or tag.
- Reserve one accent treatment for 'the important thing' per view and keep everything else neutral.
- Pair distinctiveness with a redundant cue (icon + label + color), never color alone.

**Avoid**

- Making everything bold, colored or badged — if every element shouts, none stands out and the effect collapses.
- Signaling importance with color only, which fails for color-blind users.
- Using motion/animation as the sole differentiator, hurting reduced-motion or motion-sensitive users.
- Styling two competing 'primary' buttons identically on the same screen.

**SEO Boost application.** In Project E approval flows, style the primary action ('Approve') as the single solid high-contrast button while 'Reject'/'Request changes' stay outline or text — so the recommended path is unmistakable. In dense financial tables, isolate exception rows (overdue AR, negative balances, failed reconciliations) with a colored tag plus icon, not just red text. On client landing pages, mark the recommended subscription tier with a 'Most popular' badge and an elevated card.

**Checklist**

- [ ] Is there exactly one clearly dominant primary action per view?
- [ ] Does the emphasized element differ on more than one channel (not color alone)?
- [ ] If I squint, does the intended focal point pop first?
- [ ] Are we NOT emphasizing so many things that emphasis is diluted?
- [ ] Does the distinctive treatment survive dark mode, color-blind vision and reduced-motion?

**Caveat & tensions.** The effect works only through scarcity of emphasis — it directly opposes 'if everything stands out, nothing does'; every added highlight taxes the ones already there. Distinctiveness draws attention but can mislead if the standout isn't genuinely the best choice (a dark-pattern risk when you highlight the most profitable option rather than the most suitable one). Accessibility: never let the distinction rest on color or motion alone.

**Sources:** https://lawsofux.com/von-restorff-effect/; Hedwig von Restorff (1933), 'Über die Wirkung von Bereichsbildungen im Spurenfeld,' Psychologische Forschung 18:299-342.

---

## 7. Serial Position Effect

*Category: Cognition/Memory*

**Principle.** In an ordered series, people remember the first items (primacy) and the last items (recency) better than those in the middle, so position in a list determines what gets recalled and acted on.

**Why it matters.** Placement is free emphasis. Whatever sits at the start and end of a list, menu or flow is what users most notice, remember and act on, while the middle is a low-attention dead zone. Ordering is a deliberate design decision, not a default.

**Do**

- Put the most important navigation/toolbar actions at the far left and far right (the edges), lower-priority ones in the middle.
- Lead lists with the most important item and end with a strong call to action or key takeaway.
- On mobile bottom nav, place the primary destinations at the two ends of the bar.
- Order onboarding or feature tours so the key message comes first and the CTA comes last.
- Put the 'recommended' or default option first in a set of choices.

**Avoid**

- Burying critical actions (submit, primary CTA, key filters) in the middle of a long row or list.
- Defaulting to alphabetical or arbitrary order when priority ordering would serve users better.
- Ending an important flow on a trivial or administrative step, wasting the high-recall recency slot.

**SEO Boost application.** In Project E module navigation and report toolbars, anchor the highest-value actions at the two ends — primary CTA ('New entry'/'Export') at the far right, dashboard/home at the far left — and keep rarely used utilities in the middle. In long approval or reconciliation checklists, order steps so the most consequential check is first and the final confirm/sign-off is last. On the mobile bottom tab bar, place the two most-used destinations at the outer positions.

**Checklist**

- [ ] Are top-priority actions at the start or end of their row/list, not the middle?
- [ ] Does each important list lead with its most important item?
- [ ] Do flows end on a meaningful step (confirmation/CTA) rather than filler?
- [ ] Is list order driven by priority rather than an accidental or alphabetical default?

**Caveat & tensions.** Primacy and recency are asymmetric: recency is fragile — it fades once attention shifts, a delay passes, or a new screen loads — while primacy, rehearsed into longer-term memory, is more durable; don't rely on the 'last item' advantage across a page transition. Pulls against Von Restorff: a strong visual standout in the middle can override positional weakness, so position and contrast are two levers to combine or trade off. Also pulls against strict alphabetical ordering when users scan for a known label rather than browse.

**Sources:** https://lawsofux.com/serial-position-effect/; Effect attributed to Hermann Ebbinghaus (1885), 'Über das Gedächtnis'.; https://www.interaction-design.org/literature/topics/serial-position-effect

---

## 8. Tesler's Law (Law of Conservation of Complexity)

*Category: System Design/Complexity*

**Principle.** Every system carries a certain amount of inherent, irreducible complexity that cannot be designed away — it can only be shifted: either the product/engineering absorbs it, or the user is forced to deal with it.

**Why it matters.** Whoever bears the complexity defines the experience. Pushing inherent complexity onto users (manual steps, arcane rules, error-prone inputs) trades a few hours of engineering for millions of wasted user-minutes and mistakes; absorbing it into the product is usually the higher-leverage choice.

**Do**

- Move inherent domain complexity into the system: auto-calculate, validate, and pre-fill rather than making users compute or remember rules.
- Provide smart defaults for the common case while leaving an explicit expert path for the exceptions.
- Design for how people actually behave — partial data, mistakes, interruptions — not an idealized rational user.
- Offer inline, just-in-time guidance (contextual tooltips, examples, help at the point of need), available regardless of the path taken.
- Absorb integration and edge-case handling in the backend (formats, rounding, reconciliation) instead of surfacing them as user chores.

**Avoid**

- Exposing raw internal complexity (technical codes, fields the system could infer) as the user's problem.
- 'Simplifying' by deleting necessary capability — that just relocates complexity into workarounds and support tickets.
- Assuming users will read the manual or always follow the happy path.
- Over-automating to the point users lose the visibility and control they need to trust and correct the system.

**SEO Boost application.** Project E double-entry accounting is the textbook case: the irreducible complexity of debits=credits, PPN 11% tax, account mapping, and period balancing should be absorbed by the app — auto-balance the contra entry, compute and split tax, suggest the account from the transaction type, and block an unbalanced post with a clear reason — so an Indonesian SME owner with no accounting background can record a sale correctly. Expose an 'advanced' manual-journal mode for the bookkeeper who needs full control. The complexity doesn't vanish; the product carries it instead of the user.

**Checklist**

- [ ] For each user step, ask: could the system do this instead of the person?
- [ ] Are we shifting inherent complexity onto users just to save engineering time?
- [ ] Do smart defaults cover the common case while an expert path remains?
- [ ] Is contextual help present exactly where the hard decisions happen?
- [ ] Did our 'simplification' actually remove complexity, or just hide/relocate it into workarounds?

**Caveat & tensions.** You can't delete inherent complexity, only relocate it — 'make it simpler for users' usually means 'make the engineering harder.' Pulls against Hick's/minimalism: absorbing complexity can add capability the user still occasionally needs to see, so hide it via progressive disclosure rather than pretending it's gone. Tognazzini's corollary: simplify a tool and users attempt harder tasks, regenerating complexity at a new level. And over-absorption (too much magic automation) strips the transparency and control that expert users and auditors require — in accounting, hiding the journal mechanics entirely breaks trust and auditability.

**Sources:** https://lawsofux.com/teslers-law/; Larry Tesler (Xerox PARC, mid-1980s); corollary attributed to Bruce Tognazzini

---

## 9. Doherty Threshold

*Category: Performance/Responsiveness*

**Principle.** Productivity soars when a computer and its user interact at a pace under ~400ms, fast enough that neither waits on the other; keeping feedback within that window sustains attention and flow (Doherty & Thadani, IBM Systems Journal, 1982).

**Why it matters.** Response latency above the threshold breaks the user's train of thought, drops throughput, and makes software feel sluggish. Staying under it — or convincingly appearing to — keeps users engaged and can make an app feel effortless.

**Do**

- Acknowledge every user action within ~400ms — even if the result isn't ready, show immediate feedback (button state change, spinner-to-skeleton).
- Use optimistic UI: reflect the change instantly and reconcile with the server in the background, rolling back visibly on failure.
- Show skeleton screens/content placeholders instead of blank pages or a blocking spinner while data loads.
- Win on perceived performance: instant local echo, cached/precomputed views, progressive or streamed loading of table rows.
- For unavoidably long jobs, show a determinate progress bar with meaningful status rather than a frozen screen.
- Use a deliberate, clearly-communicated short delay only where it builds trust (e.g. 'verifying payment…') — but keep the initial acknowledgement instant.

**Avoid**

- Blocking the whole UI with a full-screen spinner while a save or report runs, giving no sub-400ms feedback.
- Waiting for a full server round-trip before showing any state change on a simple edit.
- Indeterminate spinners that never convey progress on long operations.
- Re-fetching and re-rendering entire dense tables on every keystroke/filter without debounce or caching.

**SEO Boost application.** Project E forms and tables: on Save/Approve, apply optimistic UI — immediately show the row as saved/approved and reconcile with the API in the background, rolling back with a clear toast on failure — so the interaction feels sub-400ms even when the server is slower. Use skeleton rows for dashboard KPIs and dense financial reports while data streams in, rather than a blocking spinner. Debounce + SWR-cache ledger/lookup queries so filtering a report doesn't refetch on every keystroke. Reserve a deliberate 'processing…' state only for genuinely irreversible postings such as closing a period.

**Checklist**

- [ ] Does every click get visible feedback within ~400ms?
- [ ] Are saves/approvals optimistic (instant UI) with background reconciliation and rollback?
- [ ] Do slow views show skeletons instead of blank screens or blocking spinners?
- [ ] Do long operations show determinate progress with real status?
- [ ] Are dense tables and filters debounced and cached to avoid per-keystroke lag?

**Caveat & tensions.** 400ms is the target for feedback/perceived responsiveness, not a promise that every backend job finishes that fast — for long work you win with skeletons, optimistic UI, and progress, not by blocking. Tension: optimistic UI on financial writes must reconcile carefully and roll back visibly, or you'll show a 'saved' state that later fails — wrongly implying a posted transaction succeeded is dangerous in accounting. And faster isn't always better: for high-stakes/irreversible actions (period close, bulk void) a brief deliberate pause plus confirmation adds trust and prevents errors.

**Sources:** https://lawsofux.com/doherty-threshold/; W. J. Doherty & A. J. Thadani (1982), 'The Economic Value of Rapid Response Time', IBM Systems Journal

---

## 10. Peak-End Rule

*Category: Cognition/Memory*

**Principle.** People judge and remember an experience largely by how it felt at its most intense moment (the 'peak', good or bad) and at its end — not by the sum or average of every moment — and duration barely factors in ('duration neglect').

**Why it matters.** Satisfaction, willingness to return and word-of-mouth are driven by memory, and memory is dominated by peaks and endings. So you get outsized return by nailing a few high moments and finishing strong — and outsized damage from a single bad peak or a sour ending, no matter how smooth the rest was.

**Do**

- Engineer a positive peak at the moment of greatest value — e.g. a clear, celebratory confirmation the instant a big task completes.
- Finish flows on a high note: an explicit success state, a helpful next step, a thank-you — not an abrupt dump back to a blank grid.
- Soften negative peaks: turn errors into calm, well-worded, recoverable moments and never leave a hard failure as the last thing on screen.
- Add small delight at the end of effortful tasks (payroll run complete, month-end close done, invoice sent).
- Because negative moments are remembered more vividly, prioritize eliminating the single worst moment over shaving many minor ones.

**Avoid**

- Ending a successful flow with friction — a survey wall, an upsell interstitial, or a dead-end blank page.
- Optimizing average speed everywhere while ignoring one catastrophic failure moment that will define the memory.
- Letting the last screen a user sees be an unhandled error or a spinner that never resolves.
- Padding a flow to feel 'thorough' — duration is neglected, so users won't credit you for it, only for the peak and the end.

**SEO Boost application.** In Project E, make task completions land well: after a month-end close, payroll run or successful reconciliation, show a satisfying success state with a summary ('12 entries posted, books balanced') and an obvious next action rather than silently returning to the grid. Design the worst moments — a rejected approval, a failed import, a validation error deep in a long form — to be the softest: preserve entered data, explain plainly, offer one-click recovery. On client landing pages and mobile onboarding, end signup on a warm 'you're all set' moment, not an immediate upsell.

**Checklist**

- [ ] Does every important flow have a deliberately designed ending (success state + next step)?
- [ ] Have we identified and softened the single worst moment (the negative peak)?
- [ ] Is the last thing the user sees positive, or at minimum calm and recoverable?
- [ ] Are error states worded and recoverable rather than dead-ends?
- [ ] Are we resisting the urge to judge quality by total effort/duration instead of peak + end?

**Caveat & tensions.** Peak-End is descriptive of how memory works, not a license to manipulate: bolting a good ending onto a fundamentally bad experience is a dark pattern that erodes trust once noticed (see the ethics debate over deliberately prolonging medical procedures for a better ending). It doesn't excuse a poor middle forever — repeated functional failures still accumulate across sessions. Pulls against Doherty/efficiency: duration neglect implies raw speed matters less than the peak and ending, but only up to a point, since a reliably fast flow is what prevents negative peaks in the first place. Fix the worst moment genuinely before cosmetically sweetening the end.

**Sources:** https://lawsofux.com/peak-end-rule/; Kahneman, Fredrickson, Schreiber & Redelmeier (1993), 'When More Pain Is Preferred to Less: Adding a Better End,' Psychological Science 4(6):401-405.; Redelmeier & Kahneman (1996), 'Patients' memories of painful medical treatments,' Pain 66(1):3-8.

---

## Cross-cutting tensions

Where two laws pull against each other, and how to resolve:

- Hick vs Miller (count vs chunking): Hick says fewer options decide faster; Miller says chunk rather than delete. RESOLVE — group into ~5-7 labeled clusters: this lowers the *perceived* option count (satisfies Hick) without removing capability (satisfies Miller). Prefer grouping/progressive disclosure over deletion.
- Fitts vs Tesler/density: Fitts wants large, close targets; financial ledgers pack many small dense rows for expert efficiency (Tesler). RESOLVE — enlarge the hit area (full-row/full-cell tap targets, generous hover/tap affordances) without inflating visual row height; keep visual density, expand invisible touch area.
- Jakob vs Von Restorff (familiarity vs distinctiveness): Jakob says match conventions; Von Restorff says make the key element break the pattern; both also fight the urge to differentiate the brand. RESOLVE — keep structure/layout conventional and spend your one distinctiveness budget only on the single focal element (primary CTA, recommended tier). Deviate from convention only where the payoff is clear and signposted.
- Von Restorff vs Serial Position (contrast vs position): a strong visual standout in the middle can beat an item's weak middle position, and vice-versa. RESOLVE — treat position and contrast as two combinable levers: put priority items at the edges/first-last AND reserve the single accent; only deliberately use contrast to rescue a mid-list item, never by accident.
- Doherty/Peak-End (duration neglect) vs real speed: duration neglect implies raw speed matters less than the peak and ending — but a slow flow itself creates the negative peaks. RESOLVE — still optimize latency, because sluggishness manufactures the very worst moments; genuinely fix the worst moment before cosmetically sweetening the end.
- Doherty (optimistic UI) vs financial safety: instant 'saved' feedback vs a write that may still fail on the server. RESOLVE — optimistic UI on financial writes must reconcile in the background and roll back *visibly* on failure; for irreversible postings (period close, bulk void) drop optimism and use a deliberate confirm beat instead.
- Proximity vs information density: whitespace grouping vs packed tables that can't spare the whitespace. RESOLVE — when the whitespace budget is tight, fall back to common-region cues (subtotal bands, zebra striping) and Law of Similarity as backup grouping signals instead of gaps alone.
- Tesler over-absorption vs transparency/auditability: absorbing all complexity (auto-magic) can hide mechanics that expert users and auditors must see. RESOLVE — absorb the common-case complexity but always keep an expert/manual path and a visible audit trail; in accounting, never hide the journal mechanics entirely.
- Hick/minimalism vs discoverability: hiding options behind vague labels ('More', 'Options') converts decision time into hunting time. RESOLVE — use progressive disclosure with *clear, specific* labels and predictable grouping, not opaque catch-alls.

## SEO Boost surface map

Which laws dominate on each SEO Boost surface:

- Dense financial table (Neraca / Laba Rugi / Buku Besar): DOMINANT — Proximity (group accounts under section headers, subtotal-band separation) + Von Restorff (isolate exception rows: overdue AR, negative balances, failed recon — tag+icon, not red text alone) + Miller (chunk long IDs/account codes). SUPPORTING — Jakob (debit-left/credit-right, negatives in red/parens, standard report names) + Fitts (full-row tap target, not a 12px chevron). CONSTRAINT — density caps Fitts and Proximity; lean on common-region cues (zebra/subtotal bands) rather than large gaps or tall rows.
- Approval flow: DOMINANT — Von Restorff (single solid high-contrast 'Approve'; Reject/Request-changes as outline/text) + Fitts (Approve = large primary target; Reject/Void separated with spacing + confirmation so a mis-tap can't post the wrong decision). SUPPORTING — Serial Position (most consequential check first, final sign-off last) + Jakob (inbox-like list + status badge) + Peak-End (soft, recoverable rejection; clear success state) + Proximity (group request metadata: amount, requester, date).
- Onboarding (new company / employee / signup): DOMINANT — Hick (one decision per step) + Miller (4-5 step stepper; chunk fields into labeled fieldsets). SUPPORTING — Tesler (smart defaults, pre-fill, auto-validate so the user computes/remembers less) + Doherty (instant per-step feedback) + Peak-End (end on a warm 'you're all set' moment, never an immediate upsell) + Serial Position (key message first, CTA last).
- Pricing page: DOMINANT — Von Restorff (recommended tier gets a 'Most popular' badge + elevation/scale) + Serial Position (place the recommended/default tier first or at an end). SUPPORTING — Jakob (familiar pricing-card grid) + Proximity (each plan's name + price + feature list + CTA read as one tight cluster). ETHICS CONSTRAINT — highlight the most *suitable* tier, not merely the most profitable (Von Restorff dark-pattern risk).
- Mobile nav: DOMINANT — Jakob (bottom tab bar, top-right account, hamburger where expected) + Fitts (thumb zone, ≥44×44pt targets, edge-anchored bars as infinite-width targets). SUPPORTING — Serial Position (two most-used destinations at the outer ends of the bar) + Miller (cap tabs at ~5) + Hick (few top-level items, nest the rest).
- Save action: DOMINANT — Doherty (optimistic UI: reflect saved state <400ms, reconcile in background, roll back visibly on failure) + Fitts (full-width primary button in the bottom thumb zone, not a small top-right link). SUPPORTING — Von Restorff (single solid Save; secondary actions demoted) + Tesler (auto-validate / auto-balance before allowing the post; block with a clear reason) + Peak-End (explicit success state + next action). SAFETY — for irreversible postings, replace optimism with a deliberate confirm beat.

## Priority model

Apply the ten in three layers, and don't let a later layer override an earlier one. LAYER 1 — STRUCTURE (do this first, and get it internally consistent before any styling): Jakob (match the conventions and mental models your Indonesian SME users already hold), Hick (limit and group choices), Fitts (make targets reachable and appropriately sized), Tesler (absorb inherent complexity into the system, keep an expert path), Miller (chunk information), Proximity (group with whitespace). These define the skeleton; if they disagree, resolve via the tensions list — usually chunk/group rather than delete. LAYER 2 — EMPHASIS (layer on top of a settled structure, sparingly): Von Restorff (exactly one focal accent per view) and Serial Position (put priority items at the edges / first-and-last). Emphasis only works while it stays scarce, so add it after the structure is stable, never as a fix for a confusing layout. LAYER 3 — FEEL (tune last): Doherty (sub-400ms feedback, optimistic UI, skeletons) and Peak-End (finish strong, soften the single worst moment). PRECEDENCE RULE when two pull against each other: safety & auditability > convention (Jakob) > structure > emphasis > feel. Concretely: never let an optimistic 'saved' state (feel) mask a financial write that could fail, never let auto-magic (Tesler) hide the audit trail, and never let a sweetened ending (Peak-End) paper over an unfixed worst moment. Start every screen from Jakob + Hick + Fitts for the bones, layer Von Restorff + Serial Position for focus, then Doherty + Peak-End for polish.

## Accuracy notes

Fact-check results from authoring this reference (verified against primary sources):

- VERIFIED, no correction needed — Hick–Hyman formula RT = a + b·log₂(n+1) is the correct Shannon-form; kept as written.
- VERIFIED, no correction needed — Fitts's Law ID = log₂(2A/W) and MT = a + b·ID are the standard (Shannon/MacKenzie) formulation of Fitts 1954; kept as written.
- VERIFIED — Doherty Threshold ~400ms, Doherty & Thadani, IBM Systems Journal 1982; correct.
- VERIFIED — Von Restorff 1933, Psychologische Forschung vol. 18:299-342; correct. Peak-End sources (Kahneman 1993; Redelmeier & Kahneman 1996) correct.
- CLARIFIED (framing, not error) — Miller's Law: the '7±2' is the span of *immediate/short-term* memory from Miller 1956, and Miller himself doubted it was a hard capacity limit. Modern estimate is ~4±1 chunks (Cowan 2001). Principle already frames chunking as the real lever and the caveat states the 4±1 correction; left principle intact but reinforced 'about 7±2' hedging. Guidance = aim for ~4-5, not exactly 7.
- CLARIFIED — Serial Position attributed to Ebbinghaus (1885); this is the conventional attribution for primacy/recency and is acceptable, though the full primacy+recency curve was formalized by later researchers. No change.
- CLARIFIED — Law of Proximity cited to Wertheimer 1923 ('Untersuchungen zur Lehre von der Gestalt II', Psychologische Forschung); correct Gestalt-grouping source. No change.
- SET COMPLETE — all 10 laws present and renumbered into the required carousel order (1 Jakob, 2 Hick, 3 Fitts, 4 Miller, 5 Proximity, 6 Von Restorff, 7 Serial Position, 8 Tesler, 9 Doherty, 10 Peak-End). Law 5 (Proximity) do/avoid depth checked — already at parity (6 do / 4 avoid) with the strongest entries; no augmentation required.
