---
name: seoboost-deep-research
description: Use for deep, multi-perspective, fact-checked research on any business/strategy topic — market entry, competitor analysis, company research (before a deal/interview), investment bull/bear case, due diligence, or "research X properly before I write/decide". Runs Stanford STORM's 4-phase method (5 expert lenses → contradiction map → synthesis → self peer-review), grounded in real web search with sourced findings + confidence scores. Triggers — "riset mendalam soal X", "deep research X", "analisa X dari berbagai sudut", "research this company/market/investment", "bull and bear case for X". For a TECHNOLOGY adoption verdict use seoboost-tech-radar instead.
metadata:
  type: reference
---

# SEO Boost Deep Research — multi-perspective, grounded, peer-reviewed

Runs a deep research pass on `{topic}` using Stanford's **STORM** method: instead of one
mainstream answer, simulate 5 distinct expert lenses, map where they fight, synthesize,
then peer-review your own briefing — all **grounded in real web search**. The output is a
sourced briefing with confidence scores, not a confident guess.

**Core principle:** Five angles beat one. Single-prompt research gives you the surface;
multi-perspective + grounding catches the blind spots it never finds. Every factual claim
carries a source or is tagged `[unverified]` — honest over impressive (SEO Boost convention).

## Origin & license

Method: Stanford OVAL's STORM (NAACL 2024 — open/academic; the multi-perspective-questioning
idea is methodology, not a paid product). The 4 prompts are a practical adaptation, rewritten
as SEO Boost-original with mandatory grounding added. Nothing here copies a paid course/product.

The **deliberation modes + tie-break rigor** (see that section) adapt open techniques from
`0xNyk/council-of-high-intelligence` (MIT) and its cited papers — weighted consensus, method
diversity (DMAD, arXiv:2410.12853), pre-locked domain-weight seat. Ideas/methodology only,
re-expressed for STORM; SEO Boost's mandatory grounding (below) is the part those councils lack.

## When to use / not use

- **Use:** market/competitor/company research, investment bull-bear, due diligence,
  "research properly before I write or decide", any topic where one take isn't enough.
- **Don't use → route elsewhere:**
  - Technology **adopt/trial/assess/hold verdict** → `seoboost-tech-radar` (its council + radar
    format is the house standard for that). This skill may *feed* a tech-radar entry, but
    the verdict lives there.
  - Scheduled recurring briefing → `seoboost-telegram-morning-insight-briefing`.

## Inputs

