// ============================================================================
// build-example.mjs — WORKED EXAMPLE for the redesigned SEO Boost Corporate skill.
// Renders charts + a diagram, then assembles a System Design Document
// ([Project Klien Koperasi]) exercising every component. ESM (so it can await the
// chart/diagram renderers), requires helpers via createRequire.
//
// Run: node build-example.mjs [outDir]
// ============================================================================
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { renderChart } from './scripts/chart.mjs';
import { renderDiagram } from './scripts/diagram.mjs';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const H = require('./helpers.js');
const T = require('./templates/system-design-skeleton.js');
const {
  Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  C, FONT, CONTENT_W,
  P, PR, SP, GAP, H1, H2, H3, H4, BL, NL, Callout,
  buildTable, buildMetricCards, buildProcessFlow, figCaption,
} = H;

const OUT = process.argv[2] || path.join(__dirname, '.build');
const QA = path.join(OUT, 'assets');
fs.mkdirSync(QA, { recursive: true });

// helper: centered embedded image (charts/diagrams placed at 50% of 2x render)
function fig(pngPath, renderW, renderH, caption) {
  const w = Math.round(renderW * 0.62); // fit content width comfortably
  const h = Math.round(renderH * 0.62);
  const els = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 0 },
    children: [new ImageRun({ data: fs.readFileSync(pngPath), transformation: { width: w, height: h } })] })];
  if (caption) els.push(figCaption(caption));
  return els;
}

// ---- 1. render visuals ----
const bar = path.join(QA, 'ex-bar.png');
const donut = path.join(QA, 'ex-donut.png');
const diag = path.join(QA, 'ex-diagram.png');

await renderChart({ type: 'bar', title: 'Pertumbuhan Anggota KSP (ribu orang)', labels: ['2022', '2023', '2024', '2025'], values: [8, 12, 19, 27], out: bar });
await renderChart({ type: 'donut', title: 'Komposisi Unit Usaha Grup', centerLabel: { value: '5', label: 'Unit' }, segments: [
  { label: 'Simpan Pinjam', value: 45 }, { label: 'Distribusi Beras', value: 25 }, { label: 'Daging Ayam', value: 18 }, { label: 'Upakara', value: 12 },
], out: donut });
await renderDiagram({ width: 820, height: 360, nodes: [
  { id: 'reg', x: 40, y: 140, w: 160, h: 84, label: 'Module', sublabels: ['Registry'], kind: 'active' },
  { id: 'core', x: 320, y: 130, w: 180, h: 104, label: '[Project Klien Akuntansi] Core', sublabels: ['NestJS · Prisma'], kind: 'anchor' },
  { id: 'db', x: 620, y: 60, w: 150, h: 72, label: 'PostgreSQL', kind: 'data' },
  { id: 'sev', x: 620, y: 210, w: 150, h: 72, label: 'Sevanam', kind: 'external' },
], edges: [
  { from: 'reg', to: 'core', label: 'activate', kind: 'primary' },
  { from: 'core', to: 'db', fromSide: 'right', toSide: 'left' },
  { from: 'core', to: 'sev', fromSide: 'right', toSide: 'left', dashed: true, label: 'read-only' },
]}, diag);

// ---- 2. meta ----
const meta = {
  title: 'Dokumen Desain Sistem',
  titleRuns: [new TextRun({ text: 'Dokumen Desain Sistem', size: 60, bold: true, color: C.onDark, font: FONT })],
  subtitle: '[Project Klien Koperasi] — Module Registry & Bounded Context',
  docType: 'System Design Document',
  version: '1.0',
  date: 'Juni 2026',
  preparedFor: 'Tim Pengembangan SEO Boost',
  owner: 'Unit SEO Boost Indonesia',
  classification: 'Internal',
};

