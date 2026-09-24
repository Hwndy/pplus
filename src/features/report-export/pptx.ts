import PptxGenJS from 'pptxgenjs';
import { containBox, expand } from './primitives';
import type { Deck, DoughnutEl, LineChartEl, RectEl, SlideEl, TextEl } from './types';

const FONT = 'Arial';
const hex = (color: string) => color.replace('#', '').toUpperCase();

const SHAPES: Record<NonNullable<RectEl['shape']>, PptxGenJS.SHAPE_NAME> = {
  rect: 'rect',
  roundRect: 'roundRect',
  ellipse: 'ellipse',
  hexagon: 'hexagon',
  chevron: 'chevron',
  homePlate: 'homePlate',
};

function addRect(slide: PptxGenJS.Slide, el: RectEl) {
  slide.addShape(SHAPES[el.shape ?? 'rect'], {
    x: el.x, y: el.y, w: el.w, h: el.h,
    fill: el.fill ? { color: hex(el.fill), transparency: el.alpha !== undefined ? Math.round((1 - el.alpha) * 100) : 0 } : { type: 'none' },
    line: el.line ? { color: hex(el.line.color), width: el.line.width ?? 1 } : { type: 'none' },
    ...(el.shape === 'roundRect' ? { rectRadius: el.radius ?? 0.05 } : {}),
  });
}

function addText(slide: PptxGenJS.Slide, el: TextEl) {
  const run: PptxGenJS.TextPropsOptions = {
    fontFace: FONT, fontSize: el.size, color: hex(el.color), bold: el.bold, italic: el.italic,
    underline: el.underline ? { style: 'sng', color: hex(el.color) } : undefined,
  };
  if (el.link) run.hyperlink = 'slide' in el.link ? { slide: el.link.slide } : { url: el.link.url };
  slide.addText([{ text: el.text, options: run }], {
    x: el.x, y: el.y, w: el.w, h: el.h, margin: 0, align: el.align ?? 'left', valign: el.valign ?? 'top',
    lineSpacingMultiple: 1.0, fit: 'none', paraSpaceAfter: 0, paraSpaceBefore: 0,
  });
}

function addDoughnut(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: DoughnutEl) {
  slide.addChart(pptx.ChartType.doughnut, [{ name: 'Share', labels: el.categories, values: el.values }], {
    x: el.x, y: el.y, w: el.w, h: el.h,
    holeSize: 50,
    chartColors: el.colors.map(hex),
    showLegend: true, legendPos: 'b', legendFontFace: FONT, legendFontSize: 10, legendColor: '404040',
    showPercent: true, showValue: false, showLabel: false,
    dataLabelColor: 'FFFFFF', dataLabelFontFace: FONT, dataLabelFontSize: 12, dataLabelFontBold: true,
    dataBorder: { pt: 1, color: 'FFFFFF' },
  });
}

function addLineChart(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: LineChartEl) {
  slide.addChart(pptx.ChartType.line, el.series.map((s) => ({ name: s.name, labels: el.categories, values: s.values })), {
    x: el.x, y: el.y, w: el.w, h: el.h,
    chartColors: el.series.map((s) => hex(s.color)),
    lineSize: 2.5, lineDataSymbol: 'circle', lineDataSymbolSize: 7,
    showLegend: true, legendPos: 'b', legendFontFace: FONT, legendFontSize: 9, legendColor: '404040',
    catAxisLabelFontFace: FONT, catAxisLabelFontSize: 9, catAxisLabelColor: '595959',
    valAxisLabelFontFace: FONT, valAxisLabelFontSize: 8, valAxisLabelColor: '595959',
    valAxisLabelFormatCode: el.percent ? '0%' : '#,##0', valAxisMinVal: 0,
    ...(el.percent ? { valAxisMaxVal: 1 } : {}),
    valGridLine: { color: 'E5E5E5', size: 0.75 }, catGridLine: { style: 'none' },
    showValue: true, dataLabelFormatCode: el.percent ? '0%' : '#,##0', dataLabelPosition: 't',
    dataLabelFontSize: 7, dataLabelFontFace: FONT, dataLabelColor: '404040',
  });
}

function addElement(pptx: PptxGenJS, slide: PptxGenJS.Slide, el: SlideEl) {
  switch (el.t) {
    case 'rect':
      return addRect(slide, el);
    case 'text':
      return addText(slide, el);
    case 'image': {
      const box = containBox(el, el.aspect);
      return slide.addImage({ data: el.data, ...box, rounding: el.circle });
    }
    case 'line': {
      const x = Math.min(el.x1, el.x2);
      const y = Math.min(el.y1, el.y2);
      return slide.addShape('line', {
        x, y, w: Math.abs(el.x2 - el.x1), h: Math.abs(el.y2 - el.y1),
        flipV: (el.x2 - el.x1) * (el.y2 - el.y1) < 0,
        line: { color: hex(el.color), width: el.width ?? 1 },
      });
    }
    case 'doughnut':
      return addDoughnut(pptx, slide, el);
    case 'lineChart':
      return addLineChart(pptx, slide, el);
    default:
      return expand(el).forEach((child) => addElement(pptx, slide, child));
  }
}

/** Renders the deck as a PowerPoint file (native shapes, text and editable charts). */
export async function renderPptx(deck: Deck): Promise<Blob> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'P+ Measurement Services';
  pptx.company = 'P+ Measurement Services';
  pptx.title = deck.title;
  pptx.subject = `Media Performance Audit Report — ${deck.company}`;
  for (const s of deck.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: 'E7E7E7' };
    for (const el of s.elements) addElement(pptx, slide, el);
  }
  return (await pptx.write({ outputType: 'blob' })) as Blob;
}
