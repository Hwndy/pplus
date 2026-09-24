import type { ComponentType } from 'react';
import {
  AtSign, BookOpen, Camera, ChartColumnBig, ChartPie, ClipboardList, Database, FileSearch, FlaskConical, Gauge, Globe,
  Lightbulb, MapPin, Megaphone, Mic, Newspaper, ScanSearch, Settings, ShieldCheck, SquarePlay, Target, ThumbsDown,
  ThumbsUp, TriangleAlert,
} from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { buildWorldMap, MAP_COLORS, worldMapSvg } from '@/lib/worldMap';
import { toNumber } from '@/pages/client/reportUtils';
import { glossaryTerms } from '@/utils/glossaryData';
import { auditProcessSteps, methodologyData, principlesData } from '@/utils/methodologyData';
import type { CompetitiveSector, SentimentClassification, WeeklyPoint } from '@/types/reports';
import type { ReportData } from './data';
import { cropToAspect, fitFontSize, iconPng, initials, svgToPng, wrapText, type ExportImage } from './images';
import type { BarRow, Box, Deck, SectionKey, Slide, SlideEl } from './types';

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

/** Colours of the P+ audit report template. */
const C = {
  topBar: '#0D0D0D', nav: '#262626', navPanel: '#333333', navActive: '#4A4A4A', page: '#E7E7E7', card: '#FFFFFF',
  ink: '#1A1A1A', text: '#262626', muted: '#6B6B6B', faint: '#A6A6A6', border: '#D9D9D9',
  blue: '#114FCC', navy: '#0B2265', yellow: '#FFC000', gold: '#E0B000',
  teal: '#0BBFB0', red: '#C00000', grey: '#A6A6A6', online: '#8B5CF6', print: '#FF3399',
};

const TOP_H = 0.31;
const NAV_W = 2.75;
const TITLE_H = 0.38;
const AREA: Box = { x: NAV_W + 0.1, y: TOP_H + TITLE_H + 0.09, w: SLIDE_W - NAV_W - 0.2, h: SLIDE_H - (TOP_H + TITLE_H + 0.09) - 0.1 };
const GAP = 0.1;
const LH = 1.2;

const COPYRIGHT_HOLDER = 'P+ Measurement Services';
const copyright = (year: number) =>
  `Copyright © ${year} ${COPYRIGHT_HOLDER}. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of ${COPYRIGHT_HOLDER}. It is intended solely for the use of the recipient(s) named herein. Any unauthorized use is strictly prohibited.`;

type Icon = ComponentType<Record<string, unknown>>;

const SECTIONS: { key: SectionKey; label: string; icon: Icon }[] = [
  { key: 'executive', label: 'Executive Summary', icon: ClipboardList },
  { key: 'swot', label: 'SWOT Analysis', icon: ChartPie },
  { key: 'insights', label: 'Outcome & Insights', icon: Lightbulb },
  { key: 'landscape', label: 'Industry Landscape Overview', icon: Settings },
  { key: 'sentiment', label: 'Brand Drivers & Sentiment Index', icon: Gauge },
  { key: 'brandMedia', label: 'Brand Media Analysis', icon: Newspaper },
  { key: 'distribution', label: 'Distribution of Media Activities', icon: MapPin },
  { key: 'publications', label: 'Publications & Spokespersons Analysis', icon: Mic },
  { key: 'region', label: 'Coverage by Region', icon: Globe },
  { key: 'competitive', label: 'Competitive Intelligence', icon: Target },
  { key: 'prDrivers', label: 'Competitive PR Drivers', icon: Megaphone },
  { key: 'glossary', label: 'Glossary', icon: BookOpen },
  { key: 'methodology', label: 'Principle & Methodology', icon: FlaskConical },
];

// ---------------------------------------------------------------- helpers

const NEWLINE = String.fromCharCode(10);
const MONTH_LABELS =['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const lineH = (size: number) => (size * LH) / 72;
const textHeight = (text: string, w: number, size: number, bold = false) => wrapText(text, w, size, bold).length * lineH(size);

function fmtPct(value: number): string {
  if (value > 0 && value < 1) return '<1%';
  return `${Math.round(value)}%`;
}

function compact(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1e4) return `${(n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '')}K`;
  return formatNumber(n);
}

function card(box: Box, fill = C.card): SlideEl {
  return { t: 'rect', shape: 'roundRect', radius: 0.05, ...box, fill };
}

function cardTitle(box: Box, text: string, size = 12.5): SlideEl {
  return { t: 'text', x: box.x + 0.1, y: box.y + 0.05, w: box.w - 0.2, h: 0.36, text, size: fitFontSize(text, box.w - 0.2, 0.36, size, 8, true), color: C.text, bold: true, align: 'center', valign: 'middle' };
}

function note(box: Box, text: string, size = 11): SlideEl {
  return { t: 'text', ...box, text, size: fitFontSize(text, box.w, box.h, size, 7), color: C.muted, italic: true, align: 'center', valign: 'middle' };
}

function inset(box: Box, dx: number, dy = dx): Box {
  return { x: box.x + dx, y: box.y + dy, w: box.w - 2 * dx, h: box.h - 2 * dy };
}

/** The part of `box` a block of height `h` occupies when centred vertically. */
function centred(box: Box, h: number): Box {
  const offset = Math.max(0, (box.h - h) / 2);
  return { x: box.x, y: box.y + offset, w: box.w, h: box.h - offset };
}

/** Splits `box` into a cols × rows grid. */
function grid(box: Box, cols: number, rows: number, gap = GAP): Box[] {
  const w = (box.w - gap * (cols - 1)) / cols;
  const h = (box.h - gap * (rows - 1)) / rows;
  const out: Box[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: box.x + c * (w + gap), y: box.y + r * (h + gap), w, h });
  return out;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

const bulletGap = (s: number) => (s * 0.55) / 72;

/** Height of a bullet list whose text column is `w` wide. */
function listHeight(items: string[], w: number, size: number): number {
  return items.reduce((sum, it) => sum + textHeight(it, w, size), 0) + Math.max(0, items.length - 1) * bulletGap(size);
}

type ListOpts = { max: number; min: number; color?: string; bullet?: string };

/** Bulleted list with square bullets; shrinks the font until the list fits. */
function bulletList(items: string[], box: Box, opts: ListOpts): SlideEl[] {
  const textW = box.w - 0.22;
  const gapAt = bulletGap;
  let size = opts.max;
  while (size > opts.min && listHeight(items, textW, size) > box.h) size -= 0.5;
  const out: SlideEl[] = [];
  let y = box.y;
  for (const item of items) {
    const h = textHeight(item, textW, size);
    if (y + lineH(size) > box.y + box.h + 0.02) break;
    const dot = 0.055;
    out.push({ t: 'rect', x: box.x + 0.05, y: y + lineH(size) / 2 - dot / 2, w: dot, h: dot, fill: opts.bullet ?? C.text });
    out.push({ t: 'text', x: box.x + 0.22, y, w: textW, h: Math.min(h, box.y + box.h - y + 0.02), text: item, size, color: opts.color ?? C.text });
    y += h + gapAt(size);
  }
  return out;
}

/** Short items flow into two columns so wide cards are not left mostly empty (decided at 10 pt). */
function listColumns(items: string[], w: number): string[][] {
  const colW = (w - 0.25) / 2 - 0.22;
  if (items.length < 4 || !items.every((it) => wrapText(it, colW, 10).length <= 2)) return [items];
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}

function columnsHeight(items: string[], w: number, size: number): number {
  const cols = listColumns(items, w);
  const colW = cols.length > 1 ? (w - 0.25) / 2 : w;
  return Math.max(...cols.map((c) => listHeight(c, colW - 0.22, size)));
}

function bulletColumns(items: string[], box: Box, opts: ListOpts): SlideEl[] {
  const cols = listColumns(items, box.w);
  if (cols.length === 1) return bulletList(items, box, opts);
  const colW = (box.w - 0.25) / 2;
  let size = opts.max;
  while (size > opts.min && columnsHeight(items, box.w, size) > box.h) size -= 0.5;
  return cols.flatMap((col, i) => bulletList(col, { x: box.x + i * (colW + 0.25), y: box.y, w: colW, h: box.h }, { ...opts, max: size }));
}

interface Block {
  minH: number;
  maxH: number;
  /** Height needed at the preferred font size. */
  height(w: number): number;
  draw(box: Box): SlideEl[];
}

/** Stacks blocks down the content area, starting a new slide when one is full. */
function paginate(blocks: Block[], area: Box = AREA, gap = GAP): SlideEl[][] {
  const need = (b: Block) => Math.min(Math.max(b.minH, b.height(area.w)), area.h);
  const pages: Block[][] = [];
  let current: Block[] = [];
  let used = 0;
  for (const block of blocks) {
    const h = need(block);
    if (current.length && used + gap + h > area.h) {
      pages.push(current);
      current = [];
      used = 0;
    }
    used += (current.length ? gap : 0) + h;
    current.push(block);
  }
  if (current.length) pages.push(current);
  return pages.map((page) => {
    const heights = page.map(need);
    const spare = area.h - heights.reduce((a, b) => a + b, 0) - gap * (page.length - 1);
    const grown = heights.map((h, i) => Math.max(h, Math.min(h + spare / page.length, page[i].maxH)));
    let y = area.y;
    return page.flatMap((block, i) => {
      const box = { x: area.x, y, w: area.w, h: grown[i] };
      y += grown[i] + gap;
      return block.draw(box);
    });
  });
}

