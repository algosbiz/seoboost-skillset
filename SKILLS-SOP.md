# SKILLS SOP — cara pakai skill SEO Boost dengan efisien (org-level)

> Dibuat 2026-07-13 (sesi Opus), dipindah ke SEO Boost 2026-07-13 agar tidak tercampur satu project.
> **Cakupan: org-wide** (semua project SEO Boost/SEO Boost). Tujuan: efisiensi kerja + hemat token +
> hasil maksimal saat memakai ~78 skill yang di-provision Head of IT.
>
> Versi ringkas cross-project = skill `seoboost-skill-router`. File INI = versi lengkap + SOP lifecycle.
> Aturan spesifik per-project tetap tinggal di `agent-documentation/` masing-masing repo.

---

## 0. Prinsip dasar — kenapa skill hemat token (baca dulu)

Skill itu **progressive disclosure**:

1. **Deskripsi** tiap skill sudah otomatis ada di context tiap sesi (satu baris). Kamu **tidak
   perlu** membacanya manual atau `cat` SKILL.md untuk tahu ada skill itu.
2. **Isi (body)** skill baru ke-load **saat di-invoke** lewat tool `Skill`.

Konsekuensi praktis (= aturan hemat token):

| Lakukan | Jangan |
|---|---|
| Panggil skill **by name** (`/seoboost-…` atau invoke Skill) lalu ikuti | Menjelaskan ulang prosedur yang sudah ada di skill |
| Satu skill = satu pekerjaan; invoke saat trigger cocok | Invoke skill untuk task trivial (< aturan "Skip" tiap skill) |
| Delegasi baca banyak file ke agent **Explore/Plan**, simpan kesimpulan | `Read` file ratusan-KB demi 1 fungsi |
| Test **targeted** dulu (mis. `unittest tests.test_<modul>`) | Whole-suite tiap iterasi (hanya sebelum merge) |
| Hormati aturan RAM/paralel tiap project (kalau ada) | Biarkan preview/dev-server nganggur hidup |

> Kalau sebuah project punya dokumen paralel/RAM/zona LIVE-CRITICAL sendiri (contoh: seoboost-terminal
> `10-PARALLEL-SESSIONS.md`), **itu yang menang** untuk project tsb.

### Auto-reminder (hook global — aktif sejak 2026-07-13)

Dua hook di `~/.claude/settings.json` (global, semua project) menegakkan SOP ini otomatis:
- **`UserPromptSubmit`** → tiap prompt user, meng-inject pengingat ke agent: cek relevansi skill
  & sebut 1 baris di awal jawaban kalau relevan (user sering lupa panggil skill), plus nudge
  `seoboost-fork-checkpoint` kalau context ≈80%+. `suppressOutput` = tidak mengotori transcript user.
- **`PreCompact`** → tepat sebelum compact, `systemMessage` mengingatkan checkpoint agar state tersimpan.
Tuning/nonaktif: edit `~/.claude/settings.json` (key `hooks`) atau buka `/hooks`. Backup awal:
`~/.claude/settings.json.bak-before-hooks`.

---

## 1. Peta skill — kapan pakai apa (semua skill `seoboost-*` + platform)

> Jumlahnya sengaja tidak ditulis di sini — angka yang di-hardcode selalu basi. Hitung sendiri:
> `ls -d ~/.claude/seoboost-skill-set/seoboost-*/ | wc -l`

Pilih dari kolom "picu" → invoke skill di kolom kanan. Kalau ragu antara dua, pilih yang
paling **sempit** ke task.

### A. Sesi & orkestrasi multi-agent  *(inti alur harian)*
| Butuh | Skill |
|---|---|
| Task besar, mau dikerjakan end-to-end sampai tuntas (kontrak DoD → fan-out agent → QC independen → laporan awam) | `seoboost-workplan` |
| Mulai project SEO Boost baru, setup skeleton dokumentasi | `seoboost-project-onboarding` |
| Refresh/bangun konteks ekosistem SEO Boost, klien, partner sebelum/di tengah kerja (baca, bukan tulis) | `seoboost-context-enrichment` |
| Mau fork sesi / `/compact` / tutup hari — simpan state | `seoboost-fork-checkpoint` |
| Sprint selesai ("tutup sprint", "sprint X selesai") — audit fresh + nama tahap + format laporan wajib | `seoboost-sprint-close` |
| >1 sesi Claude di project yang sama, hindari tabrakan | `seoboost-agent-coordination` |
| Mulai koordinasi LIVE dua agent lintas sesi (human relay) | `seoboost-agent-coordination` |
| Hasil kerja bisa dipakai/replikasi project SEO Boost lain | `seoboost-cross-project-reuse` |