- `{topic}` — what to research (required).
- `{role}` — whose decision the actionable insight serves (e.g. "founder evaluating market
  entry", "investor", "PM"). Drives Phase 3's actionable insight.
- `{depth}` — `quick` | `standard` (default) | `deep` — how many searches per lens.
- `{mode}` — `full` (default, all 5 lenses) | `triad` (3 most on-topic lenses) | `duo`
  (2 opposing lenses only) — see *Deliberation modes & rigor*. Match effort to the decision.

If `{role}` or `{depth}` is missing, ask once (or default `standard` + infer role from context).

## Workflow (agent runs all 4 phases in order)

Read `reference/perspective-prompts.md` for the exact phase prompts + 5-lens spec. Run:

1. **Multi-Perspective Scan** — for each of 5 lenses (Practitioner, Academic, Skeptic,
   Economist, Historian): **web-search for real evidence first**, then position + strongest
   sourced evidence + the one thing only that lens knows. Keep lenses genuinely distinct.
2. **Contradiction Map** — where lenses clash, strongest/weakest evidence, the resolving
   question, what ALL agree on (likely true), and the blind spot NO lens addressed.
3. **Synthesis** — CEO one-paragraph · 5 key findings ranked by reliability (with supporting/
   challenging lenses + sources) · hidden connection · actionable insight for `{role}` ·
   frontier question.
4. **Peer Review** — confidence scores 1–10 per finding · weakest link (+ one more search to
   verify it) · bias check · missing 6th angle · "Stanford professor" overall grade.

**Final output:** the Phase 3 briefing, annotated inline with Phase 4 confidence scores + a
short sources list. Each key finding shows its score and source (or `[unverified]`).

## Deliberation modes & rigor (scale the panel; keep the tally honest)

Match the shape of the deliberation to the decision — and never let the deliberation
manufacture the answer someone already wanted.

**Modes** (set via `{mode}`; grounding rules still apply in every mode):
- **full** — all 5 lenses, full contradiction map + synthesis + peer-review. Default; use
  when stakes are high and competing frames need contact.
- **triad** — the 3 lenses most on-topic for `{topic}`. Breadth without the full round when
  cross-examination of the other two wouldn't change the outcome.
- **duo** — 2 opposing lenses only (e.g. Skeptic vs Practitioner), a dialectic. Use when ONE
  tension defines the decision. Output frames the two positions; the user decides.

**Method diversity (DMAD, arXiv:2410.12853).** The 5 lenses must differ in *reasoning
method*, not just persona — evidence-from-practice (Practitioner), literature/theory
(Academic), falsification (Skeptic), incentives/cost (Economist), precedent/base-rate
(Historian). If you swap or drop a lens (triad/duo), don't end up with two lenses that
reason the same way — that collapses the panel into one voice with two hats.

**Honest tally — a hesitant panel escalates, it does not force a verdict.** When lenses
disagree on a recommendation:
- Weight each lens by its **evidence confidence** (high 1.0 / med 0.75 / low 0.5), NOT by
  how loud it is. Optionally give the single most on-topic lens a 1.5× weight — but **lock
  that choice before you see the positions**, never after (picking the heavyweight to fit
  the votes is just bias with a number on it).
- Compute the consensus denominator from **base** weights (before the confidence discount),
  so a low-confidence panel can't manufacture agreement by shrinking the denominator. If no
  option clears ~⅔, **escalate to the user with the live disagreement** — do not round a
  split panel up to a fake verdict. (Direct echo of the SEO Boost Iron Law: no confident claim the
  evidence doesn't support.)
- A lens that abstains still counts toward the bar (abstention raises the threshold, it is
  not a free pass). A hard blocker from any lens goes in the output as a named dissent even
  if outvoted.

**Anti-capture guardrail.** Do NOT convene the panel to justify a conclusion already
chosen. If the `{topic}` is phrased to seek support ("confirm we should do X"), reframe it
neutrally first, or say why the panel isn't the right tool (a factual lookup or a cheap
reversible experiment beats a council).

## Grounding rules (non-negotiable — this is what makes it STORM, not role-play)

- Every lens's evidence claim → **must come from a web search**, with the source named.
  No search result for a claim → tag it `[unverified]`; do not present it as fact.
- Use the available tools: `web-search-prime`, `context-mode` `ctx_fetch_and_index`
  (keeps raw source bytes in the sandbox — use this when pulling many sources so the
  context window doesn't flood), or the `deep-research` plugin for heavy fan-out.
- Phase 4 must actually re-search the weakest claim, not just re-rate it.
- A briefing where most findings are `[unverified]` must SAY SO in the grade — don't
  inflate confidence the sources don't support.

## Boundaries

- TIDAK menggantikan `seoboost-tech-radar` (verdict adopsi teknologi diarahkan ke sana).
- TIDAK meloloskan klaim tanpa sumber sebagai fakta (tag `[unverified]`).
- TIDAK melewati web search di mode `standard`/`deep` (itu inti metodenya) — berlaku di SEMUA
  deliberation mode (full/triad/duo), termasuk grounding.
- Lima lens harus benar-benar beda — jangan kolaps jadi 1 jawaban berulang (jaga method
  diversity walau di triad/duo).
- TIDAK bulatkan panel yang terbelah jadi verdict palsu — kalau tak ada konsensus ~⅔,
  sampaikan ketidaksepakatannya ke user (bukan paksa jawaban).
- TIDAK mengumpulkan panel hanya untuk membenarkan jawaban yang sudah dipilih (anti-capture).

## Related

- `seoboost-tech-radar` — technology adoption verdicts (council + radar). Feed it, don't replace.
- `deep-research` (plugin) — heavy multi-source fan-out harness; usable as a grounding engine.
- `seoboost-telegram-morning-insight-briefing` — scheduled briefings (this is on-demand depth).
- `context-mode` — sandbox the source bytes (`ctx_fetch_and_index`) to avoid context flood.
- `0xNyk/council-of-high-intelligence` (MIT) — the standalone multi-provider council this
  skill's deliberation modes + tie-break rigor are adapted from. Install it directly if you
  want a full 18-member cross-model council with `/council`; this skill is the *grounded,
  research-oriented* cousin (STORM lenses + mandatory sourcing).
