#!/usr/bin/env node
/**
 * projectdocs-lint.mjs — linter kerapian ProjectDocs (konvensi SEO Boost).
 *
 * Usage: node projectdocs-lint.mjs <path-ProjectDocs> [--full]
 * Output per finding: [RULE:<id>] <relative-path>: <message>
 * Summary line: "N error, M warning". Errors -> exit 1; warnings only -> exit 0.
 *
 * Node >= 18, no dependencies. Symlinks and dot-entries are skipped so the
 * recursion is safe against symlink loops.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename, sep } from 'node:path';

const HELP = `projectdocs-lint — linter kerapian folder ProjectDocs (konvensi SEO Boost).

Pemakaian:
  node projectdocs-lint.mjs <path-ProjectDocs> [--full]
  node projectdocs-lint.mjs --help

Mode:
  Full        dipakai bila --full diberikan ATAU <path>/agent-documentation/ ada.
              Semua rule berjalan: skeleton 00..09, placeholder, decision-log,
              comm-log, versioned-output, freshness, naming.
  Workstream  default bila agent-documentation/ tidak ada. Tiap subdir ProjectDocs
              dianggap workstream dan wajib README.md + PROGRESS.md; rule
              placeholder, versioned-output, dan naming tetap berlaku.

Keluaran:
  Satu baris per temuan: [RULE:<id>] <path-relatif>: <pesan>
  Ringkasan akhir: "N error, M warning". Error -> exit 1; hanya warning -> exit 0.
`;

// ---------- CLI ----------

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  process.stdout.write(HELP);
  process.exit(0);
}
const flagFull = argv.includes('--full');
const target = argv.find((a) => !a.startsWith('-'));
if (!target) {
  process.stderr.write('Argumen kurang: path ProjectDocs wajib diberikan. Lihat --help.\n');
  process.exit(2);
}
let rootStat;
try {
  rootStat = statSync(target);
} catch {
  process.stderr.write(`Path tidak ditemukan: ${target}\n`);
  process.exit(2);
}
if (!rootStat.isDirectory()) {
  process.stderr.write(`Bukan direktori: ${target}\n`);
  process.exit(2);
}
const root = target;

// ---------- findings ----------

let errors = 0;
let warnings = 0;
function rel(p) {
  const r = relative(root, p);
  return (r === '' ? '.' : r).split(sep).join('/');
}
function report(level, rule, path, msg) {
  if (level === 'error') errors += 1;
  else warnings += 1;
  process.stdout.write(`[RULE:${rule}] ${rel(path)}: ${msg}\n`);
}

// ---------- walk (symlink-safe) ----------

/** Direktori buatan mesin: penamaannya bukan milik siapa pun untuk diperbaiki. */
const DIABAIKAN = new Set([
  'node_modules', '__pycache__', 'venv', 'dist', 'build', '.next',
  'coverage', 'target', 'vendor', '.pytest_cache', '.mypy_cache',
]);

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue; // .git, .DS_Store, dotfiles
    if (ent.isSymbolicLink()) continue; // hindari loop symlink
    // Direktori yang isinya dibuat mesin, bukan ditulis orang. Aturan penamaan tidak
    // berlaku di sana, dan memeriksanya menghasilkan temuan yang tidak bisa diperbaiki
    // siapa pun. Nyata: Klien B 2 Sep 2026, 371 error yang seluruhnya __pycache__ dan
    // node_modules, sehingga gerbang checkpoint "linter 0 error" mustahil lolos dan
    // orang berhenti membaca keluarannya.
    if (DIABAIKAN.has(ent.name)) continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) {
      out.dirs.push(p);
      walk(p, out);
    } else if (ent.isFile()) {
      out.files.push(p);
    }
  }
  return out;
}
// Penjaga arah path. Dua kali dalam dua hari linter ini dijalankan atas induk
// dari ProjectDocs, atau atas satu workstream di dalamnya, dan dua-duanya
// menghasilkan laporan yang terlihat sah tetapi memeriksa hal yang salah.
// 2 Sep 2026 agen Klien B menjalankannya atas program-b-2026/assets lalu menyimpulkan
// aturan workstream tidak menjangkau ProjectDocs, padahal menjangkau. 3 Sep 2026
// kesalahan yang sama terulang atas fixtures-projectdocs/baik. Keluaran yang
// menyesatkan lebih buruk daripada berhenti, jadi di sini ia berhenti.
if (basename(root) !== 'ProjectDocs' && existsSync(join(root, 'ProjectDocs'))) {
  console.error(
    `projectdocs-lint: '${root}' bukan direktori ProjectDocs, tetapi memuat satu di dalamnya.\n` +
    `Arahkan ke ProjectDocs-nya langsung, kalau tidak hasilnya tampak sah tetapi memeriksa hal yang salah:\n` +
    `  node ${process.argv[1]} ${join(root, 'ProjectDocs')}`
  );
  process.exit(2);
}