### B. Capture klien / audit trail  *(continuous — jangan tunda ke boundary)*
| Butuh | Skill |
|---|---|
| Klien approve/reject/instruksi (WA/email/meeting) | `seoboost-decision-tracking` → `03-DECISIONS-LOG.md` |
| Paste chat/timeline percakapan klien | `seoboost-communication-log` → `06-COMMUNICATION-LOG.md` |
| Susun laporan status KELUAR ke klien (WA singkat / email formal) | `seoboost-laporan-klien` → gerbang `seoboost-bahasa-jernih` + `seoboost-tulis-indonesia` → tercatat ke `06-COMMUNICATION-LOG.md` |

### C. Meta — lifecycle skill  *(saat wrap-up)*
| Butuh | Skill |
|---|---|
| "Ada yang layak jadi skill?" — GATE decide whether/which | `seoboost-skill-candidate` |
| Panen pelajaran sesi/sprint (entri 09, koreksi operator, insiden selesai, pola berhasil) → klasifikasi → rute | `seoboost-skill-evolution` (dispatcher di atas updater/candidate; perubahan canon hanya proposal untuk operator) |
| Update/perbaiki skill yang sudah ada (edit konten satu skill) | `seoboost-skill-updater` |
| Audit ekosistem skill (versi outdated, drift router, deprecated, MCP updates) | `seoboost-skill-ecosystem-audit` |
| Codify knowledge dev sebuah project → sub-skill | `seoboost-development-set` |
| Kerja di project spesifik (pola reusable) | `seoboost-devset-<project>` / `-project-e` / `-agent-stack` |
| Pilih skill router/lifecycle cepat (portable) | `seoboost-skill-router` |

Proposal konvensi hasil panen antre sebagai file di `proposals/` (repo ini) sampai operator memutuskan — format dan aturan di `proposals/README.md`.

### D. Craft rekayasa — arsitektur & kualitas kode
`seoboost-working-with-legacy-code` (katalog teknik Feathers). Ringkasan buku arsitektur/kualitas
kode yang lama (clean-architecture, clean-code, DDD, DDIA, system-design, refactoring-patterns,
software-design-philosophy, pragmatic-programmer, team-topologies, release-it) dihapus
28 Agu 2026 hasil audit — tergantikan skill natif `fullstack-dev-skills:architecture-designer`,
`fullstack-dev-skills:cloud-architect`, expert per-stack (postgres-pro dst.), plus
`code-review`/`simplify` bawaan harness.
Plus platform: `repomix` (CLI, `npx repomix@latest` — pack seluruh repo jadi 1 file
AI-friendly, pasangkan dengan `seoboost-working-with-legacy-code` saat onboarding ke
codebase asing/besar) · `serena` (MCP semantic code retrieval/editing via LSP —
pasangkan dengan `simplify`/`code-review` bawaan harness untuk refactor presisi lintas-file;
BEDA dari repomix — butuh MCP server tersambung dulu, bukan sekadar CLI) ·
`graphify` (turn codebase + docs + SQL schemas + configs + PDFs jadi queryable
knowledge graph — local deterministic AST parsing, no vector store; ketik
`/graphify .` di project. Best-fit untuk repeated cross-file question answering di
codebase besar/legacy; complementary dengan `repomix` — repomix = one-shot pack,
graphify = persistent queryable graph).

**Token discipline untuk sesi panjang / tool output berat:** `context-mode` MCP
(sudah terpasang default, sandbox raw output tetap di luar conversation) plus
`headroom` (session wrapper, `headroom wrap claude` dari terminal — 60-95% token
reduction pada JSON, 15-20% pada coding output; complementary bukan pengganti
context-mode).

