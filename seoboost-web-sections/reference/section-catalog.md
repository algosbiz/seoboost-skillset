# Section Catalog — anatomy + original prompt skeletons

13 web/landing-page sections. Each entry: **Tujuan · Anatomi · Prompt skeleton · Anti-slop · Varian.**
All original SEO Boost content (public web-anatomy knowledge — no copied prompts from any paid product).

Prompt skeletons use slots: `{brand}` `{DESIGN.md}` `{tone}` `{goal}` `{stack}`. Fill them from the
project's PRODUCT.md/DESIGN.md before generating; then audit the output via impeccable (Iron Law #7).

---

## 1. Hero
- **Tujuan:** Detik pertama — komunikasikan *apa ini + untuk siapa + 1 aksi* sebelum user scroll.
- **Anatomi:** Headline (value, bukan tagline kabur) · subhead 1 kalimat (untuk siapa + manfaat) · 1 primary CTA (kata kerja) · opsional secondary CTA · 1 visual/proof. NO dua primary CTA.
- **Prompt skeleton:** "Generate a hero for {brand} ({DESIGN.md} aesthetic). Audience: {audience}. Goal: {goal}. Output: a benefit-led headline (≤10 words, concrete, no buzzword), a one-line subhead naming who it's for + the payoff, ONE primary CTA verb, and a visual direction that fits {DESIGN.md}. Stack: {stack}."
- **Anti-slop:** generic "Empower your X / Boost your Y" headline · gradient-blob default · two competing CTAs · stock-hero vibe → see impeccable.
- **Varian:** (a) benefit-led · (b) problem-agitate ("Tired of X?") · (c) bold-claim + proof number.

## 2. Features / Benefits
- **Tujuan:** Terjemahkan fitur jadi *manfaat* — apa yang user bisa lakukan/rasakan.
- **Anatomi:** 3–6 item, tiap item: ikon/visual + judul (benefit) + 1 kalimat. Benefit di judul, fitur di body — bukan sebaliknya.
- **Prompt skeleton:** "List {n} core benefits of {brand} for {audience}. For each: a benefit-framed title (what they GAIN, not what it IS) + one supporting sentence. Group as a {DESIGN.md}-styled grid. Tone: {tone}."
- **Anti-slop:** judul fitur teknis ("Real-time sync") tanpa benefit · default 3-column-card grid tanpa alasan · ikon generik (gear/rocket/checkmark) untuk semua.
- **Varian:** (a) benefit grid · (b) alternating feature+image rows · (c) "before/after" pairs.

## 3. Social Proof / Logos
- **Tujuan:** Pinjam kredibilitas — "orang/brand lain percaya ini".
- **Anatomi:** Baris logo klien/partner ATAU metrik kepercayaan ("dipakai 1.2k tim") + 1 kalimat konteks. Grayscale logo agar tidak bersaing dengan brand.
- **Prompt skeleton:** "Compose a trust strip for {brand}: a short lead line ('Dipercaya oleh…') + a logo row OR a credibility metric. Keep it quiet ({DESIGN.md}), logos muted so they don't fight the page."
- **Anti-slop:** logo warna-warni ramai · klaim "trusted by thousands" tanpa angka/nama · fake logos.
- **Varian:** (a) logo wall · (b) single metric ("4.9★ · 1.2k reviews") · (c) "as seen in" media row.

## 4. Testimonials
- **Tujuan:** Bukti dari manusia nyata — kurangi keraguan dengan suara pelanggan.
- **Anatomi:** Quote spesifik (hasil, bukan "great product!") + nama + peran/perusahaan + foto/avatar. Spesifik > banyak.
- **Prompt skeleton:** "Draft {n} testimonial blocks for {brand}. Each quote names a concrete outcome or a before→after, attributed to a realistic persona (name, role, org). Layout per {DESIGN.md}. (Use REAL client quotes only when available; never fabricate named people for production.)"
- **Anti-slop:** quote generik tanpa hasil · avatar stok jelas-palsu · 1 testimoni doang lalu klaim "loved by all".
- **Varian:** (a) card grid · (b) single hero testimonial · (c) carousel (hindari kecuali >5).
- **PII note:** untuk produksi, quote bernama harus dari klien sungguhan (consent). Untuk mockup, tandai jelas sebagai placeholder.

