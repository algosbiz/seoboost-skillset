---
name: seoboost-skill-updater
description: Use when an EXISTING seoboost-* skill should be enriched or corrected — a new gotcha/pattern/edge-case belongs inside a skill that already exists (not a brand-new skill, not a fact for memory, not a per-project devset). Triggers — "update skill X", "tambahkan ini ke seoboost-gdrive", "perkaya skill <name>", "skill <name> ada yang salah/usang", "fold this into the existing skill". Edits the skill in place, sanitizes, then propagates to seoboost-skill-set. Delegates — new skill → seoboost-skill-candidate + writing-skills; memory/facts → agent-memory; per-project dev knowledge → seoboost-development-set.
metadata:
  type: reference
---

# SEO Boost Skill Updater — enrich/correct an existing skill, then propagate

The narrow gap-filler: when you learn something that belongs **inside a skill that
already exists**, this is how you fold it in and push it so every machine inherits it.
Not for creating skills, not for memory, not for per-project knowledge — those have
their own homes (see routing below).

**Core principle:** Update existing > create new. If an insight enriches a skill that
already exists, enrich it — don't mint a near-duplicate (namespace pollution). And don't
let a hard-won correction rot un-propagated.

## Routing — is this even the right skill? (check FIRST)

| What you have | Where it goes | Not here because |
|---|---|---|
| Insight that enriches an EXISTING `seoboost-*` skill | **seoboost-skill-updater (this)** | — |
| A brand-new reusable technique, no existing skill fits | `seoboost-skill-candidate` (gate) → `writing-skills` (author) | this skill only edits what exists |
| A host fact / gotcha / decision (cross-session memory) | `agent-memory/` (append + push) | memory ≠ skill |
| Reusable dev knowledge tied to a CLIENT PROJECT | `seoboost-development-set` → `seoboost-devset-<project>` | per-project has its own umbrella |

If it's not "improve a skill that already exists," stop and use the right tool above.

## Workflow (5 langkah)

1. **Locate** — which existing skill does this belong in? Find it: `ls ~/.claude/skills/seoboost-*`
   or search the repo clone. If none fits cleanly → it's a NEW skill, route to
   `seoboost-skill-candidate` (not this).
2. **Edit in place** — update that skill's `SKILL.md` (or its `reference/*`). Fold the
   gotcha/pattern/correction into the existing structure & voice; don't restructure the
   whole skill. Newest-relevant info easy to find.
3. **PII sanitize** — the new insight may carry client names / secrets / prod detail.
   Strip secrets; keep technique. Bar: "reusable technique, or client secret?" (same as
   seoboost-development-set). Project NAME ok; DB schema/creds/IP not.
4. **Verify** — frontmatter still valid, examples still consistent, no secret leaked
   (`grep` for the obvious ones). If the skill ships scripts, shellcheck them.
5. **Propagate** — sync the edited skill into the repo clone, then **confirm with the
   operator** (Iron Law #4: no push without permission) and push:
   ```bash
   # edit lives in the repo clone? commit it. Edited the installed copy instead?
   # rsync it back first: rsync -a --delete --exclude '.git' \
   #   ~/.claude/skills/<skill>/  ~/.claude/seoboost-skill-set/<skill>/
   git -C ~/.claude/seoboost-skill-set add <skill> \
     && git -C ~/.claude/seoboost-skill-set commit -m "skill(<name>): <what changed>" \
     && git -C ~/.claude/seoboost-skill-set push
   ```
   Other machines get it via `git pull` + skill sync (see
   `agent-memory/seoboost-skill-set-management.md`). New version is active after a session
   restart.

## Source-of-truth note

On this kind of setup, the **installed** skill (`~/.claude/skills/seoboost-*`) is what the
agent actually runs; the **repo** is the distribution channel. Edit the installed copy
to use it immediately, but you MUST sync it back into the repo clone and push, or the
change is local-only and other machines never see it.

**Check the install shape before reaching for rsync — it differs per host and per skill:**
```bash
ls -ld ~/.claude/skills/<skill>          # leading "l" = symlink into the repo clone
[ ~/.claude/skills/<skill>/SKILL.md -ef <repo>/<skill>/SKILL.md ] && echo "same file"
```
- **Symlink / same inode** → editing the installed copy already wrote into the repo working
  tree. `rsync` is unnecessary and an `rsync --delete` onto itself is actively dangerous.
  Go straight to `git add` + commit.
- **Real copy** → `git pull` alone will never update it; rsync it back before committing.

Also expect the shared repo to have moved on: `git push` may be rejected because another
machine in the fleet pushed first. Fetch, confirm they touched *different* skills, then
`git pull --rebase` and push — do not force.

## Boundaries (tidak dilakukan)

- TIDAK bikin skill baru (itu `seoboost-skill-candidate` + `writing-skills`).
- TIDAK simpan memory/facts (itu `agent-memory/`).
- TIDAK handle per-project dev knowledge (itu `seoboost-development-set`).
- TIDAK push tanpa konfirmasi operator.
- TIDAK leak rahasia klien ke skill (sanitize dulu).

## Related

- `seoboost-skill-candidate` — gate for NEW skills (this skill is for EXISTING ones).
- `writing-skills` — authors skills (RED→GREEN→REFACTOR); pair with it for big edits.
- `seoboost-development-set` — per-project dev knowledge → `seoboost-devset-<project>`.
- `agent-memory/seoboost-skill-set-management.md` — the sync + push procedure across machines.
