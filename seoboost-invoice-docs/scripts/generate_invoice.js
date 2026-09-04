// ============================================================================
// SEO Boost INVOICE GENERATOR — config-driven, single-page DOCX
// PT. Algo Sea Biz (SEO Boost) -> any client
//
// Usage:  node generate_invoice.js <config.json> [output.docx]
//   - <config.json>  path to an invoice config (see templates/invoice-config.json)
//   - [output.docx]  optional; overrides config.output
//
// The generator owns the INVARIANTS (brand, layout, terbilang, 1-page tuning).
// The config owns the VARIABLES (recipient, items, amounts, allocation, bank,
// director). Money math (subtotal / donatur allocation / total tunai) and the
// Indonesian "terbilang" line are computed automatically — never hand-type them.
// ============================================================================
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  ImageRun, Footer,
} = require("docx");

// --- Tokens: SEO Boost brand palette (sampled from logo). See design-tokens.md. ---
// Brand orange is for FILLS/BORDERS only (too light for text); charcoal carries text.
const CHARCOAL = "2E2B27", ACCENT = "A85500", SAND_LIGHT = "F0F0EB", ACCENT_LIGHT = "FFF4E5";
const BRAND_ORANGE = "FF8800", ACCENT_DARK = "A85500";
const GRAY_BAND = "F7F7F4", GRAY_BORDER = "E5E5E1", WHITE = "FFFFFF", INK = "3A3733";
const TEXT_MUTED = "5C5850", TEXT_DIM = "77776F", TEXT_DARK = "3A3733";
const FONT = "Arial";
const CONTENT_W = 9360;

// --- Defaults: a bare config only needs recipient + items. SEO Boost identity fills in. ---
const DEFAULTS = {
  // Logo is bundled inside the skill (assets/logo.png) so it travels with it.
  // Resolved relative to this script, not the cwd. Override via config.logo.
  logo: path.join(__dirname, "..", "assets", "logo.png"),
  issuer: {
    name: "PT. BALI MIKRO TEKNOLOGI",
    address: "Jl. Sedap Malam No. 9A, Denpasar, Bali",
    phone: "0811 3940 4640",
    email: "contact@seoboost.co.id",
    city: "Denpasar",
    signerName: "PT. Algo Sea Biz",
  },
  bank: { bank: "<BANK>", accountNo: "<NOMOR REKENING>", accountName: "PT Algo Sea Biz" },
  recipient: { attn: "u.p. Pengurus / Bagian Keuangan", line3: "di Tempat" },
};

// --- helpers ---
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const b = (color = GRAY_BORDER, size = 2) => ({ style: BorderStyle.SINGLE, size, color });
const allB = (c = GRAY_BORDER) => ({ top: b(c), bottom: b(c), left: b(c), right: b(c) });
const money = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const run = (text, o = {}) => new TextRun({
  text, font: FONT, size: o.size || 20, bold: o.bold || false,
  italics: o.italics || false, color: o.color || INK,
});

// Terbilang (Indonesian number-to-words) — sufficient up to billions.
function terbilang(n) {
  const sat = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  function toWords(x) {
    if (x < 12) return sat[x];
    if (x < 20) return toWords(x - 10) + " belas";
    if (x < 100) return toWords(Math.floor(x / 10)) + " puluh" + (x % 10 ? " " + toWords(x % 10) : "");
    if (x < 200) return "seratus" + (x % 100 ? " " + toWords(x % 100) : "");
    if (x < 1000) return toWords(Math.floor(x / 100)) + " ratus" + (x % 100 ? " " + toWords(x % 100) : "");
    if (x < 2000) return "seribu" + (x % 1000 ? " " + toWords(x % 1000) : "");
    if (x < 1000000) return toWords(Math.floor(x / 1000)) + " ribu" + (x % 1000 ? " " + toWords(x % 1000) : "");
    if (x < 1000000000) return toWords(Math.floor(x / 1000000)) + " juta" + (x % 1000000 ? " " + toWords(x % 1000000) : "");
    return toWords(Math.floor(x / 1000000000)) + " miliar" + (x % 1000000000 ? " " + toWords(x % 1000000000) : "");
  }
  if (n === 0) return "nol rupiah";
  const w = toWords(n).replace(/\s+/g, " ").trim();
  return w.charAt(0).toUpperCase() + w.slice(1) + " rupiah";
}

