// ============================================================================
// SEO Boost PKS GENERATOR — config-driven Perjanjian Kerja Sama (DOCX)
// PT. Algo Sea Biz (PIHAK PERTAMA) <-> any counterparty (PIHAK KEDUA)
//
// Usage:  node generate_pks.js <config.json> [output.docx]
//   - <config.json>  path to a PKS config (see templates/pks-config.json)
//   - [output.docx]  optional; overrides config.output
//
// The generator owns the INVARIANTS: the full legal boilerplate of all 21 Pasal,
// the SEO Boost kop-surat header, A4 layout, and Courier New body styling.
// The config owns the VARIABLES ONLY: agreement numbers, signing place/date,
// PIHAK KEDUA identity + business description, the few quantitative terms
// (jangka waktu, masa kerahasiaan, cure period, payment days, dispute forum),
// and the two signatories. You do NOT edit clause text in the config — by design.
//
// See SKILL.md for the field map and design-tokens.md for the visual rules.
// ============================================================================
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  ImageRun, Header, Footer,
} = require("docx");

// --- Tokens (see design-tokens.md). Charcoal carries text; orange is accent only. ---
const CHARCOAL = "2E2B27", BRAND_ORANGE = "FF8800", TEXT_MUTED = "5C5850", TEXT_DIM = "77776F";
const INK = "3A3733", WHITE = "FFFFFF";
const BODY_FONT = "Courier New";       // counterparty-approved legal body face
const KOP_FONT = "Arial Rounded MT Bold"; // company name in the letterhead
const KOP_FONT_FB = "Arial";           // address/contact line in the letterhead
const CONTENT_W = 9072;                // A4 content width (11906 - 1417*2 left/right)

// Body type sizes are docx half-points (x0.5 = pt).
const SZ_BODY = 20;     // 10pt body
const SZ_TITLE = 30;    // 15pt "PERJANJIAN KERJA SAMA"
const SZ_SUBTITLE = 24; // 12pt judul baris-2
const SZ_NOMOR = 20;    // 10pt nomor lines
const SZ_SECTION = 22;  // 11pt "KONSIDERAN", "PASAL n", clause titles
const LINE = 264;       // ~1.1 line spacing for dense legal text

// --- SEO Boost defaults. Only PIHAK KEDUA + the variable terms are required in config. ---
const DEFAULTS = {
  logo: path.join(__dirname, "..", "assets", "logo.png"),
  kop: {
    name: "PT. BALI MIKRO TEKNOLOGI",
    divisi: "Divisi : seoboost.co.id",
    address: "Jl. Sedap Malam No. 9A, Denpasar, Bali",
    phone: "0811 3940 4640",
    email: "contact@seoboost.co.id",
  },
  pihakPertama: {
    nama: "PT Algo Sea Biz",
    bentuk: "sebuah perseroan terbatas yang didirikan berdasarkan hukum Negara Republik Indonesia",
    kedudukan: "berkedudukan di Jalan Sedap Malam, Kelurahan Sanur Kaja, Denpasar Selatan, Kota Denpasar, Bali",
    wakil: "<Nama Direktur>",
    jabatan: "Direktur",
  },
  judul: {
    baris1: "PERJANJIAN KERJA SAMA",
    baris2: "KONSULTASI DAN PENDAMPINGAN TEKNOLOGI DAN BISNIS",
  },
  ketentuan: {
    jangkaWaktu: "1 (satu) tahun",
    masaKerahasiaan: "2 (dua) tahun",
    wanprestasiCure: "30 (tiga puluh) hari kalender",
    pembayaranHariKerja: "7 (tujuh) Hari Kerja",
    kaharNotif: "7 (tujuh) Hari Kerja",
    musyawarahHari: "30 (tiga puluh) hari kalender",
    forumSengketa: "Pengadilan Negeri Denpasar",
    rangkap: "2 (dua) rangkap asli",
  },
};

// --- low-level run/paragraph helpers (Courier New body) ---
const txt = (text, o = {}) => new TextRun({
  text, font: o.font || BODY_FONT, size: o.size || SZ_BODY,
  bold: o.bold || false, italics: o.italics || false, color: o.color || INK,
});
const P = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.JUSTIFIED,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: LINE },
  indent: o.indent,
  children: Array.isArray(text) ? text : [txt(text, o)],
});
const center = (text, o = {}) => P(text, { ...o, align: AlignmentType.CENTER });

// Pasal heading: "PASAL n" then the clause title, both centered/bold.
function pasalHead(n, title) {
  return [
    center(`PASAL ${n}`, { size: SZ_SECTION, bold: true, color: CHARCOAL, before: 220, after: 0 }),
    center(title, { size: SZ_SECTION, bold: true, color: CHARCOAL, before: 0, after: 120 }),
  ];
}

// Numbered list. items: string | { t: string, sub: [items] }.
// level 0 -> "1." decimal ; level 1 -> "a." lower-letter. Hanging indent.
function list(items, level = 0) {
  const out = [];
  const baseIndent = 420 + level * 480;
  items.forEach((it, i) => {
    const marker = level === 0 ? `${i + 1}.` : `${String.fromCharCode(97 + i)}.`;
    const body = typeof it === "string" ? it : it.t;
    out.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 0, after: 80, line: LINE },
      indent: { left: baseIndent, hanging: 360 },
      children: [txt(`${marker}\t${body}`)],
    }));
    if (it && Array.isArray(it.sub)) out.push(...list(it.sub, level + 1));
  });
  return out;
}