// ---------------------------------------------------------------- builder

interface Assets {
  nav: Record<SectionKey, ExportImage>;
  swot: ExportImage[];
  target: ExportImage;
  kpi: ExportImage[];
  process: ExportImage[];
  map: ExportImage | null;
  cover: ExportImage | null;
}

type Content = { section: SectionKey; title: string; elements: SlideEl[] };

class DeckBuilder {
  readonly content: Content[] = [];
  readonly brand: Set<string>;
  readonly baseName: string;

  constructor(private readonly d: ReportData, private readonly a: Assets) {
    this.baseName = d.pair.base_company.company_name;
    this.brand = new Set(d.competitive.data?.brand_companies ?? [this.baseName]);
  }

  private add(section: SectionKey, title: string, elements: SlideEl[]) {
    this.content.push({ section, title, elements });
  }

  private empty(section: SectionKey, title: string, what: string) {
    this.add(section, title, [card(AREA), note(inset(AREA, 1, 2.6), `No approved ${what} was recorded for ${this.d.periodTitle}.`, 14)]);
  }

  private logo(company: string) {
    return this.d.images.logos.get(company);
  }

  private companyRow(company: string, value: number, display: string): BarRow {
    const isBrand = this.brand.has(company);
    const logo = this.logo(company);
    return {
      label: company, value, display, color: isBrand ? C.yellow : C.blue, highlight: isBrand,
      icon: logo, initials: logo ? undefined : initials(company),
    };
  }

  // ------------------------------------------------ Executive summary
  executive() {
    const report = this.d.executive.data;
    const title = 'Executive Summary';
    if (!report) return this.empty('executive', title, 'media coverage');
    const s = report.summary;
    const tileW = (AREA.w - GAP * 6) / 7;
    const headH = 0.86;
    const valueH = 0.9;
    const els: SlideEl[] = [];
    const tiles: { label: string; value?: string; color?: string }[] = [
      { label: 'Total Media Exposure\n(Print & Online)', value: formatNumber(s.totalMediaExposure) },
      { label: 'Competitive media share % on brand' },
      { label: 'Brand exposure in local media', value: formatNumber(s.brandExposureInLocalMedia) },
      { label: 'Brand exposure in International media', value: formatNumber(s.brandExposureInInternationalMedia) },
      { label: 'Positive media exposure', value: formatNumber(s.positiveMediaExposure), color: C.teal },
      { label: 'Neutral media exposure', value: formatNumber(s.neutralMediaExposure), color: '#7F7F7F' },
      { label: 'Negative media exposure', value: formatNumber(s.negativeMediaExposure), color: C.red },
    ];
    tiles.forEach((tile, i) => {
      const x = AREA.x + i * (tileW + GAP);
      const head = { x, y: AREA.y, w: tileW, h: headH };
      const body = { x, y: AREA.y + headH + 0.06, w: tileW, h: valueH };
      els.push(card(head), card(body));
      els.push({ t: 'text', ...inset(head, 0.08), text: tile.label, size: fitFontSize(tile.label, tileW - 0.16, headH - 0.16, 11.5, 8), color: C.text, align: 'center', valign: 'middle' });
      if (tile.value !== undefined) {
        els.push({ t: 'text', ...inset(body, 0.06), text: tile.value, size: fitFontSize(tile.value, tileW - 0.12, valueH - 0.12, 30, 12), color: tile.color ?? C.ink, align: 'center', valign: 'middle' });
      }
    });
    // Competitive share of voice per sector (brand + subsidiaries).
    const shareBody = { x: AREA.x + tileW + GAP, y: AREA.y + headH + 0.06, w: tileW, h: valueH };
    let shares = (s.brandShareBySector ?? []).map((row) => ({ pct: toNumber(row.percentage), label: row.sector }));
    if (!shares.length) {
      const own = s.competitiveMediaShare.shares.find((row) => row.company === this.baseName);
      if (own) shares = [{ pct: toNumber(own.percentage), label: 'Brand' }];
    }
    shares = shares.slice(0, 4);
    if (!shares.length) {
      els.push({ t: 'text', ...shareBody, text: '—', size: 30, color: C.ink, align: 'center', valign: 'middle' });
    } else {
      const colW = (shareBody.w - 0.08) / shares.length;
      shares.forEach((row, i) => {
        const x = shareBody.x + 0.04 + i * colW;
        if (i > 0) els.push({ t: 'line', x1: x, y1: shareBody.y + 0.08, x2: x, y2: shareBody.y + shareBody.h - 0.08, color: C.text, width: 0.75 });
        const big = shares.length === 1;
        els.push({ t: 'text', x, y: shareBody.y + 0.08, w: colW, h: big ? 0.5 : 0.24, text: fmtPct(row.pct), size: big ? 26 : 9, bold: true, color: C.ink, align: 'center', valign: 'middle' });
        els.push({ t: 'text', x: x + 0.02, y: shareBody.y + (big ? 0.58 : 0.32), w: colW - 0.04, h: big ? 0.26 : 0.52, text: row.label, size: fitFontSize(row.label, colW - 0.04, big ? 0.26 : 0.52, big ? 10 : 8, 5.5, true), bold: true, color: C.text, align: 'center', valign: 'top' });
      });
    }

    const chartsTop = AREA.y + headH + valueH + 0.06 + GAP;
    const [lang, vehicle] = grid({ x: AREA.x, y: chartsTop, w: AREA.w, h: AREA.y + AREA.h - chartsTop }, 2, 1);
    const langEntries = Object.entries(s.language.breakdown ?? {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const languages = langEntries.length ? langEntries : [['English', s.language.english], ['Other languages', s.language.otherLanguages]] as [string, number][];
    const langColors = [C.blue, '#FF6B6B', '#12B5A5', '#A50021', C.yellow, C.online, '#64748B', '#F97316'];
    for (const [box, name, cats, vals, colors] of [
      [lang, 'Language', languages.map(([k]) => k.charAt(0).toUpperCase() + k.slice(1)), languages.map(([, v]) => v), langColors],
      [vehicle, 'Media Vehicle', ['Print Media', 'Online Media'], [s.mediaVehicle.print, s.mediaVehicle.online], [C.yellow, C.blue]],
    ] as [Box, string, string[], number[], string[]][]) {
      els.push(card(box), cardTitle(box, name, 15));
      const total = vals.reduce((a, b) => a + b, 0);
      const plot = { x: box.x + 0.2, y: box.y + 0.45, w: box.w - 0.4, h: box.h - 0.55 };
      if (total > 0) els.push({ t: 'doughnut', ...plot, categories: cats, values: vals, colors });
      else els.push(note(plot, 'No coverage recorded for the period under review.'));
    }
    this.add('executive', title, els);
  }

  // ------------------------------------------------ SWOT
  swot() {
    const report = this.d.swot.data;
    const title = 'SWOT Analysis';
    if (!report?.analyses.length) return this.empty('swot', title, 'SWOT analysis');
    const text = (item: string | { analysis: string }) => (typeof item === 'string' ? item : item.analysis).trim();
    const quadrant = (key: 'strengths' | 'weaknesses' | 'opportunities' | 'threats') =>
      report.analyses.flatMap((a) => (a[key] ?? []).map(text)).filter(Boolean);
    const quadrants = [
      { name: 'Strengths', items: quadrant('strengths'), color: '#11B5A4', icon: this.a.swot[0] },
      { name: 'Weaknesses', items: quadrant('weaknesses'), color: C.red, icon: this.a.swot[1] },
      { name: 'Opportunities', items: quadrant('opportunities'), color: '#FF9966', icon: this.a.swot[2] },
      { name: 'Threats', items: quadrant('threats'), color: '#A66BA1', icon: this.a.swot[3] },
    ];
    const blocks: Block[] = quadrants.map((q) => {
      const items = q.items.length ? q.items : [`No ${q.name.toLowerCase()} were recorded for the period under review.`];
      // One entry reads as a paragraph (as in the deck); several become a bullet list.
      const paragraph = items.length === 1 ? items[0] : null;
      const textW = (w: number) => w - 1.95;
      const bodyHeight = (w: number, size: number) => (paragraph ? textHeight(paragraph, textW(w), size) : columnsHeight(items, textW(w), size));
      return {
        minH: 1.15,
        maxH: 2.6,
        height: (w) => 0.62 + bodyHeight(w, 10),
        draw: (box) => {
          const hex = Math.min(1.05, box.h - 0.3);
          const bodyBox = { x: box.x + 1.75, y: box.y + 0.52, w: textW(box.w), h: box.h - 0.62 };
          return [
            card(box),
            { t: 'rect', shape: 'hexagon', x: box.x + 0.3, y: box.y + (box.h - hex * 0.88) / 2, w: hex * 1.1, h: hex * 0.88, fill: q.color },
            { t: 'image', x: box.x + 0.3 + hex * 0.55 - hex * 0.22, y: box.y + box.h / 2 - hex * 0.22, w: hex * 0.44, h: hex * 0.44, data: q.icon.data, aspect: 1 },
            { t: 'text', x: bodyBox.x, y: box.y + 0.08, w: bodyBox.w, h: 0.42, text: q.name, size: 21, bold: true, color: '#333333', valign: 'middle' },
            ...(paragraph
              ? [{ t: 'text', ...bodyBox, text: paragraph, size: fitFontSize(paragraph, bodyBox.w, bodyBox.h, 12, 7.5), color: C.text } as SlideEl]
              : bulletColumns(items, bodyBox, { max: 12, min: 7.5 })),
          ];
        },
      };
    });
    blocks.push(...this.noteBlocks(report.analyses.map((a) => a.analyst_note)));
    paginate(blocks).forEach((els, i) => this.add('swot', i ? `${title} (continued)` : title, els));
  }

  /** Analyst notes, shown as a highlighted card after a section's content. */
  private noteBlocks(notes: (string | null)[]): Block[] {
    const body = notes.map((n) => n?.trim()).filter(Boolean).join('\n');
    if (!body) return [];
    return [{
      minH: 0.8,
      maxH: 1.6,
      height: (w) => 0.45 + textHeight(body, w - 0.6, 11) + 0.15,
      draw: (box) => [
        card(box),
        { t: 'rect', x: box.x, y: box.y, w: 0.1, h: box.h, fill: C.yellow },
        { t: 'text', x: box.x + 0.35, y: box.y + 0.1, w: box.w - 0.6, h: 0.3, text: 'Analyst note', size: 12, bold: true, color: C.text },
        { t: 'text', x: box.x + 0.35, y: box.y + 0.42, w: box.w - 0.6, h: box.h - 0.52, text: body, size: fitFontSize(body, box.w - 0.6, box.h - 0.52, 11, 7.5), color: C.text },
      ],
    }];
  }

  /** Deck-style numbered row: yellow number, blue heading, white body. */
  private numberedRow(n: number, heading: string, subheading: string | null, body: (box: Box) => SlideEl[], bodyHeight: (w: number) => number): Block {
    const numW = 0.62;
    const headW = 2.5;
    return {
      minH: 1.0,
      maxH: 1.45,
      height: (w) => bodyHeight(w - numW - headW - 0.3) + 0.3,
      draw: (box) => {
        const headBox = { x: box.x + numW, y: box.y, w: headW, h: box.h };
        const els: SlideEl[] = [
          { t: 'rect', ...box, fill: C.card },
          { t: 'rect', x: box.x, y: box.y, w: numW, h: box.h, fill: C.yellow },
          { t: 'text', x: box.x, y: box.y, w: numW, h: box.h, text: String(n).padStart(2, '0'), size: 22, color: '#FFFFFF', align: 'center', valign: 'middle' },
          { t: 'rect', ...headBox, fill: C.blue },
        ];
        const headText = inset(headBox, 0.14, 0.1);
        if (subheading) {
          // Heading and subheading centred together.
          const size = fitFontSize(heading, headText.w, headText.h - 0.3, 17, 9);
          const headingH = textHeight(heading, headText.w, size);
          const top = headText.y + Math.max(0, (headText.h - headingH - 0.26) / 2);
          els.push({ t: 'text', x: headText.x, y: top, w: headText.w, h: headingH, text: heading, size, color: '#FFFFFF' });
          els.push({ t: 'text', x: headText.x, y: top + headingH + 0.02, w: headText.w, h: 0.24, text: subheading, size: 9.5, color: '#DCE6FF' });
        } else {
          els.push({ t: 'text', ...headText, text: heading, size: fitFontSize(heading, headText.w, headText.h, 17, 9), color: '#FFFFFF', valign: 'middle' });
        }
        els.push(...body({ x: box.x + numW + headW + 0.15, y: box.y + 0.12, w: box.w - numW - headW - 0.3, h: box.h - 0.24 }));
        return els;
      },
    };
  }

  // ------------------------------------------------ Outcome & insights
  insights() {
    const report = this.d.insights.data;
    const title = 'Insight / Recommendation / Suggestion';
    const items = (report?.insights ?? []).flatMap((r) => r.insights.map((i) => ({ category: i.category, text: (i.insight ?? i.analysis ?? '').trim() }))).filter((i) => i.text);
    if (!items.length) return this.empty('insights', title, 'insight');
    // One row per category, as in the deck.
    const byCategory = new Map<string, string[]>();
    for (const item of items) byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item.text]);
    const blocks = [...byCategory].map(([category, texts], i) => this.numberedRow(
      i + 1, category, null,
      (box) => (texts.length === 1
        ? [{ t: 'text', ...box, text: texts[0], size: fitFontSize(texts[0], box.w, box.h, 12, 7.5), color: C.text, valign: 'middle' }]
        : bulletList(texts, centred(box, listHeight(texts, box.w - 0.22, 11.5)), { max: 11.5, min: 7.5 })),
      (w) => (texts.length === 1 ? textHeight(texts[0], w, 11.5) : listHeight(texts, w - 0.22, 11)),
    ));
    blocks.push(...this.noteBlocks(report?.insights.map((r) => r.analyst_note) ?? []));
    paginate(blocks).forEach((els, i) => this.add('insights', i ? `${title} (continued)` : title, els));
  }