// --- Kop surat (letterhead) — CENTERED layout ---
// Logo is near-square (ratio 1.143); height derived from width to avoid distortion.
const LOGO_W = 168, LOGO_H = Math.round(LOGO_W / 3.448); // 168 x 49
function kopSurat(cfg) {
  const iss = cfg.issuer;
  const children = [];
  if (cfg.logo && fs.existsSync(cfg.logo)) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(cfg.logo), transformation: { width: LOGO_W, height: LOGO_H } })],
    }));
  }
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 },
    children: [run(iss.name, { size: 30, bold: true, color: CHARCOAL })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
    children: [run(iss.address, { size: 18, color: TEXT_MUTED })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
    children: [
      run("Telp: " + iss.phone, { size: 18, color: TEXT_MUTED }),
      run("   |   ", { size: 18, color: BRAND_ORANGE }),
      run("Email: " + iss.email, { size: 18, color: TEXT_MUTED }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { before: 80, after: 110 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: BRAND_ORANGE } },
    children: [run("", { size: 2 })],
  }));
  return children;
}

function titleBand(subtitle) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 20 },
      children: [run("INVOICE", { size: 40, bold: true, color: CHARCOAL })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 },
      children: [run(subtitle, { size: 20, italics: true, color: ACCENT })] }),
  ];
}

function metaBlock(cfg) {
  const rec = cfg.recipient;
  const recChildren = [
    new Paragraph({ spacing: { before: 0, after: 30 }, children: [run("Kepada Yth.", { size: 18, color: TEXT_MUTED })] }),
    new Paragraph({ spacing: { before: 0, after: 6 }, children: [run(rec.name, { size: 22, bold: true, color: CHARCOAL })] }),
  ];
  if (rec.attn) recChildren.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [run(rec.attn, { size: 18, color: INK })] }));
  if (rec.line3) recChildren.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [run(rec.line3, { size: 18, color: INK })] }));

  const cellL = new TableCell({
    width: { size: 4680, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.TOP,
    margins: { top: 60, bottom: 60, left: 0, right: 120 }, children: recChildren,
  });
  const detailRow = (k, v, vbold = false, vcolor = INK) => new TableRow({ children: [
    new TableCell({ width: { size: 1700, type: WidthType.DXA }, borders: noBorders, margins: { top: 20, bottom: 20, left: 0, right: 60 },
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [run(k, { size: 18, color: TEXT_MUTED })] })] }),
    new TableCell({ width: { size: 2980, type: WidthType.DXA }, borders: noBorders, margins: { top: 20, bottom: 20, left: 0, right: 0 },
      children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [run(v, { size: 18, bold: vbold, color: vcolor })] })] }),
  ] });
  const cellR = new TableCell({
    width: { size: 4680, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.TOP,
    shading: { fill: SAND_LIGHT, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 120 },
    children: [new Table({ width: { size: 4400, type: WidthType.DXA }, columnWidths: [1700, 2700],
      borders: { ...noBorders, insideHorizontal: noBorder, insideVertical: noBorder },
      rows: [
        detailRow("No. Invoice", cfg.invoiceNo, true, CHARCOAL),
        detailRow("Tanggal", cfg.date),
        detailRow("Jatuh Tempo", cfg.dueDate),
      ] })],
  });
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [4680, 4680],
    borders: { ...noBorders, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [new TableRow({ children: [cellL, cellR] })],
  });
}

function itemsTable(items, summaryRows) {
  const colW = [620, 5740, 900, 2100]; // No | Deskripsi | Qty | Jumlah (sum 9360)
  const head = new TableRow({ tableHeader: true, children:
    ["No.", "Deskripsi Pekerjaan", "Qty", "Jumlah"].map((h, i) => new TableCell({
      width: { size: colW[i], type: WidthType.DXA }, shading: { fill: CHARCOAL, type: ShadingType.CLEAR },
      borders: allB(CHARCOAL), margins: { top: 66, bottom: 66, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: i >= 2 ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 0, after: 0 },
        children: [run(h, { size: 19, bold: true, color: WHITE })] })],
    })) });

  const bodyRows = items.map((it, idx) => {
    const fill = idx % 2 === 0 ? WHITE : GRAY_BAND;
    const descLines = Array.isArray(it.desc) ? it.desc : [it.desc];
    const descParas = descLines.map((line, li) => new Paragraph({
      spacing: { before: li === 0 ? 0 : 10, after: 0, line: 260 },
      children: [run(line, { size: 19, bold: li === 0 && it.descBold !== false, color: INK })],
    }));
    const cell = (children, align, w) => new TableCell({
      width: { size: w, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR },
      borders: allB(GRAY_BORDER), margins: { top: 54, bottom: 54, left: 120, right: 120 }, verticalAlign: VerticalAlign.TOP,
      children: children.length ? children : [new Paragraph({ alignment: align, spacing: { before: 0, after: 0 }, children: [run("", { size: 19 })] })],
    });
    return new TableRow({ children: [
      cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [run(String(idx + 1), { size: 19 })] })], AlignmentType.CENTER, colW[0]),
      cell(descParas, AlignmentType.LEFT, colW[1]),
      cell([new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [run(it.qty || "1 paket", { size: 19 })] })], AlignmentType.CENTER, colW[2]),
      cell([new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 }, children: [run(it.amount === "" ? "" : money(it.amount), { size: 19 })] })], AlignmentType.RIGHT, colW[3]),
    ] });
  });

  const sumRows = summaryRows.map((s) => new TableRow({ children: [
    new TableCell({ columnSpan: 3, borders: allB(GRAY_BORDER),
      shading: { fill: s.fill || WHITE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 },
        children: [run(s.label, { size: 19, bold: s.bold, color: s.color || INK })] })] }),
    new TableCell({ width: { size: colW[3], type: WidthType.DXA }, borders: allB(GRAY_BORDER),
      shading: { fill: s.fill || WHITE, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 }, verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 0, after: 0 },
        children: [run(s.value, { size: 19, bold: s.bold, color: s.color || INK })] })] }),
  ] }));

  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colW, rows: [head, ...bodyRows, ...sumRows] });
}

