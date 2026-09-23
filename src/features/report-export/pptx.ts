import PptxGenJS from 'pptxgenjs';
import { CHART_COLORS } from '@/lib/charts';
import { formatDate } from '@/lib/format';
import type { Block, ReportPack, Section } from './types';

/** 16:9 slide geometry in inches. */
const W = 13.333;
const H = 7.5;
const MARGIN = 0.5;
const CONTENT_TOP = 1.35;
const CONTENT_BOTTOM = 6.85;
const GAP = 0.3;
const FONT = 'Calibri';
const INK = '0F172A';
const MUTED = '64748B';
const BORDER = 'E2E8F0';
const BRAND = '1E2A78';

const hex = (c: string) => c.replace('#', '').toUpperCase();

function palette(accent: string): string[] {
  return [hex(accent), ...CHART_COLORS.map(hex).filter((c) => c !== hex(accent))];
}

/** How much room a block needs: a full-width row or half a row. */
function widthOf(block: Block): 'full' | 'half' {
  switch (block.kind) {
    case 'kpis':
    case 'note':
      return 'full';
    case 'table':
      return block.columns.length <= 3 && block.rows.length <= 8 && block.rows.every((r) => r.every((c) => c.length <= 40)) ? 'half' : 'full';
    case 'bullets':
      return block.items.length <= 10 && block.items.every((i) => i.length <= 140) ? 'half' : 'full';
    default:
      return 'half';
  }
}

const TABLE_ROWS_FULL = 11;
const TABLE_ROWS_HALF = 8;

/** Long tables are split into several blocks so each fits on a slide. */
function paginate(blocks: Block[]): Block[] {
  return blocks.flatMap((b) => {
    if (b.kind === 'table') {
      const per = widthOf(b) === 'half' ? TABLE_ROWS_HALF : TABLE_ROWS_FULL;
      if (b.rows.length <= per) return [b];
      const parts: Block[] = [];
      for (let i = 0; i < b.rows.length; i += per) {
        parts.push({ ...b, title: i === 0 ? b.title : `${b.title} (continued)`, rows: b.rows.slice(i, i + per) });
      }
      return parts;
    }
    if (b.kind === 'bullets' && b.items.length > 12) {
      const parts: Block[] = [];
      for (let i = 0; i < b.items.length; i += 12) {
        parts.push({ ...b, title: i === 0 ? b.title : `${b.title} (continued)`, items: b.items.slice(i, i + 12) });
      }
      return parts;
    }
    return [b];
  });
}

interface Frame { x: number; y: number; w: number; h: number }

function blockTitle(slide: PptxGenJS.Slide, title: string, f: Frame, accent: string) {
  slide.addShape('rect', { x: f.x, y: f.y + 0.06, w: 0.06, h: 0.26, fill: { color: hex(accent) }, line: { color: hex(accent) } });
  slide.addText(title, { x: f.x + 0.14, y: f.y, w: f.w - 0.14, h: 0.38, fontFace: FONT, fontSize: 14, bold: true, color: INK, margin: 0 });
}

function drawKpis(slide: PptxGenJS.Slide, block: Extract<Block, { kind: 'kpis' }>, f: Frame, colors: string[]) {
  const n = block.items.length;
  const w = (f.w - GAP * (n - 1)) / n;
  block.items.forEach((item, i) => {
    const x = f.x + i * (w + GAP);
    const color = colors[i % colors.length];
    slide.addShape('roundRect', { x, y: f.y, w, h: f.h, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.75 }, rectRadius: 0.08 });
    slide.addShape('rect', { x, y: f.y, w, h: 0.07, fill: { color }, line: { color } });
    slide.addText(item.label, { x: x + 0.2, y: f.y + 0.15, w: w - 0.4, h: 0.3, fontFace: FONT, fontSize: 11, color: MUTED, margin: 0 });
    slide.addText(item.value, { x: x + 0.2, y: f.y + 0.45, w: w - 0.4, h: 0.5, fontFace: FONT, fontSize: 24, bold: true, color, margin: 0 });
    if (item.hint) slide.addText(item.hint, { x: x + 0.2, y: f.y + 0.95, w: w - 0.4, h: 0.25, fontFace: FONT, fontSize: 9, color: MUTED, margin: 0 });
  });
}