// --- Kop surat as a repeating page header (logo + company block) ---
const LOGO_W = 120, LOGO_H = Math.round(LOGO_W / 3.448);
function kopHeader(cfg) {
  const k = cfg.kop;
  const children = [];
  if (cfg.logo && fs.existsSync(cfg.logo)) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(cfg.logo), transformation: { width: LOGO_W, height: LOGO_H } })],
    }));
  }
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
    children: [txt(k.name, { font: KOP_FONT, size: 28, bold: true, color: CHARCOAL })],
  }));
  if (k.divisi) children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
    children: [txt(k.divisi, { font: KOP_FONT_FB, size: 16, color: TEXT_MUTED })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
    children: [txt(k.address, { font: KOP_FONT_FB, size: 16, color: TEXT_MUTED })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
    children: [
      txt(k.phone, { font: KOP_FONT_FB, size: 16, color: TEXT_MUTED }),
      txt("  |  ", { font: KOP_FONT_FB, size: 16, color: BRAND_ORANGE }),
      txt(k.email, { font: KOP_FONT_FB, size: 16, color: TEXT_MUTED }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { before: 0, after: 0 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BRAND_ORANGE } },
    children: [txt("", { size: 2 })],
  }));
  return new Header({ children });
}

function footer() {
  return new Footer({ children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: "E5E5E1" } },
      spacing: { before: 40, after: 0 },
      children: [txt("Perjanjian Kerja Sama — bersifat rahasia antara PARA PIHAK", { font: KOP_FONT_FB, size: 13, italics: true, color: TEXT_DIM })],
    }),
  ] });
}

// --- Signature block: two side-by-side party columns ---
function blanks(n) {
  return Array.from({ length: n }, () => new Paragraph({ spacing: { before: 0, after: 0, line: LINE }, children: [txt("", { size: SZ_BODY })] }));
}
function signatureBlock(cfg) {
  const cell = (header, company, signer) => new TableCell({
    width: { size: CONTENT_W / 2, type: WidthType.DXA },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    verticalAlign: VerticalAlign.TOP,
    children: [
      center(header, { bold: true, color: CHARCOAL, after: 60 }),
      center(company, { bold: true, color: CHARCOAL, after: 0 }),
      ...blanks(4),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
        children: [txt(signer.nama, { bold: true, color: CHARCOAL })],
      }),
      center(signer.jabatan, { size: SZ_BODY, color: TEXT_MUTED, after: 0 }),
    ],
  });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W / 2, CONTENT_W / 2],
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [
      cell("PIHAK PERTAMA", cfg.pihakPertama.nama.toUpperCase(), cfg.tandaTangan.pertama),
      cell("PIHAK KEDUA", cfg.pihakKedua.nama.toUpperCase(), cfg.tandaTangan.kedua),
    ] })],
  });
}

