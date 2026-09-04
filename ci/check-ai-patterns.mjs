#!/usr/bin/env node
// check-ai-patterns.mjs — sapuan pola AI mekanis atas file .md.
//
// Dari daftar pola terlarang di brief, yang bisa ditegakkan lewat regex tanpa
// banyak salah tangkap:
//   - kontras semu varian "bukan hanya X, tetapi/namun juga"
//   - "Penting untuk dicatat"
//   - "Tidak dapat dipungkiri"
//   - "Dalam era"
//
// Dua penajaman yang sengaja diambil (dicatat juga di laporan leaf):
// 1. Varian "bukan X, melainkan Y" TIDAK ditegakkan regex — regex tidak bisa
//    membedakan kontras semu dari kontras nyata; pemakaian sah ada di
//    seoboost-workplan/SKILL.md dan seoboost-klien-a-docs/SKILL.md. Pola
//    non-mekanis lain (tiga serangkai sifat, kata kerja pameran, pertanyaan
//    retoris transisi, kalimat kosmetik) diserahkan ke telaah manusia via
//    seoboost-bahasa-jernih.
// 2. Kutipan pola — frasa yang diapit tanda kutip atau backtick pada baris
//    yang sama — diloloskan, karena katalog anti-pola (mis.
//    seoboost-formal-docs/SKILL.md) memang mengutip frasa terlarang sebagai contoh.
//
// Direktori yang dikecualikan: seoboost-bahasa-jernih, seoboost-tulis-indonesia (rumah
// katalog contoh), ProjectDocs (laporan historis), agent-memory (rekaman),
// plugins, project-g. Direktori fixture (nama berawalan fixtures-, mis.
// ci/fixtures-bad, automation/fixtures-projectdocs) dan direktori bertitik
// dilewati saat walk — fixture sengaja berisi pelanggaran.
//
// CAKUPAN PER-RULE (ditambahkan 2 Sep 2026). Pengecualian direktori di atas
// dibuat untuk pola gaya, yang di laporan historis memang wajar muncul. Pola
// yang menyalahi kaidah bahasa, bukan sekadar gaya, tetap harus ditegakkan di
// sana: dokumen klien tinggal di ProjectDocs, dan justru di situlah empat
// pelanggaran "dimana" ditemukan pada audit 2 Sep 2026 sementara aturannya
// sudah tertulis sejak lama di seoboost-tulis-indonesia baris 56. Rule bertanda
// `semua: true` karena itu berjalan juga di direktori yang dikecualikan.
//
// PENGECUALIAN KUTIPAN BLOK. Baris yang diawali ">" diloloskan seluruhnya.
// Konvensi SEO Boost mewajibkan kutipan klien ditulis literal, lengkap dengan
// typo aslinya, di 03-DECISIONS-LOG.md dan 06-COMMUNICATION-LOG.md. Tanpa
// pengecualian ini pemeriksa akan menekan agen untuk menyunting kutipan
// literal, dan itu melanggar aturan yang lebih tinggi. Pengecualian kutipan
// sebaris di bawah tidak cukup, sebab kutipan panjang memecah tanda kutip
// pembuka dan penutup ke baris yang berbeda.
//
// Pakai: node ci/check-ai-patterns.mjs [--root <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : path.resolve(__dirname, '..');

const DIR_KECUALI = new Set([
  'seoboost-bahasa-jernih', 'seoboost-tulis-indonesia', 'ProjectDocs',
  'agent-memory', 'plugins', 'project-g',
]);
const WALK_SKIP = new Set(['.git', 'node_modules']);