const tree = walk(root, { dirs: [], files: [] });

const agentDocsDir = join(root, 'agent-documentation');
const fullMode = flagFull || (existsSync(agentDocsDir) && statSync(agentDocsDir).isDirectory());

const isMd = (p) => p.toLowerCase().endsWith('.md');
const readLines = (p) => readFileSync(p, 'utf8').split(/\r?\n/);

// ---------- date parsing (ISO atau "D MMM YYYY" Indonesia/Inggris) ----------

const MONTHS = {
  jan: 1, januari: 1, january: 1,
  feb: 2, februari: 2, february: 2,
  mar: 3, maret: 3, march: 3,
  apr: 4, april: 4,
  mei: 5, may: 5,
  jun: 6, juni: 6, june: 6,
  jul: 7, juli: 7, july: 7,
  agu: 8, ags: 8, agt: 8, agustus: 8, aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  okt: 10, oktober: 10, oct: 10, october: 10,
  nov: 11, november: 11,
  des: 12, desember: 12, dec: 12, december: 12,
};
function parseDate(text) {
  let m = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (m) return { ts: Date.UTC(+m[1], +m[2] - 1, +m[3]), raw: m[0] };
  m = text.match(/\b(\d{1,2})\s+([A-Za-z]+)\.?\s+(\d{4})\b/);
  if (m) {
    const mo = MONTHS[m[2].toLowerCase()];
    if (mo) return { ts: Date.UTC(+m[3], mo - 1, +m[1]), raw: m[0] };
  }
  return null;
}

// ---------- RULE:skeleton (full) ----------

// Prefix 07 (schema/migration) sengaja lazy menurut seoboost-project-onboarding:
// "HANYA kalau project punya data schema". Menuntutnya membuat gerbang
// "linter 0 error" pada Self-Check seoboost-fork-checkpoint mustahil dilewati project
// tanpa skema data, dan gerbang yang mustahil akan dilewati begitu saja.
const PREFIX_OPSIONAL = new Set(['07']);

// Sejak 2 Sep 2026 rule ini berjalan pada SETIAP agent-documentation yang ditemukan,
// bukan hanya di akar. Bedanya satu dan disengaja:
//   akar     -> daftar berkas wajib ditegakkan (minus prefix opsional) + larangan dobel
//   bersarang-> HANYA larangan dobel, karena proposal yang diterima berbunyi
//               "Isinya lazy: hanya berkas yang benar-benar dipakai"
// Yang memicunya: program-b-bali-2026 di Klien B memuat 09-AGENT-COORDINATION.md dan
// 09-TEMUAN-EVALUASI-PROSES.md sekaligus, tabrakan awalan yang tidak terlihat apa pun
// karena rule lama hanya membaca join(root, 'agent-documentation').
function periksaSkeleton(dir, { wajib }) {
  let names = [];
  try {
    names = readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isFile() && isMd(e.name))
      .map((e) => e.name);
  } catch {
    if (wajib) report('error', 'skeleton', dir, 'agent-documentation/ tidak ada padahal mode full');
    return;
  }
  for (let i = 0; i <= 9; i += 1) {
    const prefix = `0${i}`;
    const matches = names.filter((n) => n.startsWith(`${prefix}-`));
    if (matches.length === 0) {
      if (!wajib || PREFIX_OPSIONAL.has(prefix)) continue;
      report('error', 'skeleton', dir, `prefix ${prefix} hilang (tidak ada file ${prefix}-*.md)`);
    } else if (matches.length > 1) {
      report('error', 'skeleton', dir, `prefix ${prefix} dobel: ${matches.join(', ')}`);
    }
  }
}

