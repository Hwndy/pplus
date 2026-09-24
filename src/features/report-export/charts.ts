import type { DoughnutEl, LineChartEl } from './types';

/**
 * SVG versions of the deck's native PowerPoint charts, used by the PDF export
 * (rasterised there) so both files show the same charts.
 */

const PX = 96;
const FONT = 'Arial, Helvetica, sans-serif';
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function legend(items: { name: string; color: string }[], width: number, y: number, size = 12): string {
  const widths = items.map((i) => 18 + i.name.length * size * 0.55 + 18);
  const total = widths.reduce((a, b) => a + b, 0);
  let x = Math.max(4, (width - total) / 2);
  return items.map((item, i) => {
    const out = `<rect x="${x}" y="${y - size * 0.75}" width="${size * 0.75}" height="${size * 0.75}" fill="${item.color}"/>`
      + `<text x="${x + size}" y="${y}" font-family="${FONT}" font-size="${size}" fill="#404040">${esc(item.name)}</text>`;
    x += widths[i];
    return out;
  }).join('');
}

export function doughnutSvg(el: DoughnutEl): { svg: string; width: number; height: number } {
  const width = Math.round(el.w * PX);
  const height = Math.round(el.h * PX);
  const legendH = 30;
  const cx = width / 2;
  const cy = (height - legendH) / 2;
  const r = Math.max(10, Math.min(width, height - legendH) / 2 - 16);
  const hole = r * 0.5;
  const total = el.values.reduce((a, b) => a + b, 0) || 1;
  let angle = -Math.PI / 2;
  const parts: string[] = [];
  const labels: string[] = [];
  el.values.forEach((value, i) => {
    if (value <= 0) return;
    const share = value / total;
    const color = el.colors[i % el.colors.length];
    if (share >= 0.9999) {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(r + hole) / 2}" fill="none" stroke="${color}" stroke-width="${r - hole}"/>`);
    } else {
      const end = angle + share * Math.PI * 2;
      const large = share > 0.5 ? 1 : 0;
      const p = (rad: number, a: number) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
      parts.push(`<path d="M${p(r, angle)} A${r},${r} 0 ${large} 1 ${p(r, end)} L${p(hole, end)} A${hole},${hole} 0 ${large} 0 ${p(hole, angle)} Z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>`);
    }
    const mid = angle + share * Math.PI;
    const pct = `${Math.round(share * 100) || '<1'}%`;
    if (share >= 0.06) {
      const lr = (r + hole) / 2;
      labels.push(`<text x="${cx + lr * Math.cos(mid)}" y="${cy + lr * Math.sin(mid)}" font-family="${FONT}" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central">${pct}</text>`);
    } else {
      const lr = r + 12;
      const x = cx + lr * Math.cos(mid);
      labels.push(`<text x="${x}" y="${cy + lr * Math.sin(mid)}" font-family="${FONT}" font-size="12" font-weight="bold" fill="#262626" text-anchor="${x < cx ? 'end' : 'start'}" dominant-baseline="central">${pct}</text>`);
    }
    angle += share * Math.PI * 2;
  });
  const legendSvg = legend(el.categories.map((name, i) => ({ name, color: el.colors[i % el.colors.length] })), width, height - 10);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${parts.join('')}${labels.join('')}${legendSvg}</svg>`, width, height };
}

function niceMax(value: number, percent: boolean): number {
  if (value <= 0) return percent ? 0.1 : 10;
  const exp = 10 ** Math.floor(Math.log10(value));
  const n = value / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

export function lineChartSvg(el: LineChartEl): { svg: string; width: number; height: number } {
  const width = Math.round(el.w * PX);
  const height = Math.round(el.h * PX);
  const fmt = (v: number) => (el.percent ? `${Math.round(v * 100)}%` : Math.round(v).toLocaleString());
  const peak = niceMax(Math.max(0, ...el.series.flatMap((s) => s.values)) * 1.1, Boolean(el.percent));
  const max = el.percent ? Math.min(1, peak) : peak;
  const left = 42;
  const right = 16;
  const top = 16;
  const bottom = 50;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const n = el.categories.length;
  const xAt = (i: number) => left + (n === 1 ? plotW / 2 : (plotW * (i + 0.5)) / n);
  const yAt = (v: number) => top + plotH - (v / max) * plotH;
  const out: string[] = [];
  for (let t = 0; t <= 5; t++) {
    const v = (max * t) / 5;
    const y = yAt(v);
    out.push(`<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="${t === 0 ? '#BFBFBF' : '#E5E5E5'}" stroke-width="1"/>`);
    out.push(`<text x="${left - 6}" y="${y}" font-family="${FONT}" font-size="10" fill="#595959" text-anchor="end" dominant-baseline="central">${fmt(v)}</text>`);
  }
  el.categories.forEach((c, i) => {
    out.push(`<text x="${xAt(i)}" y="${top + plotH + 16}" font-family="${FONT}" font-size="${n > 8 ? 10 : 11}" fill="#595959" text-anchor="middle">${esc(c)}</text>`);
  });
  for (const s of el.series) {
    const pts = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
    out.push(`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round"/>`);
    s.values.forEach((v, i) => {
      out.push(`<circle cx="${xAt(i)}" cy="${yAt(v)}" r="4.5" fill="${s.color}"/>`);
      out.push(`<text x="${xAt(i)}" y="${yAt(v) - 9}" font-family="${FONT}" font-size="9" fill="#404040" text-anchor="middle">${fmt(v)}</text>`);
    });
  }
  out.push(legend(el.series.map((s) => ({ name: s.name, color: s.color })), width, height - 8, 11));
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${out.join('')}</svg>`, width, height };
}