## 5. Pricing
- **Tujuan:** Bantu user pilih + hilangkan friksi sebelum bayar.
- **Anatomi:** Tier (nama + harga + untuk siapa + fitur kunci) · 1 tier di-highlight ("Most popular") · CTA per tier · jawab keraguan (billing toggle, "no card needed"). Maks 3–4 tier (paradox of choice).
- **Prompt skeleton:** "Generate a pricing section for {brand}: {n} tiers, each with a name, who-it's-for line, price, 3–5 key features (benefit-framed), and a CTA. Highlight one recommended tier. Add the one objection-killer that matters for {audience}. Style per {DESIGN.md}."
- **Anti-slop:** 5+ tier bikin lumpuh · fitur sama persis tiap tier cuma beda angka · highlight tier tanpa alasan · "Contact us" untuk semua.
- **Varian:** (a) 3-tier klasik · (b) single plan + add-ons · (c) usage-based/slider · (d) free vs pro toggle.

## 6. FAQ
- **Tujuan:** Tutup keberatan terakhir + kurangi beban support.
- **Anatomi:** 5–8 pertanyaan NYATA (keraguan beli, bukan "what is X"). Accordion. Jawaban ringkas + link kalau perlu.
- **Prompt skeleton:** "Write {n} FAQs for {brand} that address real purchase objections for {audience} (pricing, security, migration, cancellation, support). Concise answers, honest tone {tone}. Accordion per {DESIGN.md}."
- **Anti-slop:** pertanyaan basa-basi ("What is {brand}?") yang harusnya sudah dijawab hero · jawaban marketing-spin · FAQ kepanjangan jadi dokumentasi.
- **Varian:** (a) accordion single-col · (b) 2-col grouped by topic · (c) searchable (kalau banyak).

## 7. CTA (Call-to-Action section)
- **Tujuan:** Titik konversi terfokus — biasanya sebelum footer.
- **Anatomi:** 1 headline aksi + 1 sub (urgency/value) + 1 primary CTA. Kosong di sekitarnya (fokus). Ulang aksi hero, tapi user sudah lebih yakin.
- **Prompt skeleton:** "Generate a final CTA band for {brand}: an action headline that assumes the user is now convinced, a one-line nudge (value or low-risk reminder), and a single primary CTA. Generous whitespace, {DESIGN.md} accent. Goal: {goal}."
- **Anti-slop:** banyak link bersaing di band CTA · "Sign up now!" tanpa alasan baru · CTA sama plek dengan hero tanpa progresi.
- **Varian:** (a) centered band · (b) split (copy + form) · (c) full-bleed accent.

## 8. Stats / Metrics
- **Tujuan:** Bukti kuantitatif — skala/hasil dalam angka.
- **Anatomi:** 3–4 metrik besar (angka + label). Angka jujur + bermakna. Opsional sumber.
- **Prompt skeleton:** "Compose a stats band for {brand}: 3–4 headline metrics (number + short label) that prove scale or outcomes for {audience}. Big type per {DESIGN.md}. Only real, defensible numbers."
- **Anti-slop:** angka vanity tanpa konteks ("1M+ pixels rendered") · metrik dibuat-buat · terlalu banyak angka jadi noise.
- **Varian:** (a) 3-up row · (b) animated count-up · (c) metric + 1 kalimat konteks tiap item.

## 9. How it works / Steps
- **Tujuan:** Turunkan kecemasan "ribet nggak?" — tunjukkan jalurnya simpel.
- **Anatomi:** 3–4 langkah, tiap langkah: nomor + judul aksi + 1 kalimat. Linear, jelas. Tunjukkan betapa sedikit usaha.
- **Prompt skeleton:** "Explain how {brand} works in {n} steps for {audience}. Each step: an action title + one sentence. Emphasize how little effort it takes. Numbered flow per {DESIGN.md}."
- **Anti-slop:** 6+ langkah bikin terkesan ribet · langkah penuh jargon · "Step 1: Sign up" yang obvious tanpa nilai.
- **Varian:** (a) horizontal numbered · (b) vertical timeline · (c) tabbed (per persona/use-case).

