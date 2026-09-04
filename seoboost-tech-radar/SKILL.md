---
name: seoboost-tech-radar
description: Use when evaluating whether SEO Boost should adopt a new technology/tool/library/AI-product (and recording the verdict) — "evaluasi teknologi X", "haruskah kita adopt/pakai X", "masuk tech radar", "adopt/trial/assess/hold X", "review tool baru", or a forwarded tech briefing asking for an adoption call. The SEO Boost house standard — a verdict is earned by an independent multi-agent council + live fact-check, NOT one model's opinion, then captured as a versioned evaluation doc + a Tech Radar entry + a decision-log line.
metadata:
  type: reference
---

# SEO Boost Tech Radar — Technology Evaluation Standard

How SEO Boost decides ADOPT / TRIAL / ASSESS / HOLD on a new technology, and records it. **The core is the METHOD (how the verdict is earned), not the document template.** A single model's "verdict" — however confident — is not a SEO Boost verdict.

## Iron rule: a verdict is earned by a council + fact-check, never by one model

**Do NOT let one agent (or one model) decide adoption.** This is the whole point of the skill.

Why this is non-negotiable (real incident, agent-stack D-056, 28 Jun 2026): a single cheap model (`xiaomi/mimo-v2.5`) wrote a Claude-Tag evaluation that *looked* authoritative and landed the right conclusion (DEFER) — but **two of its core facts were wrong** ("65% auto-approved" was misframed; "only 1 article" was false) and it **fabricated** that "Claude Code + a council" produced it. A real multi-agent council with live web fact-check caught all of it. **A confident verdict that is wrong on the facts you'll quote to a client or to Anthropic is worse than no verdict.**

So every adoption call MUST:
1. **Run a real council** — multiple independent agents, each a distinct lens (fact-check, fit, risk/compliance, strategy). Use the `Workflow` tool (multi-agent), or `superpowers:dispatching-parallel-agents`. NOT one agent answering four questions.
2. **Fact-check live** — one council member verifies claims against first-party sources (vendor docs/changelog) + reputable press via web search. Do NOT trust the forwarded briefing or training memory.
3. **A chair synthesizes** into one verdict, carrying forward every UNVERIFIED flag.

## Honest-reporting rules (the footguns this skill prevents)

- **Verify the artifact exists before evaluating it.** Garbled product names/dates are common in briefings. No first-party source → verdict is "UNVERIFIED — do not budget against this yet", not invented capabilities.
- **Separate vendor metrics from evidence.** A vendor-internal stat (e.g. "65% of *our* code is authored by X") describes the vendor's mature codebase, not SEO Boost's fit. Flag as marketing context. **Quote the number only in the form the vendor actually stated it** — never re-cast "authored" into "auto-approved".
- **Flag UNVERIFIED explicitly** in the doc and the decision log. Never launder uncertainty into confidence. If you couldn't verify residency/pricing/ToS, say so in those words.
- **Fit, not novelty, decides.** Weigh against SEO Boost's actual context: WhatsApp-centric ops, self-hosted + Indonesian UU PDP data-residency edge, existing stack (Hermes + Mission Control + Claude Code), client confidentiality, per-seat cost already paid, Iron Laws.
- **Data-residency reality for SEO Boost clients:** "cloud = illegal" is false (UU PDP permits cross-border via adequacy/SCC/consent), BUT a SaaS that routes client/PII data outside Indonesia (nearest Anthropic region = Singapore, not Indonesia) **contradicts SEO Boost's self-hosted selling story** and adds an unmanaged processor chain. Hard wall: no client/PII data through an unverified-residency tool until residency + DPA are confirmed in writing.

## Verdict scale

| Ring | Meaning | Action |
|---|---|---|
| **ADOPT** | Production-default, recommended | use it |
| **TRIAL** | Worth a real, bounded pilot | limited project |
| **ASSESS** | Watch/explore, not committed | monitor + tripwires |
| **HOLD** | Avoid / don't newly adopt | — |

Every verdict needs **re-evaluation triggers** (2-3 concrete signals, any one flips the call) — wire as tripwires (e.g. a Hermes cron on the vendor changelog).

## Workflow

1. **Gate the artifact** — confirm it exists (first-party source). If not → stop at UNVERIFIED.
2. **Run the council** (`Workflow`): ≥3 lenses + 1 live fact-check + a chair synthesis. Prompt each lens with SEO Boost context (stack, WhatsApp, UU PDP, partner aspiration). Chair carries UNVERIFIED flags forward.
3. **Write the evaluation doc** — versioned SEO Boost (`seoboost-versioned-output`): `<Tech>-Evaluation_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.md`. Sections: Overview · Comparison vs SEO Boost stack · Fit assessment · Risks (incl. data-residency + ToS, with UNVERIFIED flags) · Verdict + ring · Re-eval triggers · Sources (URLs).
4. **Update the Tech Radar** — add/move the entry in `~/Documents/WORKSPACE/SEOBoost/Knowledge/Tech-Radar-SEOBoost_v*.md` (rings ADOPT/TRIAL/ASSESS/HOLD × quadrants Tools/Platforms/Techniques/Languages&Frameworks). Bump the radar version on substantive change; never overwrite the prior version (audit trail). Link the entry to the eval doc + decision log.
5. **Log the decision** — `D-XXX` in the relevant project's `agent-documentation/03-DECISIONS-LOG.md` (format `seoboost-decision-tracking`). For a cross-product call, log in the most-affected product (e.g. Claude Tag → Project E D-002).

## Output anatomy (templates)

**Tech Radar entry (one table row):**
`| <Tech> (<vendor>) | <Quadrant> | <Ring> | <terse verdict + the 1-2 deciding facts + UNVERIFIED flags> | <links: eval doc · decision log · council raw> |`

**Decision-log statement (paste-ready, 3-5 sentences):** verdict + ring; who decided (council N lenses + chair, fact-checked); the 2-3 deciding reasons; any corrected misframing; the hard wall (if any); re-eval triggers.

## Common mistakes

- **One model writes the verdict.** Fails the Iron rule. Run a real council.
- **Quoting a vendor stat in a stronger form than stated** ("authored" → "auto-approved"). Quote it exactly, flag it as vendor-internal.
- **Skipping fact-check because the briefing "looks detailed".** Briefings garble facts; the detail is not verification.
- **Overwriting the Tech Radar / eval doc** instead of versioning. SEO Boost audit-trail: new version, keep the old.
- **Treating a SaaS adoption as residency-neutral** for clients under UU PDP. Always assess where client data flows + DPA.
- **Letting "ASSESS" rot** with no tripwires — an ASSESS without re-eval triggers is just forgetting.

## Related
- `seoboost-versioned-output` — versioning the eval doc + radar.
- `seoboost-decision-tracking` — the D-XXX decision-log line.
- `superpowers:dispatching-parallel-agents` / the `Workflow` tool — running the council.