// ============================================================================
// BODY — the 21 Pasal. Boilerplate is LOCKED; only ${cfg.*} spots vary.
// ============================================================================
function buildBody(cfg) {
  const p1 = cfg.pihakPertama, p2 = cfg.pihakKedua, t = cfg.ketentuan, s = cfg.penandatanganan;
  const c = [];

  // --- Title block ---
  c.push(center(cfg.judul.baris1, { size: SZ_TITLE, bold: true, color: CHARCOAL, before: 60, after: 0 }));
  c.push(center(cfg.judul.baris2, { size: SZ_SUBTITLE, bold: true, color: CHARCOAL, before: 0, after: 120 }));
  c.push(center(`Nomor: ${cfg.nomor.pertama}`, { size: SZ_NOMOR, after: 0 }));
  c.push(center(`Nomor: ${cfg.nomor.kedua}`, { size: SZ_NOMOR, after: 200 }));

  // --- Opening + parties ---
  c.push(P(`Perjanjian Kerja Sama ini (selanjutnya disebut "Perjanjian") dibuat dan ditandatangani di ${s.kota} pada hari ini, ${s.hari}, tanggal ${s.tanggal} bulan ${s.bulan} tahun ${s.tahun}, oleh dan antara:`));
  c.push(P(`${p1.nama}, ${p1.bentuk}, ${p1.kedudukan}, dalam hal ini diwakili oleh ${p1.wakil} selaku ${p1.jabatan}, dari dan oleh karenanya sah bertindak untuk dan atas nama Perusahaan, selanjutnya disebut PIHAK PERTAMA.`));
  c.push(P(`${p2.nama}, ${p2.bentuk}, ${p2.kedudukan}, dalam hal ini diwakili oleh ${p2.wakil} selaku ${p2.jabatan}, dari dan oleh karenanya sah bertindak untuk dan atas nama Perusahaan, selanjutnya disebut PIHAK KEDUA.`));
  c.push(P(`PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut "PARA PIHAK", dan secara sendiri-sendiri disebut "PIHAK".`));

  // --- KONSIDERAN ---
  c.push(center("KONSIDERAN", { size: SZ_SECTION, bold: true, color: CHARCOAL, before: 160, after: 80 }));
  c.push(P("PARA PIHAK terlebih dahulu menerangkan hal-hal sebagai berikut:"));
  c.push(...list([
    "PIHAK PERTAMA memiliki kapabilitas dalam bidang konsultasi teknologi, pendampingan bisnis, pengembangan identitas digital, desain komunikasi, pengelolaan kebutuhan website, email domain, sistem digital, workflow operasional, serta penguatan strategi bisnis.",
    `PIHAK KEDUA ${p2.deskripsiUsaha}`,
    "PIHAK KEDUA membutuhkan pendampingan strategis untuk memperkuat identitas bisnis, kesiapan digital, proses operasional, dokumentasi bisnis, serta arah pengembangan teknologi yang sesuai dengan kebutuhan usaha.",
    "PIHAK PERTAMA bersedia memberikan jasa konsultasi dan pendampingan kepada PIHAK KEDUA dalam ruang lingkup teknologi dan bisnis, termasuk namun tidak terbatas pada konsultasi desain, website, email domain, kebutuhan sistem, penguatan dokumen bisnis, dan asistensi pengembangan digital.",
    "PARA PIHAK memahami bahwa pekerjaan atau kebutuhan tambahan di luar ruang lingkup konsultasi dan pendampingan dasar, termasuk biaya pihak ketiga, lisensi, domain, hosting, email berbayar, pengembangan aplikasi khusus, pengadaan perangkat, produksi desain lanjutan, iklan, dan/atau biaya lain yang menimbulkan pengeluaran tambahan, akan diatur dan ditagihkan secara terpisah berdasarkan persetujuan PARA PIHAK.",
  ]));
  c.push(P("Berdasarkan hal-hal tersebut, PARA PIHAK sepakat untuk mengikatkan diri dalam Perjanjian ini dengan syarat dan ketentuan sebagai berikut."));

  // --- PASAL 1: Definisi ---
  c.push(...pasalHead(1, "Definisi"));
  c.push(P("Kecuali apabila konteks menentukan lain, istilah-istilah di bawah ini mempunyai arti sebagai berikut:"));
  c.push(...list([
    `Perjanjian adalah Perjanjian Kerja Sama ${cfg.judul.baris2.charAt(0) + cfg.judul.baris2.slice(1).toLowerCase()} ini beserta seluruh perubahan, lampiran, addendum, dan dokumen turunannya yang disepakati PARA PIHAK.`,
    "Dokumen Pelaksanaan adalah setiap dokumen turunan yang mengatur pekerjaan, biaya, atau aktivitas tertentu, termasuk namun tidak terbatas pada proposal, ruang lingkup kerja, quotation, invoice, surat persetujuan, berita acara, addendum, atau dokumen lain yang disepakati PARA PIHAK.",
    "Jasa Pendampingan adalah layanan konsultasi, arahan, asistensi, koordinasi, rekomendasi, review, penyusunan konsep, dan/atau dukungan implementatif terbatas yang diberikan PIHAK PERTAMA kepada PIHAK KEDUA sesuai ruang lingkup Perjanjian ini.",
    "Biaya Tambahan adalah setiap biaya di luar ruang lingkup dasar Jasa Pendampingan, termasuk namun tidak terbatas pada domain, hosting, email berbayar, lisensi, pengembangan aplikasi khusus, perangkat keras, produksi desain, biaya iklan, biaya vendor, dan/atau biaya pihak ketiga lainnya.",
    "Informasi Rahasia adalah seluruh data, informasi, dokumen, strategi, rencana bisnis, data pelanggan, data transaksi, konfigurasi sistem, harga, model kerja, dan informasi lain yang tidak tersedia untuk umum.",
    "Hari Kerja adalah hari Senin sampai dengan Jumat, kecuali hari libur nasional atau hari yang ditetapkan pemerintah sebagai hari libur resmi di Republik Indonesia.",
    "Kekayaan Intelektual adalah hak atas karya cipta, desain, perangkat lunak, source code, dokumentasi teknis, desain sistem, database structure, metode, template, modul, framework, atau hak sejenis lainnya yang dilindungi hukum.",
  ]));

  // --- PASAL 2: Sifat dan Tujuan ---
  c.push(...pasalHead(2, "Sifat dan Tujuan Perjanjian"));
  c.push(...list([
    "Perjanjian ini merupakan perjanjian kerja sama jasa konsultasi dan pendampingan teknologi serta bisnis antara PARA PIHAK.",
    "PIHAK PERTAMA bertindak sebagai konsultan pendamping yang memberikan arahan, rekomendasi, asistensi, koordinasi, dan dukungan implementatif terbatas kepada PIHAK KEDUA sesuai ruang lingkup yang disepakati.",
    { t: "Tujuan Perjanjian ini adalah:", sub: [
      "memperkuat kesiapan teknologi dan identitas digital PIHAK KEDUA;",
      "mendukung pengembangan bisnis, operasional, dan komunikasi digital PIHAK KEDUA;",
      "membantu PIHAK KEDUA dalam perencanaan dan pendampingan kebutuhan desain, website, email domain, sistem, dashboard, dokumen bisnis, dan kebutuhan digital lainnya;",
      "menyediakan kerangka kerja sama yang fleksibel, profesional, dan dapat ditinjau kembali dari waktu ke waktu;",
      "memastikan bahwa setiap pekerjaan tambahan di luar ruang lingkup dasar konsultasi dapat diatur melalui kesepakatan dan tagihan terpisah.",
    ] },
  ]));

  // --- PASAL 3: Ruang Lingkup ---
  c.push(...pasalHead(3, "Ruang Lingkup Pendampingan Teknologi dan Bisnis"));
  c.push(P("Ruang lingkup kerja sama dalam Perjanjian ini meliputi jasa konsultasi dan pendampingan, antara lain:"));
  c.push(...list([
    "Konsultasi Strategi Bisnis, meliputi pemetaan kebutuhan bisnis, penyusunan arah pengembangan usaha, penguatan positioning, value proposition, model bisnis, serta pendampingan penyusunan bahan presentasi, proposal, profil usaha, atau dokumen bisnis lainnya.",
    "Pendampingan Identitas Digital dan Desain, meliputi pendampingan konsep desain visual, penguatan identitas brand, arahan desain company profile, deck, katalog, materi promosi, atau kebutuhan visual lainnya.",
    "Pendampingan Website dan Digital Presence, meliputi pendampingan perencanaan website atau landing page, penyusunan struktur konten website, koordinasi kebutuhan domain, hosting, email domain, dan aset digital lainnya.",
    "Pendampingan Email Domain dan Infrastruktur Digital Dasar, meliputi asistensi kebutuhan email perusahaan berbasis domain, rekomendasi platform email, domain, hosting, atau layanan pihak ketiga, serta pendampingan konfigurasi dasar sepanjang masih dalam ruang lingkup yang disepakati.",
    "Pendampingan Sistem dan Proses Operasional, meliputi pemetaan workflow operasional, rekomendasi kebutuhan sistem, pendampingan penyusunan dashboard, database, SOP digital, sistem pencatatan sederhana, dan/atau koordinasi dengan penyedia teknologi apabila diperlukan.",
    "Pendampingan Implementasi dan Review Berkala, meliputi monitoring progres pekerjaan, evaluasi kebutuhan teknologi dan bisnis, rapat koordinasi, serta review terhadap hasil kerja, kendala, dan kebutuhan pengembangan lanjutan.",
  ]));
  c.push(P("Ruang lingkup sebagaimana dimaksud dalam Pasal ini bersifat konsultatif dan pendampingan. Pekerjaan teknis, pengadaan, pengembangan aplikasi khusus, produksi desain lanjutan, lisensi, langganan layanan pihak ketiga, perangkat, biaya iklan, atau biaya lain yang menimbulkan biaya tambahan akan diatur secara terpisah."));

  // --- PASAL 4: Batasan & Biaya Tambahan ---
  c.push(...pasalHead(4, "Batasan Ruang Lingkup dan Biaya Tambahan"));
  c.push(...list([
    "PARA PIHAK sepakat bahwa ruang lingkup utama Perjanjian ini adalah Jasa Pendampingan teknologi dan bisnis.",
    { t: "Ruang lingkup Perjanjian ini tidak secara otomatis mencakup:", sub: [
      "pembelian domain;", "pembayaran hosting;", "langganan email berbayar;",
      "lisensi software atau aplikasi pihak ketiga;", "pengembangan aplikasi custom;",
      "pengadaan perangkat keras;", "biaya produksi desain cetak;", "biaya iklan digital;",
      "biaya foto, video, konten profesional, atau produksi media;",
      "biaya transportasi, akomodasi, atau operasional lapangan;", "biaya pihak ketiga lainnya.",
    ] },
    { t: "Apabila terdapat kebutuhan tambahan di luar ruang lingkup konsultasi dan pendampingan dasar yang menimbulkan biaya, maka biaya tersebut akan:", sub: [
      "diinformasikan terlebih dahulu kepada PIHAK KEDUA;",
      "disetujui secara tertulis oleh PARA PIHAK;",
      "dituangkan dalam penawaran, invoice, purchase order, surat persetujuan, atau dokumen lain yang disepakati;",
      "ditagihkan secara terpisah dari kewajiban utama dalam Perjanjian ini.",
    ] },
    "Persetujuan tertulis sebagaimana dimaksud dalam ayat (3) dapat dilakukan melalui dokumen fisik, email, pesan elektronik, atau media komunikasi tertulis lain yang dapat dibuktikan.",
    "PIHAK PERTAMA tidak berkewajiban menanggung atau membayar terlebih dahulu biaya pihak ketiga, kecuali disepakati secara tertulis oleh PARA PIHAK.",
  ]));

  // --- PASAL 5: Mekanisme Pelaksanaan ---
  c.push(...pasalHead(5, "Mekanisme Pelaksanaan Pendampingan"));
  c.push(...list([
    "Pelaksanaan pendampingan dilakukan melalui rapat koordinasi, diskusi teknis, komunikasi tertulis, penyusunan rekomendasi, penyusunan dokumen, review kebutuhan, dan/atau bentuk asistensi lain yang disepakati PARA PIHAK.",
    "PIHAK KEDUA wajib menunjuk PIC yang berwenang untuk memberikan data, arahan, persetujuan, dan keputusan yang diperlukan dalam pelaksanaan pendampingan.",
    "PIHAK PERTAMA dapat memberikan rekomendasi terkait penyedia jasa, platform teknologi, domain, hosting, email, desain, website, sistem, atau kebutuhan pendukung lainnya, namun keputusan akhir tetap berada pada PIHAK KEDUA.",
    "Apabila suatu pekerjaan membutuhkan keterlibatan pihak ketiga, maka hubungan komersial dengan pihak ketiga dapat dilakukan langsung oleh PIHAK KEDUA atau melalui PIHAK PERTAMA berdasarkan kesepakatan tertulis.",
    "Setiap pekerjaan tambahan yang bersifat teknis, produksi, pengadaan, atau implementasi khusus dapat dituangkan dalam dokumen terpisah berupa proposal, quotation, invoice, purchase order, statement of work, atau addendum.",
  ]));

  // --- PASAL 6: Hak & Kewajiban PIHAK PERTAMA ---
  c.push(...pasalHead(6, "Hak dan Kewajiban PIHAK PERTAMA"));
  c.push(...list([
    { t: "PIHAK PERTAMA berkewajiban:", sub: [
      "memberikan jasa konsultasi dan pendampingan teknologi serta bisnis secara profesional dan dengan itikad baik;",
      "membantu PIHAK KEDUA dalam merumuskan kebutuhan teknologi, desain, website, email domain, sistem, dokumen bisnis, dan pengembangan digital;",
      "memberikan rekomendasi yang wajar berdasarkan informasi yang tersedia;",
      "menjaga kerahasiaan data dan informasi PIHAK KEDUA;",
      "menyampaikan kendala, kebutuhan data, atau ketergantungan pihak ketiga yang dapat memengaruhi pelaksanaan pendampingan;",
      "melakukan review berkala terhadap progres pendampingan sesuai kebutuhan PARA PIHAK.",
    ] },
    { t: "PIHAK PERTAMA berhak:", sub: [
      "menerima pembayaran atau kompensasi sesuai ketentuan komersial yang disepakati;",
      "memperoleh data, informasi, akses, dan keputusan yang diperlukan dari PIHAK KEDUA;",
      "mengajukan biaya tambahan apabila terdapat pekerjaan di luar ruang lingkup konsultasi dasar;",
      "menunda pelaksanaan pekerjaan tambahan apabila biaya, data, atau persetujuan yang diperlukan belum dipenuhi;",
      "mempertahankan hak atas metode, template, framework, desain dasar, know-how, dan Kekayaan Intelektual milik PIHAK PERTAMA.",
    ] },
  ]));

  // --- PASAL 7: Hak & Kewajiban PIHAK KEDUA ---
  c.push(...pasalHead(7, "Hak dan Kewajiban PIHAK KEDUA"));
  c.push(...list([
    { t: "PIHAK KEDUA berkewajiban:", sub: [
      "menyediakan data, informasi, arahan, dan persetujuan yang dibutuhkan;",
      "menunjuk PIC yang dapat mengambil keputusan atau memberikan arahan;",
      "melakukan pembayaran atas jasa pendampingan dan/atau biaya tambahan sesuai kesepakatan;",
      "melakukan review atas hasil rekomendasi, desain, dokumen, website, email domain, atau output pendampingan lain dalam waktu yang wajar;",
      "menanggung biaya pihak ketiga, lisensi, langganan, domain, hosting, email berbayar, pengadaan, produksi, atau biaya tambahan lainnya apabila telah disetujui.",
    ] },
    { t: "PIHAK KEDUA berhak:", sub: [
      "menerima pendampingan teknologi dan bisnis sesuai ruang lingkup Perjanjian;",
      "memperoleh rekomendasi, arahan, review, atau asistensi yang relevan;",
      "meminta klarifikasi atas pekerjaan atau rekomendasi PIHAK PERTAMA;",
      "melakukan evaluasi dan review terhadap kerja sama selama masa Perjanjian.",
    ] },
  ]));

  // --- PASAL 8: Ketentuan Komersial ---
  c.push(...pasalHead(8, "Ketentuan Komersial, Pembayaran, dan Biaya Tambahan"));
  c.push(...list([
    "Nilai jasa konsultasi dan pendampingan, apabila disepakati, akan diatur dalam lampiran, invoice, atau dokumen komersial terpisah.",
    "Perjanjian ini tidak mencakup biaya pihak ketiga atau biaya tambahan di luar ruang lingkup konsultasi dasar, kecuali disepakati secara tertulis.",
    { t: "Biaya tambahan dapat meliputi namun tidak terbatas pada:", sub: [
      "domain;", "hosting;", "email domain atau email berbayar;", "lisensi software;",
      "pengembangan website lanjutan;", "pengembangan aplikasi custom;",
      "desain lanjutan atau produksi konten;", "biaya iklan;", "perangkat keras;",
      "biaya vendor pihak ketiga;", "biaya operasional lapangan.",
    ] },
    "Setiap biaya tambahan akan diinformasikan kepada PIHAK KEDUA dan hanya dapat ditagihkan setelah memperoleh persetujuan.",
    "Tagihan tambahan dapat diterbitkan oleh PIHAK PERTAMA dalam bentuk invoice terpisah sesuai nilai, termin, dan ruang lingkup yang disetujui.",
    `Kecuali disepakati lain, pembayaran atas invoice dilakukan paling lambat ${t.pembayaranHariKerja} sejak tanggal invoice diterima oleh PIHAK KEDUA.`,
    "Keterlambatan pembayaran dapat menjadi dasar bagi PIHAK PERTAMA untuk menunda pekerjaan tambahan sampai pembayaran diselesaikan.",
  ]));

  // --- PASAL 9: Standar Pelaksanaan ---
  c.push(...pasalHead(9, "Standar Pelaksanaan dan Review Hasil Kerja"));
  c.push(...list([
    "Standar mutu, indikator keberhasilan, spesifikasi teknis, service level, masa review, dan mekanisme penerimaan hasil kerja akan diatur dalam Dokumen Pelaksanaan apabila diperlukan.",
    "Apabila hasil kerja memerlukan uji coba, review, atau verifikasi, maka proses tersebut dilakukan sesuai kriteria yang disepakati PARA PIHAK.",
    "Apabila PIHAK KEDUA tidak memberikan tanggapan dalam jangka waktu yang disepakati setelah hasil kerja disampaikan, maka hasil kerja dapat dianggap telah direview secara layak sejauh diatur demikian dalam Dokumen Pelaksanaan.",
    "Ketentuan terkait bug fixing, support, maintenance, atau masa garansi layanan hanya berlaku apabila diatur secara tertulis dalam Dokumen Pelaksanaan.",
  ]));

  // --- PASAL 10: Batasan Tanggung Jawab ---
  c.push(...pasalHead(10, "Sifat Rekomendasi dan Batasan Tanggung Jawab"));
  c.push(...list([
    "PARA PIHAK memahami bahwa jasa PIHAK PERTAMA bersifat konsultasi, pendampingan, rekomendasi, dan asistensi implementasi.",
    "PIHAK PERTAMA tidak menjamin secara mutlak tercapainya target penjualan, pendapatan, keuntungan, akuisisi pelanggan, keberhasilan sistem, atau hasil bisnis tertentu, karena hal tersebut dipengaruhi oleh berbagai faktor di luar kendali PIHAK PERTAMA.",
    "Keputusan akhir atas penggunaan rekomendasi, pemilihan vendor, pembelian layanan pihak ketiga, pelaksanaan strategi, dan pengambilan keputusan bisnis tetap berada pada PIHAK KEDUA.",
    "PIHAK PERTAMA bertanggung jawab sebatas pada pelaksanaan Jasa Pendampingan sesuai ruang lingkup yang disepakati PARA PIHAK.",
  ]));

  // --- PASAL 11: Kerahasiaan ---
  c.push(...pasalHead(11, "Kerahasiaan"));
  c.push(...list([
    "Masing-masing PIHAK wajib menjaga kerahasiaan seluruh Informasi Rahasia yang diperoleh dari PIHAK lainnya dalam rangka pelaksanaan Perjanjian ini.",
    "Informasi Rahasia hanya boleh digunakan untuk kepentingan pelaksanaan Perjanjian dan Dokumen Pelaksanaan.",
    "Suatu PIHAK tidak boleh mengungkapkan Informasi Rahasia kepada pihak ketiga tanpa persetujuan tertulis terlebih dahulu dari PIHAK lainnya, kecuali diwajibkan oleh hukum, putusan pengadilan, atau perintah instansi berwenang.",
    `Kewajiban kerahasiaan tetap berlaku selama Perjanjian ini berjalan dan untuk jangka waktu ${t.masaKerahasiaan} setelah Perjanjian ini berakhir.`,
    { t: "Pengecualian atas Informasi Rahasia berlaku terhadap informasi yang:", sub: [
      "telah menjadi milik publik tanpa pelanggaran Perjanjian;",
      "telah sah dimiliki penerima sebelum diungkapkan;",
      "diperoleh secara sah dari pihak ketiga yang tidak terikat kewajiban kerahasiaan.",
    ] },
  ]));

  // --- PASAL 12: Data & Kepatuhan ---
  c.push(...pasalHead(12, "Data dan Kepatuhan"));
  c.push(...list([
    "PARA PIHAK sepakat untuk menggunakan, memproses, menyimpan, dan mengelola data sesuai hukum yang berlaku dan hanya sejauh diperlukan untuk pelaksanaan kerja sama.",
    "PIHAK KEDUA menjamin bahwa data yang diberikan kepada PIHAK PERTAMA adalah data yang secara hukum dapat digunakan untuk keperluan Jasa Pendampingan.",
    "PIHAK PERTAMA wajib menerapkan langkah-langkah pengamanan yang wajar terhadap data yang dikelola dalam ruang lingkup Jasa Pendampingan.",
    "Ketentuan teknis lebih lanjut mengenai akses, backup, retensi, migrasi, atau penghapusan data dapat diatur dalam Dokumen Pelaksanaan.",
  ]));

  // --- PASAL 13: Kekayaan Intelektual ---
  c.push(...pasalHead(13, "Kekayaan Intelektual"));
  c.push(...list([
    "Seluruh Kekayaan Intelektual yang telah dimiliki oleh masing-masing PIHAK sebelum Perjanjian ini tetap menjadi milik PIHAK yang semula memilikinya.",
    "Sepanjang tidak ditentukan lain secara tertulis, metode, template, framework, alat bantu, source code generik, library internal, desain arsitektur umum, dan know-how milik PIHAK PERTAMA tetap menjadi milik PIHAK PERTAMA.",
    "Hasil kerja yang secara khusus dibuat untuk PIHAK KEDUA dapat digunakan oleh PIHAK KEDUA sesuai tujuan bisnisnya sepanjang kewajiban pembayarannya telah dipenuhi.",
    "Pengalihan kepemilikan penuh atas source code, sistem, database structure, atau aset digital lainnya hanya berlaku jika secara tegas dinyatakan dalam Dokumen Pelaksanaan atau perjanjian terpisah.",
    "PIHAK KEDUA tidak diperkenankan menggandakan, menjual kembali, melisensikan ulang, membongkar, atau mengeksploitasi komponen milik PIHAK PERTAMA di luar hak penggunaan yang diberikan, kecuali disetujui tertulis.",
  ]));

  // --- PASAL 14: Pernyataan & Jaminan ---
  c.push(...pasalHead(14, "Pernyataan dan Jaminan"));
  c.push(P("Masing-masing PIHAK menyatakan dan menjamin bahwa:"));
  c.push(...list([
    "PIHAK tersebut adalah badan hukum yang sah dan berwenang untuk menandatangani Perjanjian ini.",
    "Penandatangan Perjanjian ini memiliki kewenangan yang sah untuk mewakili PIHAK yang bersangkutan.",
    "Pelaksanaan Perjanjian ini tidak bertentangan dengan anggaran dasar, perjanjian lain, maupun ketentuan hukum yang mengikat PIHAK tersebut.",
    "PIHAK tersebut akan menjalankan kewajibannya dengan itikad baik.",
  ]));

  // --- PASAL 15: Jangka Waktu ---
  c.push(...pasalHead(15, "Jangka Waktu dan Review Kerja Sama"));
  c.push(...list([
    "Perjanjian ini mulai berlaku sejak tanggal ditandatangani oleh PARA PIHAK.",
    `Jangka waktu Perjanjian ini adalah selama ${t.jangkaWaktu}, kecuali diakhiri lebih awal sesuai ketentuan Perjanjian ini.`,
    "Perjanjian ini dapat diperpanjang berdasarkan persetujuan tertulis PARA PIHAK.",
    "PARA PIHAK dapat melakukan review terhadap pelaksanaan Perjanjian ini sewaktu-waktu apabila terdapat kebutuhan perubahan ruang lingkup, pengembangan pekerjaan, perubahan kondisi bisnis, perubahan kebutuhan teknologi, atau hal lain yang dianggap perlu.",
    "Review sebagaimana dimaksud pada ayat (4) dapat menghasilkan penyesuaian ruang lingkup, penyesuaian biaya, penambahan pekerjaan, penghentian sebagian pekerjaan, addendum, Dokumen Pelaksanaan, atau invoice tambahan.",
    "Berakhirnya Perjanjian ini tidak menghapus kewajiban pembayaran atas pekerjaan, biaya tambahan, atau tagihan yang telah disetujui dan/atau telah dilaksanakan sebelum tanggal berakhirnya Perjanjian.",
  ]));

  // --- PASAL 16: Pengakhiran ---
  c.push(...pasalHead(16, "Pengakhiran"));
  c.push(...list([
    { t: "Perjanjian ini dapat diakhiri:", sub: [
      "berdasarkan kesepakatan tertulis PARA PIHAK;",
      "karena jangka waktu Perjanjian berakhir dan tidak diperpanjang;",
      `karena salah satu PIHAK melakukan wanprestasi material dan tidak memperbaikinya dalam waktu ${t.wanprestasiCure} sejak diterimanya pemberitahuan tertulis;`,
      "karena PIHAK dinyatakan pailit, dibubarkan, atau tidak lagi memiliki kemampuan hukum untuk melaksanakan Perjanjian, sejauh diperbolehkan oleh hukum.",
    ] },
    { t: "Pengakhiran Perjanjian ini tidak menghapus:", sub: [
      "hak PIHAK PERTAMA untuk menerima pembayaran atas pekerjaan atau biaya tambahan yang telah dilaksanakan atau telah disetujui;",
      "kewajiban kerahasiaan;",
      "ketentuan mengenai penyelesaian sengketa;",
      "hak dan kewajiban lain yang menurut sifatnya tetap berlaku setelah Perjanjian berakhir.",
    ] },
  ]));

  // --- PASAL 17: Keadaan Kahar ---
  c.push(...pasalHead(17, "Keadaan Kahar"));
  c.push(...list([
    "Yang dimaksud dengan Keadaan Kahar adalah kejadian di luar kekuasaan wajar salah satu PIHAK, termasuk namun tidak terbatas pada bencana alam, wabah, perang, kerusuhan, kebakaran besar, sabotase, gangguan infrastruktur vital, kebijakan pemerintah, atau kegagalan sistemik yang secara langsung memengaruhi pelaksanaan kewajiban.",
    `PIHAK yang mengalami Keadaan Kahar wajib memberitahukan secara tertulis kepada PIHAK lainnya paling lambat ${t.kaharNotif} sejak kejadian tersebut diketahui.`,
    "Selama Keadaan Kahar berlangsung, kewajiban PIHAK yang terdampak dapat ditunda sepanjang benar-benar terhalang oleh keadaan tersebut.",
    "PARA PIHAK akan bermusyawarah untuk menentukan penyesuaian jadwal, ruang lingkup, atau cara pelaksanaan yang paling wajar.",
  ]));

  // --- PASAL 18: Penyelesaian Sengketa ---
  c.push(...pasalHead(18, "Penyelesaian Sengketa"));
  c.push(...list([
    "Setiap perselisihan yang timbul dari atau sehubungan dengan Perjanjian ini maupun Dokumen Pelaksanaan akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat.",
    `Apabila dalam waktu ${t.musyawarahHari} sejak dimulainya musyawarah tidak tercapai penyelesaian, PARA PIHAK sepakat untuk menyelesaikannya melalui ${t.forumSengketa}, kecuali PARA PIHAK kemudian menyepakati forum lain secara tertulis.`,
  ]));

  // --- PASAL 19: Korespondensi ---
  c.push(...pasalHead(19, "Korespondensi dan Pemberitahuan"));
  c.push(...list([
    "Setiap pemberitahuan, permintaan, persetujuan, atau komunikasi resmi berdasarkan Perjanjian ini harus dilakukan secara tertulis.",
    "Pemberitahuan dianggap sah apabila disampaikan melalui surat, email resmi, atau media tertulis lain yang lazim digunakan PARA PIHAK.",
    "Alamat dan kontak resmi PARA PIHAK untuk keperluan korespondensi akan dicantumkan dalam lampiran atau diberitahukan kemudian secara tertulis.",
  ]));

  // --- PASAL 20: Lain-Lain ---
  c.push(...pasalHead(20, "Ketentuan Lain-Lain"));
  c.push(...list([
    "Perubahan terhadap Perjanjian ini hanya sah apabila dibuat secara tertulis dan ditandatangani oleh PARA PIHAK atau disepakati melalui mekanisme tertulis lain yang dapat dibuktikan.",
    "Kegagalan salah satu PIHAK untuk menegakkan suatu ketentuan dalam Perjanjian ini tidak dapat ditafsirkan sebagai pelepasan hak.",
    "Apabila terdapat satu ketentuan dalam Perjanjian ini yang menjadi tidak sah atau tidak dapat dilaksanakan, maka ketentuan lainnya tetap berlaku sepenuhnya.",
    "Perjanjian ini merupakan keseluruhan kesepahaman PARA PIHAK mengenai pokok yang diatur di dalamnya dan menggantikan komunikasi atau pemahaman sebelumnya yang bersifat umum, kecuali dinyatakan tetap berlaku secara tegas.",
  ]));

  // --- PASAL 21: Penutup ---
  c.push(...pasalHead(21, "Penutup"));
  c.push(...list([
    `Perjanjian ini dibuat dalam ${t.rangkap} yang masing-masing mempunyai kekuatan hukum yang sama.`,
    { t: "Dokumen-dokumen berikut dapat menjadi bagian yang tidak terpisahkan dari Perjanjian ini sepanjang disetujui PARA PIHAK:", sub: [
      "proposal kerja sama;", "ruang lingkup kerja atau Statement of Work;",
      "proposal komersial atau quotation;", "Purchase Order atau surat persetujuan;",
      "Invoice;", "berita acara;", "addendum dan lampiran lainnya.",
    ] },
    "Demikian Perjanjian ini dibuat dan ditandatangani oleh PARA PIHAK dalam keadaan sadar, tanpa paksaan, serta untuk dilaksanakan dengan penuh tanggung jawab.",
  ]));

  // --- Signature ---
  c.push(new Paragraph({ spacing: { before: 240, after: 0 }, children: [txt("", { size: 2 })] }));
  c.push(signatureBlock(cfg));

  return c;
}

