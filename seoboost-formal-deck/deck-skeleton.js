/**
 * SEO Boost Formal Deck — Full Deck Skeleton
 * -------------------------------------
 * Starter template that exercises every layout pattern in the SEO Boost design system.
 * Copy this file, replace the content data, and you have a full branded deck.
 *
 * Layouts demonstrated:
 *   1. Cover               (half-circle, big title, circle logo)
 *   2. Card-grid           (2×3 numbered badge cards — "Mandat")
 *   3. Insight + list      (sidebar callout + numbered row list — "Temuan")
 *   4. Program row         (5 horizontal program cards — "Roadmap")
 *   5. Mixed cards + phases (4-col cards over 4-col phase strip — "Prioritas")
 *   6. Gantt timeline      (month columns + colored bars — "Timeline")
 *   7. Closing             ("Terima Kasih" + contact)
 *
 * Usage:
 *   node deck-skeleton.js                          # writes to /mnt/user-data/outputs/
 *   node deck-skeleton.js my-custom-deck.pptx      # custom filename
 */

const {
  COLOR,
  makeDeck,
  addSlide,
  addContentScaffold,
  addCover,
  addClosing,
  addBadgeCard,
  addProgramCard,
  addInsightSidebar,
  addSectionLabel,
  addPhaseStripCard,
  addStatCard,
  addNumberedRow,
  addBottomCallout,
  addGanttHeader,
  addGanttRow,
} = require('../helpers');

// ============================================================================
// CONTENT DATA — replace these with your real content
// ============================================================================

