---
name: seoboost-verification-instruments
description: Use when about to report a number, a green run, or a "not found" as evidence — especially before telling someone work is done, safe, or broken. Covers grep/pipeline/log/diff/mutation-test measurements that report false results.
---

# Verification Instruments Lie

## Overview

Wrong verification is worse than none, because it stops the search.

**Core principle:** an instrument reports what it measured, not what you meant to measure. Before quoting any number as evidence, ask: **"how can this tool fail, and does its failure look like success?"**

Every entry below actually happened — nine times, across three agents, in one session (Project E, 9–10 Aug 2026). Three produced false reports to a coordination board before being caught.

## The sharpest tell

> **Did a success signal lie to you?**

A failure that announces itself costs minutes. A success that lies costs the whole investigation — and it lies again next project.

## Faking GREEN — the dangerous half

| Trap | What happens | Fix |
|---|---|---|
| `if <pipeline>` | Measures the **last** command's exit code (`head`, `tail`), not the tool you asked. `eslint … \| tail -3 && echo clean` printed *clean* while eslint exited 1 | Capture the tool's own `$?`, or `PIPESTATUS` |
| **Case-insensitive FS** (macOS) | `/tmp/F.txt` and `/tmp/f.txt` are the **same file**. A gate chain that broke early left `grep` reading the **previous** run's log — reported *"217 passed"* for a run that never executed | `rm -f` the log first, then assert it exists before reading |
| Empty file, exit 0 | `git show <ref>:<path>` that fails writes **0 bytes**; `psql -f` accepts an empty file with exit 0 → "installed" having run nothing | Assert size/line-count before use |
| `rsync --delete --dry-run` without `-v` | Prints nothing → reads as "nothing would be deleted" | Add `-v`, or count |
| Concurrency test that stops being concurrent | Warm connection pool serialised 10 racers; the compare-and-set was never exercised and the test stayed green **with the guard deleted** | Give the race its own client/connections; assert something that fails if concurrency is lost |

## Faking RED — invents findings that don't exist

| Trap | What happens | Fix |
|---|---|---|
| Mutation hits a **comment** | `str.replace(a, b, 1)` patches the first match, often in a docblock. Never reaches executed code → reports SURVIVED for a healthy test | Assert the patched offset is not inside a comment; or make the pattern unique |
| Mutation too weak to fail | Changing error **text** to `"already registered-UNUSED"` still matches `/already registered/i` | Mutate **behaviour** (delete the `if`), not cosmetics |
| Over-narrow search window | `tail -3 \| grep -c "dump complete"` → 0, because newer `pg_dump` appends `\unrestrict` **after** the marker. Read as "backup truncated" | Search the whole artifact before concluding absence |
| Pattern misses the real syntax | Grepping `CREATE TABLE public.company` on a dump that writes `CREATE TABLE "public"."company"` reported **7 FK targets missing** — for migrations that had already applied successfully | Query the artifact directly (`information_schema`) instead of pattern-matching text |
| `git diff A B` as merge preview | Measures *"make A look like B"* — includes reverting everything A gained. Reported **"799 lines will be deleted"**; the real merge was a 2-file conflict. On a stale branch it over-reports by orders of magnitude | `git merge-tree --write-tree A B` (git ≥2.38) |

## Hiding a dead layer

**Defence layers that are each individually sufficient make outcome tests blind.**

A three-layer `plot_hold` guard (advisory lock → lazy release → partial unique index) stayed green with the lock removed *and* stayed green with the index removed. Each layer covered for the other; neither was tested.

> For every layer, there must be one test that **dies when only that layer is removed.**

Related: **a test whose name promises more than it asserts.** `"idempotently across two runs"` sounds like it covers grant downgrade — running the *same* template twice cannot detect a missing downgrade.

**A deny-list is a layer too, and it dies quietly.** A guard that works by *refusing* — a
deny-list of paths, an allowlist of senders, a blocked-extension set — is keyed by names it
does not otherwise read. Rename what it names and nothing fails: no missing file, no error,
no red. The guard simply stops matching, and every later run reports success while defending
nothing. Read-lists announce their own breakage; deny-lists never do.

> After any rename, grep the deny-lists separately from the read-paths, and prove the guard
> still refuses by feeding it something it must reject.

**SEO Boost case, 2 Sep 2026 (KLIEN A).** A Drive upload script carried `TERLARANG_JALUR`, a list of
internal-note directory names kept out of the client-readable folder. The directory was renamed;
the read-paths were updated and the build passed. Had the deny-list entry not been caught in the
same pass, internal notes would have uploaded to a folder the client reads — silently, with a
green run. The operational checklist for renames lives in `seoboost-fork-checkpoint` (hygiene rules
6-8); the reason it matters lives here.

