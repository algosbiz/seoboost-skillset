#!/usr/bin/env node
// check-dangling-refs.mjs — deteksi rujukan skill seoboost-* yang menggantung.
//
// Kumpulkan token `seoboost-[a-z0-9-]+` dari semua .md (kecuali direktori yang
// dikecualikan), buang yang cocok dengan nama direktori yang ada; sisanya
// pelanggaran, KECUALI baris (atau baris tepat di atas/bawahnya, untuk kalimat
// yang terbungkus wrap) memuat kata penghapusan/penggantian, atau konteksnya
// jelas bukan rujukan skill.
//
// Nama yang dianggap "ada": direktori level-1 akar scan + subdirektori
// plugins/ (skill ber-namespace plugin, mis. seoboost-marketing) + basename akar
// scan sendiri (rujukan repo `seoboost-skill-set`).
//
// Konteks yang dilewati (bukan rujukan skill — kalibrasi dari isi repo nyata):
//   - token berakhiran `-`            → prefiks keluarga/template (seoboost-devset-*, seoboost-gsap-*)
//   - karakter sebelum `/` atau `.`   → segmen path / dotfile (~/x/seoboost-agent/, .seoboost-gdrive-token)
//   - karakter sesudah `/` `:` `<` `*` atau huruf besar
//                                     → path, namespace plugin, placeholder template (seoboost-port-vX)
//   - sesudahnya `.`+alfanumerik      → nama file (seoboost-logo.png, seoboost-skill-set-management.md)
//   - diapit tanda kutip ganda        → frasa trigger/kutipan ("seoboost-devset project-e")
//
// Kata pengecualian per baris (jendela +/-1 baris): dihapus, menghapus,
// removed, deleted, menggantikan, usang, UPDATE 29 Agu, contoh — "contoh"
// ditambahkan dari kalibrasi (SKILLS-SOP memakai "contoh: seoboost-terminal" untuk
// nama project, bukan skill).
//
// Daftar putih pasangan (file, token) — kasus nyata yang bukan cacat file:
//   - seoboost-klien-b-program-b-penjurian-hari-h/SKILL.md -> seoboost-klien-b-program-b-docs
//     (skill terpasang di ~/.claude/skills tapi belum masuk repo canon;
//     keputusan memasukkannya milik orkestrator/operator, bukan leaf CI)
//   - seoboost-formal-docs/README.md -> seoboost-strategic-docs
//     (dokumentasi migrasi historis dari skill lama)
//   - seoboost-devset-<project>/SKILL.md -> seoboost-agent-board-dashboard
//     (nama repo GitHub klien, bukan skill)
//
// Pakai: node ci/check-dangling-refs.mjs [--root <dir>]

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
// Direktori fixture (nama berawalan fixtures-) dilewati — sengaja berisi pelanggaran.
const WALK_SKIP = new Set(['.git', 'node_modules']);

const PENGECUALIAN = /dihapus|menghapus|removed|deleted|menggantikan|usang|UPDATE 29 Agu|contoh/i;

const DAFTAR_PUTIH = new Set([
  // seoboost-klien-b-program-b-docs dihapus dari daftar 29 Agu 2026: dir-nya kini ada di repo.
  'seoboost-formal-docs/README.md|seoboost-strategic-docs',
  'seoboost-devset-<project>/SKILL.md|seoboost-agent-board-dashboard',
]);

// Nama yang dianggap ada.
const dikenal = new Set([path.basename(ROOT)]);
for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (ent.isDirectory() && !ent.name.startsWith('.')) dikenal.add(ent.name);
}
const pluginsDir = path.join(ROOT, 'plugins');
if (fs.existsSync(pluginsDir)) {
  for (const ent of fs.readdirSync(pluginsDir, { withFileTypes: true })) {
    if (ent.isDirectory()) dikenal.add(ent.name);
  }
}

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
  if (DIR_KECUALI.has(rel.split('/')[0])) continue;
  const baris = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (let i = 0; i < baris.length; i++) {
    const line = baris[i];
    const re = /seoboost-[a-z0-9-]+/g;
    let m;
    while ((m = re.exec(line)) !== null) {
      const token = m[0];
      if (token.endsWith('-')) continue;                       // prefiks keluarga/template
      if (dikenal.has(token)) continue;
      const sebelum = m.index > 0 ? line[m.index - 1] : '';
      const sesudahIdx = m.index + token.length;
      const sesudah = sesudahIdx < line.length ? line[sesudahIdx] : '';
      if (sebelum === '/' || sebelum === '.') continue;        // path / dotfile
      if (sesudah === '/' || sesudah === ':' || sesudah === '<' || sesudah === '*') continue;
      if (/[A-Z]/.test(sesudah)) continue;                     // placeholder template (vX)
      if (sesudah === '.' && /[A-Za-z0-9]/.test(line[sesudahIdx + 1] || '')) continue; // nama file
      const kiri = line.slice(0, m.index);
      const kanan = line.slice(sesudahIdx);
      if (kiri.includes('"') && kanan.includes('"')) continue; // frasa trigger/kutipan
      const jendela = [baris[i - 1] || '', line, baris[i + 1] || ''].join('\n');
      if (PENGECUALIAN.test(jendela)) continue;
      if (DAFTAR_PUTIH.has(rel + '|' + token)) continue;
      pelanggaran.push(rel + ':' + (i + 1) + ': rujukan menggantung `' + token + '`');
    }
  }
}

if (pelanggaran.length > 0) {
  for (const p of pelanggaran) console.log('PELANGGARAN ' + p);
  console.log('check-dangling-refs: ' + pelanggaran.length + ' pelanggaran');
  process.exit(1);
}
console.log('check-dangling-refs: lolos');
