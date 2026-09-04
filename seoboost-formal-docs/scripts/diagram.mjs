// ============================================================================
// diagram.mjs — CLEAN FLAT architecture diagrams for SEO Boost Corporate docs.
// (Replaces the earlier hand-drawn Rough.js version — user asked for tidy,
//  not handwriting.) Crisp SVG: rounded rects, straight connectors, clean
//  arrowheads. Rasterized to PNG via @resvg/resvg-js.
//
// KEY DIFFERENTIATOR retained: charcoal "anchor" node (ink900 fill, orange500
// glowing title) — the SEO Boost signature. One orange primary-path edge max.
//
// USAGE:  import { renderDiagram } from './diagram.mjs';
//         await renderDiagram(spec, '/abs/out.png');
// spec = { width, height, nodes:[], edges:[] }
//   node.kind: default|active|anchor|secondary|data|external|accent
//   edge.kind: default|primary|secondary ; side: top|bottom|left|right
// Render-space px; exported 2× then placed at ~62% in docx.
// ============================================================================
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, readFileSync } from 'node:fs';

const T = {
  orange500: '#FF8800', orange300: '#FFB761', orange600: '#C96A00', orange50: '#FFF4E5',
  ink900: '#231F20', ink800: '#3A3733', ink700: '#4F4B45', ink600: '#5C5850', ink500: '#77776F',
  sand400: '#A5A39B', sand300: '#D9D9D4', sand200: '#E5E5E1', sand50: '#F7F7F4',
  infoBg: '#EAF0F8', infoStroke: '#2B5C9C', onDark: '#F4F4F0', onDarkMuted: '#A9A79F', paper: '#FFFFFF',
};
const FONT = 'Arial, Helvetica, sans-serif';
const f = (n) => Math.round(n * 100) / 100;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// node palette: fill, stroke, title color, sublabel color, optional dashed stroke
function nodeStyle(kind) {
  switch (kind) {
    case 'anchor':    return { fill: T.ink900, stroke: T.ink900, title: T.orange500, sub: T.onDarkMuted, sw: 0 };
    case 'active': case 'start': return { fill: T.orange300, stroke: T.orange600, title: T.ink900, sub: T.ink700, sw: 2 };
    case 'accent':       return { fill: T.orange50, stroke: T.orange600, title: T.ink800, sub: T.ink700, sw: 1.6 };
    case 'data':      return { fill: T.sand200, stroke: T.sand400, title: T.ink700, sub: T.ink600, sw: 1.6 };
    case 'external':  return { fill: T.infoBg, stroke: T.infoStroke, title: T.infoStroke, sub: T.ink700, sw: 1.6 };
    case 'secondary': return { fill: T.paper, stroke: T.sand400, title: T.ink600, sub: T.ink500, sw: 1.6, dash: '6 5' };
    default:          return { fill: T.paper, stroke: T.ink800, title: T.ink800, sub: T.ink700, sw: 1.6 };
  }
}
const edgeColor = (k) => k === 'primary' ? T.orange600 : k === 'secondary' ? T.sand400 : T.ink700;

function sidePt(n, side) {
  const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
  return side === 'top' ? [cx, n.y] : side === 'bottom' ? [cx, n.y + n.h]
    : side === 'left' ? [n.x, cy] : side === 'right' ? [n.x + n.w, cy] : [cx, cy];
}

export function buildSVG(spec) {
  const W = spec.width, H = spec.height;
  const parts = [];
  const byId = {}; for (const n of spec.nodes) byId[n.id] = n;
  const edgeLabels = [];

  // edges first (behind nodes)
  for (const e of spec.edges) {
    const a = byId[e.from], b = byId[e.to]; if (!a || !b) continue;
    const [x1, y1] = sidePt(a, e.fromSide || 'right');
    const [x2, y2] = sidePt(b, e.toSide || 'left');
    const col = edgeColor(e.kind);
    const sw = e.kind === 'primary' ? 2.4 : 1.8;
    const dash = e.dashed ? ' stroke-dasharray="8 6"' : '';
    // straight connector, slightly shortened so it meets the arrowhead cleanly
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const back = 9; // gap for arrowhead
    const ex = x2 - back * Math.cos(ang), ey = y2 - back * Math.sin(ang);
    parts.push(`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(ex)}" y2="${f(ey)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"${dash}/>`);
    // clean filled triangular arrowhead
    const al = 13, aw = 6.5;
    const bx = x2 - al * Math.cos(ang), by = y2 - al * Math.sin(ang);
    const lx = bx + aw * Math.cos(ang + Math.PI / 2), ly = by + aw * Math.sin(ang + Math.PI / 2);
    const rx = bx + aw * Math.cos(ang - Math.PI / 2), ry = by + aw * Math.sin(ang - Math.PI / 2);
    parts.push(`<path d="M ${f(x2)} ${f(y2)} L ${f(lx)} ${f(ly)} L ${f(rx)} ${f(ry)} Z" fill="${col}"/>`);
    if (e.label) {
      const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
      edgeLabels.push({ x: (x1 + x2) / 2, y: horizontal ? Math.min(y1, y2) - 13 : (y1 + y2) / 2, text: e.label, color: col });
    }
  }

  // nodes (clean rounded rects)
  for (const n of spec.nodes) {
    const st = nodeStyle(n.kind);
    const dash = st.dash ? ` stroke-dasharray="${st.dash}"` : '';
    parts.push(`<rect x="${f(n.x)}" y="${f(n.y)}" width="${f(n.w)}" height="${f(n.h)}" rx="10" fill="${st.fill}" stroke="${st.stroke}" stroke-width="${st.sw}"${dash}/>`);
    const lx = n.x + n.w / 2;
    const hasSub = n.sublabels && n.sublabels.length;
    const ly = hasSub ? n.y + n.h / 2 - 4 : n.y + n.h / 2 + 6;
    parts.push(`<text x="${f(lx)}" y="${f(ly)}" font-family="${FONT}" font-size="17" font-weight="700" fill="${st.title}" text-anchor="middle">${esc(n.label)}</text>`);
    if (hasSub) n.sublabels.forEach((s, i) => parts.push(`<text x="${f(lx)}" y="${f(n.y + n.h / 2 + 22 + i * 18)}" font-family="${FONT}" font-size="13" fill="${st.sub}" text-anchor="middle">${esc(s)}</text>`));
  }

  // edge labels LAST, on a clean white plate
  for (const el of edgeLabels) {
    const w = el.text.length * 7.4 + 16, h = 22;
    parts.push(`<rect x="${f(el.x - w / 2)}" y="${f(el.y - 15)}" width="${f(w)}" height="${h}" rx="5" fill="${T.paper}" stroke="${T.sand200}" stroke-width="1"/>`);
    parts.push(`<text x="${f(el.x)}" y="${f(el.y)}" font-family="${FONT}" font-size="13" fill="${el.color}" text-anchor="middle">${esc(el.text)}</text>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="none"/>${parts.join('')}</svg>`;
}

export async function renderDiagram(spec, outPng, scale = 2) {
  const svg = buildSVG(spec);
  const resvg = new Resvg(svg, {
    background: 'rgba(0,0,0,0)',
    fitTo: { mode: 'width', value: spec.width * scale },
    font: { loadSystemFonts: true, defaultFontFamily: 'Arial' },
  });
  writeFileSync(outPng, resvg.render().asPng());
  return outPng;
}

if (process.argv[1] && process.argv[1].endsWith('diagram.mjs') && process.argv[2]) {
  const spec = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  await renderDiagram(spec, process.argv[3] || 'diagram.png');
  console.log('wrote', process.argv[3] || 'diagram.png');
}
