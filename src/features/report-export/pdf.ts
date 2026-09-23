import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { CHART_COLORS } from '@/lib/charts';
import { formatDate } from '@/lib/format';
import type { Block, ReportPack, Section } from './types';

/** A4 portrait, millimetres. */
const PAGE_W = 210;
const PAGE_H = 297;
const M = 16;
const CONTENT_W = PAGE_W - 2 * M;
const TOP = 34;
const BOTTOM = PAGE_H - 18;
const INK: RGB = [15, 23, 42];
const MUTED: RGB = [100, 116, 139];
const BORDER: RGB = [226, 232, 240];
const BRAND: RGB = [30, 42, 120];

type RGB = [number, number, number];

function rgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function tint(c: RGB, amount: number): RGB {
  return c.map((v) => Math.round(v + (255 - v) * amount)) as RGB;
}

/**
 * The built-in PDF fonts only cover Windows-1252; map the few typographic
 * characters we use and drop anything else rather than printing garbage.
 */
const WIN_ANSI_EXTRA = new Set('€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ');
function safe(text: string): string {
  const mapped = text.replace(/−/g, '-').replace(/÷/g, '/').replace(/₦/g, 'NGN ');
  return Array.from(mapped).filter((ch) => ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRA.has(ch)).join('');
}

function palette(accent: string): RGB[] {
  return [accent, ...CHART_COLORS.filter((c) => c.toLowerCase() !== accent.toLowerCase())].map(rgb);
}

class PdfWriter {
  doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  y = TOP;
  section: Section | null = null;

  constructor(private pack: ReportPack) {}

  get accent(): RGB {
    return rgb(this.section?.accent ?? '#1e2a78');
  }

  /** Starts a new page when fewer than `needed` mm remain. */
  ensure(needed: number) {
    if (this.y + needed <= BOTTOM) return;
    this.newPage(true);
  }

  newPage(continued = false) {
    this.doc.addPage();
    this.y = TOP;
    if (this.section) this.pageHeader(this.section, continued);
  }