if (fullMode) periksaSkeleton(agentDocsDir, { wajib: true });

for (const d of tree.dirs) {
  if (basename(d) !== 'agent-documentation') continue;
  if (d === agentDocsDir) continue;
  periksaSkeleton(d, { wajib: false });
}

// ---------- RULE:placeholder ----------

const PLACEHOLDER_TOKENS = [
  [/\bTBD\b/i, 'TBD'],
  [/TODO:/i, 'TODO:'],
  [/\[Project A\]/i, '[Project A]'],
  [/\blorem\b/i, 'lorem'],
  [/\bxxx\b/i, 'xxx'],
  [/<isi/i, '<isi'],
  [/<nama/i, '<nama'],
];
const EXEMPT_LINE = /template|contoh|placeholder/i;

function placeholderTargets() {
  if (!fullMode) return tree.files.filter(isMd);
  const inAgentDocs = (p) => rel(p).startsWith('agent-documentation/');
  return tree.files.filter((p) => {
    const base = basename(p);
    return (isMd(p) && inAgentDocs(p)) || base === 'README.md' || base === 'PROGRESS.md';
  });
}
// Notasi penomoran keputusan (`D-XXX`, `DP-XXX`) memakai huruf X sebagai bagian dari
// konvensi, bukan sebagai placeholder yang belum diisi. Sejak konvensi multi-workstream
// mewajibkan dokumen menyebut `DP-XXX`, token itu dibuang dari baris sebelum dipindai,
// supaya rule tidak menyalak pada teks yang justru menerapkan konvensinya. Ditemukan
// 2 Sep 2026 saat rule menuduh kalimat yang menjelaskan DP-XXX di 00-START-HERE Klien B.
const bersihkanNotasi = (line) => line.replace(/\b[A-Z]{1,3}-X{3}\b/g, '');

for (const file of placeholderTargets()) {
  const lines = readLines(file);
  lines.forEach((rawLine, idx) => {
    const line = bersihkanNotasi(rawLine);
    if (EXEMPT_LINE.test(line)) return;
    for (const [re, label] of PLACEHOLDER_TOKENS) {
      if (re.test(line)) {
        report('error', 'placeholder', file, `placeholder tak terisi '${label}' pada baris ${idx + 1}`);
        break; // satu temuan per baris cukup
      }
    }
  });
}

// ---------- RULE:decision-log (file 03-*) ----------

const mdByPrefix = (prefix) => tree.files.filter((p) => isMd(p) && basename(p).startsWith(prefix));
const TZ_RE = /\b(WIB|WITA|WIT|UTC|GMT)\b/;

for (const file of mdByPrefix('03-')) {
  const lines = readLines(file);
  const ids = [];
  lines.forEach((line, idx) => {
    const m = line.match(/^#{2,}\s+D-(\d{3})\b/);
    if (!m) return;
    ids.push(+m[1]);
    if (!TZ_RE.test(line)) {
      report('error', 'decision-log', file, `heading D-${m[1]} tanpa token zona waktu (WIB/WITA/WIT/UTC/GMT) pada baris ${idx + 1}`);
    }
  });
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) report('error', 'decision-log', file, `id D-${String(id).padStart(3, '0')} dobel`);
    seen.add(id);
  }
  if (seen.size > 0) {
    const sorted = [...seen].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i += 1) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        report('error', 'decision-log', file,
          `id lompat: D-${String(sorted[i - 1]).padStart(3, '0')} lalu D-${String(sorted[i]).padStart(3, '0')}`);
      }
    }
  }
}

// ---------- RULE:comm-log (file 06-*) ----------