### E. Deploy / DevOps / infra
| Butuh | Skill |
|---|---|
| Rilis FE+BE+migration terkopel — urutan aman | `seoboost-deploy-queue` |
| Deploy dockerized service di balik Cloudflare Tunnel | `seoboost-deploy-docker-cloudflared` |
| Verifikasi "benar-benar ke-deploy" pasca push | `seoboost-verify-deploy` |
| Setup CI/CD self-hosted runner GitHub Actions | `seoboost-cicd-selfhosted-runner` |
| Latihan migrasi data sebelum eksekusi | `seoboost-migration-rehearsal` |
| Docker build gagal karena peer-dep React | `seoboost-react-peer-dep-docker-trap` |
| Hardening agent remote / multi-tunnel edit | `seoboost-remote-agent-hardening` · `seoboost-edit-multi-tunnel` |
| Versioning app (semver, footer, version.json) | `seoboost-app-version-stamp` · `seoboost-pwa-update-prompt` |
| Single-tenant → multi-tenant SaaS | `seoboost-single2multitenant-saas` |
| Cek mock/stub yang bohong "hijau" | `seoboost-mock-check` |
| Proxy foto MinIO | `seoboost-minio-proxy-photo` |

### F. Produk & discovery
`seoboost-mom-test` (interview non-leading) · `seoboost-lean-ux`. Ringkasan framework yang lain
(continuous-discovery, design-sprint, inspired-product, jobs-to-be-done) dihapus 28 Agu 2026
hasil audit — pakai `superpowers:brainstorming` + pengetahuan model untuk kerangka umumnya.

### G. Desain & frontend

> **Prasyarat per mesin (ditetapkan 2026-08-07).** 25 skill di bagian ini EKSTERNAL,
> berasal dari registry skills.sh, bukan dari repo ini. `git pull` + `sync-skills.sh`
> tidak akan pernah memasangnya, termasuk `impeccable` yang berstatus wajib. Jalankan
> `bash install-design-stack.sh --check` untuk melihat yang kurang, lalu tanpa `--check`
> untuk memasang. Ditemukan lewat laporan mesin `n8n-seoboost` yang router-nya dead-end
> karena hanya punya isi repo.

**Router entry:** untuk semua UI/UX/frontend work → invoke `seoboost-uiux-design-router` **first**.
Router mendefinisikan mandatory-impeccable rule (`impeccable` WAJIB pada setiap UI touchpoint;
di `~/.claude/CLAUDE.md` dinomori Iron Law #7, tapi jangan rujuk lewat nomor karena system prompt
operator memakai nomor 7 untuk aturan berbeda) + 4-tier stack (discipline → context →
execution → specific → quality gate). Detail per skill di router.

**Skill inventory (dirouting oleh `seoboost-uiux-design-router`):**

`frontend-design` (natif Anthropic — arah visual umum; menggantikan `seoboost-frontend-design`
yang dihapus 29 Agu 2026) · `seoboost-design-dna` (reverse-engineer referensi
visual/screenshot/URL jadi design-token terstruktur — jalankan SEBELUM `frontend-design`
kalau ada referensi konkret) · `seoboost-top-design` (Awwwards-level,
immersive/motion) · `seoboost-ux-heuristics` · `seoboost-ios-hig-design` ·
`seoboost-microinteractions` · `seoboost-web-sections` · `seoboost-web-typography` · `seoboost-web-asset-generator` ·
`seoboost-financial-report-ui`. Plus platform: `ui-ux-pro-max`, `dataviz`.
(`seoboost-refactoring-ui`, `seoboost-design-everyday-things`, `seoboost-high-perf-browser` dihapus
28 Agu 2026 hasil audit — tergantikan `impeccable` + `web-design-guidelines` +
`high-end-visual-design`.)

**Taste-skill bundle (Leonxlnx, 13 skills, ditetapkan 2026-08-07 — anti-slop premium frontends):**
`design-taste-frontend` (v2 default, landing/portfolio/redesign) · `design-taste-frontend-v1`
(v1 preserved untuk backward-compat) · `minimalist-ui` (editorial monochrome) ·
`industrial-brutalist-ui` (Swiss + military terminal, rigid grids) · `high-end-visual-design`
(agency-grade "expensive-feeling") · `gpt-taste` (editorial GSAP-heavy, AIDA structure) ·
`redesign-existing-projects` (audit-first upgrade) · `image-to-code` (visual-first: generate
image → analyze → implement) · `imagegen-frontend-web` (per-section web design references) ·
`imagegen-frontend-mobile` (app-native mobile screens dgn phone mockup) · `brandkit` (brand
guidelines board, logo system) · `stitch-design-taste` (generate `DESIGN.md` untuk Google
Stitch) · `full-output-enforcement` (bans truncation/placeholder). Sumber: `Leonxlnx/taste-skill`
(MIT). Komplementer dengan `impeccable` (discipline) dan Emil Kowalski (polish taste).

