// ============================================================================
// chart.mjs — SEO Boost Corporate professional charts (bar / line / donut).
// Hand-built SVG → rasterized to PNG via @resvg/resvg-js (same rasterizer the
// diagram pipeline uses). NO chart library (avoids node-canvas native build).
//
// Brand rules (locked spec):
//   - Charts sit on a sand50 light panel (radius 6, sand200 border). White
//     plot area. NEVER on charcoal.
//   - One saturated hue per chart: PRIMARY = orange600 #C96A00 (readable on
//     white). secondary = ink700, tertiary = sand400, donut 4th+ = orange300
//     → ink500 → sand300.
//   - Horizontal gridlines only. Axis ink600. No 3D, no shadow, no gradient.
//
// Usage:
//   import { renderChart } from './chart.mjs';
//   await renderChart({ type:'bar', ... , out:'/abs/path.png' });
// Returns { path, width, height } (PNG @2x; embed in docx at 50%).
// ============================================================================
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';

const C = {
  orange600: '#C96A00', orange500: '#FF8800', orange300: '#FFB761',
  ink900: '#231F20', ink850: '#2E2B27', ink800: '#3A3733', ink700: '#4F4B45',
  ink600: '#5C5850', ink500: '#77776F',
  sand50: '#F7F7F4', sand200: '#E5E5E1', sand300: '#D9D9D4', sand400: '#A5A39B',
  paper: '#FFFFFF',
};
const SERIES = [C.orange600, C.ink700, C.sand400, C.orange300, C.ink500, C.sand300];
const FONT = 'Arial, Helvetica, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frame(W, H, inner) {
  // sand50 panel + white plot card
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="${C.sand50}" stroke="${C.sand200}" stroke-width="2"/>
  ${inner}
</svg>`;
}

function niceMax(v) {
  if (v <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / mag;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * mag;
}

// ---- BAR (vertical) --------------------------------------------------------
function barSVG({ title, labels, values, valueSuffix = '' }) {
  const W = 1600, H = 1000;
  const padL = 150, padR = 70, padT = title ? 150 : 90, padB = 170;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxV = niceMax(Math.max(...values));
  const ticks = 4;
  let g = '';
  if (title) g += `<text x="${padL}" y="84" font-family="${FONT}" font-size="38" font-weight="700" fill="${C.ink850}">${esc(title)}</text>`;
  // horizontal gridlines + y labels
  for (let i = 0; i <= ticks; i++) {
    const y = padT + plotH - (plotH * i / ticks);
    const val = Math.round(maxV * i / ticks);
    g += `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="${C.sand200}" stroke-width="2"/>`;
    g += `<text x="${padL - 18}" y="${y + 10}" text-anchor="end" font-family="${FONT}" font-size="26" fill="${C.ink600}">${val}${valueSuffix}</text>`;
  }
  // axis baseline
  g += `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${C.ink600}" stroke-width="2.5"/>`;
  const n = values.length;
  const slot = plotW / n;
  const bw = slot * 0.56;
  values.forEach((v, i) => {
    const x = padL + slot * i + (slot - bw) / 2;
    const bh = (v / maxV) * plotH;
    const y = padT + plotH - bh;
    g += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="6" fill="${C.orange600}"/>`;
    g += `<text x="${x + bw / 2}" y="${y - 16}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="700" fill="${C.ink800}">${v}${valueSuffix}</text>`;
    g += `<text x="${x + bw / 2}" y="${padT + plotH + 44}" text-anchor="middle" font-family="${FONT}" font-size="26" fill="${C.ink700}">${esc(labels[i])}</text>`;
  });
  return { svg: frame(W, H, g), W, H };
}

