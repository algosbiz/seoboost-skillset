# seoboost-migration-rehearsal

**Reference skill — gladi-resik migration + RLS isolation gate di DB clone sebelum produksi.**

## Fungsi (apa yang dilakukan)

Memberi **recipe untuk me-replay rantai migration + menjalankan gate isolasi tenant** terhadap DB throwaway, supaya run di produksi tinggal *replay*, bukan percobaan pertama. Plus daftar **trap role/session-variable** yang bikin gate "hijau" jadi bohong.

Inti: rehearsal baru sahih kalau (a) migration di-apply persis cara prod meng-apply (sering = loop raw `.sql` + ledger `_app_migrations`, **bukan** `drizzle-kit`), (b) di atas data berbentuk-prod biar guard keamanan migration benar-benar terpicu, (c) sebagai OWNER tabel, sementara (d) gate isolasi jalan sebagai role RUNTIME non-superuser (`app_rls`). Salah role/GUC → gate hijau tak membuktikan apa-apa.

## Kapan dipakai

- Mau ship migration ke app multi-tenant Postgres dengan RLS (policy per-tenant berbasis GUC `app.current_tenant`; runtime connect sebagai role non-superuser).
- Cutover expand-backfill-contract, policy RLS baru, atau perubahan schema apa pun yang bisa meregresikan isolasi tenant.

**Bukan untuk:** app single-tenant tanpa RLS, atau kolom additive sepele tanpa interaksi policy/NOT-NULL.

## Isi skill

- **Recipe replay** — bangun clone dari dump prod, apply rantai dengan loop persis prod (ledger + per-file BEGIN/COMMIT + `ON_ERROR_STOP`).
- **Matriks role** — apply sebagai OWNER vs jalankan gate sebagai RUNTIME (`app_rls`), dan kenapa distinction ini load-bearing (Postgres bypass RLS untuk owner/superuser).
- **Jalankan gate** — apa yang di-set (`set_config transaction-local`), apa yang di-assert (6 guarantee isolasi).
- **Migration guard abort = fitur, bukan bug** — perbaiki precondition DATA di source, jangan lemahkan guard.
- **3 trap role/GUC** — gate-as-owner vacuous, `rolbypassrls=true` silent killer, dan **GUC leak di pooled connection** (`set_config(...,false)` session-wide bocor antar-tenant) yang gate sendiri tak bisa tangkap.

## Asal

Diturunkan dari rehearsal sebuah fitur + investigasi cutover multi-tenant: saat gladi-resik, guard `CONTRACT ABORT` di migration enforce-RLS benar-benar terpicu pada data fixture — persis hal yang tak mau ditemukan di jendela prod. Komplementer dengan `seoboost-deploy-queue` (urutan deploy setelah rehearsal hijau) dan `seoboost-mock-check` (bukti live untuk fitur ber-SDK).