  pageHeader(s: Section, continued: boolean) {
    const { doc } = this;
    const accent = rgb(s.accent);
    doc.setFillColor(...accent);
    doc.rect(0, 0, PAGE_W, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(safe(continued ? `${s.title} (continued)` : s.title), M, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(safe(s.subtitle ? `${this.pack.company} · ${this.pack.periodLabel} · ${s.subtitle}` : `${this.pack.company} · ${this.pack.periodLabel}`), M, 18);
  }

  /** Section block heading; `keepWith` reserves room for the content that follows so titles never end a page. */
  blockTitle(title: string, keepWith = 0) {
    const { doc } = this;
    this.ensure(14 + keepWith);
    doc.setFillColor(...this.accent);
    doc.rect(M, this.y, 1.2, 5, 'F');
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(safe(title), M + 3.5, this.y + 4);
    this.y += 9;
  }

  kpis(block: Extract<Block, { kind: 'kpis' }>) {
    const { doc } = this;
    const perRow = Math.min(4, block.items.length);
    const gap = 4;
    const w = (CONTENT_W - gap * (perRow - 1)) / perRow;
    const h = 24;
    const colors = palette(this.section?.accent ?? '#1e2a78');
    for (let i = 0; i < block.items.length; i += perRow) {
      this.ensure(h + 4);
      block.items.slice(i, i + perRow).forEach((item, j) => {
        const x = M + j * (w + gap);
        const color = colors[(i + j) % colors.length];
        doc.setDrawColor(...BORDER);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, this.y, w, h, 2, 2, 'FD');
        doc.setFillColor(...color);
        doc.rect(x, this.y, w, 1.2, 'F');
        doc.setTextColor(...MUTED);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(safe(item.label), x + 3, this.y + 6.5, { maxWidth: w - 6 });
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(safe(item.value), x + 3, this.y + 15);
        if (item.hint) {
          doc.setTextColor(...MUTED);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.text(safe(item.hint), x + 3, this.y + 20.5, { maxWidth: w - 6 });
        }
      });
      this.y += h + 6;
    }
  }

  legend(items: { label: string; color: RGB }[]) {
    const { doc } = this;
    let x = M;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    for (const it of items) {
      const label = safe(it.label);
      const w = doc.getTextWidth(label) + 9;
      if (x + w > M + CONTENT_W) { x = M; this.y += 5; }
      doc.setFillColor(...it.color);
      doc.rect(x, this.y - 2.5, 3, 3, 'F');
      doc.setTextColor(...MUTED);
      doc.text(label, x + 4.5, this.y);
      x += w;
    }
    this.y += 6;
  }

  /** Horizontal bars: one row per category (and per series for grouped charts). */
  hbars(block: Extract<Block, { kind: 'bar' }>) {
    const { doc } = this;
    const colors = palette(this.section?.accent ?? '#1e2a78');
    const multi = block.series.length > 1;
    const labelW = 52;
    const barMax = CONTENT_W - labelW - 16;
    const max = Math.max(1, ...block.series.flatMap((s) => s.values));
    const rowH = multi ? 3.6 * block.series.length + 2.5 : 6.5;
    this.blockTitle(block.title, rowH * Math.min(3, block.categories.length) + (multi ? 6 : 0));
    if (multi) this.legend(block.series.map((s, i) => ({ label: s.name, color: colors[i % colors.length] })));
    block.categories.forEach((cat, ci) => {
      this.ensure(rowH + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...INK);
      const label = doc.splitTextToSize(safe(cat), labelW - 2)[0] as string;
      doc.text(label, M, this.y + (multi ? rowH / 2 : 4));
      block.series.forEach((s, si) => {
        const v = s.values[ci] ?? 0;
        const color = multi ? colors[si % colors.length] : block.colorByCategory ? colors[ci % colors.length] : colors[0];
        const y = this.y + (multi ? si * 3.6 + 0.5 : 1);
        const barH = multi ? 3 : 4.5;
        doc.setFillColor(...tint(color, 0.85));
        doc.rect(M + labelW, y, barMax, barH, 'F');
        doc.setFillColor(...color);
        doc.rect(M + labelW, y, Math.max(0.4, (v / max) * barMax), barH, 'F');
        doc.setTextColor(...INK);
        doc.setFontSize(7.5);
        doc.text(String(v), M + labelW + barMax + 2, y + barH - 0.8);
      });
      this.y += rowH;
    });
    this.y += 5;
  }

  /** Vertical columns for time series (weeks, months). */
  columns(block: Extract<Block, { kind: 'bar' }>) {
    const { doc } = this;
    const colors = palette(this.section?.accent ?? '#1e2a78');
    const chartH = 50;
    this.blockTitle(block.title, chartH + 20);
    if (block.series.length > 1) this.legend(block.series.map((s, i) => ({ label: s.name, color: colors[i % colors.length] })));
    const max = Math.max(1, ...block.series.flatMap((s) => s.values));
    const groupW = CONTENT_W / block.categories.length;
    const barW = Math.min(12, (groupW * 0.7) / block.series.length);
    const base = this.y + chartH;
    doc.setDrawColor(...BORDER);
    doc.line(M, base, M + CONTENT_W, base);
    block.categories.forEach((cat, ci) => {
      const gx = M + ci * groupW + (groupW - barW * block.series.length) / 2;
      block.series.forEach((s, si) => {
        const v = s.values[ci] ?? 0;
        const h = (v / max) * (chartH - 6);
        const color = block.series.length > 1 ? colors[si % colors.length] : block.colorByCategory ? colors[ci % colors.length] : colors[0];
        doc.setFillColor(...color);
        if (h > 0) doc.rect(gx + si * barW, base - h, barW - 0.6, h, 'F');
        doc.setTextColor(...INK);
        doc.setFontSize(7);
        doc.text(String(v), gx + si * barW + (barW - 0.6) / 2, base - h - 1.2, { align: 'center' });
      });
      doc.setTextColor(...MUTED);
      doc.setFontSize(7);
      const lines = doc.splitTextToSize(safe(cat), groupW - 1) as string[];
      doc.text(lines.slice(0, 2), M + ci * groupW + groupW / 2, base + 4, { align: 'center' });
    });
    this.y = base + 12;
  }

  /** Share of a whole as a single 100% stacked bar with a legend. */
  shares(block: Extract<Block, { kind: 'pie' }>) {
    const { doc } = this;
    const colors: RGB[] = block.colors ? block.colors.map(rgb) : palette(this.section?.accent ?? '#1e2a78');
    const total = block.values.reduce((a, b) => a + b, 0) || 1;
    this.blockTitle(block.title, 22);
    let x = M;
    block.values.forEach((v, i) => {
      const w = (v / total) * CONTENT_W;
      if (w <= 0) return;
      doc.setFillColor(...colors[i % colors.length]);
      doc.rect(x, this.y, w, 9, 'F');
      if (w > 14) {
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`${Math.round((v / total) * 100)}%`, x + w / 2, this.y + 6, { align: 'center' });
      }
      x += w;
    });
    this.y += 15;
    this.legend(block.categories.map((c, i) => ({ label: `${c} (${block.values[i]})`, color: colors[i % colors.length] })));
    this.y += 2;
  }