for (const file of mdByPrefix('06-')) {
  const lines = readLines(file);
  const dated = [];
  lines.forEach((line, idx) => {
    if (!/^#{1,6}\s/.test(line)) return;
    const d = parseDate(line);
    if (d) dated.push({ ...d, line: idx + 1 });
  });
  if (dated.length >= 2) {
    for (let i = 1; i < dated.length; i += 1) {
      if (dated[i].ts < dated[i - 1].ts) {
        report('error', 'comm-log', file,
          `tanggal mundur: '${dated[i].raw}' (baris ${dated[i].line}) setelah '${dated[i - 1].raw}' (baris ${dated[i - 1].line})`);
      }
    }
  }
}

// ---------- RULE:versioned-output ----------

const VERSION_RE = /_v\d+\.\d+_\d{4}-\d{2}-\d{2}\./;
const OUTPUT_DIR_RE = /^(output|keluaran|deliverable)/i;
const BAD_WORD_RE = /(?<![a-z])(final|revisi)(?![a-z])/i;
const GENERIC_RE = /^(output|final)\.[a-z0-9]+$/i;

for (const file of tree.files) {
  const base = basename(file);
  if (GENERIC_RE.test(base)) {
    report('error', 'versioned-output', file, `nama generik '${base}' — pakai pola <Slug>_v{MAJOR}.{MINOR}_{YYYY-MM-DD}.<ext>`);
  } else if (BAD_WORD_RE.test(base)) {
    report('error', 'versioned-output', file, `nama memuat FINAL/REVISI — pakai versi eksplisit _v{MAJOR}.{MINOR}_{YYYY-MM-DD}`);
  }
  const segments = rel(file).split('/').slice(0, -1);
  if (!isMd(file) && segments.some((s) => OUTPUT_DIR_RE.test(s)) && !VERSION_RE.test(base)) {
    report('error', 'versioned-output', file, `file output tanpa pola versi _v{MAJOR}.{MINOR}_{YYYY-MM-DD}`);
  }
}

// ---------- RULE:versi-ganda-permukaan, lane-tertukar, arsip-akar ----------
//
// Ketiganya ditambahkan 3 Sep 2026 dari council empat lensa atas dua proposal
// panen Klien B. Diukur lebih dulu: 0 kemunculan di repo ini untuk ketiganya, jadi
// tidak ada isi yang berubah merah. Di ProjectDocs Klien B ketiganya menemukan
// 16 + 47 + 0, dan sampel yang diperiksa manual nol positif palsu.
//
// Kenapa BUKAN sekadar menambah `out` ke OUTPUT_DIR_RE, yang terlihat lebih
// mudah: `scripts/out/` memang lane artefak regenerable, dan seoboost-versioned-output
// Skenario 6 menandai pemisahannya kritikal. Berkas di sana justru TIDAK wajib
// berversi. Yang salah bukan direktori yang lolos aturan versi, melainkan
// terbitan klien yang mendarat di lane yang boleh dihapus kapan saja. Karena itu
// deteksinya dibalik: yang dicari berkas BERVERSI di dalam `out/`.

const VERSI_PECAH = /^(.*)_v(\d+)\.(\d+)_(\d{4}-\d{2}-\d{2})\.([A-Za-z0-9]+)$/;
const ARSIP_SEG = /^arsip$/i;
const LANE_ANTARA_SEG = /^out$/i;

const kelompokVersi = new Map();

for (const file of tree.files) {
  const segments = rel(file).split('/').slice(0, -1);
  const base = basename(file);
  const diArsip = segments.some((s) => ARSIP_SEG.test(s));

  // arsip-akar: akar `arsip/` hanya boleh berisi map, tidak ada berkas berdiri
  // di sana (seoboost-versioned-output Skenario 7). Berkas yang mendarat di akar
  // arsip selalu berarti pengarsipan berhenti separuh jalan.
  if (segments.length > 0 && ARSIP_SEG.test(segments[segments.length - 1])) {
    report('error', 'arsip-akar', file, 'berkas berdiri di akar arsip/, tempatnya arsip/<slug>/');
  }

  const m = VERSI_PECAH.exec(base);
  if (!m) continue;

  // lane-tertukar: berkas berversi berarti terbitan, dan terbitan tidak boleh
  // tinggal di lane yang konvensinya menyatakan boleh dihapus dan dibuat ulang.
  if (LANE_ANTARA_SEG.test(segments[segments.length - 1] ?? '')) {
    report('error', 'lane-tertukar', file,
      "berkas berversi di lane artefak regenerable 'out/', terbitan klien tempatnya di 'output/'");
  }

  // versi-ganda-permukaan: hanya versi tertinggi tiap dokumen berdiri di
  // permukaan; sisanya turun ke arsip. Yang sudah di dalam arsip dilewati.
  if (diArsip) continue;
  const kunci = segments.join('/') + '\u0000' + m[1] + '\u0000' + m[5].toLowerCase();
  if (!kelompokVersi.has(kunci)) kelompokVersi.set(kunci, []);
  kelompokVersi.get(kunci).push({ file, mayor: Number(m[2]), minor: Number(m[3]) });
}

for (const daftar of kelompokVersi.values()) {
  if (daftar.length < 2) continue;
  daftar.sort((a, b) => b.mayor - a.mayor || b.minor - a.minor);
  const puncak = daftar[0];
  for (const lama of daftar.slice(1)) {
    report('error', 'versi-ganda-permukaan', lama.file,
      `versi lama berdampingan dengan v${puncak.mayor}.${puncak.minor}, turunkan ke arsip/<slug>/`);
  }
}

// ---------- RULE:freshness (full) ----------

if (fullMode) {
  const startFiles = mdByPrefix('00-').filter((p) => rel(p).startsWith('agent-documentation/'));
  for (const file of startFiles) {
    const lines = readLines(file);
    // Dokumen SEO Boost ditulis dalam Bahasa Indonesia, jadi label yang dipakai di lapangan
    // adalah "Terakhir diperbarui". Rule ini semula hanya mengenali frasa Inggris,
    // sehingga tidak ada project berbahasa Indonesia yang bisa melewatinya. Kelas yang
    // sama dengan tuntutan prefix 07: aturan yang mustahil dipenuhi akan diabaikan.
    const LABEL_TANGGAL = /last updated|terakhir diperbarui|terakhir diupdate/i;
    const luLine = lines.find((l) => LABEL_TANGGAL.test(l));
    const d = luLine ? parseDate(luLine) : null;
    if (!d) {
      report('error', 'freshness', file,
        "tidak ada baris 'Last updated' / 'Terakhir diperbarui' dengan tanggal terparse");
      continue;
    }
    const agentMd = tree.files.filter((p) => isMd(p) && rel(p).startsWith('agent-documentation/'));
    let newest = 0;
    for (const p of agentMd) newest = Math.max(newest, statSync(p).mtimeMs);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (newest - d.ts > SEVEN_DAYS) {
      report('warning', 'freshness', file,
        `'Last updated' (${d.raw}) tertinggal > 7 hari dari perubahan .md terbaru di agent-documentation`);
    }
  }
}

// ---------- RULE:naming (nama dir di dalam ProjectDocs) ----------

for (const dir of tree.dirs) {
  const name = basename(dir);

  // Map di dalam `arsip/` dikecualikan dari pola lowercase-kebab.
  //
  // Konvensi arsip (seoboost-versioned-output Scenario 7, seoboost-fork-checkpoint bagian E) menyimpan
  // versi lama sebagai `arsip/<slug>/<berkas>`, dan slug itu adalah nama dokumennya apa adanya:
  // `Matriks-GAP_KLIEN-A_KLIEN A`. Menyeragamkannya ke lowercase-kebab justru
  // memutus kaitan antara nama map dan nama berkas di dalamnya, padahal kaitan itulah gunanya —
  // operator mencari versi lama dengan mencocokkan nama.
  //
  // Tanpa pengecualian ini satu project menghasilkan 87 warning sekaligus, dan peringatan
  // sebanyak itu menenggelamkan yang benar-benar perlu dibaca. Terukur 1 September 2026.
  // Aturan spasi TETAP berlaku di mana pun, termasuk di dalam arsip.
  // Dua bentuk yang dikecualikan, dua-duanya karena nama mapnya memang sengaja mengikuti
  // nama dokumennya — dan kaitan nama itulah gunanya: operator mencari versi lama dengan
  // mencocokkan nama map ke nama berkas.
  //
  //   <kategori>/<Nama-Dokumen>/            ← direktori dokumen
  //   <kategori>/<Nama-Dokumen>/arsip/...   ← dan isinya
  //
  // Tanpa pengecualian ini satu project menghasilkan 98 warning sekaligus, dan peringatan
  // sebanyak itu menenggelamkan yang benar-benar perlu dibaca. Terukur 1 September 2026.
  // Aturan spasi TETAP berlaku di mana pun, termasuk pada kedua bentuk di atas.
  const bagian = rel(dir).split('/');
  const diDalamArsip = bagian.slice(0, -1).includes('arsip');
  const berkasLangsung = existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name)
    : [];
  // Map dokumen dikenali dari ISI, bukan dari namanya: seluruh berkas berversi di dalamnya
  // berbagi satu slug. Pengenalan berdasarkan nama patah begitu konvensi penamaan berubah —
  // terjadi 1 September 2026 ketika nama map dipendekkan dengan membuang akhiran yang sama
  // pada semua dokumen, dan 102 warning muncul serentak untuk map yang isinya justru benar.
  const berpola = berkasLangsung
    .map((n) => n.match(/^(.+)_v\d+\.\d+_\d{4}-\d{2}-\d{2}\.\w+$/))
    .filter(Boolean);
  const mapDokumen = berpola.length > 0
    && new Set(berpola.map((m) => m[1])).size === 1;
  const dikecualikan = diDalamArsip || mapDokumen || name === 'arsip';

  if (/\s/.test(name)) {
    report('error', 'naming', dir, 'nama direktori memuat spasi — pakai kebab-case');
  } else if (!dikecualikan && !/^[a-z0-9][a-z0-9.-]*$/.test(name)) {
    report('warning', 'naming', dir, 'nama direktori di luar pola lowercase/kebab/angka/titik');
  }
}

