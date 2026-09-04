# Perspective Prompts — the 4-phase STORM research engine

The executable detail behind `seoboost-deep-research`. Run the 4 phases in order. **Every
phase that makes a factual claim must be grounded by a real web search** (see SKILL.md
"Grounding rules"); a claim with no source is tagged `[unverified]`, never passed as fact.

Adapted from Stanford's STORM methodology (OVAL lab, NAACL 2024 — open/academic): the
insight that multi-perspective questioning catches blind spots single-prompt research
never finds. Rewritten as SEO Boost-original + mandatory grounding.

Inputs: `{topic}` (what to research) · `{role}` (whose decision the actionable insight
serves) · `{depth}` (quick / standard / deep — how many searches per phase).

---

## The 5 expert lenses (used in Phase 1)

| Lens | Stance | Searches for |
|---|---|---|
| **Practitioner** | Works with `{topic}` daily | Operational realities academics miss; what actually breaks in practice |
| **Academic** | Studied it for years | What peer-reviewed evidence actually says; where it contradicts popular belief |
| **Skeptic** | Thinks mainstream is wrong | The strongest counter-argument; evidence proponents conveniently ignore |
| **Economist** | Follows the money | Who profits from the current narrative; what incentives shape the research |
| **Historian** | Has seen the pattern before | Historical parallels; how similar situations actually played out |

---

## Phase 1 — Multi-Perspective Scan

> Research `{topic}` from 5 expert lenses. For EACH lens, first **web-search for real
> evidence** specific to that lens's angle (depth = `{depth}`), then give:
> - **Core position** (2 sentences).
> - **Strongest evidence** supporting their view — with the SOURCE (url/title). If none
>   found, say so and tag the position `[unverified]`.
> - **The one thing** they'd tell me that no other lens would.
>
> Keep the 5 lenses genuinely distinct — do not let them collapse into the same answer.

## Phase 2 — Contradiction Map

> Using the 5 grounded perspectives above, map the tensions:
> 1. Where do 2+ lenses **directly contradict**? List each conflict with the specific
>    clashing claims.
> 2. Which lens has the **strongest** evidence? The **weakest**? Why (cite the sources)?
> 3. The **one question** that, if answered, resolves the biggest contradiction.
> 4. What does **EVERY** lens agree on? (Likely true — even opponents confirm it.)
> 5. What did **NONE** of the lenses address? (The field's blind spot — often the most
>    valuable finding.)

## Phase 3 — Synthesis

> Synthesize the 5 perspectives + contradiction map into a research briefing:
> 1. **CEO one-paragraph** — brief a CEO who has 60 seconds and needs nuance, not just
>    the headline.
> 2. **5 key findings** — ranked by reliability. For each: which lenses support it,
>    which challenge it, and its source(s).
> 3. **Hidden connection** — one non-obvious link between findings that only shows up
>    when you look at all 5 lenses together.
> 4. **Actionable insight** — given the evidence, what should someone in `{role}`
>    actually DO differently? Be specific.
> 5. **Frontier question** — the one question that, if answered, would change how we
>    understand `{topic}`.

## Phase 4 — Peer Review (review your own briefing)

> 1. **Confidence scores** — rate each of the 5 key findings 1–10 for reliability;
>    explain each score (grounded sources raise it, `[unverified]` lowers it).
> 2. **Weakest link** — which claim are you least confident in? What specific evidence
>    would verify it? **Run one more web search to try to verify it now.**
> 3. **Bias check** — which lens is over-represented in the synthesis? Did one voice
>    dominate?
> 4. **Missing perspective** — is there a 6th angle that would change the conclusions?
> 5. **Overall grade** — if a Stanford professor reviewed this briefing, what grade
>    (A–F) would they give, and what would they tell me to fix?

---

## Final output

Deliver the **Phase 3 synthesis** as the briefing, annotated with **Phase 4 reliability
scores** inline, and a short sources list. Every key finding shows its confidence score
and source (or `[unverified]`). Honest over impressive — SEO Boost reporting convention.

## Depth presets
- **quick** — 1 search/lens, skip Phase 4 re-verification. ~fast scan.
- **standard** (default) — 1–2 searches/lens + Phase 4 verify weakest link.
- **deep** — 2–3 searches/lens, verify every key finding in Phase 4.
