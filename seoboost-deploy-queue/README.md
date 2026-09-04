# seoboost-deploy-queue

**Reference skill — urutan deploy aman untuk fitur ber-migration yang membentang BE + FE di repo push-to-deploy terpisah.**

## Fungsi (apa yang dilakukan)

Memberi **urutan deploy yang benar + gate verifikasi per-fase + pohon rollback** saat sebuah fitur membentang dua repo yang deploy independen: backend (NestJS, dengan migration DB) dan frontend (Next.js) yang memanggil endpoint baru itu. Selalu ada jendela di mana satu repo sudah live dan satunya belum — skill ini memastikan kamu memilih mismatch yang aman, bukan yang merusak produksi.

Inti: **deploy paruh yang toleran dulu** (backend + migration additive — FE lama selamat), **paruh yang menuntut belakangan** (frontend — UI baru mati melawan BE lama). Verifikasi paruh-yang-sedang-live di tiap batas.

## Kapan dipakai

- Fitur membentang BE (NestJS, ada migration) + FE (Next.js) di **repo terpisah**, push-to-deploy (GitHub Actions, push ke `main`).
- Migration jadi bagian pipeline deploy BE; FE memanggil endpoint BE baru.

**Bukan untuk:** single repo, perubahan tanpa migration, atau migration destruktif/rename (itu butuh expand-backfill-contract dulu — skill menjelaskan cek precondition-nya).

## Isi skill

- **Precondition load-bearing** — migration WAJIB additive-only; kalau drop/rename/narrow/NOT-NULL → STOP, pakai expand-contract.
- **Sekuens 4 fase** — Phase 0 pre-flight (gate hijau, fresh evidence), Phase 1 BE dulu + watch migration + gate (ledger, probe endpoint, FE lama masih jalan), Phase 2 FE + gate (walk fitur e2e di prod), Phase 3 close.
- **Pohon rollback** — apa yang dilakukan kalau gagal di Phase 1 migration / Phase 1 code / Phase 2 FE; kenapa migration additive boleh ditinggal saat rollback code.
- **Asimetri** yang jadi dasar urutan + **Common Mistakes** table.

## Asal

Diturunkan dari deploy produksi sebuah fitur ber-migration (BE + migration → verify → FE), dijalankan persis dengan sekuens ini. Komplementer dengan `seoboost-mock-check` (bukti live sebelum deploy) dan `seoboost-migration-rehearsal` (gladi-resik migration sebelum prod). Selaras dengan Environment Mapping + Iron Law #4 (no push tanpa izin eksplisit user).