function drawChart(pptx: PptxGenJS, slide: PptxGenJS.Slide, block: Extract<Block, { kind: 'bar' | 'pie' }>, f: Frame, colors: string[], accent: string) {
  blockTitle(slide, block.title, f, accent);
  const area = { x: f.x, y: f.y + 0.45, w: f.w, h: f.h - 0.45 };
  const common = { fontFace: FONT, dataLabelFontSize: 9, catAxisLabelFontSize: 10, valAxisLabelFontSize: 9, legendFontSize: 10 };

  if (block.kind === 'pie') {
    slide.addChart(pptx.ChartType.doughnut, [{ name: block.title, labels: block.categories, values: block.values }], {
      ...area,
      ...common,
      holeSize: 58,
      chartColors: (block.colors ?? colors).map(hex),
      showLegend: true,
      legendPos: 'r',
      showPercent: true,
      showValue: false,
      dataLabelColor: 'FFFFFF',
    });
    return;
  }

  // Horizontal bar charts draw the first category at the bottom, so reverse them to keep rankings top-down.
  const order = <T,>(list: T[]) => (block.horizontal ? [...list].reverse() : list);
  const data = block.series.map((s) => ({ name: s.name, labels: order(block.categories), values: order(s.values) }));
  const multi = block.series.length > 1;
  const categoryColors = order(colors.slice(0, block.categories.length).concat(
    Array.from({ length: Math.max(0, block.categories.length - colors.length) }, (_, i) => colors[i % colors.length]),
  ));
  slide.addChart(pptx.ChartType.bar, data, {
    ...area,
    ...common,
    barDir: block.horizontal ? 'bar' : 'col',
    barGrouping: 'clustered',
    chartColors: block.colorByCategory && !multi ? categoryColors : colors,
    // With one series, "vary colours" gives each category its own colour.
    ...(block.colorByCategory && !multi ? { varyColors: true } : {}),
    showLegend: multi,
    legendPos: 'b',
    showValue: true,
    dataLabelColor: INK,
    valAxisHidden: true,
    valGridLine: { style: 'none' },
    catAxisLineShow: false,
    catAxisLabelColor: '334155',
    barGapWidthPct: 60,
  });
}

function drawTable(slide: PptxGenJS.Slide, block: Extract<Block, { kind: 'table' }>, f: Frame, accent: string) {
  blockTitle(slide, block.title, f, accent);
  const header = block.columns.map((c) => ({ text: c, options: { bold: true, color: 'FFFFFF', fill: { color: hex(accent) } } }));
  const rows = block.rows.map((r, i) => r.map((c) => ({ text: c, options: { fill: { color: i % 2 ? 'F8FAFC' : 'FFFFFF' } } })));
  // Give text-heavy columns (headlines, insights) the most room.
  const weights = block.columns.map((_, ci) => Math.max(8, ...block.rows.map((r) => Math.min(r[ci]?.length ?? 0, 90)), block.columns[ci].length));
  const total = weights.reduce((a, b) => a + b, 0);
  slide.addTable([header, ...rows], {
    x: f.x,
    y: f.y + 0.45,
    w: f.w,
    colW: weights.map((wt) => (wt / total) * f.w),
    fontFace: FONT,
    fontSize: 10,
    color: INK,
    valign: 'middle',
    border: { type: 'solid', pt: 0.5, color: BORDER },
    margin: 0.06,
  });
}

function drawBullets(slide: PptxGenJS.Slide, block: Extract<Block, { kind: 'bullets' }>, f: Frame, accent: string) {
  blockTitle(slide, block.title, f, accent);
  slide.addText(
    block.items.map((text) => ({ text, options: { bullet: { indent: 14 }, breakLine: true } })),
    { x: f.x, y: f.y + 0.45, w: f.w, h: f.h - 0.45, fontFace: FONT, fontSize: 12, color: INK, valign: 'top', paraSpaceAfter: 6, fit: 'shrink' },
  );
}

function drawNote(slide: PptxGenJS.Slide, text: string, f: Frame) {
  slide.addShape('roundRect', { x: f.x, y: f.y, w: f.w, h: 1.2, fill: { color: 'F8FAFC' }, line: { color: BORDER }, rectRadius: 0.08 });
  slide.addText(text, { x: f.x + 0.3, y: f.y, w: f.w - 0.6, h: 1.2, fontFace: FONT, fontSize: 13, color: MUTED, valign: 'middle' });
}