// ---------- RULE:workstream (kedua mode) ----------
//
// Berjalan juga pada mode full sejak 2 Sep 2026. Sebelumnya rule ini terkurung di
// dalam `if (!fullMode)`, sehingga project berbentuk hibrida (punya agent-documentation
// DI SAMPING direktori workstream) tidak pernah diperiksa subdirektorinya. Pada Klien B itu
// berarti enam workstream tanpa README lolos tanpa satu pun peringatan.
// Proposal yang menetapkannya: proposals/2026-09-02-projectdocs-bertingkat-multi-workstream.md

// Direktori struktural yang bukan workstream. Ditemukan lewat fixture positif: aturan
// baru sempat menuduh `output-laporan/` sebagai workstream tanpa README, padahal ia
// direktori keluaran. Nama-nama di bawah berasal dari struktur yang ditetapkan
// seoboost-project-onboarding, plus awalan `output` dan `arsip` yang dipakai lintas project.
const BUKAN_WORKSTREAM = new Set([
  'agent-documentation', 'plans', 'build', 'scripts', 'assets', 'output', 'arsip',
]);
const bukanWorkstream = (nama) =>
  BUKAN_WORKSTREAM.has(nama) || nama.startsWith('output') || nama.startsWith('arsip');

{
  const topDirs = tree.dirs
    .filter((d) => !rel(d).includes('/'))
    .filter((d) => !bukanWorkstream(basename(d)));
  for (const d of topDirs) {
    let children = [];
    try {
      children = readdirSync(d);
    } catch { /* dilewati */ }
    for (const wanted of ['README.md', 'PROGRESS.md']) {
      if (!children.includes(wanted)) {
        report('error', 'workstream', d, `workstream tanpa ${wanted}`);
      }
    }
  }
  if (!existsSync(join(root, 'README.md'))) {
    report('warning', 'workstream', root, 'ProjectDocs tanpa README.md di root');
  }
}

// ---------- summary ----------

process.stdout.write(`${errors} error, ${warnings} warning\n`);
process.exit(errors > 0 ? 1 : 0);
