---
name: seoboost-skill-ecosystem-audit
description: Use to audit the local skill ECOSYSTEM (not content of individual skills) — check for outdated skill versions via `npx skills update`, deprecated user-authored skills with official replacements, `CLAUDE.md` / `SKILLS-SOP.md` / router convention drift, MCP server versions, and skills installed but not referenced in any router. Triggers — "cek skill yang perlu update", "audit ekosistem skill", "check skill freshness", "sync skill router", "ada skill baru worth install?", "any skill outdated?", weekly/monthly maintenance, or after a major install session. Reports drift; does NOT auto-modify router/SOP/CLAUDE.md without explicit user approval. NOT for editing a single skill's content — that's `seoboost-skill-updater`. NOT for authoring a new skill — that's `seoboost-skill-candidate` → `writing-skills`.
---

# SEO Boost Skill Ecosystem Audit

Maintenance skill for auditing the **local skill ecosystem** — versions, drift,
deprecations, coverage. Runs a structured audit + surfaces drift, without
auto-mutating canonical convention docs.

## Scope boundary (check FIRST)

| What you want | Use this? |
|---|---|
| Refresh all installed skills to latest versions + surface ecosystem drift | **This skill (yes)** |
| Add a gotcha/fix inside a single existing skill's content | `seoboost-skill-updater` |
| Create a brand-new skill because none fits | `seoboost-skill-candidate` → `writing-skills` |
| Investigate one skill's implementation | Just read it |

## When to run

- **Weekly / monthly** — maintenance cadence
- **After major install session** — 5+ new skills / MCP added
- **When router feels stale** — user notices skill not being triggered, or old skill triggered instead of new
- **Before Sprint close** — quality gate for skill hygiene
- **After vendor announcement** — check for official skills that replace user-authored ones

## Audit checklist (create TodoWrite todos for each)

### 1. Skills.sh CLI updates

```bash
npx skills update -g -y
```

Refreshes all skills installed via `npx skills add ...`. Reports what changed.

**The `-g -y` matters.** Bare `npx skills update` defaults to *project* scope and
prints `No project skills to update.` even when global skills are stale. SEO Boost installs
the design stack globally (`install-design-stack.sh` passes `-g`), so the bare command
is a silent no-op. Verified 2026-08-09 on a Linux host: bare command found 0
updates, `-g -y` found and applied 1 (`impeccable`). `-y` also skips the interactive
scope prompt, which otherwise hangs a non-interactive session.

### 2. Claude Code plugin marketplaces

Check `~/.claude/plugins/known_marketplaces.json`:
- Marketplaces with `autoUpdate: true` (e.g. `thedotmack`, `context-mode`) refresh automatically
- Others need manual `/plugin marketplace update <name>` in interactive Claude Code
- Flag any `lastUpdated` > 30 days for manual refresh

### 3. MCP server versions

```bash
claude mcp list
```

Some servers self-report outdated versions (e.g. `context-mode` prints
`⚠️ vX outdated → vY available`). For each: consult its upgrade path.
`context-mode` specifically: `/ctx-upgrade`.

### 4. Deprecated user-authored skills with official replacements

Audit `~/.claude/skills/` and `~/.agents/skills/` for user-authored skills that
now have official vendor equivalents. Known cases (2026-08-07):

| User-authored (deprecated) | Official replacement | Source |
|---|---|---|
| `gsap-master` | `gsap-core` + `gsap-timeline` + `gsap-scrolltrigger` + `gsap-plugins` + `gsap-performance` | `greensock/gsap-skills` |
Resolved 28-29 Aug 2026 (ecosystem audit + operator decision): ALL `seoboost-gsap-*` skills and
`gsap-master` deleted — the full official set (8 skills incl. `gsap-frameworks`, `gsap-react`,
`gsap-utils`) is published at `greensock/gsap-skills` and wired into `install-design-stack.sh`.
29 other confirmed-redundant skills were also removed — see
`ProjectDocs/skill-ecosystem-audit-2026-08-28/LAPORAN-AUDIT.md`.