// ---- LINE (1-2 series) -----------------------------------------------------
function lineSVG({ title, labels, series, valueSuffix = '' }) {
  // series: [{name, values, kind:'primary'|'secondary'}]
  const W = 1600, H = 1000;
  const padL = 150, padR = 70, padT = title ? 150 : 90, padB = 170;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const allV = series.flatMap(s => s.values);
  const maxV = niceMax(Math.max(...allV));
  const ticks = 4;
  let g = '';
  if (title) g += `<text x="${padL}" y="84" font-family="${FONT}" font-size="38" font-weight="700" fill="${C.ink850}">${esc(title)}</text>`;
  for (let i = 0; i <= ticks; i++) {
    const y = padT + plotH - (plotH * i / ticks);
    const val = Math.round(maxV * i / ticks);
    g += `<line x1="${padL}" y1="${y}" x2="${padL + plotW}" y2="${y}" stroke="${C.sand200}" stroke-width="2"/>`;
    g += `<text x="${padL - 18}" y="${y + 10}" text-anchor="end" font-family="${FONT}" font-size="26" fill="${C.ink600}">${val}${valueSuffix}</text>`;
  }
  g += `<line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="${C.ink600}" stroke-width="2.5"/>`;
  const n = labels.length;
  const xAt = (i) => padL + (plotW * i / (n - 1));
  const yAt = (v) => padT + plotH - (v / maxV) * plotH;
  labels.forEach((lb, i) => {
    g += `<text x="${xAt(i)}" y="${padT + plotH + 44}" text-anchor="middle" font-family="${FONT}" font-size="26" fill="${C.ink700}">${esc(lb)}</text>`;
  });
  series.forEach((s, si) => {
    const primary = s.kind !== 'secondary' && si === 0;
    const col = primary ? C.orange600 : C.ink700;
    const pts = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
    g += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${primary ? 4 : 3}" ${primary ? '' : 'stroke-dasharray="10 8"'} stroke-linejoin="round" stroke-linecap="round"/>`;
    if (primary) s.values.forEach((v, i) => { g += `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="8" fill="${col}"/>`; });
  });
  // legend (if >1 series)
  if (series.length > 1) {
    let lx = padL;
    const ly = H - 50;
    series.forEach((s, si) => {
      const col = si === 0 ? C.orange600 : C.ink700;
      g += `<rect x="${lx}" y="${ly - 18}" width="34" height="14" rx="3" fill="${col}"/>`;
      g += `<text x="${lx + 44}" y="${ly - 4}" font-family="${FONT}" font-size="24" fill="${C.ink700}">${esc(s.name)}</text>`;
      lx += 44 + esc(s.name).length * 14 + 60;
    });
  }
  return { svg: frame(W, H, g), W, H };
}

// ---- DONUT -----------------------------------------------------------------
function donutSVG({ title, segments, centerLabel }) {
  // segments: [{label, value}]
  const W = 1600, H = 1000;
  // donut sits in the LEFT half; legend gets the right half with full text room.
  const cx = 430, cy = title ? 560 : 520, rO = 300, rI = rO * 0.6;
  const total = segments.reduce((a, s) => a + s.value, 0);
  let g = '';
  if (title) g += `<text x="80" y="84" font-family="${FONT}" font-size="38" font-weight="700" fill="${C.ink850}">${esc(title)}</text>`;
  let ang = -Math.PI / 2;
  const polar = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  segments.forEach((s, i) => {
    const frac = s.value / total;
    const a2 = ang + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const [x1, y1] = polar(rO, ang), [x2, y2] = polar(rO, a2);
    const [x3, y3] = polar(rI, a2), [x4, y4] = polar(rI, ang);
    const col = SERIES[i % SERIES.length];
    g += `<path d="M ${x1} ${y1} A ${rO} ${rO} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rI} ${rI} 0 ${large} 0 ${x4} ${y4} Z" fill="${col}" stroke="${C.paper}" stroke-width="4"/>`;
    ang = a2;
  });
  if (centerLabel) {
    g += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="${FONT}" font-size="56" font-weight="700" fill="${C.ink850}">${esc(centerLabel.value)}</text>`;
    if (centerLabel.label) g += `<text x="${cx}" y="${cy + 44}" text-anchor="middle" font-family="${FONT}" font-size="26" fill="${C.ink500}">${esc(centerLabel.label)}</text>`;
  }
  // legend in the right half — starts at lx=820, text fits well within W=1600.
  // vertically centered around the donut center for balance.
  const lx = 820;
  const rowH = 112;
  let ly = cy - ((segments.length - 1) * rowH) / 2 - 6;
  segments.forEach((s, i) => {
    const col = SERIES[i % SERIES.length];
    const pct = Math.round((s.value / total) * 100);
    g += `<rect x="${lx}" y="${ly - 24}" width="30" height="30" rx="5" fill="${col}"/>`;
    g += `<text x="${lx + 48}" y="${ly}" font-family="${FONT}" font-size="28" fill="${C.ink800}">${esc(s.label)}</text>`;
    g += `<text x="${lx + 48}" y="${ly + 34}" font-family="${FONT}" font-size="24" fill="${C.ink500}">${pct}%  ·  ${s.value}</text>`;
    ly += rowH;
  });
  return { svg: frame(W, H, g), W, H };
}

export async function renderChart(spec) {
  let built;
  if (spec.type === 'bar') built = barSVG(spec);
  else if (spec.type === 'line') built = lineSVG(spec);
  else if (spec.type === 'donut') built = donutSVG(spec);
  else throw new Error('unknown chart type: ' + spec.type);
  const resvg = new Resvg(built.svg, {
    fitTo: { mode: 'width', value: built.W * 2 }, // 2x retina
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
    background: 'rgba(0,0,0,0)',
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(spec.out, png);
  return { path: spec.out, width: built.W, height: built.H };
}