function terbilangLine(text) {
  return new Paragraph({ spacing: { before: 100, after: 30 },
    children: [run("Terbilang: ", { size: 19, bold: true, color: CHARCOAL }), run(text, { size: 19, italics: true, color: TEXT_DARK })] });
}

// Callout. `lines` entries may be plain strings or arrays of TextRun-spec objects
// ({text, bold, italics, color}) for inline emphasis.
function callout(label, lines, color = ACCENT) {
  const fill = color === CHARCOAL ? SAND_LIGHT : ACCENT_LIGHT;
  const borderColor = color === CHARCOAL ? CHARCOAL : BRAND_ORANGE;
  const toRun = (r) => typeof r === "string" ? run(r, { size: 19, color: TEXT_DARK }) : run(r.text, { size: 19, bold: r.bold, italics: r.italics, color: r.color || TEXT_DARK });
  const bodyParas = lines.map((t, i) => new Paragraph({ spacing: { before: i === 0 ? 0 : 40, after: 0, line: 270 },
    children: Array.isArray(t) ? t.map(toRun) : [toRun(t)] }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: CONTENT_W, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 260, right: 220 },
      shading: { fill, type: ShadingType.CLEAR },
      borders: { top: noBorder, bottom: noBorder, right: noBorder, left: { style: BorderStyle.SINGLE, size: 24, color: borderColor } },
      children: [new Paragraph({ spacing: { before: 0, after: 60 }, children: [run(label, { size: 20, bold: true, color: color === CHARCOAL ? CHARCOAL : ACCENT_DARK })] }), ...bodyParas],
    })] })] });
}

function paymentBlock(bank) {
  return [
    new Paragraph({ spacing: { before: 160, after: 50 }, children: [run("Instruksi Pembayaran", { size: 20, bold: true, color: CHARCOAL })] }),
    new Paragraph({ spacing: { before: 0, after: 20 }, children: [run("Mohon pembayaran ditransfer ke rekening berikut:", { size: 19, color: INK })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [run("Bank        : ", { size: 19, color: TEXT_MUTED }), run(bank.bank, { size: 19, bold: true })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [run("No. Rek.   : ", { size: 19, color: TEXT_MUTED }), run(bank.accountNo, { size: 19, bold: true })] }),
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [run("a.n.          : ", { size: 19, color: TEXT_MUTED }), run(bank.accountName, { size: 19, bold: true })] }),
  ];
}

function signatureBlock(city, date, signerName, director) {
  const colW = [5760, 3600];
  const rightCell = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 6 }, children: [run(city + ", " + date, { size: 19, color: INK })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 6 }, children: [run("Hormat kami,", { size: 19, color: INK })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 6 }, children: [run(signerName, { size: 19, bold: true, color: CHARCOAL })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: INK } }, children: [run("", { size: 2 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 0 }, children: [run(director || "(_____________________)", { size: 19, bold: !!director, color: director ? CHARCOAL : INK })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [run("Direktur", { size: 18, color: TEXT_MUTED })] }),
  ];
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: colW,
    borders: { ...noBorders, insideHorizontal: noBorder, insideVertical: noBorder },
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: colW[0], type: WidthType.DXA }, borders: noBorders, children: [new Paragraph({ children: [run("", { size: 2 })] })] }),
      new TableCell({ width: { size: colW[1], type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.TOP, children: rightCell }),
    ] })] });
}

