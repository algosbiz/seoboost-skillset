#!/usr/bin/env node
// check-credentials.mjs — sapuan pola kredensial atas seluruh repo.
//
// Pola: password[:=], blok PRIVATE KEY, kunci API sk-..., token GitHub ghp_...,
// token Slack xox[bap]-. Dikecualikan: .git, direktori fixture (nama berawalan
// fixtures-), node_modules, direktori bertitik, file biner, file > 2 MB.
//
// Baris berlabel contoh/placeholder/example/<...> diloloskan (aturan brief).
// Penajaman untuk pola password (dikalibrasi dari isi repo nyata — semua hit
// lama adalah contoh kode, bukan rahasia): kecocokan `password[:=]` hanya
// dilaporkan bila sisi kanannya tampak literal rahasia. Sisi kanan yang aman:
// kosong, string kosong ""/'', referensi variabel ($VAR), pembacaan env
// (process.env / os.environ / getenv / ENV[), atau anotasi tipe
// (String/str/bool/int/number).
//
// Pakai: node ci/check-credentials.mjs [--root <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const rootIdx = args.indexOf('--root');
const ROOT = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : path.resolve(__dirname, '..');

const WALK_SKIP = new Set(['.git', 'node_modules']);
const EKSTENSI_BINER = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.avif', '.heic',
  '.pdf', '.zip', '.gz', '.tgz', '.dmg', '.bin', '.exe', '.wasm', '.jar',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.mov', '.psd', '.pyc',
]);
const BATAS_UKURAN = 2 * 1024 * 1024;

const PLACEHOLDER = /contoh|placeholder|example|<[^>]*>/i;
const POLA_SANDI = /password\s*[:=]/i;
const POLA_LAIN = [
  { nama: 'private-key', re: /BEGIN (RSA |EC )?PRIVATE KEY/ },
  { nama: 'api-key-sk', re: /\bsk-[A-Za-z0-9]{20,}/ },
  { nama: 'github-token', re: /\bghp_[A-Za-z0-9]{20,}/ },
  { nama: 'slack-token', re: /xox[bap]-/ },
];

function rhsAman(rhs) {
  if (rhs === '') return true;
  if (/^(""|'')/.test(rhs)) return true;
  if (rhs.startsWith('$')) return true;
  if (/^(process\.env|os\.environ|ENV\[|getenv|System\.getenv)/i.test(rhs)) return true;
  if (/^(String|str|string|bool|boolean|int|number)\b/.test(rhs)) return true;
  return false;
}

function* walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || WALK_SKIP.has(ent.name)) continue;
    if (ent.isDirectory() && ent.name.startsWith('fixtures-')) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else if (ent.isFile()) yield p;
  }
}

const pelanggaran = [];

for (const file of walk(ROOT)) {
  if (EKSTENSI_BINER.has(path.extname(file).toLowerCase())) continue;
  const stat = fs.statSync(file);
  if (stat.size > BATAS_UKURAN) continue;
  const buf = fs.readFileSync(file);
  if (buf.subarray(0, 8000).includes(0)) continue; // biner tanpa ekstensi dikenal
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const baris = buf.toString('utf8').split(/\r?\n/);
  for (let i = 0; i < baris.length; i++) {
    const line = baris[i];
    if (PLACEHOLDER.test(line)) continue;
    const mp = POLA_SANDI.exec(line);
    if (mp !== null) {
      const rhs = line.slice(mp.index + mp[0].length).trim();
      if (!rhsAman(rhs)) {
        pelanggaran.push(rel + ':' + (i + 1) + ': [password] ' + line.trim().slice(0, 80));
      }
    }
    for (const { nama, re } of POLA_LAIN) {
      if (re.test(line)) {
        pelanggaran.push(rel + ':' + (i + 1) + ': [' + nama + '] ' + line.trim().slice(0, 80));
      }
    }
  }
}

if (pelanggaran.length > 0) {
  for (const p of pelanggaran) console.log('PELANGGARAN ' + p);
  console.log('check-credentials: ' + pelanggaran.length + ' pelanggaran');
  process.exit(1);
}
console.log('check-credentials: lolos');