## 10. Comparison / Table
- **Tujuan:** Bantu user yang membandingkan (vs kompetitor / vs status quo).
- **Anatomi:** Tabel: baris = kriteria yang user pedulikan, kolom = opsi. Highlight kolom {brand}. Jujur (jangan strawman kompetitor).
- **Prompt skeleton:** "Build a comparison table for {brand} vs {alternatives} for {audience}. Rows = criteria the buyer actually weighs. Highlight {brand}'s column. Be fair to alternatives (credibility). Style per {DESIGN.md}."
- **Anti-slop:** semua ✅ di kolom sendiri, semua ❌ kompetitor (tidak kredibel) · kriteria yang cuma menang di pihak sendiri · tabel kepanjangan.
- **Varian:** (a) us-vs-them 2-col · (b) feature matrix multi-kolom · (c) "old way vs new way".

## 11. Team / About
- **Tujuan:** Humanize — di balik produk ada orang; bangun trust (penting B2B/jasa/lokal).
- **Anatomi:** Foto + nama + peran (+ opsional 1 baris/link). Konsisten gaya foto. Untuk jasa/agency lokal: ini sering tinggi-impact.
- **Prompt skeleton:** "Generate a team/about section for {brand}: {n} members with photo, name, role. Optional one-liner. Warm, credible, {tone}. Grid per {DESIGN.md}."
- **Anti-slop:** stok-foto korporat generik · bio buzzword ("passionate ninja rockstar") · grid foto gaya campur-aduk.
- **Varian:** (a) photo grid · (b) founder-story spread · (c) "our values" + faces.

## 12. Footer
- **Tujuan:** Navigasi sekunder + trust/legal + last-chance links.
- **Anatomi:** Kolom link (produk, perusahaan, legal) · kontak/sosial · copyright · opsional newsletter. Rapi, tidak ramai.
- **Prompt skeleton:** "Generate a footer for {brand}: grouped link columns (product, company, legal), contact/social, copyright. Optional newsletter inline. Quiet, organized, {DESIGN.md} muted palette."
- **Anti-slop:** footer jadi tempat buang semua link tanpa grup · sosial-icon warna ramai · newsletter agresif di footer.
- **Varian:** (a) multi-col link footer · (b) minimal (logo + 1 row) · (c) "fat footer" with sitemap.

## 13. Newsletter / Lead-capture
- **Tujuan:** Tangkap user yang belum siap beli — tukar nilai dengan email.
- **Anatomi:** 1 value prop (apa yang mereka dapat) + 1 field email + 1 CTA + trust micro-copy ("no spam"). Friksi minimal.
- **Prompt skeleton:** "Generate a lead-capture block for {brand}: a clear value line (what they get for subscribing), one email field, one CTA, and a one-line trust reassurance. Minimal friction, {DESIGN.md} styled. Goal: {goal}."
- **Anti-slop:** "Subscribe to our newsletter" tanpa alasan · banyak field (nama, perusahaan, telepon) untuk sekadar email · pop-up agresif sebagai satu-satunya cara.
- **Varian:** (a) inline band · (b) split (copy + form) · (c) lead-magnet ("Download the guide").

---

## Cara pakai katalog ini (ringkas)
1. Tahu **brand context** dulu: ada PRODUCT.md/DESIGN.md? Kalau belum, lihat `seoboost-web-sections` SKILL.md (seed via getdesign.md atau /impeccable init).
2. Pilih section + **varian** yang cocok dengan goal.
3. Isi slot prompt skeleton dengan brand context, generate (stack-appropriate).
4. **Audit hasil via impeccable** sebelum serahkan — anti-slop list di tiap section adalah checklist awal.