function addSectionSlide(pptx: PptxGenJS, pack: ReportPack, s: Section, part: number): PptxGenJS.Slide {
  const slide = pptx.addSlide({ masterName: 'CONTENT' });
  slide.addShape('rect', { x: 0, y: 0, w: W, h: 0.12, fill: { color: hex(s.accent) }, line: { color: hex(s.accent) } });
  slide.addText(part > 1 ? `${s.title} (continued)` : s.title, {
    x: MARGIN, y: 0.35, w: W - 2 * MARGIN, h: 0.55, fontFace: FONT, fontSize: 24, bold: true, color: hex(s.accent), margin: 0,
  });
  slide.addText(s.subtitle ? `${pack.company} · ${pack.periodLabel} · ${s.subtitle}` : `${pack.company} · ${pack.periodLabel}`, {
    x: MARGIN, y: 0.88, w: W - 2 * MARGIN, h: 0.3, fontFace: FONT, fontSize: 11, color: MUTED, margin: 0,
  });
  return slide;
}

function renderSection(pptx: PptxGenJS, pack: ReportPack, s: Section) {
  const colors = palette(s.accent);
  const blocks = paginate(s.blocks);
  let part = 1;
  let slide = addSectionSlide(pptx, pack, s, part);
  let y = CONTENT_TOP;
  let pendingHalf: Block | null = null;

  const newSlide = () => {
    part += 1;
    slide = addSectionSlide(pptx, pack, s, part);
    y = CONTENT_TOP;
  };

  const draw = (b: Block, f: Frame) => {
    if (b.kind === 'kpis') drawKpis(slide, b, f, colors);
    else if (b.kind === 'bar' || b.kind === 'pie') drawChart(pptx, slide, b, f, colors, s.accent);
    else if (b.kind === 'table') drawTable(slide, b, f, s.accent);
    else if (b.kind === 'bullets') drawBullets(slide, b, f, s.accent);
    else drawNote(slide, b.text, f);
  };

  const maxH = CONTENT_BOTTOM - CONTENT_TOP;
  /** Height a block needs (inches), sized to its content so slides are not padded out. */
  const heightOf = (b: Block, width: 'full' | 'half') => {
    switch (b.kind) {
      case 'kpis': return 1.3;
      case 'note': return 1.2;
      case 'table': return Math.min(maxH, 0.45 + 0.25 * (b.rows.length + 1) + 0.1);
      case 'bullets': {
        const perLine = width === 'half' ? 70 : 150;
        const lines = b.items.reduce((n, i) => n + Math.max(1, Math.ceil(i.length / perLine)), 0);
        return Math.min(maxH, 0.45 + 0.3 * lines + 0.1 * b.items.length + 0.1);
      }
      case 'bar':
        if (b.horizontal) return Math.min(4.6, 0.45 + Math.max(1.3, 0.42 * b.categories.length * b.series.length) + (b.series.length > 1 ? 0.4 : 0));
        return 3.2;
      default:
        return 3.2;
    }
  };

  const place = (b: Block, width: 'full' | 'half', partner?: Block) => {
    const h = Math.min(maxH, Math.max(heightOf(b, width), partner ? heightOf(partner, width) : 0));
    if (CONTENT_BOTTOM - y < h && y > CONTENT_TOP) newSlide();
    const fullW = W - 2 * MARGIN;
    if (width === 'full') {
      draw(b, { x: MARGIN, y, w: fullW, h });
    } else {
      const half = (fullW - GAP) / 2;
      draw(b, { x: MARGIN, y, w: half, h });
      if (partner) draw(partner, { x: MARGIN + half + GAP, y, w: half, h });
    }
    y += h + GAP;
  };

  for (const b of blocks) {
    if (widthOf(b) === 'full') {
      if (pendingHalf) { place(pendingHalf, 'half'); pendingHalf = null; }
      place(b, 'full');
    } else if (pendingHalf) {
      place(pendingHalf, 'half', b);
      pendingHalf = null;
    } else {
      pendingHalf = b;
    }
  }
  if (pendingHalf) place(pendingHalf, 'half');
}