function buildDoc(cfg) {
  return new Document({
    styles: { default: { document: { run: { font: BODY_FONT, size: SZ_BODY } } } },
    sections: [{
      properties: { page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1700, right: 1417, bottom: 1191, left: 1417, header: 360, footer: 480 },
      } },
      headers: { default: kopHeader(cfg) },
      footers: { default: footer() },
      children: buildBody(cfg),
    }],
  });
}

// --- Config loading with SEO Boost defaults deep-merged ---
function loadConfig(p) {
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  const m = (def, ov) => ({ ...def, ...(ov || {}) });
  const cfg = {
    ...DEFAULTS, ...raw,
    kop: m(DEFAULTS.kop, raw.kop),
    pihakPertama: m(DEFAULTS.pihakPertama, raw.pihakPertama),
    judul: m(DEFAULTS.judul, raw.judul),
    ketentuan: m(DEFAULTS.ketentuan, raw.ketentuan),
  };
  // Sensible signatory defaults: PIHAK PERTAMA -> SEO Boost rep; PIHAK KEDUA -> their rep.
  const tt = raw.tandaTangan || {};
  cfg.tandaTangan = {
    pertama: m({ nama: cfg.pihakPertama.wakil, jabatan: cfg.pihakPertama.jabatan }, tt.pertama),
    kedua: m({ nama: (raw.pihakKedua || {}).wakil, jabatan: (raw.pihakKedua || {}).jabatan }, tt.kedua),
  };
  return cfg;
}

