---
name: seoboost-web-sections
description: Use when generating or building website/landing-page SECTIONS by component — hero, features, pricing, testimonials, FAQ, CTA, stats, steps, comparison, team, footer, lead-capture. Original SEO Boost prompt library + anatomy checklist per section, seeded from DESIGN.md and audited via impeccable. Triggers — "buat section hero", "generate pricing section", "bikin landing page section", "section testimonial", "buatkan CTA section", or building a landing page section-by-section. NOT a replacement for impeccable (that audits; this composes).
metadata:
  type: reference
---

# SEO Boost Web Sections — generate landing-page sections by component

Pustaka orisinal SEO Boost untuk menyusun section situs web berkualitas tinggi (hero, pricing,
testimonial, FAQ, dst). Tiap section punya anatomi + prompt skeleton + anti-slop +
varian di `reference/section-catalog.md`. Output di-seed dari DESIGN.md dan
**diaudit lewat impeccable** — bukan generic slop.

**Core principle:** Section yang baik = *tujuan jelas + anatomi lengkap + ikut brand
identity + lolos slop-check*. Ini melengkapi impeccable (impeccable mengaudit; skill ini
menyusun), bukan menggantikannya.

## Asal-usul & batas legal (penting)

Terinspirasi konsep "generate section per-component" yang umum di tool web-builder,
TAPI seluruh isi skill ini **DITULIS DARI NOL** dari pengetahuan anatomi web publik +
stack SEO Boost. TIDAK menyalin prompt/konten dari produk berbayar manapun (mis.
motionsites.ai = komersial; kontennya tidak disentuh). Yang diambil hanya *ide
kategori section* (tidak bisa dilindungi hak cipta), bukan ekspresi/prompt orang lain.

## Workflow (4 langkah)

1. **Context** — sebelum generate, pastikan tahu:
   - Brand identity: ada `PRODUCT.md` / `DESIGN.md` di project? Kalau belum → seed dulu
     (lihat "Integrasi" di bawah). Tanpa ini, output jadi generic.
   - Target section apa? Goal section itu (konversi / trust / info)?
   - Stack: React / Next.js / Vue / Svelte / HTML? (output adaptif)
2. **Pick + compose** — buka `reference/section-catalog.md`, ambil section + **varian**
   yang cocok dengan goal. Isi slot prompt skeleton (`{brand}` `{DESIGN.md}` `{tone}`
   `{goal}` `{stack}`) dengan brand context project.
3. **Generate** — hasilkan section (stack-appropriate). Ikuti anatomi wajib section.
4. **Audit** — lewatkan hasil ke **impeccable** (slop-detection, Iron Law #7). Anti-slop
   list di tiap entry katalog adalah checklist awal. Perbaiki, baru serahkan.

## Integrasi stack SEO Boost (ini pembeda dari tool generic)

- **Seed dari DESIGN.md** (getdesign.md flow): kalau project belum punya DESIGN.md,
  seed dulu — `npx getdesign@latest add <brand>` atau `cp ~/.claude/design-md-library/
  design-md/<brand>/DESIGN.md`, atau `/impeccable init` untuk bikin dari nol. Section
  lalu ikut identity, bukan generic.
- **Audit via impeccable**: tiap section yang di-generate WAJIB lewat slop-check
  (Iron Law #7 — no UI work tanpa impeccable).
- **Stack-aware**: output disesuaikan framework project (React/Next/Vue/HTML).

## Section catalog (13)

Hero · Features/Benefits · Social Proof/Logos · Testimonials · Pricing · FAQ · CTA ·
Stats/Metrics · How-it-works/Steps · Comparison/Table · Team · Footer · Newsletter/Lead-capture

Detail (anatomi + prompt skeleton + anti-slop + varian) → `reference/section-catalog.md`.

## Boundaries (tidak dilakukan)

- TIDAK menyalin prompt/konten dari motionsites atau produk berbayar manapun.
- TIDAK menggantikan impeccable (melengkapi: impeccable mengaudit, skill ini menyusun).
- TIDAK generate testimoni/orang bernama palsu untuk PRODUKSI (mockup boleh, tapi
  tandai placeholder; produksi pakai quote klien sungguhan dgn consent).
- TIDAK ship section tanpa lewat slop-check (Iron Law #7).

## Related

- `impeccable` — WAJIB audit tiap section (Iron Law #7). Compose di sini, audit di sana.
- `getdesign.md` (di CLAUDE.md) — seed DESIGN.md per brand sebelum compose.
- Stack experts (`react-expert`, `nextjs-developer`, `vue-expert`) — implement output.
- `seoboost-financial-report-ui` — kalau section-nya laporan keuangan, itu house-standard-nya.
