import { GState, jsPDF } from 'jspdf';
import { doughnutSvg, lineChartSvg } from './charts';
import { svgToPng, wrapText } from './images';
import { containBox, expand } from './primitives';
import { SLIDE_H, SLIDE_W } from './slides';
import type { Deck, RectEl, SlideEl, TextEl } from './types';

const LINE_HEIGHT = 1.2;

// The PDF standard fonts cover Windows-1252; replace what they cannot draw.
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
const NBSP = String.fromCharCode(160);
function pdfText(text: string): string {
  let out = '';
  for (const ch of text.replace(/₦/g, 'N').split(NBSP).join(' ')) {
    const code = ch.charCodeAt(0);
    if (code >= 0x2010 && code <= 0x2012) out += '-';
    else if (code === 10 || (code >= 32 && code <= 255) || WIN_ANSI_EXTRA.has(ch)) out += ch;
    else out += '?';
  }
  return out;
}

function rgb(color: string): [number, number, number] {
  const h = color.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function polygon(doc: jsPDF, points: [number, number][], style: string) {
  const [start, ...rest] = points;
  const deltas: [number, number][] = [];
  let prev = start;
  for (const p of rest) {
    deltas.push([p[0] - prev[0], p[1] - prev[1]]);
    prev = p;
  }
  doc.lines(deltas, start[0], start[1], [1, 1], style, true);
}

function drawRect(doc: jsPDF, el: RectEl) {
  const style = el.fill && el.line ? 'FD' : el.fill ? 'F' : 'S';
  if (el.fill) doc.setFillColor(...rgb(el.fill));
  if (el.line) {
    doc.setDrawColor(...rgb(el.line.color));
    doc.setLineWidth((el.line.width ?? 1) / 72);
  }
  const translucent = el.alpha !== undefined && el.alpha < 1;
  if (translucent) {
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: el.alpha, 'stroke-opacity': 1 }));
  }
  const { x, y, w, h } = el;
  const ss = Math.min(w, h);
  switch (el.shape ?? 'rect') {
    case 'roundRect': {
      const r = Math.min(el.radius ?? 0.05, ss / 2);
      doc.roundedRect(x, y, w, h, r, r, style);
      break;
    }
    case 'ellipse':
      doc.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, style);
      break;
    case 'hexagon': {
      const d = ss * 0.25 * 1.1547;
      polygon(doc, [[x + d, y], [x + w - d, y], [x + w, y + h / 2], [x + w - d, y + h], [x + d, y + h], [x, y + h / 2]], style);
      break;
    }
    case 'chevron': {
      const d = ss * 0.5;
      polygon(doc, [[x, y], [x + w - d, y], [x + w, y + h / 2], [x + w - d, y + h], [x, y + h], [x + d, y + h / 2]], style);
      break;
    }
    case 'homePlate': {
      const d = ss * 0.5;
      polygon(doc, [[x, y], [x + w - d, y], [x + w, y + h / 2], [x + w - d, y + h], [x, y + h]], style);
      break;
    }
    default:
      doc.rect(x, y, w, h, style);
  }
  if (translucent) doc.restoreGraphicsState();
}

function drawText(doc: jsPDF, el: TextEl) {
  const style = el.bold && el.italic ? 'bolditalic' : el.bold ? 'bold' : el.italic ? 'italic' : 'normal';
  doc.setFont('helvetica', style);
  doc.setFontSize(el.size);
  doc.setTextColor(...rgb(el.color));
  // Same line breaking as the layout code, so text fits exactly where it was measured.
  const lines = wrapText(el.text, el.w, el.size, el.bold).map(pdfText);
  const lh = (el.size * LINE_HEIGHT) / 72;
  const total = lines.length * lh;
  const top = el.valign === 'middle' ? el.y + (el.h - total) / 2 : el.valign === 'bottom' ? el.y + el.h - total : el.y;
  const align = el.align ?? 'left';
  const x = align === 'center' ? el.x + el.w / 2 : align === 'right' ? el.x + el.w : el.x;
  lines.forEach((line, i) => {
    const y = top + i * lh + lh / 2;
    doc.text(line, x, y, { align, baseline: 'middle' });
    if (el.underline && line) {
      const w = doc.getTextWidth(line);
      const ux = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      doc.setDrawColor(...rgb(el.color));
      doc.setLineWidth(0.6 / 72);
      doc.line(ux, y + el.size * 0.42 / 72, ux + w, y + el.size * 0.42 / 72);
    }
  });
  if (el.link) {
    const target = 'slide' in el.link ? { pageNumber: el.link.slide } : { url: el.link.url };
    doc.link(el.x, el.y, el.w, el.h, target);
  }
}

class ImageCache {
  private readonly aliases = new Map<string, string>();
  alias(data: string): string {
    let alias = this.aliases.get(data);
    if (!alias) {
      alias = `img${this.aliases.size}`;
      this.aliases.set(data, alias);
    }
    return alias;
  }
}

function drawImage(doc: jsPDF, cache: ImageCache, el: { x: number; y: number; w: number; h: number; data: string; aspect: number; circle?: boolean }) {
  const box = containBox(el, el.aspect);
  const format = el.data.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
  if (el.circle) {
    doc.saveGraphicsState();
    doc.ellipse(box.x + box.w / 2, box.y + box.h / 2, box.w / 2, box.h / 2, null);
    doc.clip();
    doc.discardPath();
  }
  doc.addImage(el.data, format, box.x, box.y, box.w, box.h, cache.alias(el.data), 'FAST');
  if (el.circle) doc.restoreGraphicsState();
}

async function drawElement(doc: jsPDF, cache: ImageCache, el: SlideEl): Promise<void> {
  switch (el.t) {
    case 'rect':
      return drawRect(doc, el);
    case 'text':
      return drawText(doc, el);
    case 'image':
      return drawImage(doc, cache, el);
    case 'line':
      doc.setDrawColor(...rgb(el.color));
      doc.setLineWidth((el.width ?? 1) / 72);
      doc.line(el.x1, el.y1, el.x2, el.y2);
      return;
    case 'doughnut':
    case 'lineChart': {
      const chart = el.t === 'doughnut' ? doughnutSvg(el) : lineChartSvg(el);
      const png = await svgToPng(chart.svg, chart.width, chart.height, 2.5);
      return drawImage(doc, cache, { ...el, data: png.data, aspect: png.aspect });
    }
    default:
      for (const child of expand(el)) await drawElement(doc, cache, child);
  }
}

/** Renders the deck as a 16:9 PDF with the same layout as the PowerPoint file. */
export async function renderPdf(deck: Deck): Promise<Blob> {
  const doc = new jsPDF({ unit: 'in', format: [SLIDE_W, SLIDE_H], orientation: 'landscape', compress: true });
  doc.setProperties({ title: deck.title, subject: `Media Performance Audit Report — ${deck.company}`, author: 'P+ Measurement Services', creator: 'P+ Measurement Services' });
  const cache = new ImageCache();
  for (let i = 0; i < deck.slides.length; i++) {
    if (i > 0) doc.addPage([SLIDE_W, SLIDE_H], 'landscape');
    for (const el of deck.slides[i].elements) await drawElement(doc, cache, el);
  }
  return doc.output('blob');
}