  table(block: Extract<Block, { kind: 'table' }>) {
    this.blockTitle(block.title, 7 * Math.min(3, block.rows.length + 1));
    autoTable(this.doc, {
      startY: this.y,
      head: [block.columns.map(safe)],
      body: block.rows.map((r) => r.map(safe)),
      margin: { left: M, right: M, top: TOP, bottom: PAGE_H - BOTTOM },
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.8, textColor: INK, lineColor: BORDER, lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: this.accent, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data) => {
        // Pages added by the table get the section header too.
        if (data.pageNumber > 1 && this.section) this.pageHeader(this.section, true);
      },
    });
    const finalY = (this.doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    this.y = (finalY ?? this.y) + 8;
  }

  bullets(block: Extract<Block, { kind: 'bullets' }>) {
    const { doc } = this;
    this.blockTitle(block.title, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    for (const item of block.items) {
      const lines = doc.splitTextToSize(safe(item), CONTENT_W - 6) as string[];
      this.ensure(lines.length * 4.6 + 2);
      doc.setFillColor(...this.accent);
      doc.circle(M + 1.2, this.y - 1.2, 0.8, 'F');
      doc.setTextColor(...INK);
      doc.text(lines, M + 5, this.y);
      this.y += lines.length * 4.6 + 1.6;
    }
    this.y += 4;
  }

  note(text: string) {
    const { doc } = this;
    this.ensure(18);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...BORDER);
    doc.roundedRect(M, this.y, CONTENT_W, 14, 2, 2, 'FD');
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(safe(text), M + 5, this.y + 8.5, { maxWidth: CONTENT_W - 10 });
    this.y += 20;
  }

  cover() {
    const { doc, pack } = this;
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, PAGE_W, 120, 'F');
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 120, PAGE_W, 2.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('P+ Media Analytics', M, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(199, 210, 254);
    doc.text('Media measurement and competitive intelligence', M, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(125, 211, 252);
    doc.text('MEDIA INTELLIGENCE REPORT', M, 78);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text(doc.splitTextToSize(safe(pack.company), CONTENT_W) as string[], M, 92);
    if (pack.logo) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(PAGE_W - M - 46, 12, 46, 20, 3, 3, 'F');
        doc.addImage(pack.logo, 'PNG', PAGE_W - M - 43, 14, 40, 16, undefined, 'FAST');
      } catch {
        // A logo that cannot be decoded is simply left out.
      }
    }
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Reporting period', M, 142);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(safe(pack.periodLabel), M, 149);
    if (pack.competitors.length) {
      doc.setFont('helvetica', 'bold');
      doc.text('Benchmarked against', M, 162);
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(safe(pack.competitors.join(', ')), CONTENT_W) as string[], M, 169);
    }
    doc.setFont('helvetica', 'bold');
    doc.text('Contents', M, 190);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    pack.sections.forEach((s, i) => {
      const y = 198 + i * 6.2;
      if (y > PAGE_H - 22) return;
      doc.setFillColor(...rgb(s.accent));
      doc.circle(M + 2, y - 1.3, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text(String(i + 1), M + 2, y - 0.3, { align: 'center' });
      doc.setTextColor(...INK);
      doc.setFontSize(10);
      doc.text(safe(s.title), M + 7, y);
    });
    doc.setTextColor(...MUTED);
    doc.setFontSize(8);
    doc.text(safe(`Prepared ${formatDate(pack.generatedAt)}`), M, PAGE_H - 12);
  }

  footers() {
    const { doc, pack } = this;
    const pages = doc.getNumberOfPages();
    for (let i = 2; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setDrawColor(...BORDER);
      doc.line(M, PAGE_H - 12, PAGE_W - M, PAGE_H - 12);
      doc.setTextColor(...MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(safe(`P+ Media Analytics · ${pack.company} · ${pack.periodLabel}`), M, PAGE_H - 7.5);
      doc.text(`${i} / ${pages}`, PAGE_W - M, PAGE_H - 7.5, { align: 'right' });
    }
  }

  render(): Blob {
    this.cover();
    for (const s of this.pack.sections) {
      this.section = s;
      this.newPage();
      for (const b of s.blocks) {
        if (b.kind === 'kpis') this.kpis(b);
        else if (b.kind === 'bar' && b.horizontal) this.hbars(b);
        else if (b.kind === 'bar') this.columns(b);
        else if (b.kind === 'pie') this.shares(b);
        else if (b.kind === 'table') this.table(b);
        else if (b.kind === 'bullets') this.bullets(b);
        else this.note(b.text);
      }
    }
    this.footers();
    this.doc.setProperties({ title: `${this.pack.company} media report — ${this.pack.periodLabel}`, author: 'P+ Media Analytics' });
    return this.doc.output('blob');
  }
}

/** Renders the report pack as a paginated A4 PDF. */
export function renderPdf(pack: ReportPack): Blob {
  return new PdfWriter(pack).render();
}