## The parent rule for mutation testing

> **A SURVIVED mutation proves nothing until it is proven able to go RED.**

SURVIVED has two causes — weak test, or weak mutation — and the report cannot tell them apart. Re-apply the mutation after strengthening the test: **red afterwards is the proof it hit live code**, which you never had when it reported survived.

## Quick self-check before quoting a number

1. Which exit code / file / window did I actually measure?
2. Could this tool return "nothing" for a reason other than "nothing exists"?
3. Is there a fact I already hold that makes this result impossible? (This caught the 7-FK false alarm — the migrations had already applied.)
4. Can I ask the artifact directly instead of matching its text?
5. If it's a guard: have I seen it go red?

## Common mistakes

| Mistake | Fix |
|---|---|
| Quoting a measurement you narrowed | Widen, then narrow again to confirm |
| Trusting a green chain that short-circuited | Assert each stage produced its artifact |
| "It passed, so it's covered" | Coverage is proven by a mutation dying, not by a pass |
| Reporting a scary number without a sanity check | Big numbers deserve verification **before** the alarm, not after |
| Narrating a cross-check you never ran | The claim "I checked X against Y" is itself a measurement — show the comparison output, or say you did not check |

## The narrated cross-check — a reading nobody took

The instrument can lie. So can the sentence that says the instrument was read. A cross-check
you describe but never run is indistinguishable, in a report, from one that passed — and it
disarms every reader downstream, because a stated check is what they stop checking.

Ask before writing "sudah saya cocokkan / I verified X against Y":
1. What command or file read produced the comparison? Name it.
2. Can I paste its output, or the count of matches?
3. If the intersection is empty, would my sentence still read the same? (If yes, the sentence
   is not reporting a measurement.)

**SEO Boost case, 29 Aug 2026.** Before deleting 9 skill directories, an agent wrote that it had
checked those names against the audit report's list of 29 deleted skills and that all 9 were
in it. The intersection was zero. Nobody re-checked, because the check had been stated. Four
skills were lost permanently. Full account:
`ProjectDocs/skill-ecosystem-audit-2026-08-28/INSIDEN-2026-08-29-sync-hapus-installed-only.md`.

The pairing that makes this expensive: a narrated cross-check in front of an irreversible
action. Guardrail 1 in `agent-memory/OPERATING-GUARDRAILS.md` covers the second half.

## Gates on generated documents — the gate exists and measures the wrong thing

Eleven findings in one project (KLIEN A, Aug–Sep 2026) share one shape: a gate was in place,
it passed, and a human found the defect anyway. The gate was never wrong about what it
measured — it measured the wrong property.

| The gate asked | What actually broke | Found by |
|---|---|---|
| Is every heading present in the text? | Rows overflowed a fixed-height sheet and vanished silently; `overflow:hidden` means no second page, so the page-count check passed too | Client, on a Drive preview |
| Is every heading present? | Last row sat at y=833pt of an 841.9pt page, footer pushed off entirely — heading present, row unreadable | Client |
| Are all labels present? | Labels overlapped each other; presence says nothing about position | Reviewer's screenshot |
| Does the text fit the node? | `slice()` had been truncating node text silently for months | Discovered while building a different gate |
| Did the sweep run? | Sweep died halfway, still printed a count; the count read as a clean result | Nobody — caught by re-running |
| Are em dashes gone? | Only the literal character was searched; `&mdash;` and `\u2014` survived | Later audit |
| — nothing checked this — | A rupiah figure in prose traced to no source cell, and its direction was inverted | Client, who read it and said he didn't understand |

**The rule.** For anything rendered — PDF, chart, table, deck — presence and position are two
different questions, and a text gate answers only the first. Add the second explicitly:

```js
// presence: is the content there at all
const text = execSync(`pdftotext "${pdf}" -`).toString().replace(/\s+/g, ' ');
// position: did it stay inside the sheet
const yMax = [...execSync(`pdftotext -bbox "${pdf}" -`).toString()
  .matchAll(/yMax="([\d.]+)"/g)].map((m) => +m[1]);
// the footer is the honest canary: it is last in flow, so its absence means
// something was cut before reaching it
if (!text.includes(FOOTER.slice(0, 40))) throw new Error('content overflowed the sheet');
```

**Four traps specific to document gates:**