const DECK = {
  filename: process.argv[2] || '/mnt/user-data/outputs/seoboost-deck-sample.pptx',

  cover: {
    brandTop: 'PT BALI MIKRO TEKNOLOGI',
    brandSub: 'seoboost.co.id',
    eyebrow: 'PEMAPARAN MITRA KONSULTAN',
    title: 'Pendampingan Teknologi & Bisnis\nuntuk PT Contoh Klien',
    tagline: 'Roadmap prioritas untuk memperkuat fondasi identitas, kanal digital, kolaborasi, dan operasi.',
    meta: [
      'Sesi pemaparan kepada pemegang saham',
      'Berdasarkan PKS Nomor XXX/PKS/SBI/V/2026 — DD Bulan 2026',
      'Disampaikan oleh: <Nama Direktur> · Direktur PT Algo Sea Biz',
    ],
    footer: '2026  |  Bali, Indonesia  |  PT Algo Sea Biz (SEO Boost)',
  },

  // Slide 2: Card grid (2x3) — "Mandat" pattern
  mandat: {
    eyebrow: '02 · MANDAT',
    title: 'Mandat Pendampingan yang Sudah Dicakup PKS',
    subtitle: 'Enam area ini menjadi dasar diskusi prioritas dan urutan eksekusinya.',
    cards: [
      { num: '01', title: 'Strategi Bisnis',    body: 'Pemetaan kebutuhan, positioning, dan model pertumbuhan.' },
      { num: '02', title: 'Identitas Digital',  body: 'Brand guideline, visual system, dan materi komunikasi inti.' },
      { num: '03', title: 'Website Korporat',   body: 'Website resmi sebagai titik kredibilitas dan kanal awal.' },
      { num: '04', title: 'Infrastruktur Dasar',body: 'Domain, email, hosting, dan fondasi digital formal.' },
      { num: '05', title: 'Sistem Operasional', body: 'Workflow, dashboard, SOP, dan pencatatan yang lebih tertib.' },
      { num: '06', title: 'Review Berkala',     body: 'Monitoring progres, evaluasi, dan penyesuaian implementasi.' },
    ],
    callout: { lead: 'Fokus rapat:', tail: 'memilih prioritas eksekusi paling berdampak, bukan menambah scope baru.' },
  },

  // Slide 3: Insight sidebar + numbered list
  temuan: {
    eyebrow: '03 · TEMUAN',
    title: 'Temuan Awal yang Perlu Dikonfirmasi',
    subtitle: 'Peluangnya nyata, tetapi fondasi untuk scale-up masih perlu dirapikan.',
    insight: {
      label: 'INSIGHT KUNCI',
      headline: 'Masalah utama bukan kurang peluang.',
      body: 'Yang perlu diperkuat adalah identitas, kontrol operasional, dan disiplin eksekusi sebelum ekspansi dipercepat.',
    },
    items: [
      { num: 1, title: 'Identitas brand belum konsisten',     body: 'Belum ada standar visual tunggal untuk produk inti.' },
      { num: 2, title: 'Kanal digital belum resmi',           body: 'Belum ada website korporat sebagai titik kepercayaan utama.' },
      { num: 3, title: 'Kolaborasi kerja masih ad-hoc',       body: 'Belum ada workspace tunggal untuk tracking progres dan keputusan.' },
      { num: 4, title: 'Potensi automasi belum dimanfaatkan', body: 'Layanan pelanggan dan follow-up masih bisa dipercepat via WA + AI.' },
      { num: 5, title: 'Fondasi scale-up belum siap',         body: 'Pertumbuhan butuh kontrol data dan operasi yang lebih kuat.' },
    ],
    callout: { lead: 'Hipotesis ini perlu dikonfirmasi bersama', tail: 'agar roadmap yang dipilih benar-benar sesuai kebutuhan.', emphasis: 'soft' },
  },

  // Slide 4: Program row (5 horizontal cards)
  roadmap: {
    eyebrow: '04 · ROADMAP',
    title: 'Roadmap Pendampingan yang Disarankan',
    subtitle: 'Urutan yang paling aman adalah membangun fondasi dulu, lalu baru masuk ke fase akselerasi.',
    programs: [
      { eyebrow: 'PROGRAM 1', title: 'Brand Guideline',     body: 'Merapikan identitas dan materi dasar.' },
      { eyebrow: 'PROGRAM 2', title: 'Website Korporat',    body: 'Membuka kanal kredibilitas resmi.' },
      { eyebrow: 'PROGRAM 3', title: 'Project E Onboarding',   body: 'Menata kolaborasi dan audit trail.' },
      { eyebrow: 'PROGRAM 4', title: 'Agentic AI + WA',     body: 'Mengurangi beban layanan manual.' },
      { eyebrow: 'PROGRAM 5', title: 'Ops Platform',        body: 'Membangun tulang punggung operasional.' },
    ],
    callout: { lead: 'Filosofi urutan:', tail: 'identitas → kanal resmi → disiplin kolaborasi → automasi → platform operasi.' },
  },

  // Slide 5: Mixed cards + phases
  prioritas: {
    eyebrow: '05 · PRIORITAS',
    title: 'Program Prioritas: Operations Platform',
    subtitle: 'Program ini menjadi paling strategis setelah fondasi awal siap, karena langsung menyentuh kontrol operasi dan scale-up.',
    targetCard: { label: 'TARGET SCALE-UP', body: '100 KK pilot → 500 KK tahap 1 → 1.300 KK tahap 2' },
    roles: [
      { title: 'Admin',  body: 'PO multi-supplier, stok, audit trail, dan member management.' },
      { title: 'Runner', body: 'Pengiriman gudang-ke-tenant, stock opname, dan QR scan.' },
      { title: 'Tenant', body: 'Dashboard read-only, acknowledgement, dan dispute stok.' },
      { title: 'User',   body: 'Disiapkan untuk ekspansi layanan dan future payment.' },
    ],
    phases: [
      { eyebrow: 'Fase 0', title: 'Finalisasi desain',         body: '2–4 minggu' },
      { eyebrow: 'Fase 1', title: 'MVP operasional',           body: '12–16 minggu' },
      { eyebrow: 'Fase 2', title: 'Tenant + multi-warehouse',  body: '6–10 minggu' },
      { eyebrow: 'Fase 3', title: 'Pay + member',              body: '8–12 minggu' },
    ],
    callout: { lead: 'Total estimasi 7–10 bulan,', tail: 'tetapi setiap fase bisa diputus terpisah sesuai keputusan.' },
  },

  // Slide 6: Gantt timeline
  timeline: {
    eyebrow: '06 · TIMELINE',
    title: 'Urutan Eksekusi yang Disarankan',
    subtitle: 'Arah terbaik: fondasi korporat lebih dulu, lalu lanjut ke disiplin kolaborasi dan akselerasi operasional.',
    months: ['Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    rows: [
      // startMonth / endMonth are 1-based indexes into months[]
      { label: 'Brand Guideline',      start: 3, end: 4, color: COLOR.TL_ORANGE },
      { label: 'Website Korporat',     start: 4, end: 6, color: COLOR.TL_ORANGE_SOFT },
      { label: 'Project E (opsional)',    start: 2, end: 3, color: COLOR.TL_TEAL },
      { label: 'Agentic AI + WA',      start: 5, end: 8, color: COLOR.TL_BLUE },
      { label: 'Ops Platform – Fase 0',start: 2, end: 4, color: COLOR.TL_ORANGE_SOFT },
      { label: 'Ops Platform – Fase 1',start: 5, end: 8, color: COLOR.TL_PLUM },
    ],
    waves: [
      { lead: 'Gelombang 1', tail: 'Fondasi identitas + kanal resmi' },
      { lead: 'Gelombang 2', tail: 'Kolaborasi dan visibilitas kerja' },
      { lead: 'Gelombang 3', tail: 'Automasi dan operasi skala lanjut' },
    ],
  },

  closing: {
    heading: 'TERIMA KASIH',
    brandLine: 'PT Algo Sea Biz · seoboost.co.id',
    contact: 'contact@seoboost.co.id  ·  0811 3940 4640  ·  JL. Sedap Malam No 9A Denpasar',
    closingNote: 'Siap untuk diskusi dan penetapan prioritas eksekusi.',
  },
};

