#!/usr/bin/env node
// check-frontmatter.mjs — pemeriksa frontmatter SKILL.md level-1.
//
// Aturan: tiap <dir>/SKILL.md pada level-1 repo wajib diawali blok frontmatter
// `---`, memuat `name:` yang sama persis dengan nama folder dan `description:`
// yang tidak kosong. Mendukung block scalar YAML (`>-`, `>`, `|`, `|-`) karena
// empat skill nyata memakainya (mis. seoboost-feasibility-study).
//
// Direktori yang dikecualikan: agent-memory, project-g, plugins, ProjectDocs,
// proposals, automation, ci — bukan direktori skill. Direktori bertitik dan
// fixtures-bad juga dilewati. Direktori non-skill tanpa SKILL.md hanya diberi
// peringatan (tidak menggagalkan) supaya penambahan direktori infrastruktur
// baru tidak langsung memerahkan CI.
//
// Pakai: node ci/check-frontmatter.mjs [--root <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : path.resolve(__dirname, '..');

const KECUALI = new Set([
  'agent-memory', 'project-g', 'plugins', 'ProjectDocs',
  'proposals', 'automation', 'ci', 'node_modules', 'fixtures-bad',
]);

const pelanggaran = [];
const peringatan = [];

// Ambil nilai kunci top-level (kolom 0) dari blok frontmatter.
function ambilKunci(blok, kunci) {
  for (let i = 0; i < blok.length; i++) {
    const m = blok[i].match(new RegExp('^' + kunci + ':(.*)$'));
    if (!m) continue;
    let nilai = m[1].trim();
    if (nilai === '>' || nilai === '|' || nilai === '>-' || nilai === '|-') {
      const lanjut = [];
      for (let j = i + 1; j < blok.length && /^\s+\S/.test(blok[j]); j++) {
        lanjut.push(blok[j].trim());
      }
      nilai = lanjut.join(' ');
    }
    nilai = nilai.replace(/^["']/, '').replace(/["']$/, '');
    return nilai;
  }
  return null;
}

for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!ent.isDirectory()) continue;
  const nama = ent.name;
  if (nama.startsWith('.') || KECUALI.has(nama)) continue;

  const file = path.join(ROOT, nama, 'SKILL.md');
  const rel = nama + '/SKILL.md';
  if (!fs.existsSync(file)) {
    peringatan.push(nama + ': tidak punya SKILL.md (tidak menggagalkan)');
    continue;
  }

  const baris = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  if (baris[0] !== '---') {
    pelanggaran.push(rel + ': tidak diawali blok frontmatter ---');
    continue;
  }
  let tutup = -1;
  for (let i = 1; i < baris.length; i++) {
    if (baris[i] === '---') { tutup = i; break; }
  }
  if (tutup < 0) {
    pelanggaran.push(rel + ': blok frontmatter tidak ditutup ---');
    continue;
  }

  const blok = baris.slice(1, tutup);
  const nameVal = ambilKunci(blok, 'name');
  const descVal = ambilKunci(blok, 'description');

  if (nameVal === null) {
    pelanggaran.push(rel + ': frontmatter tanpa kunci name:');
  } else if (nameVal !== nama) {
    pelanggaran.push(rel + ': name "' + nameVal + '" tidak sama dengan nama folder "' + nama + '"');
  }
  if (descVal === null) {
    pelanggaran.push(rel + ': frontmatter tanpa kunci description:');
  } else if (descVal === '') {
    pelanggaran.push(rel + ': description kosong');
  }
}

for (const p of peringatan) console.log('PERINGATAN ' + p);
if (pelanggaran.length > 0) {
  for (const p of pelanggaran) console.log('PELANGGARAN ' + p);
  console.log('check-frontmatter: ' + pelanggaran.length + ' pelanggaran');
  process.exit(1);
}
console.log('check-frontmatter: lolos');