**Component generation MCP:** `21st` MCP (21st.dev registry, HTTP transport) — invoke saat butuh
production-quality React component tanpa hand-roll.

**Animasi — GSAP (official GreenSock skills, ditetapkan 2026-08-07 menggantikan `seoboost-gsap-*` user-authored):**
`gsap-core` (API dasar to/from/fromTo, easing, `matchMedia`/reduced-motion) · `gsap-timeline`
(sequencing/choreography) · `gsap-scrolltrigger` (scroll-linked, pinning, parallax) · `gsap-plugins`
(ScrollSmoother, Flip, Draggable, SplitText, dll.) · `gsap-performance` (60fps, hindari layout thrash).
Pilih paling sempit per task. Sumber: `greensock/gsap-skills` (40K+ installs per skill).

**Animasi taste & motion decisions (Emil Kowalski, ditetapkan 2026-08-07):** `emil-design-eng` (UI
polish philosophy, invisible details) · `animation-vocabulary` (naming lookup: "apa nama efek…") ·
`apple-design` (Apple HIG motion, fluid physics, spring, gestures) · `pick-ui-library` (cegah
hand-roll toast/drawer atau install abandoned package). Sumber: `emilkowalski/skills` (26.4K stars,
MIT). Komplementer dengan `impeccable` (discipline) dan `gsap-*` (implementation).

**3D/immersive:** `seoboost-threejs-pointer` — pointer saja (TIDAK divendor, upstream tanpa lisensi
eksplisit), install on-demand `npx skills add CloudAI-X/threejs-skills`; pasangkan dengan
`seoboost-top-design` untuk arah motion/immersive keseluruhan.

### H. Dokumen & output
| Butuh | Skill |
|---|---|
| Dok formal SEO Boost apa pun (tech, PRD, ADR, proposal, MoM) — oranye `#FF8800` + charcoal | `seoboost-formal-docs` |
| Tagihan / faktur ke klien (satu halaman, DOCX + PDF) | `seoboost-invoice-docs` |
| Perjanjian Kerja Sama / kontrak | `seoboost-pks-docs` |
| **Dokumen keluar butuh NOMOR SURAT (kontrak, NDA, invoice, surat tugas/penugasan, penawaran, berita acara, MoU)** — WAJIB | `seoboost-surat-register` (register company-wide, jangan karang nomor) |
| Output ber-versi (jangan overwrite) | `seoboost-versioned-output` |
| Upload/kelola Google Drive | `seoboost-gdrive` |
| **Mutu Bahasa Indonesia** (semua keluaran yang dibaca orang lain) | `seoboost-tulis-indonesia` |
| **Jarak antara penulis dan pembaca** (jargon penyusun, tic retoris, klaim tanpa pijakan, judul yang membantah isinya) | `seoboost-bahasa-jernih` |

> `seoboost-bahasa-jernih` **melengkapi** `seoboost-tulis-indonesia`, tidak menggantikannya. Yang itu
> mengurus ragam, kalke, dan ejaan baku — persoalan yang dapat dinilai dari kalimatnya sendiri.
> Yang ini mengurus persoalan yang hanya terlihat bila kamu tahu siapa pembacanya: istilah yang
> jelas bagi penyusunnya tetapi tidak bagi penerimanya, judul yang bertahan setelah premisnya
> dicabut, klaim yang bersandar pada ringkasan sendiri, dan kalimat yang menempatkan SEO Boost sebagai
> pihak yang berwenang. Ia juga mengatur balasan chat, bukan hanya dokumen. Wajib di seluruh
> keluaran Bahasa Indonesia sejak 26 Agustus 2026.

