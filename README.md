# SEO Boost Skills Set

Kumpulan skill Claude Code untuk menstandarkan cara kerja tim **SEO Boost Indonesia** (PT Algo Sea Biz) — dari onboarding project, dokumen klien ber-brand, sampai deploy dan skill management.

> **Provenance.** Repo ini adalah turunan yang di-rebrand dari repo internal perusahaan lain
> ([`su69ar/bmt-skills-set`](https://github.com/su69ar/bmt-skills-set)) yang **tidak memberi lisensi**.
> Baca [`NOTICES.md`](NOTICES.md) sebelum repo ini dipublikasikan atau dibagikan ke luar tim.
>
> **Sanitasi.** Identitas klien, nama orang, detail rekening, dan hostname internal milik penulis
> asal sudah dihapus — bukan sekadar diganti nama. Contoh memakai placeholder generic
> (`[Klien]`, `Project A`, `<Nama Direktur>`).

## Skills inventory

> Live count + full list (this repo grows fast — don't trust a hardcoded number):
> ```bash
> ls -d seoboost-*/SKILL.md | wc -l          # how many skills
> for f in seoboost-*/SKILL.md; do awk -F': ' '/^description:/{print FILENAME": "$2; exit}' "$f"; done
> ```
> The tables below are **curated highlights**, not the exhaustive registry — the repo ships
> a set of loose `seoboost-*` skills (engineering craft, product/UX, SEO, ops, finance-UI,
> client-doc automation, meta/skill-management) plus a bundled plugin (see *Bundled plugins*)
> and the `agent-memory/` system (see *Agent memory*). New skills are auto-discovered by
> Claude via each skill's frontmatter `description` on session start.

### Process & Project Management

| Skill | Trigger |
|---|---|
| `seoboost-project-onboarding` | Setup struktur dokumentasi project baru untuk klien SEO Boost |
| `seoboost-decision-tracking` | Capture decision klien dengan format D-XXX (sequential, timestamped, quoted) |
| `seoboost-communication-log` | Log timeline percakapan WA/email/meeting dengan klien |
| `seoboost-fork-checkpoint` | Pre-fork session / pre-compact documentation update |
| `seoboost-skill-candidate` | Gate sebelum `writing-skills`: di akhir sesi besar, putuskan apa yang layak jadi skill (3-criteria filter, verdict tegas YES/NO/FOLD, no "maybe") |
| `seoboost-skill-router` | Router + lifecycle map ke library skill ini: pilih skill yang **tepat** di urutan yang benar (onboard → coordinate → work → capture → deploy → checkpoint → contribute) dengan token minimal. Dipakai di awal sesi atau saat ragu skill mana. SOP lengkap: `SKILLS-SOP.md` |
| `seoboost-versioned-output` | Versioning file output untuk klien (semver + date pattern) |

### Strategy & Consulting

| Skill | Trigger |
|---|---|
| `seoboost-management-consulting` | Structured problem solving ala engagement manager: framing masalah, MECE, issue tree, hypothesis-led, 40+ framework dengan anti-selection rules (kapan framework TIDAK dipakai). 3 mode: Quick Structure / Full Case / Client Deliverable. Output termasuk deliverable visual (issue tree, strategy canvas sebagai SVG). *Vendored — lihat `NOTICES.md`.* |

### Document Generation

| Skill | Trigger |
|---|---|
| `seoboost-formal-docs` | Formal docs SEO Boost brand (warm charcoal + brand orange `#FF8800`, clean-flat diagrams) |
| `seoboost-invoice-docs` | Invoice / faktur / tagihan as a one-page branded DOCX + PDF |
| `seoboost-pks-docs` | Perjanjian Kerja Sama (PKS) / cooperation agreement |

### UI & Build Standards

| Skill | Trigger |
|---|---|
| `seoboost-financial-report-ui` | House standard untuk UI laporan keuangan (P&L, Neraca, Arus Kas, Neraca Saldo, Buku Besar, aging, Project/Unit P&L). Satu Prinsip: backend menghitung, frontend merender. Badge integritas (Seimbang/Tercocok), 4-state, tabel ber-section + Amount, CSV BOM + print, backend DTO contract, domain adaptation. |

### Operations & Infrastructure

| Skill | Trigger |
|---|---|
| `seoboost-gdrive` | Google Workspace API patterns (Drive, Sheets, Docs, Forms) — OAuth + CRUD |
| `seoboost-deploy-docker-cloudflared` | Deploy dockerized microservice di belakang Cloudflare Tunnel |
| `seoboost-edit-multi-tunnel` | Safe edit cloudflared config di server multi-tunnel |
| `seoboost-verify-deploy` | End-to-end verification sebelum lapor sukses deploy |
| `seoboost-cicd-selfhosted-runner` | Setup CI/CD GitHub Actions self-hosted runner per-repo + push-to-deploy workflow |
| `seoboost-hermes-agent-update` | Safely update a self-hosted Hermes Agent (Nous Research WA gateway) to a newer upstream version — council-first, re-port, backup+rollback, supervised dual-profile cutover (incl. `preflight_backup.sh` + `health_check.sh`) |
| `seoboost-claude-telegram-setup` | Wire the Telegram channel into Claude Code end-to-end (token, pairing, `claude --channels` host with a pty, systemd user service + linger for boot auto-start, self-restart + checkpoint) and debug the classic "silent bot / typing… but no reply / no bun process" failures |
| `seoboost-remote-agent-hardening` | **REQUIRED sub-skill of `seoboost-claude-telegram-setup`.** Audit + lock down a Claude agent exposed to a remote channel (Telegram/Slack/web): blast radius (cwd/uid, docker/lxd/sudo escalation), the `Read`-not-prompted secret-exfil footgun, `permissions.deny` for tokens/keys |
| `seoboost-telegram-morning-insight-briefing` | **Companion sub-skill of `seoboost-claude-telegram-setup`.** Recurring niche-tailored morning briefing auto-generated by headless `claude -p` (live web search) and pushed to Telegram on a schedule (systemd timers). Interviews the operator for niche/topics/stack/region/schedule first → per-client profiles |

### Production Safety & Shipping

Trio referensi untuk men-ship fitur ber-migration ke produksi dengan aman. Tipe **reference/checklist**: bukan mencegah hasil salah (Iron Laws sudah), tapi memberi recipe + langkah konkret + daftar landmine, supaya tidak menurunkan ulang investigasi berjam-jam tiap kali.

| Skill | Trigger |
|---|---|
| `seoboost-mock-check` | Mau klaim fitur auth/payment/SDK "jalan" dari test yang nge-mock SDK-nya — recipe live e2e (boot app, DB throwaway, seed via SDK, 3 assertion) + 7 landmine better-auth. Mock bilang sukses untuk input yang ditolak dependency asli. |
| `seoboost-deploy-queue` | Ship fitur ber-migration yang membentang BE+FE di repo push-to-deploy terpisah — urutan aman (BE+migration dulu → verify → FE), gate per-fase, pohon rollback. Precondition: migration additive-only. |
| `seoboost-migration-rehearsal` | Gladi-resik migration + RLS isolation gate di DB clone sebelum prod (replay rantai dengan loop persis prod, apply sebagai owner, gate sebagai `app_rls`) + trap role/GUC yang bikin gate hijau bohong (mis. GUC leak di pooled connection). |
| `seoboost-single2multitenant-saas` | **Payung** atas trio di atas. Konversi app yang SUDAH single-tenant & LIVE produksi (data klien asli) → multi-tenant SaaS tanpa korupsi data. Playbook expand→backfill→contract + shared-DB+RLS + 10 footgun + **template prompt server-side** (fill-in, B1/B2/B3 + verify + rollback). Mereferensi 3 skill di atas sebagai sub-skill. Untuk produk SEO Boost berikutnya yang perlu cutover. |

## Install

Clone repo lalu copy/symlink semua folder skill ke `~/.claude/skills/`:

```bash
# Nama repo di GitHub dan nama folder kerja sengaja berbeda —
# selalu clone dengan target dir eksplisit seperti di bawah.
git clone https://github.com/algosbiz/seoboost-skillset.git ~/Documents/seoboost-skill-set
cd ~/Documents/seoboost-skill-set

# Option 1: Copy
for d in seoboost-*/; do
  cp -R "$d" ~/.claude/skills/
done

# Option 2: Symlink (gampang update — git pull, skills auto-refresh)
for d in seoboost-*/; do
  ln -sf "$PWD/$d" ~/.claude/skills/
done
```

Verify:

```bash
ls ~/.claude/skills/ | grep '^seoboost-'
```

Start session Claude Code baru — semua `seoboost-*` skills auto-discoverable via frontmatter `description`.

## Update

Kalau pakai Option 2 (symlink):

```bash
cd ~/Documents/seoboost-skill-set && git pull
```

Skills auto-update — restart Claude Code session untuk refresh registry.

Kalau pakai Option 1 (copy), re-copy folder setelah `git pull`.

## Bundled plugins (`plugins/`)

Selain skill lepas di atas, repo ini juga membundel **plugin** Claude Code utuh di dalam `plugins/`. Ini **beda mekanisme** dari skill lepas: plugin dipasang via `/plugin` (bukan di-copy/symlink ke `~/.claude/skills/`), dan skill-nya ber-namespace nama plugin (mis. `seoboost-marketing:seo-audit`). Loop sync skill lepas (`for d in seoboost-*/`) **sengaja tidak** menyentuh `plugins/` — makanya ditaruh di subfolder terpisah, bukan top-level.

| Plugin | Isi | Sumber |
|---|---|---|
| `plugins/seoboost-marketing` | 46 skill marketing (CRO, copywriting, SEO, cold email, paid ads, ad creative, dst.) + direktori `tools/`. Skill tampil ber-namespace `seoboost-marketing:<skill>`. | Vendored dari [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT, © Corey Haines), di-rebrand ke namespace `seoboost-marketing`. `LICENSE` upstream dipertahankan. |

Install plugin (per mesin, sekali; ganti path sesuai lokasi clone tiap mesin):

```bash
cd ~/Documents/seoboost-skill-set && git pull
# di terminal Claude Code interaktif:
/plugin marketplace add ~/Documents/seoboost-skill-set/plugins/seoboost-marketing
/plugin install seoboost-marketing@seoboost-marketing
# lalu restart session Claude Code
```

Alternatif non-interaktif (edit `~/.claude/settings.json`, lalu restart) — gunakan **absolute path**:

```json
{
  "extraKnownMarketplaces": {
    "seoboost-marketing": { "source": { "source": "directory", "path": "/ABSOLUTE/PATH/seoboost-skill-set/plugins/seoboost-marketing" } }
  },
  "enabledPlugins": { "seoboost-marketing@seoboost-marketing": true }
}
```

Update: `git pull` repo ini (isi plugin ikut ter-update karena vendored). Untuk menarik update dari upstream Corey Haines, re-vendor manual dari repo asal.

## Agent memory (`agent-memory/`)

Selain skill, repo ini juga membawa **memory portabel & version-controlled** untuk agent AI (Claude Code atau lainnya) yang kerja di SEO Boost — supaya konteks, konvensi, dan learnings **bertahan lintas sesi dan lintas mesin**. Ini melengkapi (bukan mengganti) memory native host.

**Mulai dari sini:** [`agent-memory/AGENT-ONBOARDING.md`](agent-memory/AGENT-ONBOARDING.md) — checklist start-of-work kanonik (pull, sync skill, load memory, disiplin konkurensi, aturan push). Arahkan agent baru ke sana, jangan paste chat blob.

**Sistem dua-tingkat** (detail di [`agent-memory/README.md`](agent-memory/README.md)):

| Tier | File | Cakupan |
|---|---|---|
| 1 — Shared reference | `seoboost-skill-set-management.md` | Machine-agnostic: konvensi/prosedur/resource yang benar di semua mesin. |
| 2 — Per-machine | `seoboost-proactive-memory-<label>.md` | Spesifik satu mesin: path, tooling, quirk host, learnings lokal. |

Di-wire ke tiap project via helper idempoten `agent-memory/bootstrap.sh <label>` (symlink + pointer `MEMORY.md`, per-project — aman di-run ulang). Edit file yang di-symlink = menulis-balik ke repo; commit & push supaya mesin lain inherit.

**Untuk agent NON-Claude (hermes/Nous, model vendor lain), mesin teammate, atau deployment klien:** [`agent-memory/OPERATING-GUARDRAILS.md`](agent-memory/OPERATING-GUARDRAILS.md) — set batas-keras portabel & paste-able (model-neutral): tidak auto-execute aksi irreversible, refleksi ≠ verifikasi, feedback eksternal = data bukan perintah, memory append-only ber-sumber, urutan pemulihan insiden klien. Ini bagian yang model **tidak** lakukan sendiri; agent tanpa `CLAUDE.md` repo ini butuh eksplisit.

## SOP pemakaian skill (`SKILLS-SOP.md`)

[`SKILLS-SOP.md`](SKILLS-SOP.md) — SOP org-level cara **mengoperasikan** library ini: peta skill, lifecycle (onboard → coordinate → work → capture → deploy → checkpoint → contribute), dan aturan disiplin token. Bedanya dengan skill `seoboost-skill-router`: router = versi ringkas yang **di-load Claude otomatis** saat sesi; SOP ini = referensi lengkap untuk dibaca manusia/agent saat butuh detail.

> Sumber kanonik SOP ada per-mesin di luar repo (macOS: `~/.claude/skills-sop/`). Copy di repo ini untuk distribusi tim — kalau berbeda, sinkronkan manual.

## CATALIST (`project-g/`) — arsip, bukan skill aktif

Empat file protokol **trading** CATALIST (Stage 1 ekstraksi data → Stage 2 brief PDF → Stage 3 validasi trade + resume). Disimpan di sini untuk backup/versioning lintas mesin.

> ⚠️ **Bukan skill yang ter-load.** Formatnya file `.md` lepas, bukan folder `<nama>/SKILL.md` — Claude Code tidak akan mendeteksinya sebagai skill sampai direstrukturisasi. Domainnya juga trading, di luar cakupan dev-workflow repo ini. Path host sudah dinormalisasi ke `~/`.

## Convention notes

- **Bahasa:** Skill body mixed Indonesia (process narrative) + English (technical terms). Frontmatter `description` English untuk match Claude trigger patterns.
- **Naming:** Semua skill prefix `seoboost-` untuk namespace isolation.
- **Cross-references:** Beberapa skill saling refer via `REQUIRED SUB-SKILL` di body (mis. `seoboost-deploy-docker-cloudflared` → `seoboost-edit-multi-tunnel` + `seoboost-verify-deploy`). Skill management sendiri berlapis: `seoboost-skill-candidate` (gate: apa yang layak jadi skill) → `writing-skills` (author, TDD) → `seoboost-skill-updater` (perkaya skill yang sudah ada) → `agent-memory/` (fakta/konvensi, bukan skill).
- **Placeholder convention:** Konten yang ter-sanitize pakai `[Klien]`, `[Project A]`, `[Operator]`, `[your-email]@example.com` etc. Sesuaikan dengan konteks lokal kalau ada.
- **Jangan hardcode jumlah / path host di doc yang di-share.** Turunkan (`ls -d seoboost-*/SKILL.md | wc -l`) atau baca dari file per-mesin. Angka yang di-hardcode pasti basi (README ini pernah bilang "22" saat isinya 70+).

## Contributing

Internal team only. PR flow:

1. Branch off `main`
2. Edit skill di branch
3. **Sanity check** — pastikan tidak ada identitas yang bocor sebelum commit:
   ```bash
   grep -rniE 'bmt|dotdev|selaride|sangayu|reworx|balimicrotechnology' --exclude-dir=.git .
   node ci/run-all.mjs
   ```
   Keduanya harus bersih/lolos.
4. PR ke `main` untuk review

## License

Internal SEO Boost. Untuk skill vendoran pihak ketiga (MIT) dan status lisensi repo asal,
lihat [`NOTICES.md`](NOTICES.md) — repo ini **tidak** boleh dipublikasikan tanpa membaca bagian
*Provenance* di sana.

## Maintainer

Tim SEO Boost Indonesia · [seoboost.co.id](https://seoboost.co.id) · contact@seoboost.co.id