1. **`-layout` mode breaks matching.** `pdftotext -layout` preserves column position, so a cell
   wrapping across lines is interleaved with neighbouring columns and a title that reads fine on
   screen cannot be matched. Use plain reading order for presence gates. (Cost this: a gate
   reported 30 of 43 headings missing when all 43 were present.)
2. **A partial sweep still returns a number.** Any sweep must report attempted vs completed, and
   a mismatch is a failure, not a footnote. A count from a sweep that died halfway looks exactly
   like a clean result.
3. **One encoding is not the character.** Searching a literal `—` misses `&mdash;` and `\u2014`.
   Search every encoding the pipeline can emit.
4. **Numbers in prose have no gate at all.** Every currency figure in a client-facing document
   must trace to a source cell, or be written as a calculation whose steps are shown. A figure
   that cannot be pointed back to its origin must not ship. Spelling gates pass fabricated
   numbers, because their spelling is correct.

**When a constraint looks immovable, check the constraint's own premise.** One threshold
"could not be raised" through repeated tuning; the real fix was splitting the chart in two, after
which the threshold was never binding. Tuning a number many times without progress is evidence
that the number is not the cause.

## Idempotence is a safety check, not a tidiness check

For any tool that moves, copies, or deletes files: **run it twice and read the second number.**
A second run must do nothing. When it reports work, that is not inefficiency — it is usually a
bug that destroys data, and it is invisible on the first run.

Real, KLIEN A, 1 Sep 2026. A tidy-up tool re-filed 1,608 published documents into per-document
folders. First run: 3,084 files moved, count unchanged at 1,608, folder names correct. Every
signal said success. The second dry run said **1,598 files would move again** — and the reason
was one line:

```js
if (fs.existsSync(ke)) fs.unlinkSync(dari);   // "a collision means the same file twice"
else fs.renameSync(dari, ke);
```

Correct for its original purpose: two copies of one file, keep the destination, drop the source.
But when **source and destination are the same path** — a file already in the right place —
`existsSync(ke)` is true and `unlinkSync(dari)` deletes that very file.

The dangerous state did not exist during the first run: everything genuinely moved, so source
never equalled destination. It was *created by* the successful first run. The next real run would
have deleted 1,598 published files with no error at all.

**What saved it was the dry run plus reading the number** — not caution, and not a test.

Two rules:

1. Any file-moving tool gets a `--dry-run` and an explicit "second pass moves nothing" check,
   and the number is read, not assumed.
2. Guard the identity case first: `if (resolve(from) === resolve(to)) return;` before any
   existence test.

The same check caught a second, quieter fault in the same tool on the same day: archived files
were pulled to the surface and pushed back down on every run — 1,486 moves, zero net change. A
churn like that also hides the moves that are real.

## Recognition by NAME breaks every time the naming convention changes

Five times in one day, across four files, one project (KLIEN A, 1 Sep 2026):

| The check asked | Broke when | Silent result |
|---|---|---|
| does `arsip/<file>` exist? | archives were grouped into `arsip/<slug>/` | published version numbers became reusable |
| do these two guessed paths exist? | files moved to `<slug>/<file>` | same |
| is the folder name equal to the slug? | folder names were shortened | 102 lint warnings for folders that were correct |
| same, in the linter | same | same |
| glob `Matriks-GAP*` | five new files gained that prefix | six documents nearly spilled into one folder mixed together |

Every failure was silent. Nothing threw; the checks simply stopped finding anything, and a check
that finds nothing looks exactly like a check that found nothing wrong.

**A name is a convention, and conventions change. Content is fact.**

- Recognise by content: a "document folder" is not "a folder whose name equals the slug", it is
  "a folder whose versioned files all share one slug".
- Walk the tree instead of guessing a path shape. On thousands of files the cost is nothing, and
  it survives the next convention change.
- Keep the naming rule in one exported function. Copying it means waiting for the copies to drift.

## A range you hardcoded, read back as a count

Klien B, 1 Sep 2026. A script answered "which certificate number was last used?" by reading a
Google Sheet:

```python
values/'{tab}'!A1:H400        # the range
```

It printed `BARIS DATA: 399`. The sheet held **416** rows. Seventeen were never read, nothing
failed, and 399 looked exactly like a count.

**The tell that caught it:** the number stopped one short of a round figure that also appears in
the code. That is not a coincidence worth accepting.

> **A count that lands just under a round number appearing in your own source is truncated
> until proven otherwise.**

**Fix:** derive the range from the source, never pin it. For Sheets that is
`sheets.properties.gridProperties.rowCount`. When a fixed ceiling is unavoidable, print the
ceiling next to the count so the reader can see the number might not be the whole of it.

## Status codes that describe the wrong layer

