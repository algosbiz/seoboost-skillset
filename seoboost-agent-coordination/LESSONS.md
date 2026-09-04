# LESSONS — Working well across concurrent sessions (SEO Boost)

Playbook for multi-session coordination that actually raises efficiency, not
ceremony. Seeded from the first real run (Klien B / Program B Bali 2026, 30 Jun 2026):
an engineering session + a marketing-article session live on the same project.
Every rule below earned its place from something that happened, not theory.

## The one idea everything follows from

You cannot see the other session. The board is the only shared reality. So:
**write the board as you act, read it before you act.** A coordination system
that depends on remembering to sync "later" is already broken — later is when
the session crashes with the locks still held.

## What good looks like (the wins to repeat)

1. **The flag that justifies the whole system.** The article session was about
   to publish "251 peserta Program B Bali." The eng session, reading from source docs,
   caught that 251 is the *Program B* number — Program B Bali registration hadn't even
   closed yet, so a Bali number cannot exist. One board message stopped an
   inaccurate public claim about the client, to the client. **That single catch
   paid for the entire coordination effort.** The value of cross-session
   coordination is not tidiness — it is catching the contradiction one session
   can't see because it lacks the other's context.

2. **Claim before you touch, and the claim is the coordination.** No claim →
   add yours, proceed. Fresh claim by a live sibling → don't barge in. The
   article session correctly narrowed its claim to its own workspace + read-only
   on eng docs. Collisions don't happen when claims are honest and granular.

3. **Additive edits to shared files are safe; rewrites are not.** The article
   session appended D-029/D-030 to the decision log *before* reading the board —
   normally a violation, but it was pure append (new entries at the end, zero
   change to existing content), so no harm. The rule that matters isn't "never
   touch shared files," it's **never rewrite another session's content; append
   is fine.** Sequential IDs (last eng = D-028 → article took D-029/030) made it
   collision-free.

4. **Verify the other session's facts against source before endorsing.** When
   article asked "is 251 safe to publish?", eng didn't answer from memory — it
   grepped `02-DOMAIN-KNOWLEDGE.md` and found the number sitting in the *Program B*
   column. Cross-session answers carry weight; ground them in the repo, not recall.

5. **One engagement, one decision log.** Marketing decisions (D-029/030) stayed
   in the project's existing `03-DECISIONS-LOG.md` rather than spawning a parallel
   log. Easier to trace, IDs stay globally sequential. Don't fragment the record
   per workstream.

## What to avoid (failure modes seen or near-missed)

- **Publishing one session's numbers without checking whose event they are.**
  256/251 looked like an achievement; it was the wrong event's data. Aggregate
  metrics are exactly the thing that looks safe and isn't.
- **Editing shared files before checking in.** It was harmless here only because
  it was append-only. Check the board first; if you already edited, *say so on
  the board immediately* (article did — good recovery).
- **Implying agent-to-agent contact that didn't happen.** Sessions talk through
  the board (async) and through the human (real-time). Never write "I told the
  other agent" when you left a note they may not have read yet.
- **Treating the board as durable state.** It's volatile "who's live now."
  Decisions/blockers/comms still go to their numbered files.

## The efficiency math (why this is worth the overhead)

The board costs ~2 minutes per session to maintain. It prevents: duplicated
work (two sessions editing the same file → one's work lost), contradictory
client-facing output (the 251 flag), and stale-lock deadlock (a crashed session
freezing a sibling). The first prevented lost-write or wrong public claim pays
back the overhead for the whole project. **Coordination is cheap; the mistakes
it prevents are expensive and often invisible until the client sees them.**

## Minimum viable discipline (if you do nothing else)

1. Read the board at session start.
2. Claim what you'll touch; respect fresh claims.
3. Append-only to shared files; never rewrite a sibling's content.
4. Check out at session end (drop claims, set status done) — no ghost locks.
5. When you cross workstreams, verify the other side's facts against source
   before you endorse or publish them.

## Honest scope

This works for *disciplined* sessions. A session that ignores the board is
invisible to it — the board catches cooperation, not rogue actors. For anything
that must happen in another session *now*, the human is the broker, not the
board. Don't oversell it; it's a convention that pays off, not a guarantee.