// ============================================================================
// BUILD
// ============================================================================

async function buildDeck() {
  const pres = makeDeck();

  // ----- 1. COVER -----
  addCover(pres, DECK.cover);

  // Total content pages = total slides minus cover & closing.
  // For 7-slide deck (cover + 5 content + closing), content runs 02..06 of /06 total (matching reference).
  const totalContent = 7; // matches reference "02/07 ... 06/07"

  // ----- 2. MANDAT (2x3 card grid) -----
  {
    const slide = addSlide(pres);
    addContentScaffold(slide, {
      pageNum: 2, totalPages: totalContent,
      eyebrow: DECK.mandat.eyebrow, title: DECK.mandat.title, subtitle: DECK.mandat.subtitle,
    });

    // 2x3 grid layout
    const gridX = 0.5;
    const gridY = 2.85;
    const cardW = 4.05;
    const cardH = 1.6;
    const gapX = 0.13;
    const gapY = 0.2;

    DECK.mandat.cards.forEach((c, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      addBadgeCard(slide, {
        x: gridX + col * (cardW + gapX),
        y: gridY + row * (cardH + gapY),
        w: cardW, h: cardH,
        num: c.num, title: c.title, body: c.body,
      });
    });

    addBottomCallout(slide, DECK.mandat.callout);
  }

  // ----- 3. TEMUAN (insight sidebar + numbered list) -----
  {
    const slide = addSlide(pres);
    addContentScaffold(slide, {
      pageNum: 3, totalPages: totalContent,
      eyebrow: DECK.temuan.eyebrow, title: DECK.temuan.title, subtitle: DECK.temuan.subtitle,
    });

    // Sidebar on left
    addInsightSidebar(slide, {
      x: 0.5, y: 2.85, w: 2.7, h: 3.5,
      label: DECK.temuan.insight.label,
      headline: DECK.temuan.insight.headline,
      body: DECK.temuan.insight.body,
    });

    // Numbered rows on right (5 items)
    const rowX = 3.4;
    const rowY = 2.85;
    const rowW = 9.4;
    const rowH = 0.62;
    const rowGap = 0.1;
    DECK.temuan.items.forEach((item, i) => {
      addNumberedRow(slide, {
        x: rowX, y: rowY + i * (rowH + rowGap),
        w: rowW, h: rowH,
        num: item.num, title: item.title, body: item.body,
      });
    });

    addBottomCallout(slide, DECK.temuan.callout);
  }

  // ----- 4. ROADMAP (5 program cards in a row) -----
  {
    const slide = addSlide(pres);
    addContentScaffold(slide, {
      pageNum: 4, totalPages: totalContent,
      eyebrow: DECK.roadmap.eyebrow, title: DECK.roadmap.title, subtitle: DECK.roadmap.subtitle,
    });

    const count = DECK.roadmap.programs.length;
    const gridX = 0.5;
    const gridY = 3.0;
    const gapX = 0.15;
    const cardW = (12.3 - gapX * (count - 1)) / count;
    const cardH = 2.7;

    DECK.roadmap.programs.forEach((p, i) => {
      addProgramCard(slide, {
        x: gridX + i * (cardW + gapX),
        y: gridY,
        w: cardW, h: cardH,
        eyebrow: p.eyebrow, title: p.title, body: p.body,
      });
    });

    addBottomCallout(slide, DECK.roadmap.callout);
  }

  // ----- 5. PRIORITAS (target card + 4 role cards + 4 phase strip) -----
  {
    const slide = addSlide(pres);
    addContentScaffold(slide, {
      pageNum: 5, totalPages: totalContent,
      eyebrow: DECK.prioritas.eyebrow, title: DECK.prioritas.title, subtitle: DECK.prioritas.subtitle,
    });

    // Target scale-up card (top-left, compact)
    addStatCard(slide, {
      x: 0.5, y: 2.7, w: 5.5, h: 0.95,
      label: DECK.prioritas.targetCard.label,
      value: DECK.prioritas.targetCard.body,
    });

    // 4-column role cards (no eyebrow — uses the fixed addProgramCard helper)
    const rolesCount = DECK.prioritas.roles.length;
    const roleY = 3.9;
    const roleH = 1.5;
    const roleGapX = 0.15;
    const roleW = (12.3 - roleGapX * (rolesCount - 1)) / rolesCount;
    DECK.prioritas.roles.forEach((r, i) => {
      addProgramCard(slide, {
        x: 0.5 + i * (roleW + roleGapX),
        y: roleY,
        w: roleW, h: roleH,
        eyebrow: '', title: r.title, body: r.body,
      });
    });

    // Section label above phase strip
    addSectionLabel(slide, {
      x: 0.5, y: 5.55, w: 6, h: 0.3,
      text: 'PENDEKATAN BERTAHAP',
    });

    // 4-column phase strip (uses the dedicated addPhaseStripCard helper)
    const phasesCount = DECK.prioritas.phases.length;
    const phaseY = 5.9;
    const phaseH = 0.55;
    const phaseGapX = 0.15;
    const phaseW = (12.3 - phaseGapX * (phasesCount - 1)) / phasesCount;
    DECK.prioritas.phases.forEach((ph, i) => {
      addPhaseStripCard(slide, {
        x: 0.5 + i * (phaseW + phaseGapX),
        y: phaseY, w: phaseW, h: phaseH,
        eyebrow: ph.eyebrow,
        title: ph.title,
        duration: ph.body,
      });
    });

    addBottomCallout(slide, DECK.prioritas.callout);
  }

  // ----- 6. TIMELINE (gantt) -----
  {
    const slide = addSlide(pres);
    addContentScaffold(slide, {
      pageNum: 6, totalPages: totalContent,
      eyebrow: DECK.timeline.eyebrow, title: DECK.timeline.title, subtitle: DECK.timeline.subtitle,
    });

    const labelX = 0.5;
    const labelW = 2.7;
    const gridX = 3.4;
    const gridY = 2.7;
    const gridW = 9.4;
    const months = DECK.timeline.months;

    addGanttHeader(slide, { months, x: gridX, y: gridY, w: gridW });

    const rowGap = 0.13;
    const rowH = 0.36;
    const firstRowY = gridY + 0.55;
    DECK.timeline.rows.forEach((r, i) => {
      const rowY = firstRowY + i * (rowH + rowGap);
      addGanttRow(slide, {
        label: r.label,
        labelX, labelY: rowY, labelW,
        rowY, rowH,
        gridX, gridW, totalMonths: months.length,
        startMonth: r.start, endMonth: r.end,
        color: r.color,
      });
    });

    // 3 wave caption boxes at bottom
    const wavesCount = DECK.timeline.waves.length;
    const waveY = 6.45;
    const waveH = 0.45;
    const waveGap = 0.15;
    const waveW = (12.3 - waveGap * (wavesCount - 1)) / wavesCount;
    DECK.timeline.waves.forEach((w, i) => {
      const x = 0.5 + i * (waveW + waveGap);
      slide.addShape('roundRect', {
        x, y: waveY, w: waveW, h: waveH,
        fill: { color: COLOR.CHAR_BG },
        line: { color: i === 0 ? COLOR.ORANGE_HOT : COLOR.ORANGE_SOFT, width: 1 },
        rectRadius: 0.06,
      });
      slide.addText(
        [
          { text: w.lead, options: { bold: true, color: i === 0 ? COLOR.ORANGE_HOT : COLOR.TEXT_BODY } },
          { text: '  ·  ' + w.tail, options: { color: COLOR.TEXT_BODY } },
        ],
        {
          x: x + 0.2, y: waveY, w: waveW - 0.4, h: waveH,
          fontFace: 'Arial', fontSize: 11,
          valign: 'middle',
        }
      );
    });
  }

  // ----- 7. CLOSING -----
  addClosing(pres, DECK.closing);

  // ----- WRITE -----
  await pres.writeFile({ fileName: DECK.filename });
  console.log('✓ Deck written to:', DECK.filename);
}

buildDeck().catch((err) => {
  console.error('✗ Deck build failed:', err);
  process.exit(1);
});