  // ------------------------------------------------ Industry landscape
  landscape() {
    const report = this.d.landscape.data;
    const baseTitle = 'Industry Landscape Overview';
    const overviews = report?.overviews ?? [];
    if (!overviews.some((o) => o.highlights?.length)) return this.empty('landscape', baseTitle, 'industry landscape overview');
    const sectors = new Map<string, { highlights: string[]; notes: (string | null)[] }>();
    for (const o of overviews) {
      const entry = sectors.get(o.sector) ?? { highlights: [], notes: [] };
      entry.highlights.push(...(o.highlights ?? []).map((h) => h.trim()).filter(Boolean));
      entry.notes.push(o.analyst_note);
      sectors.set(o.sector, entry);
    }
    for (const [sector, entry] of sectors) {
      if (!entry.highlights.length) continue;
      const blocks: Block[] = entry.highlights.map((text) => ({
        minH: 1.25,
        maxH: 2.2,
        height: (w) => textHeight(text, w - 1.95, 12) + 0.4,
        draw: (box) => {
          const hex = Math.min(1.0, box.h - 0.3);
          const bodyBox = { x: box.x + 1.75, y: box.y + 0.15, w: box.w - 1.95, h: box.h - 0.3 };
          return [
            card(box),
            { t: 'rect', shape: 'hexagon', x: box.x + 0.3, y: box.y + (box.h - hex * 0.88) / 2, w: hex * 1.1, h: hex * 0.88, fill: C.blue },
            { t: 'image', x: box.x + 0.3 + hex * 0.55 - hex * 0.25, y: box.y + box.h / 2 - hex * 0.25, w: hex * 0.5, h: hex * 0.5, data: this.a.target.data, aspect: 1 },
            { t: 'text', ...bodyBox, text, size: fitFontSize(text, bodyBox.w, bodyBox.h, 12.5, 7.5), color: C.text, valign: 'middle' },
          ];
        },
      }));
      blocks.push(...this.noteBlocks(entry.notes));
      const title = `${baseTitle} – ${sector} Highlights`;
      paginate(blocks).forEach((els, i) => this.add('landscape', i ? `${title} (continued)` : title, els));
    }
  }

