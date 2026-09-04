# seoboost-mock-check

**Reference skill — live e2e recipe for features built on an auth / payments / external SDK.**

## Fungsi (apa yang dilakukan)

Mencegah klaim "fitur jalan" yang hanya bersandar pada test yang **nge-mock SDK-nya sendiri**. Saat kamu mock SDK yang justru *adalah* fitur itu (auth guard, impersonation, charge, webhook, session swap), test cuma membuktikan pemahamanmu terhadap mock — bukan perilaku dependency asli. Mock bilang "sukses" untuk input yang ditolak SDK asli, jadi suite hijau penuh bisa men-ship fitur yang rusak.

Skill ini adalah **recipe + checklist landmine** untuk menjalankan satu jalur live, supaya kamu tidak perlu menurunkan ulang investigasi berjam-jam setiap kali.

## Kapan dipakai

- Fitur di atas SDK auth/pembayaran/eksternal (better-auth, Stripe, Clerk, Passport, dll) "selesai" dengan unit test yang nge-mock.
- Perilaku berbahaya ada di dependency: guard menolak, charge sukses/gagal, session berpindah, signature webhook terverifikasi.
- Gejala: "test hijau tapi rusak", "mock-nya return success", green CI mendahului insiden prod.

**Bukan untuk:** fitur logika murni tanpa dependency eksternal (mock memang cukup), atau memutuskan *apakah* perlu test (kamu sudah tahu perlu — ini soal *caranya*).

## Isi skill

- **Iron Rule** — minimal satu jalur live ke dependency asli sebelum "done"; kalau cuma mampu satu test, pilih kasus **negatif** (guard asli benar-benar menolak).
- **Recipe live e2e** (untuk fitur auth/impersonation): pilih altitude (boot app, jangan panggil service), DB throwaway yang dimigrasi seperti prod, env sebelum SDK di-import, seed principal lewat sign-up SDK, 3 assertion inti (negatif + audit landed + session flip/revert), teardown.
- **7 landmine better-auth** — `YOU_CANNOT_IMPERSONATE_ADMINS`, `getSetCookie()` butuh `testEnvironment:node`, `returnHeaders:true` load-bearing, cookie `Secure` vs loopback, class-level guard saat altered session, import-order/env trap, open handles.
- **Quick Reference** + **Common Mistakes** table.

## Asal

Diturunkan dari sesi support-impersonation (better-auth + Postgres RLS): live e2e menangkap 2 bug yang 54/54 unit test (nge-mock `auth.api`) lewatkan. Recipe sudah tervalidasi terhadap codebase nyata. Komplementer dengan `seoboost-deploy-queue` (urutan deploy aman) dan `seoboost-migration-rehearsal` (gladi-resik migration).