> `seoboost-tulis-indonesia` adalah **lapisan bahasa**, bukan lapisan wujud. Dipakai bersama
> `seoboost-formal-docs`, bukan menggantikannya: skill dokumen mengurus
> merek dan tata letak, skill ini mengurus ragam, diksi, dan kejelasan kalimat. Cakupannya
> lebih luas daripada dokumen — salinan situs web, teks antarmuka, email klien, dan caption
> ikut di dalamnya. Punya pemeriksa otomatis; Tingkat 1 harus 0 sebelum diserahkan.
> **Balasan chat ke operator sendiri — direvisi 16 Agu 2026.** Sebelumnya dikecualikan penuh. Sekarang:
> alur kerja penuh dan pemeriksa otomatis **tidak** dijalankan untuk balasan chat (itu untuk teks
> yang diserahkan), tetapi **mutu dasarnya tetap berlaku** — nol kalke, empat aturan kejelasan,
> dan ejaan baku. Rinciannya kini di `seoboost-bahasa-jernih` (bagian balasan chat). Kedua berkas
> SYSTEM-PROMPT dihapus dari repo 28 Agu 2026 — aturan bahasanya diserap ke `seoboost-bahasa-jernih`;
> jejak lengkapnya ada di riwayat git.
>
> **Pesan WhatsApp/email ke klien atau mitra (grup maupun japri) BUKAN chat** — itu teks yang
> diserahkan, jadi berlaku penuh: `seoboost-tulis-indonesia` + konvensi penulisan SEO Boost. Lihat
> `seoboost-bahasa-jernih` (bagian draf WA/email dan pesan ke klien/mitra).
>
> **Presedensi istilah (ditetapkan 16 Agu 2026).** Dua otoritas bahasa dibuat selang sehari dan
> saling bertabrakan pada pilihan kata: `seoboost-formal-docs` → *Document language* menahan istilah
> Inggris (GAP, checklist, threshold, stakeholder, decision point, revenue share, dispute),
> sedangkan `seoboost-tulis-indonesia` secara bawaan menaruh kata Indonesia sebagai kata utama.
> Aturannya:
>
> - **Dokumen project yang dibaca pihak klien → tabel `seoboost-formal-docs` menang.** Tabel itu
>   dikalibrasi ke tulisan teknis pihak itu sendiri, sinyal yang lebih kuat daripada aturan gaya umum.
> - **Selain itu → `seoboost-tulis-indonesia` menang, selalu.** Kalke, kejelasan, dan ejaan baku
>   tidak pernah kalah oleh tabel mana pun.
>
> Catatan penegakan: `scripts/periksa.py` hanya menegakkan `seoboost-tulis-indonesia`. Konvensi
> `seoboost-formal-docs` (tabel istilah, larangan kata "klien", kalimat kosmetik, framing kepemilikan)
> **tidak terdeteksi otomatis** — sudah diuji, hasilnya nol temuan. Penegakannya masih manusia.

### I. SEO (skill natif skills.sh — urut)
`seo-project-setup` → `keyword-research` → `keyword-clustering` →
`competitor-analysis` / `competitive-landscape` → `link-prospecting`; coaching: `seo-coach`.
(Seri `seoboost-open-seo-*` dihapus 28 Agu 2026 hasil audit — duplikat 1:1 skill natif tersebut.)

### J. Riset & radar
`seoboost-deep-research` (riset multi-perspektif ber-sitasi) · `seoboost-tech-radar` (verdict adopsi teknologi).

### K. Comms infra / automasi
`seoboost-claude-telegram-setup` · `seoboost-telegram-morning-insight-briefing` ·
`seoboost-hermes-agent-update` (upgrade/tambah profil/config Hermes) ·
`seoboost-hermes-plugin-dispatch` (menulis slash command Hermes; jembatan chat → Claude Code) ·
`seoboost-ig-summarizer`.

### L. Operasional klien spesifik (runbook, bukan pola reusable lintas-project)

Belum ada. Runbook klien ditulis saat kliennya ada — lewat gate `seoboost-development-set`,
dengan slug `seoboost-devset-<project>`. Jangan menaruh nama klien di skill yang reusable.

### M. Strategi & konsultasi
`seoboost-management-consulting` — problem solving & analisis strategis pakai framework konsulting
profesional (issue tree, strategy canvas), termasuk deliverable visual (diagram SVG). Trigger:
pertanyaan strategi, due diligence, diagnosis organisasi, rekomendasi terstruktur.

### Platform skills (bukan `seoboost-*`, tetap dipakai)
`verify` / `run` (jalankan & buktikan perubahan) · `code-review` / `simplify` / `security-review`
(review diff) · `deep-research` · `anthropic-skills:*` (docx/pptx/xlsx/pdf, skill-creator,
writing-skills) · `finance:*` · `data:*` · `seoboost-marketing:*` · `product-management:*` ·
`ui-ux-pro-max` (design intel, lihat section G) · `dataviz` (chart/visualisasi) ·
`repomix` (CLI pack-repo-jadi-1-file, lihat section D) · `serena` (MCP semantic
code retrieval/editing, lihat section D — perlu MCP server tersambung).