  // ------------------------------------------------ Sentiment
  sentiment() {
    const report = this.d.sentiment.data;
    const title = 'Brand Media Sentiment Index';
    if (!report || !report.totals.total_categorized) return this.empty('sentiment', title, 'sentiment analysis');
    const b = report.sentiment_breakdown;
    const groups: Record<'positive' | 'negative' | 'neutral', SentimentClassification[]> = {
      positive: ['strongly_positive', 'positive', 'moderately_positive'],
      neutral: ['neutral'],
      negative: ['moderately_negative', 'negative', 'strongly_negative'],
    };
    const total = report.totals.total_categorized;
    const count = (keys: SentimentClassification[]) => keys.reduce((sum, k) => sum + (b[k]?.count ?? 0), 0);
    const pct = { positive: (count(groups.positive) / total) * 100, neutral: (count(groups.neutral) / total) * 100, negative: (count(groups.negative) / total) * 100 };
    const els: SlideEl[] = [];

    // Overall index: one 100% bar, then the seven keyword classifications.
    const top = { x: AREA.x, y: AREA.y, w: AREA.w, h: 2.55 };
    els.push(card(top));
    const bar = { x: top.x + 0.5, y: top.y + 0.35, w: top.w - 1.0, h: 0.6 };
    let x = bar.x;
    for (const [key, color] of [['negative', C.red], ['positive', C.teal], ['neutral', C.grey]] as const) {
      const w = (pct[key] / 100) * bar.w;
      if (w <= 0) continue;
      els.push({ t: 'rect', x, y: bar.y, w, h: bar.h, fill: color });
      if (w > 0.45) els.push({ t: 'text', x, y: bar.y, w, h: bar.h, text: fmtPct(pct[key]), size: 12, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle' });
      x += w;
    }
    const legendY = bar.y + bar.h + 0.12;
    [['Negative', C.red, pct.negative], ['Positive', C.teal, pct.positive], ['Neutral', C.grey, pct.neutral]].forEach(([label, color, value], i) => {
      const lx = top.x + top.w / 2 - 2.7 + i * 1.9;
      els.push({ t: 'rect', x: lx, y: legendY + 0.07, w: 0.14, h: 0.14, fill: color as string });
      els.push({ t: 'text', x: lx + 0.2, y: legendY, w: 1.6, h: 0.28, text: `${label} ${fmtPct(value as number)}`, size: 11, color: C.text, valign: 'middle' });
    });
    const classes: [SentimentClassification, string, string][] = [
      ['strongly_positive', 'Strongly positive', '#067A70'], ['positive', 'Positive', '#0BBFB0'], ['moderately_positive', 'Moderately positive', '#7EDDD4'],
      ['neutral', 'Neutral', '#A6A6A6'], ['moderately_negative', 'Moderately negative', '#F19A9A'], ['negative', 'Negative', '#E04848'], ['strongly_negative', 'Strongly negative', '#8F0000'],
    ];
    const chips = grid({ x: top.x + 0.3, y: legendY + 0.42, w: top.w - 0.6, h: top.y + top.h - legendY - 0.55 }, 7, 1, 0.08);
    classes.forEach(([key, label, color], i) => {
      const box = chips[i];
      els.push({ t: 'rect', shape: 'roundRect', radius: 0.05, ...box, fill: '#F5F5F5' });
      els.push({ t: 'rect', x: box.x, y: box.y, w: box.w, h: 0.07, fill: color });
      els.push({ t: 'text', x: box.x + 0.05, y: box.y + 0.12, w: box.w - 0.1, h: 0.4, text: formatNumber(b[key]?.count ?? 0), size: 18, bold: true, color: C.ink, align: 'center', valign: 'middle' });
      els.push({ t: 'text', x: box.x + 0.05, y: box.y + 0.52, w: box.w - 0.1, h: box.h - 0.56, text: [label, fmtPct(b[key]?.percentage ?? 0)].join(NEWLINE), size: 8.5, color: C.muted, align: 'center', valign: 'top' });
    });

    // Key brand reputational drivers.
    const headY = top.y + top.h + GAP;
    els.push(card({ x: AREA.x, y: headY, w: AREA.w, h: 0.42 }));
    els.push({ t: 'text', x: AREA.x + 0.15, y: headY, w: AREA.w - 0.3, h: 0.42, text: 'Key Brand Reputational Drivers', size: 14, bold: true, color: C.text, valign: 'middle' });
    const tableTop = headY + 0.42 + 0.06;
    const table = { x: AREA.x, y: tableTop, w: AREA.w, h: AREA.y + AREA.h - tableTop };
    els.push({ t: 'rect', ...table, fill: C.card, line: { color: '#404040', width: 1 } });
    const cols: { name: string; key: 'positive' | 'negative' | 'neutral'; fill: string; color: string; w: number }[] = [
      { name: 'Positive', key: 'positive', fill: '#5CE0D6', color: C.ink, w: 0.375 },
      { name: 'Negative', key: 'negative', fill: C.red, color: '#FFFFFF', w: 0.335 },
      { name: 'Neutral', key: 'neutral', fill: '#7F7F7F', color: '#FFFFFF', w: 0.29 },
    ];
    let cx = table.x;
    for (const col of cols) {
      const w = table.w * col.w;
      const headlines = groups[col.key].flatMap((k) => {
        const v = report.key_brand_reputational_drivers[k];
        return Array.isArray(v) ? v : [];
      }).slice(0, 8);
      const items = headlines.length ? headlines : [`There was no ${col.key} media coverage recorded for the period under review`];
      els.push({ t: 'rect', x: cx, y: table.y, w, h: 0.32, fill: col.fill, line: { color: '#404040', width: 1 } });
      els.push({ t: 'text', x: cx, y: table.y, w, h: 0.32, text: col.name, size: 11, bold: true, color: col.color, align: 'center', valign: 'middle' });
      if (cx > table.x) els.push({ t: 'line', x1: cx, y1: table.y, x2: cx, y2: table.y + table.h, color: '#404040', width: 1 });
      els.push(...bulletList(items, { x: cx + 0.08, y: table.y + 0.42, w: w - 0.2, h: table.h - 0.5 }, { max: 10, min: 7 }));
      cx += w;
    }
    this.add('sentiment', title, els);
  }

  // ------------------------------------------------ Brand media analysis
  brandMedia() {
    const report = this.d.brandMedia.data;
    const title = 'Brand Media Analysis';
    if (!report) return this.empty('brandMedia', title, 'media coverage');
    const a = report.analysis;
    const els: SlideEl[] = [];
    const kpis = [
      { label: 'News Mentions', value: formatNumber(a.news_mention.total) },
      { label: 'Photo Mentions', value: formatNumber(a.photo_mention.total) },
      { label: 'Video Mentions', value: formatNumber(a.video_mention.total) },
      { label: 'Potential Reach', sub: '(Print & Online)', value: formatNumber(a.potential_reach.combined_reach) },
    ];
    const kpiBoxes = grid({ x: AREA.x, y: AREA.y, w: AREA.w, h: 1.1 }, 4, 1);
    kpis.forEach((kpi, i) => {
      const box = kpiBoxes[i];
      els.push(card(box));
      const labelW = Math.min(box.w - 0.5, 2.2);
      const startX = box.x + (box.w - labelW - 0.36) / 2;
      els.push({ t: 'image', x: startX, y: box.y + 0.1, w: 0.28, h: 0.28, data: this.a.kpi[i].data, aspect: 1 });
      els.push({ t: 'text', x: startX + 0.36, y: box.y + 0.08, w: labelW, h: 0.32, text: kpi.label, size: 14, color: C.text, valign: 'middle' });
      if (kpi.sub) els.push({ t: 'text', x: box.x, y: box.y + 0.37, w: box.w, h: 0.16, text: kpi.sub, size: 7.5, bold: true, color: C.text, align: 'center', valign: 'middle' });
      els.push({ t: 'text', x: box.x + 0.1, y: box.y + 0.5, w: box.w - 0.2, h: 0.56, text: kpi.value, size: fitFontSize(kpi.value, box.w - 0.2, 0.56, 30, 12), color: C.ink, align: 'center', valign: 'middle' });
    });

    const midY = AREA.y + 1.1 + GAP;
    const midH = 2.75;
    const lists: { title: string; rows: BarRow[]; empty: string }[] = [
      {
        title: 'Thematic Distribution of Media Activities',
        rows: a.thematic_distribution.top_10.map((r) => ({ label: r.activity, value: toNumber(r.percentage), display: fmtPct(toNumber(r.percentage)), color: C.blue })),
        empty: 'No media activities recorded for the period under review.',
      },
      {
        title: 'Brand & Subsidiaries Media Exposure',
        rows: a.brand_subsidiary_exposure.top_10.map((r) => ({ label: r.brand, value: toNumber(r.percentage), display: fmtPct(toNumber(r.percentage)), color: C.blue })),
        empty: a.brand_subsidiary_exposure.note ?? 'No subsidiary coverage recorded for the period under review.',
      },
      {
        title: 'Brand Message Placement In The Media',
        rows: a.brand_message_placement.placements.map((r) => ({ label: r.placement, value: toNumber(r.percentage), display: fmtPct(toNumber(r.percentage)), color: C.blue })),
        empty: 'No message placements recorded for the period under review.',
      },
    ];
    grid({ x: AREA.x, y: midY, w: AREA.w, h: midH }, 3, 1).forEach((box, i) => {
      const list = lists[i];
      els.push(card(box), cardTitle(box, list.title, 12.5));
      const plot = { x: box.x + 0.1, y: box.y + 0.48, w: box.w - 0.2, h: box.h - 0.6 };
      if (list.rows.length) els.push({ t: 'bars', ...plot, rows: list.rows, labelW: 1.35, size: 9.5 });
      else els.push(note(plot, list.empty, 10));
    });

    const lowY = midY + midH + GAP;
    const [weeklyBox, monthlyBox] = grid({ x: AREA.x, y: lowY, w: AREA.w, h: AREA.y + AREA.h - lowY }, 2, 1);
    // Weekly trend: share of the period's print / online stories in each P+ week.
    const weeks = new Map<string, { online: number; print: number }>();
    const addWeeks = (points: WeeklyPoint[], key: 'online' | 'print') => {
      for (const p of points) {
        const entry = weeks.get(p.week) ?? { online: 0, print: 0 };
        entry[key] = toNumber(p.percentage) / 100;
        weeks.set(p.week, entry);
      }
    };
    addWeeks(a.weekly_volume_trend.online.weekly_breakdown, 'online');
    addWeeks(a.weekly_volume_trend.print.weekly_breakdown, 'print');
    const weekly = [...weeks.entries()];
    els.push(card(weeklyBox), cardTitle(weeklyBox, 'Overall Weekly Volume Trend', 13));
    els.push({ t: 'text', x: weeklyBox.x, y: weeklyBox.y + 0.36, w: weeklyBox.w, h: 0.18, text: this.d.periodLabel, size: 8, bold: true, color: C.text, align: 'center', valign: 'middle' });
    const weeklyPlot = { x: weeklyBox.x + 0.1, y: weeklyBox.y + 0.56, w: weeklyBox.w - 0.2, h: weeklyBox.h - 0.62 };
    if (weekly.length) {
      els.push({
        t: 'lineChart', ...weeklyPlot, percent: true, categories: weekly.map(([w]) => w),
        series: [
          { name: 'Online Media', color: C.online, values: weekly.map(([, v]) => v.online) },
          { name: 'Print Media', color: C.print, values: weekly.map(([, v]) => v.print) },
        ],
      });
    } else {
      els.push(note(weeklyPlot, 'No coverage recorded for the period under review.', 10));
    }
    const monthly = a.monthly_volume_trend.monthly_breakdown;
    els.push(card(monthlyBox), cardTitle(monthlyBox, 'Overall Monthly Volume Trend', 13));
    els.push({ t: 'text', x: monthlyBox.x, y: monthlyBox.y + 0.36, w: monthlyBox.w, h: 0.18, text: `January – December ${a.monthly_volume_trend.year ?? ''}`.trim(), size: 8, bold: true, color: C.text, align: 'center', valign: 'middle' });
    const monthlyPlot = { x: monthlyBox.x + 0.1, y: monthlyBox.y + 0.56, w: monthlyBox.w - 0.2, h: monthlyBox.h - 0.62 };
    if (monthly.length && (a.monthly_volume_trend.online_total || a.monthly_volume_trend.print_total)) {
      els.push({
        t: 'lineChart', ...monthlyPlot, percent: true, categories: monthly.map((m) => MONTH_LABELS[Number(m.month.slice(5, 7)) - 1] ?? m.month),
        series: [
          { name: 'Online Media', color: C.online, values: monthly.map((m) => toNumber(m.online.percentage) / 100) },
          { name: 'Print Media', color: C.print, values: monthly.map((m) => toNumber(m.print.percentage) / 100) },
        ],
      });
    } else {
      els.push(note(monthlyPlot, 'No coverage recorded for the year.', 10));
    }
    this.add('brandMedia', title, els);
  }

  // ------------------------------------------------ Distribution of media activities
  distribution() {
    const report = this.d.thematic.data;
    const title = 'Top - Thematic Distribution Breakdown';
    const activities = (report?.activities ?? []).slice(0, 10);
    // Competitive metrics the client follows that had no coverage are listed too, as in the deck.
    const covered = new Set(activities.map((a) => a.activity.trim().toLowerCase()));
    const metrics = this.d.competitive.data?.monitoring_summary.competitive_metrics ?? this.d.competitive.data?.monitoring_summary.media_prominences ?? [];
    const uncovered = metrics.filter((m) => !covered.has(m.trim().toLowerCase())).slice(0, Math.max(0, 10 - activities.length));
    if (!activities.length && !uncovered.length) return this.empty('distribution', title, 'media activity');
    const rows = [
      ...activities.map((act) => ({
        name: act.activity,
        sub: `${fmtPct(toNumber(act.percentage))} · ${formatNumber(act.frequency)} ${act.frequency === 1 ? 'story' : 'stories'}`,
        items: act.sample_editorials.map((e) => e.title?.trim()).filter((t): t is string => Boolean(t)).slice(0, 3),
      })),
      ...uncovered.map((m) => ({ name: m, sub: null, items: [] as string[] })),
    ];
    const blocks = rows.map((row, i) => {
      const items = row.items.length ? row.items : [`There was no media prominence on ${row.name} for the period under review`];
      return this.numberedRow(
        i + 1, row.name, row.sub,
        (box) => bulletList(items, centred(box, listHeight(items, box.w - 0.22, 11.5)), { max: 11.5, min: 7.5 }),
        (w) => listHeight(items, w - 0.22, 11),
      );
    });
    paginate(blocks.map((b) => ({ ...b, maxH: 1.25 }))).forEach((els, i) => this.add('distribution', i ? `${title} (continued)` : title, els));
  }

  // ------------------------------------------------ Publications & spokespersons
  publications() {
    const report = this.d.publications.data;
    const title = 'Publications / Reporters / Spokespersons Analysis';
    if (!report) return this.empty('publications', title, 'publication coverage');
    const a = report.analysis;
    const els: SlideEl[] = [];
    const highlights = (a.spokesperson_highlights ?? []).slice(0, 3);
    const sideW = highlights.length ? 2.75 : 0;
    const main = { x: AREA.x, y: AREA.y, w: AREA.w - (sideW ? sideW + GAP : 0), h: AREA.h };
    const pubRows = (sources: { source: string; percentage: string }[]) =>
      sources.slice(0, 10).map((s): BarRow => ({ label: s.source, value: toNumber(s.percentage), display: fmtPct(toNumber(s.percentage)), color: C.blue }));
    const reporterRows = (reporters: { reporter: string; percentage: string; publication?: string | null }[]) =>
      reporters.slice(0, 10).map((r): BarRow => ({ label: r.reporter, sublabel: r.publication ?? undefined, value: toNumber(r.percentage), display: fmtPct(toNumber(r.percentage)), color: C.blue }));
    const panels: { title: string; rows: BarRow[]; labelW: number }[] = [
      { title: 'Print Publications (Volume)', rows: pubRows(a.print_publications_volume.sources), labelW: 1.5 },
      { title: 'Online Publications (Volume)', rows: pubRows(a.online_publications_volume.sources), labelW: 1.75 },
      { title: 'Print Reporters (Volume)', rows: reporterRows(a.print_reporters.reporters), labelW: 1.7 },
      { title: 'Online Reporters (Volume)', rows: reporterRows(a.online_reporters.reporters), labelW: 1.8 },
    ];
    if (!highlights.length && a.spokesperson_volume.spokespersons.length) {
      // No profiles: list spokespersons as a fifth chart instead of the photo column.
      panels.push({
        title: 'Spokespersons (Volume)', labelW: 1.6,
        rows: a.spokesperson_volume.spokespersons.slice(0, 10).map((s) => ({ label: s.spokesperson, value: toNumber(s.percentage), display: fmtPct(toNumber(s.percentage)), color: C.blue })),
      });
    }
    const boxes = panels.length > 4 ? grid(main, 3, 2) : grid(main, 2, 2);
    panels.forEach((panel, i) => {
      const box = boxes[i];
      els.push(card(box), cardTitle(box, panel.title, 13));
      const plot = { x: box.x + 0.1, y: box.y + 0.48, w: box.w - 0.2, h: box.h - 0.58 };
      if (panel.rows.length) els.push({ t: 'bars', ...plot, rows: panel.rows, labelW: Math.min(panel.labelW, box.w * 0.42), size: 9.5 });
      else els.push(note(plot, 'No coverage recorded for the period under review.', 10));
    });
    if (highlights.length) {
      const side = grid({ x: main.x + main.w + GAP, y: AREA.y, w: sideW, h: AREA.h }, 1, 3);
      highlights.forEach((person, i) => {
        const box = side[i];
        els.push(card(box));
        const photo = this.d.images.people.get(person.spokesperson);
        const size = 0.72;
        if (photo) {
          els.push({ t: 'rect', shape: 'ellipse', x: box.x + 0.08, y: box.y + 0.08, w: size, h: size, fill: '#FFFFFF', line: { color: '#595959', width: 1 } });
          els.push({ t: 'image', x: box.x + 0.1, y: box.y + 0.1, w: size - 0.04, h: size - 0.04, data: photo.data, aspect: photo.aspect, circle: true });
        } else {
          els.push({ t: 'rect', shape: 'ellipse', x: box.x + 0.08, y: box.y + 0.08, w: size, h: size, fill: C.navy });
          els.push({ t: 'text', x: box.x + 0.08, y: box.y + 0.08, w: size, h: size, text: initials(person.spokesperson), size: 18, bold: true, color: '#FFFFFF', align: 'center', valign: 'middle' });
        }
        const role = [person.title, person.company].filter(Boolean).join(', ');
        const header = role ? `${person.spokesperson}\n(${role})` : person.spokesperson;
        const headerY = box.y + size + 0.12;
        const headerH = Math.min(0.62, textHeight(header, box.w - 0.16, 10.5, true) + 0.04);
        els.push({ t: 'text', x: box.x + 0.08, y: headerY, w: box.w - 0.16, h: headerH, text: header, size: fitFontSize(header, box.w - 0.16, headerH, 10.5, 7.5, true), bold: true, color: C.ink });
        const statement = person.statement?.trim()
          || (person.headline ? `Featured in “${person.headline}”${person.source ? ` (${person.source})` : ''}.` : `Quoted in ${person.count} ${person.count === 1 ? 'story' : 'stories'} during the period.`);
        const bodyBox = { x: box.x + 0.08, y: headerY + headerH + 0.08, w: box.w - 0.16, h: box.y + box.h - headerY - headerH - 0.14 };
        els.push({ t: 'text', ...bodyBox, text: statement, size: fitFontSize(statement, bodyBox.w, bodyBox.h, 9.5, 6.5), color: C.text });
      });
    }
    this.add('publications', title, els);
  }

  // ------------------------------------------------ Coverage by region
  region() {
    const report = this.d.social.data;
    const title = 'Social Stats / Online Coverage by Region';
    if (!report) return this.empty('region', title, 'social or online coverage');
    const m = report.social_media_metrics;
    const els: SlideEl[] = [];
    const side = grid({ x: AREA.x, y: AREA.y, w: 2.4, h: AREA.h }, 1, 3);
    const platforms: { icon: ExportImage | null; name: string; count: number; stats: [string, number][] }[] = [
      { icon: this.d.images.platforms.x, name: 'X', count: m.x.records_count, stats: [['Total Tweet', m.x.total_posts], ['Followers', m.x.total_followers], ['Following', m.x.total_following]] },
      { icon: this.d.images.platforms.facebook, name: 'Facebook', count: m.facebook.records_count, stats: [['Total Page Likes', m.facebook.total_page_likes], ['Total Monthly Posts', m.facebook.total_monthly_posts]] },
      { icon: this.d.images.platforms.instagram, name: 'Instagram', count: m.instagram.records_count, stats: [['Total Post', m.instagram.total_posts], ['Followers', m.instagram.total_followers], ['Following', m.instagram.total_following]] },
    ];
    platforms.forEach((p, i) => {
      const box = side[i];
      els.push(card(box));
      if (p.icon) els.push({ t: 'image', x: box.x + box.w / 2 - 0.23, y: box.y + 0.1, w: 0.46, h: 0.46, data: p.icon.data, aspect: p.icon.aspect });
      const statsBox = { x: box.x + 0.1, y: box.y + 0.62, w: box.w - 0.2, h: box.h - 0.7 };
      if (!p.count) {
        els.push(note(statsBox, `No ${p.name} statistics recorded for the period.`, 9.5));
        return;
      }
      const rowH = Math.min(0.5, statsBox.h / p.stats.length);
      p.stats.forEach(([label, value], j) => {
        const y = statsBox.y + j * rowH;
        els.push({ t: 'text', x: statsBox.x, y, w: statsBox.w, h: rowH * 0.5, text: label, size: 11.5, bold: true, color: C.text, align: 'center', valign: 'bottom' });
        els.push({ t: 'text', x: statsBox.x, y: y + rowH * 0.5, w: statsBox.w, h: rowH * 0.46, text: compact(value), size: 11.5, color: C.muted, align: 'center', valign: 'top' });
      });
    });
    const mapCard = { x: AREA.x + 2.4 + GAP, y: AREA.y, w: AREA.w - 2.4 - GAP, h: AREA.h };
    els.push(card(mapCard), cardTitle(mapCard, 'Online Coverage by Region', 14));
    const countries = report.online_country_coverage.countries;
    const mapBox = { x: mapCard.x + 0.2, y: mapCard.y + 0.5, w: mapCard.w - 0.4, h: mapCard.h - 1.35 };
    if (this.a.map && countries.length) {
      els.push({ t: 'image', ...mapBox, data: this.a.map.data, aspect: this.a.map.aspect });
      const legendY = mapBox.y + mapBox.h + 0.05;
      const lx = mapCard.x + mapCard.w / 2 - 1.5;
      els.push({ t: 'rect', x: lx, y: legendY + 0.06, w: 0.14, h: 0.14, fill: MAP_COLORS.high });
      els.push({ t: 'text', x: lx + 0.2, y: legendY, w: 1.2, h: 0.26, text: 'High Frequency', size: 9.5, color: C.text, valign: 'middle' });
      els.push({ t: 'rect', x: lx + 1.6, y: legendY + 0.06, w: 0.14, h: 0.14, fill: MAP_COLORS.low });
      els.push({ t: 'text', x: lx + 1.8, y: legendY, w: 1.2, h: 0.26, text: 'Low Frequency', size: 9.5, color: C.text, valign: 'middle' });
      const list = [...countries].sort((a, b) => b.count - a.count).slice(0, 12).map((c) => `${c.country} (${formatNumber(c.count)})`).join('  |  ');
      els.push({ t: 'text', x: mapCard.x + 0.3, y: legendY + 0.3, w: mapCard.w - 0.6, h: 0.45, text: list, size: fitFontSize(list, mapCard.w - 0.6, 0.45, 11, 7), color: C.text, align: 'center', valign: 'middle' });
    } else {
      els.push(note(mapBox, 'No online coverage by country was recorded for the period under review.', 12));
    }
    this.add('region', title, els);
  }

  // ------------------------------------------------ Competitive intelligence
  private sectors(): CompetitiveSector[] {
    const report = this.d.competitive.data;
    if (!report) return [];
    const own = report.base_company.sub_industry?.trim();
    return Object.values(report.competitive_intelligence).sort((a, b) => {
      if (a.sub_industry === own) return -1;
      if (b.sub_industry === own) return 1;
      return a.sub_industry.localeCompare(b.sub_industry);
    });
  }

  competitive() {
    const baseTitle = 'Competitive Intelligence';
    const sectors = this.sectors();
    if (!sectors.length) return this.empty('competitive', baseTitle, 'competitive coverage');
    for (const sector of sectors) {
      const an = sector.analysis;
      type Panel = { title: string; rows: BarRow[]; empty: string };
      const panels: Panel[] = [{
        title: 'Top 10 Competitive Media Share',
        rows: an.competitive_media_share.shares.slice(0, 10).map((s) => this.companyRow(s.company, toNumber(s.percentage), fmtPct(toNumber(s.percentage)))),
        empty: 'No coverage recorded for the period under review.',
      }];
      for (const [metric, entry] of Object.entries(an.media_prominence_analysis)) {
        panels.push({
          title: `Top - Media Prominence On ${metric}`,
          rows: entry.companies.filter((c) => c.frequency > 0).slice(0, 5).map((c) => this.companyRow(c.company, toNumber(c.percentage), fmtPct(toNumber(c.percentage)))),
          empty: `There was no media prominence on ${metric} for the period under review.`,
        });
      }
      panels.push({
        title: 'Top - CEOs With Media Prominence',
        rows: an.top_ceos_with_media_prominence.ceos.slice(0, 5).map((ceo) => {
          const photo = this.d.images.people.get(ceo.ceo);
          const isBrand = ceo.company ? this.brand.has(ceo.company) : false;
          return {
            label: ceo.ceo, sublabel: ceo.company ?? undefined, value: toNumber(ceo.percentage), display: fmtPct(toNumber(ceo.percentage)),
            color: isBrand ? C.yellow : C.blue, highlight: isBrand, icon: photo, initials: photo ? undefined : initials(ceo.ceo),
          };
        }),
        empty: 'No CEO media prominence recorded for the period under review.',
      });

      const title = `${baseTitle} – ${sector.sub_industry}`;
      const drawPanels = (list: Panel[], area: Box, rows: number) => {
        const els: SlideEl[] = [];
        grid(area, 3, rows).forEach((box, i) => {
          const panel = list[i];
          if (!panel) return;
          els.push(card(box), cardTitle(box, panel.title, 12.5));
          const plot = { x: box.x + 0.08, y: box.y + 0.44, w: box.w - 0.16, h: box.h - 0.52 };
          if (panel.rows.length) {
            const ceo = panel.title.includes('CEO');
            els.push({ t: 'bars', ...plot, rows: panel.rows, labelW: ceo ? 1.15 : 0.95, size: 8.5 });
          } else {
            els.push(note(plot, panel.empty, 9.5));
          }
        });
        return els;
      };

      // First slide: six panels and the sentiment index, as in the deck.
      const sentH = 2.05;
      const first = panels.slice(0, 6);
      const els = drawPanels(first, { x: AREA.x, y: AREA.y, w: AREA.w, h: AREA.h - sentH - GAP }, 2);
      const sentBox = { x: AREA.x, y: AREA.y + AREA.h - sentH, w: AREA.w, h: sentH };
      els.push(card(sentBox), cardTitle(sentBox, 'Media Sentiment Index', 14));
      const index = an.media_sentiment_index;
      const companies = Array.from(new Set(sector.companies_in_category)).filter((c) => index[c]?.total_mentions)
        .sort((a, b) => (this.brand.has(b) ? 1 : 0) - (this.brand.has(a) ? 1 : 0) || index[b].total_mentions - index[a].total_mentions)
        .slice(0, 8);
      if (companies.length) {
        els.push({
          t: 'diverging', x: sentBox.x + 0.3, y: sentBox.y + 0.45, w: sentBox.w - 0.6, h: sentBox.h - 0.8, labelW: 1.8,
          colors: { negative: C.red, positive: C.teal, neutral: C.grey },
          rows: companies.map((c) => {
            const logo = this.logo(c);
            return {
              label: c, icon: logo, initials: logo ? undefined : initials(c),
              negative: toNumber(index[c].negative.percentage), positive: toNumber(index[c].positive.percentage), neutral: toNumber(index[c].neutral.percentage),
            };
          }),
        });
        const legendY = sentBox.y + sentBox.h - 0.3;
        [['Positive', C.teal], ['Negative', C.red], ['Neutral', C.grey]].forEach(([label, color], i) => {
          const lx = sentBox.x + sentBox.w / 2 - 1.5 + i * 1.0;
          els.push({ t: 'rect', x: lx, y: legendY + 0.07, w: 0.11, h: 0.11, fill: color });
          els.push({ t: 'text', x: lx + 0.15, y: legendY, w: 0.8, h: 0.24, text: label, size: 9, color: C.text, valign: 'middle' });
        });
      } else {
        els.push(note(inset(sentBox, 0.5, 0.5), 'No sentiment recorded for the period under review.', 10));
      }
      const silent = sector.companies_without_coverage ?? [];
      if (silent.length) {
        const text = `No coverage this period: ${silent.join(', ')}`;
        els.push({ t: 'text', x: sentBox.x + 0.15, y: sentBox.y + sentBox.h - 0.3, w: 3.6, h: 0.26, text, size: fitFontSize(text, 3.6, 0.26, 7.5, 5.5), italic: true, color: C.muted, valign: 'middle' });
      }
      this.add('competitive', title, els);
      chunk(panels.slice(6), 6).forEach((rest) => this.add('competitive', `${title} (continued)`, drawPanels(rest, AREA, 2)));
    }
  }

  // ------------------------------------------------ Competitive PR drivers
  prDrivers() {
    const baseTitle = 'Competitive PR Drivers';
    const sectors = this.sectors().filter((s) => Object.values(s.analysis.competitive_pr_drivers).some((d) => d.sample_titles.length));
    if (!sectors.length) return this.empty('prDrivers', baseTitle, 'PR driver');
    for (const sector of sectors) {
      const drivers = sector.analysis.competitive_pr_drivers;
      const companies = Object.keys(drivers).filter((c) => drivers[c].sample_titles.length)
        .sort((a, b) => (this.brand.has(b) ? 1 : 0) - (this.brand.has(a) ? 1 : 0) || a.localeCompare(b));
      const title = `${baseTitle} – ${sector.sub_industry}`;
      chunk(companies, 4).forEach((group, page) => {
        const els: SlideEl[] = [card(AREA)];
        // Up to three companies stack like the deck, each card sized to its headlines; four use a 2 × 2 grid.
        const inner = inset(AREA, 0.35, 0.25);
        let boxes: Box[];
        if (group.length <= 3) {
          const slot = (inner.h - 0.25 * 2) / 3;
          let y = inner.y;
          boxes = group.map((company) => {
            const need = 0.97 + listHeight(drivers[company].sample_titles, inner.w - 0.82, 12.5) + 0.25;
            const box = { x: inner.x, y, w: inner.w, h: Math.min(Math.max(slot, need), inner.h / group.length) };
            y += box.h + 0.25;
            return box;
          });
        } else {
          boxes = grid(inner, 2, 2, 0.25);
        }
        group.forEach((company, i) => {
          const box = boxes[i];
          const isBrand = this.brand.has(company);
          els.push({ t: 'rect', shape: 'roundRect', radius: 0.18, ...box, fill: '#FFFFFF', line: { color: isBrand ? C.gold : C.blue, width: 2.5 } });
          const logo = this.logo(company);
          const nameX = box.x + 0.3 + (logo ? 0.6 : 0);
          if (logo) els.push({ t: 'image', x: box.x + 0.25, y: box.y + 0.18, w: 0.5, h: 0.5, data: logo.data, aspect: logo.aspect });
          els.push({ t: 'text', x: nameX, y: box.y + 0.15, w: box.x + box.w - nameX - 0.25, h: 0.56, text: company, size: fitFontSize(company, box.x + box.w - nameX - 0.25, 0.56, 26, 12, true), bold: true, color: C.blue, valign: 'middle' });
          els.push(...bulletList(drivers[company].sample_titles, { x: box.x + 0.3, y: box.y + 0.82, w: box.w - 0.6, h: box.h - 0.97 }, { max: 12.5, min: 8, bullet: C.yellow, color: '#404040' }));
        });
        this.add('prDrivers', page ? `${title} (continued)` : title, els);
      });
    }
  }

  // ------------------------------------------------ Glossary
  glossary() {
    const termW = 2.3;
    const defW = AREA.w - termW;
    const headH = 0.52;
    const rows = glossaryTerms.map((g) => {
      const h = Math.max(textHeight(g.term, termW - 0.25, 10.5, true), textHeight(g.definition, defW - 0.25, 10)) + 0.2;
      return { ...g, h: Math.max(0.42, h) };
    });
    const pages: (typeof rows)[] = [];
    let current: typeof rows = [];
    let used = headH;
    for (const row of rows) {
      if (current.length && used + row.h > AREA.h) {
        pages.push(current);
        current = [];
        used = headH;
      }
      current.push(row);
      used += row.h;
    }
    if (current.length) pages.push(current);
    pages.forEach((page, p) => {
      const els: SlideEl[] = [];
      const total = headH + page.reduce((s, r) => s + r.h, 0);
      els.push({ t: 'rect', x: AREA.x, y: AREA.y, w: AREA.w, h: total, fill: C.card, line: { color: '#404040', width: 1.25 } });
      els.push({ t: 'rect', x: AREA.x, y: AREA.y, w: AREA.w, h: headH, fill: C.navy });
      els.push({ t: 'text', x: AREA.x, y: AREA.y, w: termW, h: headH, text: 'METRIC', size: 17, bold: true, color: C.gold, align: 'center', valign: 'middle' });
      els.push({ t: 'text', x: AREA.x + termW, y: AREA.y, w: defW, h: headH, text: 'DEFINITION', size: 17, bold: true, color: C.gold, align: 'center', valign: 'middle' });
      els.push({ t: 'line', x1: AREA.x + termW, y1: AREA.y, x2: AREA.x + termW, y2: AREA.y + total, color: '#404040', width: 1 });
      let y = AREA.y + headH;
      for (const row of page) {
        els.push({ t: 'line', x1: AREA.x, y1: y, x2: AREA.x + AREA.w, y2: y, color: '#404040', width: 1 });
        els.push({ t: 'text', x: AREA.x + 0.12, y, w: termW - 0.25, h: row.h, text: row.term, size: 10.5, bold: true, color: C.ink, valign: 'middle' });
        els.push({ t: 'text', x: AREA.x + termW + 0.12, y, w: defW - 0.25, h: row.h, text: row.definition, size: 10, italic: true, color: C.text, valign: 'middle' });
        y += row.h;
      }
      this.add('glossary', p ? 'Glossary (continued)' : 'Glossary', els);
    });
  }

  // ------------------------------------------------ Audit process, principles & methodology
  methodology() {
    const els: SlideEl[] = [card(AREA)];
    const n = auditProcessSteps.length;
    const chevW = 1.9;
    const chevH = 2.05;
    const step = chevW * 0.94;
    const startX = AREA.x + (AREA.w - (step * (n - 1) + chevW)) / 2;
    const chevY = AREA.y + (AREA.h - chevH) / 2;
    auditProcessSteps.forEach((s, i) => {
      const x = startX + i * step;
      els.push({ t: 'rect', shape: 'chevron', x, y: chevY, w: chevW, h: chevH, fill: s.color });
      const circle = 0.82;
      const cx = x + chevW / 2 - circle / 2 + 0.05;
      els.push({ t: 'rect', shape: 'ellipse', x: cx, y: chevY + chevH / 2 - circle / 2, w: circle, h: circle, fill: '#FFFFFF' });
      const icon = this.a.process[i];
      els.push({ t: 'image', x: cx + 0.17, y: chevY + chevH / 2 - circle / 2 + 0.17, w: circle - 0.34, h: circle - 0.34, data: icon.data, aspect: 1 });
      const above = i % 2 === 0;
      const midX = x + chevW / 2 + 0.05;
      const textW = 2.4;
      const dot = 0.16;
      if (above) {
        els.push({ t: 'line', x1: midX, y1: chevY - 0.12, x2: midX, y2: chevY - 0.55, color: s.color, width: 1.25 });
        els.push({ t: 'rect', shape: 'ellipse', x: midX - dot / 2, y: chevY - 0.55 - dot, w: dot, h: dot, fill: s.color });
        els.push({ t: 'text', x: midX - textW / 2, y: chevY - 2.1, w: textW, h: 0.34, text: s.title, size: 13.5, bold: true, color: C.text, align: 'center', valign: 'middle' });
        els.push({ t: 'text', x: midX - textW / 2, y: chevY - 1.76, w: textW, h: 1.02, text: s.description, size: fitFontSize(s.description, textW, 1.02, 12.5, 9), color: C.text, align: 'center', valign: 'top' });
      } else {
        els.push({ t: 'line', x1: midX, y1: chevY + chevH + 0.12, x2: midX, y2: chevY + chevH + 0.55, color: s.color, width: 1.25 });
        els.push({ t: 'rect', shape: 'ellipse', x: midX - dot / 2, y: chevY + chevH + 0.55, w: dot, h: dot, fill: s.color });
        els.push({ t: 'text', x: midX - textW / 2, y: chevY + chevH + 0.82, w: textW, h: 0.34, text: s.title, size: 13.5, bold: true, color: C.text, align: 'center', valign: 'middle' });
        els.push({ t: 'text', x: midX - textW / 2, y: chevY + chevH + 1.16, w: textW, h: 1.02, text: s.description, size: fitFontSize(s.description, textW, 1.02, 12.5, 9), color: C.text, align: 'center', valign: 'top' });
      }
    });
    this.add('methodology', 'Our Audit Report Process – developed by P+ Measurement Services', els);

    const pm: SlideEl[] = [];
    const [left, right] = grid(AREA, 2, 1);
    for (const [box, heading, body, image] of [
      [left, principlesData.title, principlesData.description, this.d.images.principles],
      [right, methodologyData.title, methodologyData.description, this.d.images.methodology],
    ] as [Box, string, string, ExportImage | null][]) {
      pm.push(card(box));
      pm.push({ t: 'text', x: box.x + 0.3, y: box.y + 0.25, w: box.w - 0.6, h: 0.5, text: heading, size: 20, bold: true, color: C.navy, align: 'center', valign: 'middle' });
      if (image) pm.push({ t: 'image', x: box.x + 0.4, y: box.y + 0.9, w: box.w - 0.8, h: box.h - 2.6, data: image.data, aspect: image.aspect });
      pm.push({ t: 'text', x: box.x + 0.4, y: box.y + box.h - 1.55, w: box.w - 0.8, h: 1.3, text: body, size: fitFontSize(body, box.w - 0.8, 1.3, 13, 9), color: C.text, align: 'center', valign: 'middle' });
    }
    this.add('methodology', 'Principle & Methodology', pm);
  }

  // ------------------------------------------------ Cover and frame
  cover(): Slide {
    const d = this.d;
    const els: SlideEl[] = [];
    if (this.a.cover) {
      els.push({ t: 'image', x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, data: this.a.cover.data, aspect: this.a.cover.aspect });
      els.push({ t: 'rect', x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: '#061A4A', alpha: 0.5 });
      els.push({ t: 'rect', x: 0, y: 0, w: SLIDE_W * 0.6, h: SLIDE_H, fill: '#061A4A', alpha: 0.3 });
    } else {
      els.push({ t: 'rect', x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: '#0A1F5C' });
      els.push({ t: 'rect', shape: 'ellipse', x: 6.2, y: -2.6, w: 9.5, h: 9.5, fill: '#1447E6', alpha: 0.35 });
      els.push({ t: 'rect', shape: 'ellipse', x: 8.6, y: 2.4, w: 6.5, h: 6.5, fill: '#2F6BFF', alpha: 0.25 });
      els.push({ t: 'rect', shape: 'roundRect', radius: 1.2, x: 7.35, y: 0.6, w: 5.0, h: 5.9, line: { color: '#3D7BFF', width: 3 } });
    }
    const logo = d.images.clientLogo;
    if (logo) {
      const h = 0.8;
      const w = Math.min(4.2, h * logo.aspect);
      els.push({ t: 'rect', shape: 'roundRect', radius: 0.08, x: 0.35, y: 0.35, w: w + 0.3, h: h + 0.24, fill: '#FFFFFF', alpha: 0.95 });
      els.push({ t: 'image', x: 0.5, y: 0.47, w, h, data: logo.data, aspect: logo.aspect });
    } else {
      els.push({ t: 'text', x: 0.45, y: 0.4, w: 6.5, h: 0.8, text: d.pair.base_company.company_name, size: fitFontSize(d.pair.base_company.company_name, 6.5, 0.8, 30, 16, true), bold: true, color: '#FFFFFF', valign: 'middle' });
    }
    els.push({ t: 'text', x: 0.2, y: 3.62, w: 7.6, h: 0.6, text: 'MEDIA PERFORMANCE AUDIT REPORT.', size: 26, bold: true, color: '#FFFFFF', valign: 'middle' });
    els.push({ t: 'text', x: 0.2, y: 4.25, w: 7.6, h: 0.5, text: `${d.periodTitle}.`, size: 22, color: '#FFFFFF', valign: 'middle' });
    if (d.pair.competitors.length) {
      const vs = `${d.pair.base_company.company_name} vs ${d.pair.competitors.map((c) => c.company_name).join(', ')}`;
      els.push({ t: 'text', x: 0.2, y: 4.8, w: 7.2, h: 0.5, text: vs, size: fitFontSize(vs, 7.2, 0.5, 13, 9), color: '#D6E2FF', valign: 'top' });
    }
    els.push({ t: 'text', x: 8.3, y: 6.15, w: 4.95, h: 0.42, text: 'P+ Measurement Services\nData-driven media Intelligence', size: 12, color: '#FFFFFF', align: 'right', valign: 'bottom' });
    els.push({ t: 'text', x: 8.3, y: 6.72, w: 4.95, h: 0.22, text: 'www.pplusmeasurement.com.ng', size: 12, color: '#FFFFFF', align: 'right', valign: 'middle', link: { url: 'https://www.pplusmeasurement.com.ng' } });
    els.push({ t: 'rect', x: 0, y: 7.2, w: SLIDE_W, h: 0.3, fill: '#050E2B', alpha: 0.8 });
    const year = d.generatedAt.getFullYear();
    els.push({ t: 'text', x: 0.3, y: 7.2, w: SLIDE_W - 0.6, h: 0.3, text: copyright(year), size: 6.5, color: '#FFFFFF', align: 'center', valign: 'middle' });
    return { section: null, elements: els };
  }

  private frame(content: Content, number: number, firstSlide: Record<SectionKey, number>): SlideEl[] {
    const els: SlideEl[] = [
      { t: 'rect', x: 0, y: 0, w: SLIDE_W, h: SLIDE_H, fill: C.page },
      { t: 'rect', x: 0, y: 0, w: SLIDE_W, h: TOP_H, fill: C.topBar },
      { t: 'text', x: NAV_W, y: 0, w: SLIDE_W - 2 * NAV_W, h: TOP_H, text: 'Independent PR Measurement & Performance Audit', size: 13, color: '#FFFFFF', align: 'center', valign: 'middle' },
      { t: 'text', x: SLIDE_W - 1.2, y: 0, w: 1.05, h: TOP_H, text: String(number), size: 9, color: '#8C8C8C', align: 'right', valign: 'middle' },
      { t: 'rect', x: 0, y: TOP_H, w: NAV_W, h: SLIDE_H - TOP_H, fill: C.nav },
      { t: 'rect', x: NAV_W, y: TOP_H, w: SLIDE_W - NAV_W, h: TITLE_H, fill: '#FFFFFF' },
      { t: 'text', x: NAV_W + 0.08, y: TOP_H, w: SLIDE_W - NAV_W - 3.4, h: TITLE_H, text: content.title, size: fitFontSize(content.title, SLIDE_W - NAV_W - 3.4, TITLE_H, 14.5, 10, true), bold: true, color: C.ink, valign: 'middle' },
      { t: 'text', x: SLIDE_W - 3.3, y: TOP_H, w: 3.15, h: TITLE_H, text: this.d.periodLabel, size: 9.5, color: C.muted, align: 'right', valign: 'middle' },
    ];
    // Client logo in the navigation header.
    const logo = this.d.images.clientLogo;
    const navTop = TOP_H + 0.08;
    if (logo) {
      const h = 0.34;
      const w = Math.min(2.2, h * logo.aspect);
      els.push({ t: 'rect', shape: 'roundRect', radius: 0.05, x: 0.15, y: navTop, w: w + 0.16, h: h + 0.1, fill: '#FFFFFF' });
      els.push({ t: 'image', x: 0.23, y: navTop + 0.05, w, h, data: logo.data, aspect: logo.aspect });
    } else {
      els.push({ t: 'text', x: 0.15, y: navTop, w: NAV_W - 0.3, h: 0.44, text: this.d.pair.base_company.company_name, size: fitFontSize(this.d.pair.base_company.company_name, NAV_W - 0.3, 0.44, 12, 8, true), bold: true, color: '#FFFFFF', valign: 'middle' });
    }
    const itemH = 0.295;
    const listTop = TOP_H + 0.62;
    els.push({ t: 'rect', x: 0, y: listTop - 0.06, w: NAV_W - 0.03, h: itemH * SECTIONS.length + 0.12, fill: C.navPanel });
    SECTIONS.forEach((s, i) => {
      const y = listTop + i * itemH;
      if (s.key === content.section) els.push({ t: 'rect', x: 0, y, w: NAV_W - 0.03, h: itemH, fill: C.navActive });
      if (s.key === content.section) els.push({ t: 'rect', x: 0, y, w: 0.05, h: itemH, fill: C.yellow });
      els.push({ t: 'image', x: 0.2, y: y + 0.065, w: 0.165, h: 0.165, data: this.a.nav[s.key].data, aspect: 1 });
      els.push({ t: 'text', x: 0.48, y, w: NAV_W - 0.55, h: itemH, text: s.label, size: fitFontSize(s.label, NAV_W - 0.55, lineH(10.5) * 1.05, 10.5, 7), color: '#FFFFFF', underline: true, valign: 'middle', link: { slide: firstSlide[s.key] } });
    });
    const year = this.d.generatedAt.getFullYear();
    els.push({ t: 'text', x: 0.05, y: SLIDE_H - 0.95, w: NAV_W - 0.1, h: 0.9, text: copyright(year), size: 6.5, italic: true, color: '#FFFFFF', valign: 'bottom' });
    return els;
  }

  build(): Slide[] {
    this.executive();
    this.swot();
    this.insights();
    this.landscape();
    this.sentiment();
    this.brandMedia();
    this.distribution();
    this.publications();
    this.region();
    this.competitive();
    this.prDrivers();
    this.glossary();
    this.methodology();
    const firstSlide = {} as Record<SectionKey, number>;
    this.content.forEach((c, i) => {
      firstSlide[c.section] ??= i + 2; // slide 1 is the cover
    });
    return [
      this.cover(),
      ...this.content.map((c, i) => ({ section: c.section, elements: [...this.frame(c, i + 2, firstSlide), ...c.elements] })),
    ];
  }
}

async function loadAssets(d: ReportData): Promise<Assets> {
  const white = '#FFFFFF';
  const [nav, swot, target, kpi, process] = await Promise.all([
    Promise.all(SECTIONS.map((s) => iconPng(s.icon, '#D9D9D9', 48, 2))),
    Promise.all([ThumbsUp, ThumbsDown, Lightbulb, TriangleAlert].map((icon) => iconPng(icon as Icon, white, 96, 2.2))),
    iconPng(Target as Icon, C.yellow, 96, 2.4),
    Promise.all([AtSign, Camera, SquarePlay, Globe].map((icon) => iconPng(icon as Icon, '#404040', 64, 1.8))),
    Promise.all([ScanSearch, Database, ShieldCheck, ChartColumnBig, FileSearch].map((icon, i) => iconPng(icon as Icon, auditProcessSteps[i]?.color ?? C.blue, 96, 1.8))),
  ]);
  let map: ExportImage | null = null;
  const countries = d.social.data?.online_country_coverage.countries ?? [];
  if (countries.length) {
    const world = buildWorldMap(countries.map((c) => ({ country: c.country, count: c.count })), 960, 470);
    map = await svgToPng(worldMapSvg(world), world.width, world.height, 2);
  }
  const cover = d.images.cover ? await cropToAspect(d.images.cover, SLIDE_W / SLIDE_H) : null;
  return {
    nav: Object.fromEntries(SECTIONS.map((s, i) => [s.key, nav[i]])) as Record<SectionKey, ExportImage>,
    swot, target, kpi, process, map, cover,
  };
}

/** Builds the Media Performance Audit Report deck for the loaded report data. */
export async function buildDeck(data: ReportData): Promise<Deck> {
  const assets = await loadAssets(data);
  const slides = new DeckBuilder(data, assets).build();
  return {
    title: `Media Performance Audit Report — ${data.pair.base_company.company_name} — ${data.periodTitle}`,
    company: data.pair.base_company.company_name,
    periodLabel: data.periodLabel,
    slides,
  };
}
