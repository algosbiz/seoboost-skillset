---
name: seoboost-cross-project-reuse
description: Use when work in one SEO Boost project could be reused, replicated, or integrated by ANOTHER SEO Boost project — to speed up future development instead of rebuilding from scratch. Triggers — "ini bisa dipakai project lain", "replikasi mesin X ke project Y", "integrasikan dengan project Z", "ada yang sudah pernah bikin ini di project lain?", "catat ini biar reusable", "apa yang bisa di-reuse dari project sebelumnya", before building something a sibling project likely already solved, or when finishing a component that other SEO Boost projects will want. NOT for coordinating concurrent sessions on the SAME project (that is seoboost-agent-coordination), and NOT for client decisions/comms (seoboost-decision-tracking / seoboost-communication-log).
---

# SEO Boost Cross-Project Reuse (Discovery, Replication, Integration)

## What this is — and the hard truth first

Two SEO Boost projects do not share a directory. Project Klien B cannot read project
Project E's files. So "an agent in project B reuses project A's work" is impossible
unless A wrote down **what's reusable, where it lives, and how to lift it** into
a channel B can also reach. There is no auto-discovery; reuse is a deliberate
act of cataloguing by A and searching by B.

The channel that both sides reach is the **`agent-memory/` tier of the
`seoboost-skill-set` repo** — version-controlled, symlinked into every project,
machine-agnostic. This skill disciplines one file in that tier: a catalog of
reusable assets across SEO Boost projects. It does not create a new capability; it
turns the shared memory you already have into a reuse index.

**This is the opposite problem from `seoboost-agent-coordination`.** That skill stops
concurrent sessions from colliding (locking, "don't touch"). THIS skill makes a
later project FIND and LIFT an earlier project's work (discovery, "please reuse").
Coordination = same project, avoid conflict. Reuse = different projects, maximize
leverage.

## The channel: `agent-memory/REUSABLE-CATALOG.md`

One file in the `seoboost-skill-set` repo's `agent-memory/` tier. A catalog where
each entry is a reusable asset some project built, described well enough that a
different project can decide "yes, lift this" without reading the source repo.

(Template in `assets/REUSABLE-CATALOG.template.md`.)

Each entry answers four questions a reusing agent actually has:
1. **WHAT** — the asset (a service, a pipeline, a template, a deploy recipe, a
   pattern). One line.
2. **WHERE** — origin project + path/repo. Machine-agnostic where possible (repo
   name + relative path, not a hardcoded clone path).
3. **REUSE MODE** — *replicate* (copy + adapt), *integrate* (call it live, e.g.
   server-to-server), or *pattern* (copy the approach, not the code). These need
   different things from the reuser — say which.
4. **LIFT NOTES** — what to change when reusing (config, secrets, hardcoded
   names), what's frozen (contracts, hashes), and the known traps. This is the
   payload — a catalog entry without lift notes is just an advertisement.

**Capability tag (WAJIB prefix judul entry).** Prefix tiap entry dengan slug
kapabilitas `[verb-noun]` lowercase, biar bulan depan operator bisa
`grep REUSABLE-CATALOG.md` berdasarkan APA yang dilakukan, bukan berdasarkan asal-project:

```
### [poster-fill] Poster template filler — WHAT / WHERE / REUSE-MODE / LIFT-NOTES
### [sheets-replicate] Google Sheets replicator — ...
### [scoring-rekap] Skor rekapitulasi builder — ...
### [juri-form-build] Form juri generator — ...
```
Kosakata kecil (~10 verba). **Reuse slug lama sebelum bikin baru** — 50 sinonim = noise lagi.

## Promotion bar — kapan sebuah script LAYAK jadi entry (jangan catalog semua)

Foldering rapi ≠ tool. Foldering itu hygiene; **cataloguing adalah klaim bahwa sibling
project akan memanggilnya.** Promosikan hanya kalau **4-dari-4** benar:

1. **Second-caller test** — kamu bisa sebut *project lain konkret* yang akan mau ("event
   lain → poster-fill", "verifikasi lain → scoring-rekap"). Tak bisa sebut caller kedua = bukan tool.
2. **Parameterised, bukan hardcoded** — input dari args/config, bukan nilai ditanam di
   body. Kalau lifting = find-replace nama klien, gagal.
3. **Self-contained** — jalan dari foldernya dengan deps dideklarasi; tak menjangkau path
   privat/schema bespoke satu project.
4. **Kapabilitas berulang, bukan one-shot** — melakukan KELAS hal (isi poster APA SAJA,
   replikasi sheet APA SAJA), bukan satu artefak spesifik.

**2-dari-4 = biarkan rapi di project-nya, JANGAN catalog.** Default = jangan catalog;
catalog adalah allow-list reuse terbukti, bukan inventaris tiap script.

**Filter don't-catalog (jaga sinyal):** one-off glue untuk satu quirk data klien; logic
80% hardcoded ke satu project; wrapper lebih tipis dari call stdlib yang dibungkus;
"mungkin berguna suatu hari" tanpa second-caller konkret.

## Sanitasi: TOOL boleh diangkat, DATA tidak

Perluasan aturan no-secrets/no-PII. Yang di-catalog adalah **script generator + sample
input sintetis/kosong** — NEVER daftar peserta, skor, atau output terisi:
- LIFT-NOTES sebut **shape** input (kolom/schema), never baris nyata.
- Kalau entry memungkinkan pembaca merekonstruksi peserta/skor asli → itu kebocoran.
  Strip ke schema dulu sebelum landing.
- "Internal use first" tetap aman: tool-nya liftable lintas project SEO Boost; data klien tetap
  terkurung di project asalnya.

## Protocol

### When you FINISH something reusable (the producer side)
A component is "reusable" if a *different* SEO Boost project would plausibly want it:
a microservice, a data pipeline, a deploy/runbook recipe, a document template, a
non-obvious pattern that took real effort to get right, or a **generator script**
(fill poster, replicate sheets, rekap scoring) that clears the 4-of-4 promotion bar above.

**Trigger** (bolt to an event that already happens — not a separate chore):
- **Saat stamp output klien** (`seoboost-versioned-output` → `_v{X.Y}` di `output/`): the
  generator that produced it is proven & done. Check the 4-of-4 bar → catalog if it passes.
- **Sweep-net at project close / `seoboost-fork-checkpoint`**: anything missed at output-time.

1. ☐ First check the **promotion bar (4-of-4)** above. Fails? Leave it neatly foldered,
   do NOT catalog. Passes? Continue.
2. ☐ `cd <clone> && git pull --ff-only` (per `agent-memory/AGENT-ONBOARDING.md`).
3. ☐ Add/refresh an entry in `agent-memory/REUSABLE-CATALOG.md` — **prefix with the
   `[capability]` tag**, answer the four questions. Be honest about reuse mode and lift
   notes — over-claiming ("just copy it") wastes the reuser's time at the frozen contract.
   Apply the **TOOL-liftable / DATA-not** sanitisation: synthetic/blank sample input only.
4. ☐ If the asset already has good docs in its own repo (a README, a DEPLOY
   runbook), the catalog entry POINTS there — don't duplicate, link.
5. ☐ Push needs operator confirmation (Iron Law #4 — no push without permission).
   State the entry to operator first.

Do NOT catalog: client secrets, live tokens, real participant/customer data,
or anything project-confidential. The catalog is technique + location, never
credentials or PII. (Same bar as `seoboost-development-set`.)

### When you're about to BUILD something (the consumer side — check first)
Before building a service / pipeline / deploy / template from scratch:

1. ☐ Read `agent-memory/REUSABLE-CATALOG.md` — did a sibling project already
   solve this? `git pull` first so it's current.
2. ☐ Thin catalog or unsure? `episodic-memory:search-conversations` by the
   capability ("auto-surat PDF", "verifikasi pendaftaran pipeline", "cloudflared
   multi-tunnel deploy") to find which project did related work, then read that
   project's docs.
3. ☐ Found a match → decide reuse mode from the entry:
   - **Replicate** → copy the source, then work the LIFT NOTES (change config,
     re-point secrets, rename hardcoded values). Verify with the source's own
     tests if it ships them.
   - **Integrate** → call it live (e.g. server-to-server + API key). Read its
     API contract; do NOT fork it. Coordinate the contract with the owner.
   - **Pattern** → copy the approach, write fresh (often with TDD). Don't paste
     code that carries the other project's assumptions.
4. ☐ No match → build it, then catalog it when done (you're now the producer).

### When you REPLICATE or INTEGRATE
- **Replicate:** the source is a starting point, not gospel. Adapt to the new
  client's identity/config. Don't ship project A's brand/data in project B.
  (Cf. the design-md lesson: a seed, then localize.)
- **Integrate:** the contract is the boundary. Frozen things stay frozen (HMAC
  secrets, hash formats, API field names). Changing the shared contract is a
  cross-project decision — log it on both sides, broker via the human.
- Either way: the reused asset's **own tests/verification still apply.** A lift
  that skips the source's test suite is unverified.

## Honest limits — say these, don't oversell

- **No auto-discovery.** B finds A's work only if A catalogued it or it surfaces
  in memory search. Uncatalogued work is invisible to the next project. The
  catalog rewards the producer's discipline, nothing else.
- **The catalog is a pointer, not a package.** It tells you what exists and how
  to lift it; the actual code lives in its origin repo, which the reusing machine
  may need to clone. Say "clone <org>/<repo> to lift it", don't
  imply the asset is sitting in the current project.
- **Replication ≠ free.** Lift notes exist because every reuse needs adaptation.
  An entry that promises zero-change reuse is usually wrong about the frozen
  contract — distrust it, read the source.
- **Cross-project contract changes need the human.** Two projects integrating
  live can't silently renegotiate the API; operator brokers, both decision logs
  record it.

## Anti-patterns

- ❌ Rebuilding something a sibling project already solved because you didn't
  check the catalog / search memory. The check costs a minute; the rebuild costs
  days.
- ❌ Cataloguing an advertisement (WHAT + WHERE, no LIFT NOTES). Useless to the
  reuser — they hit the traps you didn't warn about.
- ❌ Putting secrets, tokens, or client data in the catalog. Technique + location
  only.
- ❌ Forking a service that was meant to be integrated (called live), duplicating
  it into project B → two copies drift, contract breaks. Integrate, don't fork.
- ❌ Shipping the origin project's brand/identity/data when replicating. Localize.
- ❌ Treating a catalog entry as a substitute for the source's tests. Re-verify.
- ❌ **Over-cataloguing** — dumping every neatly-foldered one-off into the catalog until
  it's noise. Gate on the 4-of-4 bar; default is DON'T catalog.
- ❌ **Cataloguing the DATA, not the tool** — putting a filled poster / real scores /
  participant list in the entry. Tool + synthetic sample only; strip to schema.
- ❌ **Untagged entries** — no `[capability]` prefix, so months later nobody can grep by
  what it does. Always tag.

## Relationship to other skills

- `seoboost-agent-coordination` — concurrent sessions, SAME project, avoid collision.
  This skill — DIFFERENT projects over time, maximize reuse. Complementary,
  opposite goals.
- `seoboost-development-set` (`seoboost-devset-<project>`) — captures REUSABLE TECHNIQUE as
  a per-project sub-skill. That's the deep "how this project works" knowledge;
  THIS catalog is the lightweight "what exists across projects + how to lift it"
  index that points AT devsets and source repos. Use both: devset = depth,
  catalog = discovery.
- `agent-memory/AGENT-ONBOARDING.md` — the tier's own start-here. Pull/sync/read
  discipline lives there; this skill assumes you followed it.