Do NOT auto-delete — project-specific overrides may exist (e.g. `gsap` skill for
JARVIS HUD is intentional). Surface the deprecation; let the user decide.

### 5. Convention drift (grep)

> **Resolve `$REPO` first.** The clone path differs per machine (`~/.claude/seoboost-skill-set`
> on the M4 Mac, `~/Documents/Workspaces/SEOBoost/seoboost-skill-set` on a Linux host). Read it
> from `agent-memory/seoboost-proactive-memory-<machine>.md`. Hardcoding one machine's path makes
> every grep below return empty and the audit reports a **false clean**.

```bash
REPO=<this machine's seoboost-skill-set clone>
grep -rEn "seoboost-gsap-|gsap-master" \
  ~/.claude/CLAUDE.md \
  "$REPO/SKILLS-SOP.md" \
  "$REPO"/*/SKILL.md 2>/dev/null
```

Any hit = doc still points to deprecated skill. Read each hit before acting: a line that
says "X replaces deprecated Y" is correct and must NOT be rewritten. Only hits that
*recommend* the deprecated skill are drift.

### 6. Router coverage drift

```bash
# All installed skills:
ls ~/.claude/skills/ ~/.agents/skills/ 2>/dev/null | sort -u > /tmp/installed.txt

# All referenced in routers ($REPO resolved as in step 5):
grep -hoE '`[a-z][a-z0-9:-]+`' \
  "$REPO/seoboost-skill-router/SKILL.md" \
  "$REPO/seoboost-uiux-design-router/SKILL.md" \
  "$REPO/SKILLS-SOP.md" \
  | tr -d '`' | sort -u > /tmp/referenced.txt

# Installed but not referenced:
comm -23 /tmp/installed.txt /tmp/referenced.txt
```

Result = skills present but router doesn't know about them → agent may skip them.

### 7. New skills.sh releases in SEO Boost-relevant domains

```bash
for kw in "design" "react" "nextjs" "nestjs" "dbt" "airflow" "rag" "langchain"; do
  echo "=== $kw ==="
  npx skills find "$kw" 2>&1 | head -10
done
```

Flag any skill with > 1K installs from reputable source (vendor-official or
well-known author) that doesn't overlap with what's installed.

## Report format

Structured output for user review:

```markdown
# Skill Ecosystem Audit — <YYYY-MM-DD>

## Updated automatically
- [x] `npx skills update` — <N skills> refreshed: <list>

## Requires manual action

### CLI / MCP updates
- [ ] `context-mode` vX → vY — run `/ctx-upgrade`

### Deprecated skills
- [ ] `gsap-master` at `~/.agents/skills/gsap-master/` — official `gsap-*` installed. Confirm remove?

### Convention drift
- [ ] `SKILLS-SOP.md` line N still references `<deprecated-skill>` — should be `<official-skill>`

### Router drift
- [ ] `design-taste-frontend` installed but not in `seoboost-uiux-design-router` Tier 2

### New skills worth evaluating
- [ ] `<owner/repo@skill>` (<N installs>) — <one-line why>
```

## Anti-pattern

- **Auto-modify router / SOP / CLAUDE.md without user approval** — canonical docs; drift decisions belong to user.
- **Auto-delete deprecated user-authored skills** — may have project-specific overrides.
- **Skip the report** and just update silently — user needs to see what changed.
- **Confuse this skill with `seoboost-skill-updater`** — that one edits ONE skill's content; this one audits the ECOSYSTEM.

## Cross-references

- Content update for single skill: `seoboost-skill-updater`
- Author new skill: `seoboost-skill-candidate` → `writing-skills`
- Router (general): `seoboost-skill-router`
- Router (UI/UX): `seoboost-uiux-design-router`
- Full org SOP: `~/.claude/seoboost-skill-set/SKILLS-SOP.md`
- Convention: `~/.claude/CLAUDE.md`
- Skills.sh directory: https://skills.sh