---

## 2. SOP lifecycle — alur satu sesi kerja

Tujuh fase. Tidak semua fase muncul tiap sesi; ambil yang relevan.

### Fase A — ONBOARDING (buka sesi)
**Picu:** sesi baru, "lanjut project", "resume".
1. Baca `agent-documentation/` project itu (biasanya `00-START-HERE.md` → `05-CURRENT-STATE.md` → `08-HANDOFF-CHECKLIST.md`).
2. Kalau ini **project SEO Boost baru** (belum ada `agent-documentation/`): invoke **`seoboost-project-onboarding`**.
3. Kalau project pakai **kerja paralel per-section**: baca dokumen paralelnya + prompt sesi-mu.
4. **DoD:** kamu bisa jawab "apa selesai / apa berjalan / apa berikutnya" tanpa nanya.

### Fase B — KOORDINASI (kalau paralel)
**Picu:** ada/mungkin ada sesi lain di project yang sama; sebelum sentuh zona SHARED.
1. Invoke **`seoboost-agent-coordination`** — baca board, klaim pekerjaanmu, tulis heartbeat.
2. Koordinasi live dua-arah antar sesi/human-relay → **`seoboost-agent-coordination`**.
3. **Hormati zona LIVE-CRITICAL project** — jangan sentuh file produksi/rahasia tanpa arahan.
   (Contoh seoboost-terminal: `runner.py`, `core/journal.py`, `config/*.key`, `data/*`; merge ke `main` = deploy live → serahkan ke maintainer.)

### Fase C — KERJA (pilih skill domain)
**Picu:** eksekusi task. Pilih dari **peta §1** sesuai jenis kerja (arsitektur/kode/deploy/desain/SEO/riset/dok).
- **Task tidak selesai dalam satu balasan?** → bungkus dengan **`seoboost-workplan`**: tulis
  kontrak DoD + kriteria terima, tunggu approve sekali, lalu fan-out agent → QC oleh agent
  yang BUKAN penggarap → laporan bahasa awam. Workplan **memilih** skill domain di bawah ini,
  tidak menggantikannya.
- Butuh baca banyak file dulu? → agent **Explore** (kesimpulan, bukan dump).
- Butuh rancang strategi implementasi? → agent **Plan**.
- **DoD:** perubahan ter-verifikasi (skill `verify` / `run`), test targeted hijau.
- **Sprint selesai?** → **`seoboost-sprint-close`** — ritual Sprint Completion Reporting Convention (audit fresh kedua repo, live e2e, CI + Run ID, konsistensi dokumentasi, git bersih, nama tahap, format laporan). Di akhirnya memanggil `seoboost-skill-evolution` (panen) dan `seoboost-fork-checkpoint` bila sesi berakhir.

### Fase D — CAPTURE (continuous, jangan tunda)
**Picu:** fakta durable muncul **saat itu juga** — bukan nanti di boundary.
- Keputusan klien → **`seoboost-decision-tracking`** (format `D-XXX`, quote literal) → `03-DECISIONS-LOG.md`.
- Percakapan klien → **`seoboost-communication-log`** → `06-COMMUNICATION-LOG.md`.
- Laporan status keluar ke klien (rutin/milestone/blocker) → **`seoboost-laporan-klien`** — fakta dari ProjectDocs, gerbang bahasa wajib, lalu laporan terkirim dicatat ke `06-COMMUNICATION-LOG.md`.
- Blocker baru/resolved, pivot → update `05-CURRENT-STATE.md`.
- **Aturan audit SEO Boost:** JANGAN overwrite decision yang sudah di-log; append/version. Dedupe hanya untuk state yang masih berubah.

### Fase E — DEPLOY (kalau merilis)
**Picu:** ship ke produksi.
1. Rilis terkopel FE+BE+migration → **`seoboost-deploy-queue`** (urutan + gate).
2. Dockerized + Cloudflare → **`seoboost-deploy-docker-cloudflared`**.
3. Konfirmasi benar-benar live → **`seoboost-verify-deploy`**.
4. Kalau project auto-deploy dari `main` (contoh seoboost-terminal: UI live `:8765` disajikan dari `main`): merge = DEPLOY → serial, review, siap `git revert`.

