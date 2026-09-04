# seoboost-single2multitenant-saas

**Playbook skill — mengubah app yang SUDAH single-tenant & LIVE produksi (ada data klien asli) menjadi multi-tenant SaaS, tanpa merusak data tenant lama.**

## Fungsi (apa yang dilakukan)

Memberi **playbook lengkap + template prompt server-side** untuk konversi single→multi-tenant pada app yang sudah jalan di produksi — varian tersulit (bukan greenfield). Diturunkan dari cutover produksi nyata (sebuah POS: ~400 sales tenant pertama dipertahankan byte-for-byte), supaya produk SEO Boost berikutnya **tidak mengulang** kurva belajar berhari-hari + bug produksi yang sudah kena.

Inti: expand→backfill→contract sebagai deploy ber-gate terpisah; shared DB + `organization_id` di semua tabel + Postgres RLS sebagai jaring wajib; **runtime connect sebagai role non-owner atau RLS jadi teater**; gladi-resik seluruh chain di clone prod (buktikan immutability + RLS gate) sebelum prod.

## Kapan dipakai

- App yang **sudah single-tenant & LIVE** dengan data klien asli harus jadi multi-tenant SaaS (onboard tenant ke-2) di shared DB.
- Stack tipe NestJS + Postgres + better-auth + Drizzle (adaptasi kalau beda).

**Kapan JANGAN:** kasus one-off / dua-tenant di mana kesederhanaan ops menang — pakai **satu instance terisolasi per tenant** (tanpa bedah schema). Skill ini untuk genuinely banyak tenant di ops cost rata.

## Isi

- **`SKILL.md`** — playbook: Phase 0 readiness audit (parent→child org derivation), Phase 1 arsitektur (keputusan terkunci), Phase 2 expand→backfill→contract + RLS policy, Phase R rehearsal (immutability checksum), RLS gate 6 assertion, Phase C cutover produksi (point of no return), **footgun checklist 10 item** (RLS owner-bypass, dua connection string, GUC transaction-local, migration atomicity, composite-onConflict, jangan-RLS-tabel-auth, docker recreate vs restart, dst).
- **`server-prompt-template.md`** — template copy-paste fill-in `<PLACEHOLDER>` untuk agent server: B1 set password app_rls + bukti RLS pertama, B2 repoint `DATABASE_URL`→app_rls + RECREATE container + smoke, B3 provision tenant #2 + cek isolasi. Tiap step ada verify + rollback. Alur: local agent isi placeholder → user paste ke agent VPS.

## Sub-skill (direferensi, tidak diduplikasi)

- `seoboost-migration-rehearsal` — Phase R (gladi-resik chain + RLS gate di clone).
- `seoboost-deploy-queue` — disiplin urutan deploy ber-gate + rollback tree.
- `seoboost-mock-check` — bug isolasi cuma ketangkap DB-backed e2e, bukan unit test ber-mock.

## Asal

Diturunkan dari cutover multi-tenant produksi (audit + rehearsal + runbook + prompt server yang battle-tested) — `.implementation-plan/multi-tenant-readiness/`. Catatan jujur di SKILL: ada drift penomoran migration (rehearsal-era vs final on-disk) dan satu invariant set inti yang paling transferable (role-split + dua URL + FORCE RLS + `set_config(...,true)` + predicate missing_ok + composite unique + jangan-RLS-tabel-auth + tiap migration self-atomic & idempotent).