function validate(cfg) {
  const miss = [];
  if (!cfg.nomor || !cfg.nomor.pertama || !cfg.nomor.kedua) miss.push("nomor.pertama / nomor.kedua");
  if (!cfg.penandatanganan) miss.push("penandatanganan (kota/hari/tanggal/bulan/tahun)");
  const p2 = cfg.pihakKedua;
  if (!p2 || !p2.nama || !p2.bentuk || !p2.kedudukan || !p2.wakil || !p2.jabatan || !p2.deskripsiUsaha)
    miss.push("pihakKedua (nama/bentuk/kedudukan/wakil/jabatan/deskripsiUsaha)");
  if (miss.length) {
    console.error("Config tidak lengkap. Field wajib yang hilang:\n  - " + miss.join("\n  - "));
    process.exit(1);
  }
}

(async () => {
  const cfgPath = process.argv[2];
  if (!cfgPath) {
    console.error("Usage: node generate_pks.js <config.json> [output.docx]");
    process.exit(1);
  }
  const cfg = loadConfig(cfgPath);
  validate(cfg);
  const out = process.argv[3] || cfg.output;
  if (!out) { console.error("No output path (pass as 2nd arg or set 'output' in config)."); process.exit(1); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await Packer.toBuffer(buildDoc(cfg)));
  console.log(`OK: PKS written -> ${out}`);
  console.log(`    PIHAK PERTAMA : ${cfg.pihakPertama.nama} (${cfg.tandaTangan.pertama.nama})`);
  console.log(`    PIHAK KEDUA   : ${cfg.pihakKedua.nama} (${cfg.tandaTangan.kedua.nama})`);
  console.log(`    Nomor         : ${cfg.nomor.pertama}  |  ${cfg.nomor.kedua}`);
  console.log(`    Tertanda di   : ${cfg.penandatanganan.kota}, ${cfg.penandatanganan.hari} ${cfg.penandatanganan.tanggal} ${cfg.penandatanganan.bulan} ${cfg.penandatanganan.tahun}`);
})();
