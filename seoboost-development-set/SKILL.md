---
name: seoboost-development-set
description: Use when work on a CLIENT PROJECT produces reusable development knowledge (architecture patterns, stack conventions, deploy procedures, technical gotchas) worth codifying as a per-project sub-skill seoboost-devset-<project>. Triggers — "buat skill development untuk project X", "capture pola ini ke devset", "seoboost-devset project-e", or after a project milestone yields a reusable technique. Routes through seoboost-skill-candidate (the gate) and writing-skills (the author); this skill owns the per-project category, naming, and PII bar. NOT for one-off details or client secrets.
metadata:
  type: reference
---

# SEO Boost Development Set — per-project dev knowledge as sub-skills

Payung (pabrik + konvensi + gudang) untuk knowledge **development per-project klien**.
Saat kerja di sebuah project menghasilkan teknik yang akan kepakai lagi, skill ini
mengubahnya jadi sub-skill `seoboost-devset-<project>` yang reusable lintas mesin/tim.

**Core principle:** Capture **TEKNIK & POLA**, bukan rahasia klien. Satu project = satu
sub-skill `seoboost-devset-<project>`. Tidak setiap pekerjaan layak — lewat gate dulu.

## Tiga peran (fusion)

1. **Pabrik (prosedur)** — cara mengubah pengalaman kerja project jadi sub-skill.
2. **Konvensi (aturan)** — naming `seoboost-devset-<slug>`, struktur file, dan **PII bar**.
3. **Gudang (container)** — sub-skill `seoboost-devset-*` tinggal di repo `seoboost-skill-set`
   (flat, prefix `seoboost-devset-`), ikut distribusi normal (`sync-skills.sh` /
   `agent-memory/seoboost-skill-set-management.md`), reusable di mesin lain.

## PII bar (WAJIB — baca tiap menulis sub-skill)

Pertanyaan tunggal: **"Apakah ini teknik reusable, atau rahasia klien?"**

- ✅ **Simpan:** pola arsitektur, gotcha teknis + solusi, konvensi stack, prosedur
  deploy (urutan/gate/rollback). Nama project boleh (identitas, bukan rahasia).
- ❌ **Jangan:** skema DB rahasia, kredensial/secret, data bisnis sensitif, IP klien,
  kode proprietary verbatim.
- Ragu → generalisasi jadi pola, atau tinggalkan.

## Workflow (5 langkah)

1. **Trigger** — kerja di project klien menghasilkan teknik yang akan kepakai lagi
   (di project ini atau project mirip).
2. **Gate** — jalankan `seoboost-skill-candidate`. Default NO. One-off / sekali-pakai ditolak.
   Hanya yang benar-benar reusable lanjut.
3. **PII filter** — pisahkan teknik-reusable dari rahasia-klien. Sanitize yang sensitif
   (pola sama seperti saat push ke `seoboost-skill-set`).
4. **Capture** — buat/update `seoboost-devset-<project>/SKILL.md` dari
   `reference/devset-template.md`. Pakai `writing-skills` untuk menulis dari nol, atau
   `seoboost-skill-updater` kalau memperkaya sub-skill yang sudah ada.
