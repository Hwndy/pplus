import { fitFontSize } from './images';
import type { BarRow, BarsEl, Box, DivergingEl, PrimitiveEl, SlideEl } from './types';

const LABEL = '#404040';
const MUTED = '#7F7F7F';
const AXIS = '#D9D9D9';

/** Logo/photo in a circle, or the initials when there is no picture. */
function badge(row: Pick<BarRow, 'icon' | 'initials' | 'color'>, x: number, y: number, size: number): PrimitiveEl[] {
  if (row.icon) {
    return [
      { t: 'rect', shape: 'ellipse', x, y, w: size, h: size, fill: '#FFFFFF', line: { color: AXIS, width: 0.75 } },
      { t: 'image', x: x + size * 0.12, y: y + size * 0.12, w: size * 0.76, h: size * 0.76, data: row.icon.data, aspect: row.icon.aspect, circle: row.icon.aspect > 0.9 && row.icon.aspect < 1.1 },
    ];
  }
  if (!row.initials) return [];
  return [
    { t: 'rect', shape: 'ellipse', x, y, w: size, h: size, fill: row.color },
    { t: 'text', x, y, w: size, h: size, text: row.initials, size: Math.max(6, size * 72 * 0.36), color: '#FFFFFF', bold: true, align: 'center', valign: 'middle' },
  ];
}

function bars(el: BarsEl): PrimitiveEl[] {
  const out: PrimitiveEl[] = [];
  const n = el.rows.length;
  if (!n) return out;
  const size = el.size ?? 9;
  // Few rows keep a natural height instead of stretching across the panel.
  const rowH = Math.min(el.h / n, 0.5);
  const top = el.y + (el.h - rowH * n) / 2;
  const barH = Math.min(rowH * 0.66, 0.36);
  const withBadges = el.rows.some((r) => r.icon || r.initials);
  const badgeSize = Math.min(rowH * 0.86, 0.36);
  const badgeCol = withBadges ? badgeSize + 0.06 : 0;
  const valueW = 0.5;
  const barX = el.x + el.labelW + badgeCol;
  const barMaxW = Math.max(0.2, el.w - el.labelW - badgeCol - valueW);
  const max = el.max ?? Math.max(...el.rows.map((r) => r.value), 0);

  out.push({ t: 'line', x1: barX, y1: top, x2: barX, y2: top + rowH * n, color: AXIS, width: 0.75 });
  el.rows.forEach((row, i) => {
    const y = top + i * rowH;
    if (el.labelW > 0) {
      const text = row.sublabel ? `${row.label}\n(${row.sublabel})` : row.label;
      const fs = fitFontSize(text, el.labelW - 0.06, rowH, size, 6, row.highlight);
      out.push({
        t: 'text', x: el.x, y, w: el.labelW - 0.06, h: rowH, text, size: fs,
        color: row.highlight ? '#111111' : LABEL, bold: row.highlight, align: 'right', valign: 'middle',
      });
    }
    if (withBadges) out.push(...badge(row, el.x + el.labelW, y + (rowH - badgeSize) / 2, badgeSize));
    const w = max > 0 ? (row.value / max) * barMaxW : 0;
    if (row.value > 0) {
      out.push({ t: 'rect', x: barX, y: y + (rowH - barH) / 2, w: Math.max(w, 0.03), h: barH, fill: row.color });
    }
    out.push({
      t: 'text', x: barX + Math.max(w, 0.03) + 0.05, y, w: valueW, h: rowH, text: row.display,
      size: Math.min(size, 9), color: row.highlight ? '#111111' : MUTED, bold: row.highlight, valign: 'middle',
    });
  });
  return out;
}

function diverging(el: DivergingEl): PrimitiveEl[] {
  const out: PrimitiveEl[] = [];
  const n = el.rows.length;
  if (!n) return out;
  const rowH = el.h / n;
  const barH = Math.min(rowH * 0.62, 0.3);
  const badgeSize = Math.min(rowH * 0.9, 0.3);
  const maxNeg = Math.max(...el.rows.map((r) => r.negative), 0);
  const maxRight = Math.max(...el.rows.map((r) => r.positive + r.neutral), 1);
  const plotX = el.x + el.labelW;
  const plotW = el.w - el.labelW - 0.1;
  const scale = plotW / (maxNeg + maxRight);
  const axisX = plotX + maxNeg * scale;

  el.rows.forEach((row, i) => {
    const y = el.y + i * rowH;
    const by = y + (rowH - barH) / 2;
    const negW = row.negative * scale;
    const posW = row.positive * scale;
    const neuW = row.neutral * scale;
    const leftEdge = axisX - negW;
    // Name (and logo) sit just left of where the row's bars start.
    const labelRight = leftEdge - 0.06;
    const hasBadge = Boolean(row.icon || row.initials);
    if (hasBadge) out.push(...badge({ ...row, color: '#595959' }, labelRight - badgeSize, y + (rowH - badgeSize) / 2, badgeSize));
    const textRight = hasBadge ? labelRight - badgeSize - 0.05 : labelRight;
    const labelW = Math.max(0.4, textRight - el.x);
    out.push({
      t: 'text', x: textRight - labelW, y, w: labelW, h: rowH, text: row.label,
      size: fitFontSize(row.label, labelW, rowH, 8.5, 6), color: LABEL, align: 'right', valign: 'middle',
    });
    const segments: [number, number, string, string][] = [
      [leftEdge, negW, el.colors.negative, `-${Math.round(row.negative)}%`],
      [axisX, posW, el.colors.positive, `${Math.round(row.positive)}%`],
      [axisX + posW, neuW, el.colors.neutral, `${Math.round(row.neutral)}%`],
    ];
    for (const [x, w, fill, label] of segments) {
      if (w <= 0) continue;
      out.push({ t: 'rect', x, y: by, w, h: barH, fill });
      if (w >= 0.36) out.push({ t: 'text', x, y: by, w, h: barH, text: label, size: 8, color: '#FFFFFF', bold: true, align: 'center', valign: 'middle' });
    }
  });
  out.push({ t: 'line', x1: axisX, y1: el.y, x2: axisX, y2: el.y + el.h, color: '#595959', width: 0.75 });
  return out;
}

/** Composite elements drawn as shapes; charts are left to each renderer. */
export function expand(el: SlideEl): SlideEl[] {
  if (el.t === 'bars') return bars(el);
  if (el.t === 'diverging') return diverging(el);
  return [el];
}

/** The largest box with the image's aspect ratio that fits (centred) inside `box`. */
export function containBox(box: Box, aspect: number): Box {
  if (!aspect || !Number.isFinite(aspect)) return box;
  const w = Math.min(box.w, box.h * aspect);
  const h = w / aspect;
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h };
}