### Fase F — CHECKPOINT / HANDOFF (tutup / fork)
**Picu:** "aku mau fork", "session panjang", "/compact", tutup hari, context penuh.
1. Invoke **`seoboost-fork-checkpoint`** — verifikasi `agent-documentation/` lengkap (bukan rekonstruksi dari ingatan).
2. Update `05-CURRENT-STATE.md` + `08-HANDOFF-CHECKLIST.md`; stempel "Last updated".
3. Bereskan resource dev (matikan preview/dev-server nganggur; `git worktree remove` kalau selesai).
4. **DoD:** agent fresh bisa rebuild konteks ~30 menit, zero halu.

### Fase G — KONTRIBUSI SKILL (wrap-up)
**Picu:** sesi besar selesai, fitur ship, bug sulit teratasi, "ada yang layak jadi skill?".
1. Invoke **`seoboost-skill-candidate`** — GATE 3-kriteria (repeatable · footgun mahal · bukan "call library X"). Default verdict **NO**.
2. Kalau LULUS gate → author via `writing-skills` (atau `seoboost-development-set` untuk devset project).
3. Update skill lama → **`seoboost-skill-updater`**. Konvensi project (bukan lintas-project) → CLAUDE.md, **bukan** skill.
4. Tumpukan pelajaran belum terproses (entri `09` tanpa marker panen, koreksi operator, insiden yang selesai) → **`seoboost-skill-evolution`** — klasifikasi lalu rute ke updater/candidate/proposal/agent-memory; jalan saat sprint close, setelah checkpoint, atau bulanan bersama `seoboost-skill-ecosystem-audit`.

---

## 3. Cheatsheet trigger → skill (tempel di dekat monitor)

```
buka sesi / project baru ........ baca 00-START-HERE  ·  seoboost-project-onboarding
task besar, garap sampai tuntas . seoboost-workplan  (kontrak → agent → QC → laporan awam)
butuh refresh konteks ekosistem/klien . seoboost-context-enrichment
paralel dengan agent lain ....... seoboost-agent-coordination  ·  seoboost-agent-coordination
klien decide sesuatu ............ seoboost-decision-tracking      → 03-DECISIONS-LOG.md
paste chat klien ................ seoboost-communication-log      → 06-COMMUNICATION-LOG.md
surat/dok butuh nomor surat ..... seoboost-surat-register  (WAJIB, jangan karang nomor)
mau fork / /compact / tutup ..... seoboost-fork-checkpoint
tutup sprint / sprint selesai ... seoboost-sprint-close    (audit fresh + nama tahap + laporan)
laporan status keluar ke klien .. seoboost-laporan-klien   (gerbang bahasa → log ke 06)
panen pelajaran sesi/sprint ..... seoboost-skill-evolution (rute ke updater/candidate/proposal)
mau rilis produksi .............. seoboost-deploy-queue → seoboost-verify-deploy
dok formal apa pun .............. seoboost-formal-docs
nulis apa pun dalam B. Indonesia  seoboost-tulis-indonesia  (dok, web, UI, email klien)
bahasanya "aneh"/"kaku"/kalke ... seoboost-tulis-indonesia  → scripts/periksa.py
riset mendalam .................. seoboost-deep-research   ·  adopsi teknologi: seoboost-tech-radar
"ada yang layak jadi skill?" .... seoboost-skill-candidate (gate) → writing-skills
buktikan perubahan jalan ........ verify  ·  run
review diff ..................... code-review  ·  simplify  ·  security-review
```

---

## 4. Anti-pattern (pemborosan yang harus dihindari)

- ❌ `cat`/`Read` SKILL.md untuk "cek ada skill apa" → deskripsinya **sudah** di context. Cukup invoke.
- ❌ Invoke 5 skill "biar lengkap" untuk 1 task kecil → pilih 1 yang paling sempit.
- ❌ Tunda semua capture ke `/compact` → ringkasan mem-paraphrase, quote/angka literal hilang. Capture **saat** fakta muncul.
- ❌ Whole-suite test tiap iterasi → targeted; whole-suite hanya sebelum merge.
- ❌ Abaikan aturan RAM/paralel project → resource jebol / clobber antar-sesi.
- ❌ Merge/deploy sendiri tanpa koordinasi di project yang auto-deploy dari `main`.

---

*Maintainer: sesi Opus + operator. Home: `~/Documents/SEO Boost/skills-sop/`. Update via
`seoboost-skill-updater`-style discipline saat skill baru ditambah Head of IT atau alur berubah.
Cross-ref: skill `seoboost-skill-router`; aturan per-project di `agent-documentation/` repo masing-masing.*
