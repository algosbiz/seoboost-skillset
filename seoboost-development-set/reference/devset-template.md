# devset-template — template untuk sub-skill `seoboost-devset-<project>`

Salin blok di bawah jadi `seoboost-devset-<project-slug>/SKILL.md` saat membuat sub-skill development untuk sebuah project klien. Isi tiap section dengan **pola & teknik reusable** — bukan rahasia klien.

> **PII bar (baca tiap menulis):** "Apakah ini teknik reusable, atau rahasia klien?"
> ✅ Simpan: pola arsitektur, gotcha teknis + solusinya, konvensi stack, prosedur deploy, urutan/gate/rollback.
> ❌ Jangan: skema DB rahasia, kredensial/secret, data bisnis sensitif, IP klien, kode proprietary verbatim.
> Nama project boleh ditulis (mis. Project E) — itu identitas, bukan rahasia teknis. Kalau ragu, generalisasi.

---

## Template SKILL.md (copy mulai dari sini)

```markdown
---
name: seoboost-devset-<project-slug>
description: Use when developing on the <Project> project — reusable architecture patterns, stack conventions, deploy procedures, and technical gotchas specific to <Project>. Triggers when working on <Project> code, "<project> dev", "pola <project>", or porting a <Project> technique elsewhere. Captures REUSABLE TECHNIQUE only — never client secrets.
metadata:
  type: project
---

# <Project> — development knowledge (sub-skill of seoboost-development-set)

Reusable development knowledge for the <Project> project. TEKNIK & POLA only —
no client secrets (see the PII bar in seoboost-development-set). Part of the
seoboost-devset-* family; created/updated via the seoboost-development-set procedure.

## Stack & arsitektur
- <pola arsitektur tingkat tinggi — mis. "BE NestJS + Drizzle, FE Next.js, Postgres + RLS multi-tenant">
- <keputusan arsitektur yang berulang & alasannya>

## Konvensi project
- Branch/deploy flow: <mis. production=main, staging=*-refactor>
- Naming / struktur folder / pola modul: <...>
- Tooling khusus: <...>

## Gotcha teknis (jebakan + solusi)
- <gotcha 1> → <fix yang terbukti jalan>
- <gotcha 2> → <fix>

## Prosedur deploy
- Urutan: <mis. migrasi DB → BE → FE>
- Gate sebelum lanjut: <apa yang diverifikasi tiap langkah>
- Rollback: <cara balik kalau gagal>

## Catatan
- Sumber: pengalaman kerja di project <Project>. Update via seoboost-development-set
  saat ada teknik reusable baru (lewat gate seoboost-skill-candidate dulu).
```

---

## Contoh terisi (ilustrasi — `seoboost-devset-<project>`, sanitized)

Ini contoh bagaimana template di atas terisi. Perhatikan: semua poin adalah **teknik**, bukan rahasia.

```markdown
## Stack & arsitektur
- Multi-tenant SaaS: shared DB + Postgres RLS untuk isolasi tenant (1 tenant = 1 row-scope, bukan 1 DB).
- A/R & A/P = SINGLE system account per company (bukan per income-category) — kesalahan umum yang harus dihindari saat mapping akun.

## Konvensi project
- production = branch `main`; staging = branch `*-refactor`. NO direct push ke main.
- Feature branch base off `*-refactor`, merge via PR setelah UAT staging.

## Gotcha teknis
- RLS green di test bisa berbohong kalau role/GUC tidak di-set seperti runtime → rehearse migrasi di clone throwaway dulu.
- Prisma 6 tolak `undefined` di `data` field → pakai `?? null`.

## Prosedur deploy
- Urutan coupled FE+BE+migration: migrasi DB → BE → FE (per repo push-to-deploy terpisah).
- Gate antar langkah: health endpoint + auth gate + smoke test di staging sebelum angkat ke production.
- Rollback: cherry-pick revert ke branch hotfix → PR ke main dengan diff minimal.
```

> Contoh di atas mengambil **pola** dari skill SEO Boost yang sudah ada (seoboost-single2multitenant-saas, seoboost-migration-rehearsal, seoboost-deploy-queue) — menunjukkan seoboost-devset-<project> sebagai tempat mengkonsolidasi teknik per-project, bukan menggandakan rahasia klien.