Two from the same session, both of which would have produced a confident wrong report.

| Observed | Looks like | Actually |
|---|---|---|
| `HTTP 200`, 906 KB | file downloaded | Google **sign-in page**; body starts `<!doctype html>` with `base href` to `accounts.google.com/v3/signin` |
| `HTTP 500 Internal Server Error` | the backend threw | request **never reached the backend**; a proxy in front timed out and wrote the 500 itself |

**Fix for both: read the body, not the code.** Cheap discriminators that settle it in one line:

- `Content-Type` **absent** on an error from a framework that always emits JSON → the answer came
  from a different layer
- Magic bytes: `ffd8ff` JPEG, `25504446` PDF, `3c21646f` `<!do` → HTML where a file was expected
- **Elapsed time.** A size rejection answers instantly (413). Thirty-one seconds is something
  waiting until it gives up, which is a timeout wearing a 500's clothes

## Two instruments for measuring a black box from outside

Both were used to find the root cause of a production failure whose logs had already been
destroyed. No logs, no server access, nothing mutated.

**1. The identifier that is guaranteed to fail.** Send a request whose ID cannot exist. The
service's own answer then tells you *how far the request travelled*:

```
small body + nonexistent code  -> 404 JSON  "code not found"   = reached the service
large body + SAME code         -> 500 text, no Content-Type    = never reached it
```

Holding the identifier constant makes size the only variable. Because the ID is fake, nothing is
written and no real record is touched — the experiment is safe to run against production.

**2. The straddling pair.** Do not report "the limit is somewhere above X". Bracket it:

```
body 10,466,757  (19,003 under 10 MiB) -> 404 JSON,  1,635 ms
body 10,493,425  ( 7,665 over  10 MiB) -> 500 hang, 32,374 ms
```

26,668 bytes flip the behaviour. That is a **hard limit**, and it names its own value: 10 MiB.
A pair that straddles is proof; a single failing sample is a guess.

**What this replaces:** the theory being tested was "it depends on the uploader's network speed",
which predicts times rising with size. The measured times were flat (863 ms, 2,388, 2,190, 1,444)
and then fell off a cliff. **A curve and a cliff are different shapes, and one table tells them
apart.** Prefer a hypothesis that a table can kill.

## Four instruments that lied in one session

Klien B <Nama Event>, 2 Sep 2026, the night before an international event. Every one of
these produced a **false finding**, not a missed one — and three were reported to the
operator as fact before being re-checked.

| Instrument | What it said | What was true |
|---|---|---|
| `pdftotext` on a form | Column "Test" is empty; the client has not filled it in | The column held **checkbox images**. Text extraction returns nothing for non-text content, and nothing reads as empty. Opening the file showed all 28 ticked |
| `grep -c "commit"` | One occurrence of internal terminology leaked into a client document | It matched **"Steering Committee"**. Substring matching does not know word boundaries |
| Phrase search across a table | The string "517 sampai 603" is missing from the rendered PDF | It was there, **wrapped across two lines** inside a table cell. Extracted text breaks where the layout breaks, not where the sentence does |
| `for c in "a b c"; do cmd $c` in **zsh** | Six generators all FAILED | zsh does **not** word-split an unquoted parameter; the whole string became one argument. All six had succeeded. Use `${=c}`, an array, or explicit calls |

**The rule these share.** An instrument that returns nothing is not evidence of absence —
it is evidence that *this instrument* found nothing. Before reporting absence to a person,
ask what else would produce the same silence: a different content type, a line break, a
word boundary, a shell that splits differently from the one you assumed.

**Cheapest counter-check.** Prove the instrument can find something you know is there.
If `pdftotext` cannot find a string you can see on the page, it is the wrong instrument
for that page — not proof the string is gone.

## Checking the wrong layer: children instead of the thing itself

Same session. The operator reported a background task still running. The reply said
nothing was running, backed by process searches for `python3`, Chrome, and `pdftoppm` —
all zero. The operator sent a screenshot of the task panel: **11m 44s, still running**.

The searches were real and their results were correct. They looked for the task's
**child processes**, never for the shell that owned them. The conclusion happened to be
right — the processes had already exited — but it was reached by measuring something else.

Being right by luck is not verification. Name the thing whose state you are claiming, and
measure **that**, not the things it usually spawns.

## Real-world impact

Three of the nine false readings reached a shared coordination board before being caught. One nearly triggered a "production backups are corrupt" alarm two days before a client onboarding. The correction of a wrong number is cheap; the reaction to it is not.

Direvisi 30 Agu 2026 — panen `seoboost-skill-evolution` (temuan T-002).