function addCover(pptx: PptxGenJS, pack: ReportPack) {
  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };
  slide.addShape('rect', { x: 0, y: 0, w: 4.6, h: H, fill: { color: BRAND }, line: { color: BRAND } });
  slide.addShape('rect', { x: 4.6, y: 0, w: 0.12, h: H, fill: { color: '0EA5E9' }, line: { color: '0EA5E9' } });
  slide.addText('P+ Media Analytics', { x: 0.5, y: 0.6, w: 3.8, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: 'FFFFFF', margin: 0 });
  slide.addText('Media measurement and competitive intelligence', { x: 0.5, y: 1.0, w: 3.8, h: 0.6, fontFace: FONT, fontSize: 11, color: 'C7D2FE', margin: 0 });
  slide.addText(`Prepared ${formatDate(pack.generatedAt)}`, { x: 0.5, y: 6.6, w: 3.8, h: 0.3, fontFace: FONT, fontSize: 10, color: 'C7D2FE', margin: 0 });
  if (pack.logo) slide.addImage({ data: pack.logo, x: W - 2.6, y: 0.5, w: 2.0, h: 0.8, sizing: { type: 'contain', w: 2.0, h: 0.8 } });

  slide.addText('MEDIA INTELLIGENCE REPORT', { x: 5.3, y: 2.2, w: 7.5, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: '0EA5E9', charSpacing: 2, margin: 0 });
  slide.addText(pack.company, { x: 5.3, y: 2.65, w: 7.5, h: 1.1, fontFace: FONT, fontSize: 38, bold: true, color: INK, margin: 0, fit: 'shrink' });
  if (pack.competitors.length) {
    slide.addText(`Benchmarked against ${pack.competitors.join(', ')}`, { x: 5.3, y: 3.8, w: 7.5, h: 0.6, fontFace: FONT, fontSize: 14, color: MUTED, margin: 0, fit: 'shrink' });
  }
  slide.addShape('roundRect', { x: 5.3, y: 4.7, w: 4.2, h: 0.55, fill: { color: 'EEF2FF' }, line: { color: 'EEF2FF' }, rectRadius: 0.1 });
  slide.addText(pack.periodLabel, { x: 5.3, y: 4.7, w: 4.2, h: 0.55, fontFace: FONT, fontSize: 14, bold: true, color: BRAND, align: 'center', margin: 0 });
}

function addContents(pptx: PptxGenJS, pack: ReportPack) {
  const slide = pptx.addSlide({ masterName: 'CONTENT' });
  slide.addText('Contents', { x: MARGIN, y: 0.4, w: 6, h: 0.6, fontFace: FONT, fontSize: 26, bold: true, color: BRAND, margin: 0 });
  const perCol = 9;
  pack.sections.forEach((s, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = MARGIN + col * 6.2;
    const y = 1.4 + row * 0.58;
    slide.addShape('ellipse', { x, y: y + 0.05, w: 0.34, h: 0.34, fill: { color: hex(s.accent) }, line: { color: hex(s.accent) } });
    slide.addText(String(i + 1), { x, y: y + 0.05, w: 0.34, h: 0.34, fontFace: FONT, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
    slide.addText(s.title, { x: x + 0.5, y, w: 5.5, h: 0.44, fontFace: FONT, fontSize: 14, color: INK, valign: 'middle', margin: 0 });
  });
}

/** Renders the report pack as an editable PowerPoint deck (native charts and tables). */
export async function renderPptx(pack: ReportPack): Promise<Blob> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'P+ Media Analytics';
  pptx.company = 'P+ Media Analytics';
  pptx.title = `${pack.company} media report — ${pack.periodLabel}`;
  pptx.defineSlideMaster({
    title: 'CONTENT',
    background: { color: 'FFFFFF' },
    objects: [
      { line: { x: MARGIN, y: 7.0, w: W - 2 * MARGIN, h: 0, line: { color: BORDER, width: 0.75 } } },
      { text: { text: `P+ Media Analytics · ${pack.company} · ${pack.periodLabel}`, options: { x: MARGIN, y: 7.05, w: 9, h: 0.3, fontFace: FONT, fontSize: 9, color: MUTED, margin: 0 } } },
    ],
    slideNumber: { x: W - MARGIN - 0.6, y: 7.05, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 9, color: MUTED, align: 'right' },
  });

  addCover(pptx, pack);
  addContents(pptx, pack);
  pack.sections.forEach((s) => renderSection(pptx, pack, s));

  return (await pptx.write({ outputType: 'blob' })) as Blob;
}