const POLA = [
  { nama: 'kontras-semu', re: /bukan hanya\s+[^,.\n]{1,80},?\s*(?:tetapi|namun)\s+juga\b/i },
  { nama: 'penting-untuk-dicatat', re: /penting untuk dicatat/i },
  { nama: 'tidak-dapat-dipungkiri', re: /tidak dapat dipungkiri/i },
  { nama: 'dalam-era', re: /\bdalam era\b/i },
  // Dua pola di bawah masuk daftar §6 seoboost-bahasa-jernih pada panen KLIEN A
  // 1-2 Sep 2026 tetapi belum punya penegak; ditambahkan 2 Sep setelah diukur
  // 0 kemunculan di repo, jadi tidak memerahkan isi yang sudah ada.
  { nama: 'perlu-dicatat-bahwa', re: /perlu dicatat bahwa/i },
  { nama: 'transisi-hal-ini', re: /\bHal ini (?:menunjukkan|menutup|menjelaskan|menambah|berkaitan|berpotensi|menjadi|membuat)\b/i },

  // --- Kaidah, bukan gaya. Ditambahkan 2 Sep 2026. Semuanya bercakupan
  // `semua` sebab yang dilanggar aturan bahasa, dan dokumen klien di
  // ProjectDocs justru yang paling perlu dijaga.

  // Ejaan. "di mana" selalu dipisah; "dimana" serangkai tidak pernah benar,
  // apa pun fungsinya. Aturan fungsinya sebagai kata hubung sudah lama ada di
  // seoboost-tulis-indonesia baris 56, tetapi belum pernah punya penegak.
  { nama: 'dimana-serangkai', re: /\bdimana\b/i, semua: true },

  // Pleonasme, lima bentuk Keraf (Diksi dan Gaya Bahasa, 2000:133), dibakukan
  // Permendiknas 46/2009:106. Uji bakunya: buang kata yang dicurigai, kalau
  // artinya tetap utuh, kata itu memang mubazir. Keempat belas pola di bawah
  // diukur 0 kemunculan di repo DAN di ProjectDocs Klien B pada 2 Sep 2026, jadi
  // tidak ada satu pun isi yang berubah merah karena penambahan ini.
  { nama: 'pleonasme-agar-supaya', re: /\bagar supaya\b/i, semua: true },
  { nama: 'pleonasme-amat-sangat', re: /\bamat sangat\b/i, semua: true },
  { nama: 'pleonasme-sangat-sekali', re: /\bsangat\s+\w+\s+sekali\b/i, semua: true },
  { nama: 'pleonasme-sejak-dari', re: /\bsejak dari\b/i, semua: true },
  // Backreference, bukan \w+-\w+, supaya "para stakeholder-nya" tidak ikut.
  { nama: 'pleonasme-para-reduplikasi', re: /\bpara (\w+)-\1\b/i, semua: true },
  { nama: 'pleonasme-saling-resiprokal', re: /\bsaling \w+-me\w+\b/i, semua: true },
  { nama: 'pleonasme-arah-berlebih', re: /\b(?:naik ke atas|turun ke bawah|maju ke depan|mundur ke belakang|menepi ke pinggir)\b/i, semua: true },
  { nama: 'pleonasme-kembali-ganda', re: /\b(?:kambuh|terulang|diulang|mengulang) kembali\b/i, semua: true },
  { nama: 'pleonasme-seperti-misalnya', re: /\bseperti misalnya\b/i, semua: true },
  { nama: 'pleonasme-dll-ganda', re: /\bdan lain sebagainya\b/i, semua: true },

  // Pengisi yang tidak membawa informasi. Sekerabat dengan daftar §6
  // seoboost-bahasa-jernih, ditegakkan di sini karena bentuknya tetap.
  { nama: 'tidak-terlepas-dari', re: /\btidak (?:dapat )?(?:terlepas|dipisahkan) dari\b/i, semua: true },
  { nama: 'peran-penting', re: /\b(?:memegang|memainkan) peran(?:an)? (?:penting|krusial|kunci|vital)\b/i, semua: true },
  { nama: 'rujuk-balik-kosong', re: /\bseperti (?:yang )?telah (?:dijelaskan|disebutkan|dipaparkan|diuraikan) (?:sebelumnya|di atas)\b/i, semua: true },
];

const KUTIP = /["“”`]/;
const KUTIPAN_BLOK = /^\s*>/;

function* walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || WALK_SKIP.has(ent.name)) continue;
    if (ent.isDirectory() && ent.name.startsWith('fixtures-')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else if (ent.isFile() && ent.name.endsWith('.md')) yield p;
  }
}

const pelanggaran = [];

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const diKecuali = DIR_KECUALI.has(rel.split('/')[0]);
  const aktif = diKecuali ? POLA.filter((p) => p.semua) : POLA;
  if (aktif.length === 0) continue;
  const baris = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < baris.length; i++) {
    if (KUTIPAN_BLOK.test(baris[i])) continue; // kutipan literal klien
    for (const { nama, re } of aktif) {
      const m = re.exec(baris[i]);
      if (!m) continue;
      const sebelum = baris[i].slice(0, m.index);
      const sesudah = baris[i].slice(m.index + m[0].length);
      if (KUTIP.test(sebelum) && KUTIP.test(sesudah)) continue; // kutipan katalog
      pelanggaran.push(rel + ':' + (i + 1) + ': [' + nama + '] ' + m[0].slice(0, 80));
    }
  }
}

if (pelanggaran.length > 0) {
  for (const p of pelanggaran) console.log('PELANGGARAN ' + p);
  console.log('check-ai-patterns: ' + pelanggaran.length + ' pelanggaran');
  process.exit(1);
}
console.log('check-ai-patterns: lolos');
