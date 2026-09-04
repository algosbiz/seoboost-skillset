#!/usr/bin/env node
// run-all.mjs — jalankan keempat pemeriksa ci/ berurutan dan agregasi hasil.
//
// Pakai:
//   node ci/run-all.mjs                       -> scan akar repo (default)
//   node ci/run-all.mjs --fixtures <dir>      -> GANTI akar scan ke dir fixture
//                                                (kontrol negatif: harus gagal
//                                                pada ci/fixtures-bad)
//
// Keluar 0 hanya bila keempat pemeriksa lolos.

import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

let root = path.resolve(__dirname, '..');
const fixIdx = args.indexOf('--fixtures');
if (fixIdx >= 0) {
  const dir = args[fixIdx + 1];
  if (!dir) {
    console.error('run-all: --fixtures butuh argumen direktori');
    process.exit(2);
  }
  root = path.resolve(dir);
}
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error('run-all: akar scan tidak ditemukan: ' + root);
  process.exit(2);
}

const PEMERIKSA = [
  'check-frontmatter.mjs',
  'check-ai-patterns.mjs',
  'check-dangling-refs.mjs',
  'check-credentials.mjs',
];

console.log('run-all: akar scan = ' + root);
const hasil = [];
for (const nama of PEMERIKSA) {
  console.log('--- ' + nama + ' ---');
  const r = spawnSync(process.execPath, [path.join(__dirname, nama), '--root', root], {
    stdio: 'inherit',
  });
  hasil.push({ nama, kode: r.status === null ? 1 : r.status });
}

console.log('--- ringkasan ---');
let gagal = 0;
for (const { nama, kode } of hasil) {
  console.log(nama + ': ' + (kode === 0 ? 'LOLOS' : 'GAGAL (exit ' + kode + ')'));
  if (kode !== 0) gagal++;
}
if (gagal > 0) {
  console.log('run-all: GAGAL — ' + gagal + ' dari ' + PEMERIKSA.length + ' pemeriksa menemukan pelanggaran');
  process.exit(1);
}
console.log('run-all: semua pemeriksa lolos');