5. **Propagate** — `git add` + commit + push ke `seoboost-skill-set` **(konfirmasi operator
   dulu — Iron Law #4: no push tanpa izin)**. Mesin lain dapat via `git pull` + sync.

## Naming & struktur

- Slug: `seoboost-devset-<project-slug>` — lowercase, ringkas (mis. `seoboost-devset-<project>`).
- File: `seoboost-devset-<slug>/SKILL.md` (+ `reference/` kalau besar). Template ada di
  `reference/devset-template.md` skill ini.

## Boundaries (tidak dilakukan)

- TIDAK menggantikan `seoboost-skill-candidate` (pakai gate-nya) atau `writing-skills`
  (pakai untuk menulis).
- TIDAK menyimpan rahasia klien (PII bar ketat).
- TIDAK membuat sub-skill untuk one-off (harus reusable + lolos gate).
- TIDAK push tanpa konfirmasi operator.

---

## Hierarki — penampakan saat ada `seoboost-devset-<project>`

### 1. Di dalam repo `seoboost-skill-set` (FLAT di filesystem, berpayung secara penamaan)

Penting: Claude Code TIDAK mengenal skill bersarang — semua skill flat di root repo.
Hubungan "payung → sub" itu **logis lewat prefix `seoboost-devset-`**, bukan folder fisik.

```
seoboost-skill-set/                          ← repo (private)
│
├── agent-memory/                        ← memory lintas-mesin (bukan skill)
│
├── seoboost-development-set/                 ← 🏭 PAYUNG / PABRIK (skill ini)
│   ├── SKILL.md                            ("cara bikin seoboost-devset-<project>")
│   └── reference/
│       └── devset-template.md              (template sub-skill baru)
│
├── seoboost-devset-<project>/                   ← 📦 SUB-SKILL (hasil, project Project E)
│   └── SKILL.md                            (pola/teknik dev Project E — sanitized)
│
├── seoboost-devset-<project-lain>/           ← 📦 sub-skill berikutnya (nanti)
│   └── SKILL.md
│
├── seoboost-skill-candidate/                 ← 🚪 GATE (decide layak/tidak)
├── seoboost-gdrive/                          ← skill lain (flat, sejajar)
└── ... (skill seoboost-* lainnya)
```

### 2. Relasi (pabrik → produk)

```
                ┌─────────────────────────┐
                │   seoboost-development-set    │  🏭 PAYUNG
                │  (prosedur + konvensi)   │
                └────────────┬────────────┘
                             │ menghasilkan (template + PII bar)
             ┌───────────────┼───────────────┐
             ▼               ▼               ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │ seoboost-devset-  │ │ seoboost-devset-  │ │ seoboost-devset-  │  📦 PRODUK
     │ project-e       │ │ <project-2>  │ │ <project-3>  │  (per-project)
     └──────────────┘ └──────────────┘ └──────────────┘
      isi: pola arsitektur, gotcha teknis,
      konvensi stack, prosedur deploy
      (TEKNIK reusable — BUKAN rahasia klien)
```

### 3. Alur: kerja project → `seoboost-devset-<project>` di repo → lintas mesin

```
  Agent kerja di project Project E
            │ ketemu teknik reusable (pola RLS, urutan deploy FE+BE)
            ▼
  seoboost-skill-candidate   🚪 GATE — "layak? default NO untuk one-off"
            │ LOLOS
            ▼
  seoboost-development-set    🏭 kategori dev-per-project → seoboost-devset-<project>
            │            + terapkan PII bar (sanitize rahasia)
            ▼
  writing-skills         ✍️ author SKILL.md (atau seoboost-skill-updater kalau update)
            │ hasil: seoboost-devset-<project>/SKILL.md (sanitized)
            ▼
  push ke seoboost-skill-set 📤 commit + push (konfirmasi — Iron Law #4)
            │ git
            ▼
  Mesin lain: git pull + sync → dapat seoboost-devset-<project>   🌐 reusable
```

### 4. Zoom: isi `seoboost-devset-<project>/`

```
seoboost-devset-<project>/
└── SKILL.md
    ├── frontmatter (name: seoboost-devset-<project>, description + triggers)
    └── body (TEKNIK reusable — sanitized)
        ├── Stack & arsitektur (pola, bukan kredensial)
        ├── Konvensi project (naming, branch flow)
        ├── Gotcha teknis (jebakan + solusi)
        ├── Prosedur deploy (urutan, gate, rollback)
        └── ❌ TIDAK ADA: skema DB rahasia, secret, data bisnis, IP
```

## Related

- `seoboost-skill-candidate` — gate sebelum capture (decide layak/tidak).
- `writing-skills` — author sub-skill (RED→GREEN→REFACTOR).
- `seoboost-skill-updater` — update sub-skill yang sudah ada + propagate (kalau sudah ada).
- `agent-memory/seoboost-skill-set-management.md` — prosedur sync skill ke mesin lain.
