# seoboost-formal-docs Skill — Install Guide

A Claude Skill for producing SEO Boost-branded formal documents (PRD, MoM, proposal, system design, etc.) in HTML, DOCX, and PDF with the SEO Boost visual identity: brand orange `#FF8800` glowing inside charcoal anchor surfaces, on a white printable body.

> **Brand note.** Source of truth for the identity is `design-tokens.md` and `helpers.js`.
> Do not sample colours off an existing rendered document — sample them from the tokens.

## What's Inside

```
seoboost-formal-docs/
├── SKILL.md                          # Skill metadata + when-to-use + critical rules
├── design-tokens.md                  # Color palette, typography, spacing
├── components.md                     # Visual component catalog
├── workflow.md                       # Step-by-step build workflow
├── helpers.js                        # Reusable docx-js helpers
├── templates/
│   ├── prd-skeleton.js              # PRD starter (22 sections)
│   ├── mom-skeleton.js              # Minutes of Meeting starter
│   ├── proposal-skeleton.js         # Business proposal starter
│   ├── system-design-skeleton.js    # System design / API spec / runbook starter
│   └── generic-skeleton.js          # Fallback for other formal docs
├── examples/
│   └── project-g-prd-v1.0.docx       # Reference output (60-page PRD)
└── README.md                         # This file
```

## Installation per Claude Product

### 1. Claude Code (CLI)

**Global install** (skill available in any project):

```bash
mkdir -p ~/.claude/skills
unzip seoboost-formal-docs.zip -d ~/.claude/skills/
# Result: ~/.claude/skills/seoboost-formal-docs/
```

**Project-level install** (skill scoped to one repo):

```bash
cd /path/to/your/project
mkdir -p .claude/skills
unzip /path/to/seoboost-formal-docs.zip -d .claude/skills/
# Result: .claude/skills/seoboost-formal-docs/
```

**Verification:**

```bash
# In Claude Code, ask:
> "Apa skill SEO Boost yang tersedia?"
# Claude should list seoboost-formal-docs as available
```

### 2. Cowork (Desktop)

Cowork shares Claude Code's skill mechanism. Install the same way:

```bash
mkdir -p ~/.claude/skills
unzip seoboost-formal-docs.zip -d ~/.claude/skills/
```

Restart Cowork after install. Verify by asking Cowork to "buatkan MoM template" — it should pick up the skill and reference the SEO Boost style.

> **Note:** Cowork is in beta as of May 2026. If Cowork uses a different skill path, check Cowork settings → Skills folder. Update README when path is confirmed.

### 3. Claude.ai (Web / Mobile App)

claude.ai supports skills via two mechanisms:

**Option A — Project upload (recommended):**

1. Create a Claude Project (e.g., "SEO Boost Documents")
2. Open Project → Knowledge tab
3. Upload the entire `seoboost-formal-docs/` folder as project knowledge (or upload as ZIP)
4. All chats within this Project will have skill context

**Option B — Per-conversation upload (one-off):**

Drop the ZIP at the start of a chat. Claude will read SKILL.md and apply the style for that conversation only.

**Limitation:** claude.ai web/mobile cannot persist a global skill registry yet (as of May 2026). Project upload is the closest alternative.

### 4. Sync Across Machines (Recommended Setup)

Maintain skills as a private git repo so all your machines stay in sync:

```bash
# One-time setup
cd ~
git clone git@github.com:<your-org>/claude-skills.git .claude/skills

# Update on each machine
cd ~/.claude/skills
git pull
```

When you improve the skill (new component, bug fix, style tweak):

```bash
cd ~/.claude/skills/seoboost-formal-docs
# ...edit files...
git add -A && git commit -m "feat: add post-mortem template" && git push
```

Then `git pull` on every other machine.

## Quick Start After Install

In any Claude session (Code, Cowork, or claude.ai with skill loaded), prompt:

> "Buatkan MoM untuk meeting kick-off Project X tanggal 15 Mei dengan attendee A, B, C. Topik utama: scope alignment, timeline, dan budget."

Claude will:

1. Read `seoboost-formal-docs/SKILL.md` to understand the trigger
2. Pick `templates/mom-skeleton.js` as starting point
3. Read `helpers.js` and `design-tokens.md` for style
4. Generate content + run the build → DOCX + PDF
5. Validate, convert, QA, and present files

## Maintenance

**When to update this skill:**

- New document type emerges (e.g., compliance audit report) → add new template under `templates/`
- Visual style changes (e.g., new corporate color) → update `design-tokens.md` + `helpers.js`
- New component pattern (e.g., risk matrix diagram) → add helper + document in `components.md`
- Critical rule discovered (e.g., new docx-js validation pitfall) → update SKILL.md "Critical rules"

**When to NOT update this skill:**

- One-off project-specific style → use a one-off override script, don't modify skill
- Personal preference vs corporate identity → discuss with team first

**Versioning:**

Bump SKILL.md `version:` field on any non-trivial change. Use semver: major (1.0 → 2.0) for breaking changes (e.g., helper API change), minor (1.0 → 1.1) for new templates/components, patch (1.0.0 → 1.0.1) for bug fixes or doc updates.

## Relationship to seoboost-strategic-docs

This skill **supersedes** the older `seoboost-strategic-docs` skill. The older skill covered concept note, MoM, proposal, feasibility study. This skill covers the same scope plus PRD, system design, API spec, runbook, post-mortem, and other formal documents.

**Migration:** After installing `seoboost-formal-docs`, remove `seoboost-strategic-docs` to avoid duplication and trigger conflicts:

```bash
rm -rf ~/.claude/skills/seoboost-strategic-docs
```

If you have existing chat memory references to `seoboost-strategic-docs`, update them to `seoboost-formal-docs`.

## Troubleshooting

**Q: Claude doesn't seem to use the skill — generates plain documents instead.**

A: Check that `SKILL.md` is at the root of the skill folder (not inside a subdirectory after unzip). Also verify Claude has read access to the path. In Claude Code, run `claude config show` to confirm skill paths.

**Q: DOCX validation fails with `highlightCs not expected`.**

A: This was a bug in older H1 implementations using `highlight: "darkBlue"` on TextRun. The current `helpers.js` renders H1 as a charcoal `ink850` band carrying a orange `▍` lead-tick and an `onDark` title, with a hairline shelf beneath — no highlight, no badge chip, and no section number on the band at all. If you customized H1, revert to the version in this skill.

**Q: Tables look broken in Google Docs after upload.**

A: Make sure all table widths use `WidthType.DXA`, not `WidthType.PERCENTAGE`. The helpers already use DXA — only an issue if you wrote custom tables outside the helpers.

**Q: Can I use this skill for non-SEO Boost documents?**

A: This skill encodes SEO Boost visual identity. For client deliverables under client branding, fork the skill and replace color tokens, header/footer text, and disclaimer wording.

## License

Proprietary — PT Algo Sea Biz internal use only. Do not redistribute outside SEO Boost without authorization.

---

*v1.0 — May 2026 — PT Algo Sea Biz*