function footer(iss) {
  return new Footer({ children: [
    new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_BORDER } },
      spacing: { before: 60, after: 0 },
      children: [run(`${iss.signerName}  ·  ${iss.address}  ·  ${iss.phone}`, { size: 14, color: TEXT_DIM })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 20, after: 0 },
      children: [run("Dokumen ini diterbitkan secara elektronik dan sah tanpa memerlukan stempel basah. Mohon konfirmasi pembayaran ke kontak di atas.", { size: 13, italics: true, color: TEXT_DIM })] }),
  ] });
}

// --- Money math: the single source of truth for subtotal / allocation / total ---
function computeSummary(items, allocation) {
  const subtotal = items.reduce((a, it) => a + (Number(it.amount) || 0), 0);
  const rows = [{ label: "Subtotal", value: money(subtotal) }];
  let totalTunai = subtotal;
  if (allocation && Number(allocation.amount) > 0) {
    rows.push({ label: allocation.label || "Alokasi Dana Donatur / Sponsorship", value: "(" + money(allocation.amount) + ")", color: ACCENT_DARK });
    totalTunai = subtotal - Number(allocation.amount);
    rows.push({ label: allocation.totalLabel || "Total Tagihan Tunai", value: money(totalTunai), bold: true, color: CHARCOAL, fill: BRAND_ORANGE });
  } else {
    rows.push({ label: "Total Tagihan", value: money(totalTunai), bold: true, color: CHARCOAL, fill: BRAND_ORANGE });
  }
  return { subtotal, totalTunai, rows };
}

function buildDoc(cfg) {
  const { rows, totalTunai } = computeSummary(cfg.items, cfg.allocation);
  const children = [
    ...kopSurat(cfg),
    ...titleBand(cfg.subtitle || "Invoice Jasa"),
    metaBlock(cfg),
    new Paragraph({ spacing: { before: 160, after: 0 }, children: [run("", { size: 2 })] }),
    itemsTable(cfg.items, rows),
    terbilangLine(terbilang(totalTunai)),
  ];
  if (cfg.callout && cfg.callout.lines && cfg.callout.lines.length) {
    children.push(callout(cfg.callout.title || "Keterangan", cfg.callout.lines, cfg.callout.color === "charcoal" ? CHARCOAL : ACCENT));
  }
  children.push(...paymentBlock(cfg.bank));
  children.push(new Paragraph({ spacing: { before: 20, after: 0 }, children: [run("", { size: 2 })] }));
  children.push(signatureBlock(cfg.issuer.city, cfg.date, cfg.issuer.signerName, cfg.director));

  return new Document({
    styles: { default: { document: { run: { font: FONT } } } },
    sections: [{
      properties: { page: {
        size: { width: 12240, height: 15840 }, // US Letter
        // Tuned margins: a combined 2-item + allocation + bank + signature invoice
        // fits on one page here. Loosen cautiously; the signature's last line is
        // the first thing to overflow. See references/one-page-and-qa.md.
        margin: { top: 500, right: 1440, bottom: 460, left: 1440, header: 260, footer: 220 },
      } },
      footers: { default: footer(cfg.issuer) },
      children,
    }],
  });
}

// --- Config loading with SEO Boost defaults merged in ---
function loadConfig(p) {
  const raw = JSON.parse(fs.readFileSync(p, "utf8"));
  return {
    ...DEFAULTS, ...raw,
    issuer: { ...DEFAULTS.issuer, ...(raw.issuer || {}) },
    bank: { ...DEFAULTS.bank, ...(raw.bank || {}) },
    recipient: { ...DEFAULTS.recipient, ...(raw.recipient || {}) },
  };
}

(async () => {
  const cfgPath = process.argv[2];
  if (!cfgPath) {
    console.error("Usage: node generate_invoice.js <config.json> [output.docx]");
    process.exit(1);
  }
  const cfg = loadConfig(cfgPath);
  const out = process.argv[3] || cfg.output;
  if (!out) { console.error("No output path (pass as 2nd arg or set 'output' in config)."); process.exit(1); }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, await Packer.toBuffer(buildDoc(cfg)));
  const { subtotal, totalTunai } = computeSummary(cfg.items, cfg.allocation);
  console.log(`OK: invoice written -> ${out}`);
  console.log(`    subtotal=${money(subtotal)}  total tunai=${money(totalTunai)}  terbilang="${terbilang(totalTunai)}"`);
})();