// ---- 3. sections ----
const sections = [
  ...H1('Ringkasan Eksekutif', true),
  P('Dokumen ini menjelaskan desain arsitektur untuk ekstensi modul Koperasi pada platform [Project Klien Akuntansi], ' +
    'khusus mendukung Koperasi Klien C dan grup usaha PT Klien C. Pendekatan yang dipilih ' +
    'adalah hybrid bounded context dengan module registry bergaya Odoo, sehingga setiap unit usaha dapat ' +
    'mengaktifkan modul secara independen tanpa mengganggu unit lain.'),
  GAP(),
  buildMetricCards([
    { value: '5 Unit', label: 'Modul inti' },
    { value: 'SAK EP', label: 'Standar akuntansi' },
    { value: 'Per-Unit', label: 'Pola aktivasi' },
    { value: '2 Orang', label: 'Tim pengembang' },
  ]),
  GAP(),
  P('Tiga keputusan arsitektur utama menjadi fondasi desain: (1) module registry untuk aktivasi modul ' +
    'per unit usaha, (2) bounded context hexagonal agar logika Koperasi dapat diekstraksi menjadi produk SaaS ' +
    'terpisah di masa depan, dan (3) kepatuhan penuh pada SAK EP sesuai konfirmasi GM KLC.'),

  ...H1('Konteks Pertumbuhan & Tujuan'),
  P('[Project Klien Akuntansi] saat ini adalah platform Work Management monolitik dengan 129 model Prisma, belum mendukung ' +
    'multi-badan-hukum maupun pemuatan modul dinamis. Ekstensi Koperasi harus ditambahkan tanpa merusak ' +
    'fungsi eksisting yang sudah dipakai produksi. Pertumbuhan anggota KSP yang dilayani memperlihatkan tren ' +
    'naik konsisten, sehingga fondasi yang skalabel menjadi prioritas.'),
  ...fig(bar, 820 * 0.62 / 0.62, 1000 * 0.62 / 0.62, 'Gambar 1. Pertumbuhan jumlah anggota KSP 2022–2025 (data ilustratif).'),
  P('Grup usaha terdiri dari lima unit dengan kontribusi berbeda. Komposisi ini memengaruhi prioritas modul ' +
    'yang diaktifkan per unit pada tahap awal.'),
  ...fig(donut, 1600, 1000, 'Gambar 2. Komposisi unit usaha grup (data ilustratif).'),

  H2('2.1', 'Sasaran Desain'),
  BL('Aktivasi modul Koperasi per unit usaha — tidak memaksa semua tenant memakai modul yang sama.'),
  BL('Isolasi domain Koperasi dari core [Project Klien Akuntansi] melalui ports & adapters (hexagonal).'),
  BL('Kesiapan ekstraksi: logika Koperasi dapat dipindah ke layanan SaaS terpisah tanpa rewrite.'),
  BL('Kepatuhan akuntansi SAK EP — bukan SAK ETAP yang sudah tidak berlaku.'),

  H2('2.2', 'Batasan'),
  NL('Tim pengembang berjumlah 2 orang (paralel), sehingga scope per sprint dijaga ramping.'),
  NL('Branch produksi "main" tidak boleh disentuh langsung — seluruh integrasi melalui staging.'),
  NL('Sistem incumbent Sevanam tetap berjalan; [Project Klien Akuntansi] berkoeksistensi, bukan menggantikan.'),
  GAP(),
  Callout('Catatan Penting',
    'Module Koperasi WAJIB bergantung pada modul Accounting. Aktivasi Koperasi tanpa Accounting aktif ' +
    'harus ditolak oleh registry pada level guard, bukan hanya validasi UI.', 'note'),

  ...H1('Arsitektur Module Registry'),
  P('Module registry mengadopsi pola Odoo: tabel definisi modul dan tabel aktivasi per unit. Setiap unit usaha ' +
    'memiliki daftar modul aktif sendiri. Modul yang tidak aktif tidak muncul di navigasi dan endpoint-nya ' +
    'ditolak oleh guard. Diagram berikut menunjukkan relasi inti antara registry, core, dan sistem eksternal.'),
  ...fig(diag, 820, 360, 'Gambar 3. Arsitektur ringkas: Module Registry mengaktifkan domain pada [Project Klien Akuntansi] Core (anchor), yang menulis ke PostgreSQL dan membaca Sevanam secara read-only.'),

  H2('3.1', 'Skema Data Inti'),
  buildTable(
    ['Tabel', 'Peran', 'Kolom Kunci'],
    [
      [{ text: 'module_definition', bold: true, color: C.ink850 }, 'Katalog modul tersedia', 'code, name, depends_on'],
      [{ text: 'unit_module_activation', bold: true, color: C.ink850 }, 'Aktivasi modul per unit', 'unit_id, module_code, is_active'],
      [{ text: 'unit', bold: true, color: C.ink850 }, 'Unit usaha (holding/operasional)', 'id, type, parent_id'],
    ],
    [3000, 3504, 3000]
  ),
  GAP(),
  Callout('Aturan Bisnis',
    'Guard @RequireModule(\'KOPERASI\') dipasang pada setiap controller domain Koperasi. Permintaan dari unit ' +
    'yang belum mengaktifkan modul Koperasi mengembalikan 403 sebelum mencapai service.', 'success'),

  H2('3.2', 'Alur Aktivasi Modul'),
  P('Aktivasi mengikuti empat tahap berurutan, dengan pengecekan dependensi sebelum modul benar-benar aktif.'),
  buildProcessFlow(['Pilih Unit', 'Cek Dependensi', 'Aktivasi Registry', 'Pasang Guard']),

  ...H1('Standar Akuntansi SAK EP'),
  P('Sesuai konfirmasi General Manager KLC, koperasi menggunakan SAK EP (Standar Akuntansi Keuangan Entitas ' +
    'Privat) mengacu Permenkop UKM 2/2024, bukan SAK ETAP. Hal ini berdampak pada beberapa perlakuan akuntansi ' +
    'yang harus dimodelkan sejak awal.'),
  buildTable(
    ['Aspek', 'Perlakuan SAK EP'],
    [
      ['Bunga pinjaman', 'Metode suku bunga efektif (bukan flat)'],
      ['Cadangan kerugian', 'Expected credit loss (CKPN berbasis ekspektasi)'],
      ['Konsolidasi', 'Wajib untuk grup usaha (holding + unit)'],
      ['Pajak tangguhan', 'Diakui (deferred tax)'],
    ],
    [3504, 6000]
  ),
  GAP(),
  Callout('Prinsip Inti',
    'Setiap perhitungan akuntansi diverifikasi terhadap SAK EP sejak baris pertama kode. Implementasi yang ' +
    'masih memakai asumsi SAK ETAP akan menghasilkan laporan yang tidak patuh — ini adalah keputusan ' +
    'arsitektur, bukan sekadar detail teknis.', 'dark'),

  ...H1('Risiko & Mitigasi'),
  buildTable(
    ['Risiko', 'Dampak', 'Mitigasi'],
    [
      ['Regresi pada core [Project Klien Akuntansi]', { text: 'Tinggi', bold: true, color: C.dangerText }, 'Bounded context + guard; tidak ubah model eksisting'],
      ['Salah tafsir SAK EP', { text: 'Tinggi', bold: true, color: C.dangerText }, 'Verifikasi tiap perhitungan ke standar sejak awal'],
      ['Ketergantungan Sevanam', { text: 'Sedang', bold: true, color: C.warningText }, 'Adapter read-only; kontak teknis perlu di-follow-up'],
      ['Scope melebar (2 dev)', { text: 'Sedang', bold: true, color: C.warningText }, 'Sprint ramping; fitur per-unit bertahap'],
    ],
    [3104, 1560, 4840]
  ),
  GAP(),
  Callout('Langkah Berikutnya', [
    'Finalisasi spesifikasi tabel registry dan tulis migrasi Prisma.',
    'Follow-up kontak teknis Sevanam untuk spesifikasi integrasi.',
    'Susun rencana Sprint 0 (fondasi modul + guard) dengan pendekatan TDD.',
  ], 'info'),

  // closing
  H3('Penutup'),
  P('Dokumen ini merupakan acuan desain internal tim pengembangan dan dapat berubah seiring temuan ' +
    'implementasi. Setiap perubahan substantif pada arsitektur akan dicatat pada log keputusan proyek.'),
  SP(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 0 },
    children: [new TextRun({ text: '— Akhir Dokumen —', size: 17, italics: true, color: C.ink500, font: FONT })] }),
];

// ---- 4. write ----
const doc = T.buildDoc({ meta, sections });
const outDocx = path.join(OUT, 'example.docx');
const buf = await Packer.toBuffer(doc);
fs.writeFileSync(outDocx, buf);
console.log('OK generated:', outDocx, (buf.length / 1024).toFixed(1), 'KB');
