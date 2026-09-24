/**
 * Format-neutral description of the Media Performance Audit Report deck.
 * Slides are 13.333 × 7.5 inches (16:9); every position and size is in inches
 * and every font size in points, so the PowerPoint and PDF renderers draw the
 * same slide from the same data.
 */

export type Align = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';

export interface Box { x: number; y: number; w: number; h: number }

export type ShapeKind = 'rect' | 'roundRect' | 'ellipse' | 'hexagon' | 'chevron' | 'homePlate';

export interface RectEl extends Box {
  t: 'rect';
  shape?: ShapeKind;
  fill?: string;
  /** Fill opacity, 0–1 (default 1). */
  alpha?: number;
  line?: { color: string; width?: number };
  /** Corner radius in inches (roundRect). */
  radius?: number;
}

export type Link = { slide: number } | { url: string };

export interface TextEl extends Box {
  t: 'text';
  text: string;
  size: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: Align;
  valign?: VAlign;
  /** Clicking the text jumps to this slide (1-based) or opens this URL. */
  link?: Link;
}

export interface ImageEl extends Box {
  t: 'image';
  /** data: URL */
  data: string;
  /** Natural aspect ratio (width / height); the image is fitted (contained) inside the box. */
  aspect: number;
  circle?: boolean;
}

export interface LineEl { t: 'line'; x1: number; y1: number; x2: number; y2: number; color: string; width?: number }

export interface BarRow {
  label: string;
  sublabel?: string;
  value: number;
  display: string;
  color: string;
  /** Logo or photo (data URL); `initials` is shown in a circle when there is none. */
  icon?: { data: string; aspect: number };
  initials?: string;
  highlight?: boolean;
}

/** Horizontal bar list drawn as shapes (identical in both formats); supports logos/photos. */
export interface BarsEl extends Box {
  t: 'bars';
  rows: BarRow[];
  /** Width of the label column (inches); 0 hides labels. */
  labelW: number;
  /** Value that fills the whole bar (defaults to the largest value). */
  max?: number;
  size?: number;
}

/** Per-company sentiment: negative extends left of the axis, positive and neutral to the right. */
export interface DivergingEl extends Box {
  t: 'diverging';
  rows: { label: string; icon?: { data: string; aspect: number }; initials?: string; negative: number; positive: number; neutral: number }[];
  labelW: number;
  colors: { negative: string; positive: string; neutral: string };
}

export interface LineChartEl extends Box {
  t: 'lineChart';
  categories: string[];
  series: { name: string; color: string; values: number[] }[];
  /** Values are fractions (0–1) shown as percentages. */
  percent?: boolean;
}

export interface DoughnutEl extends Box {
  t: 'doughnut';
  categories: string[];
  values: number[];
  colors: string[];
}

export type ChartEl = LineChartEl | DoughnutEl;
export type PrimitiveEl = RectEl | TextEl | ImageEl | LineEl;
export type SlideEl = PrimitiveEl | BarsEl | DivergingEl | ChartEl;

export type SectionKey =
  | 'executive' | 'swot' | 'insights' | 'landscape' | 'sentiment' | 'brandMedia' | 'distribution'
  | 'publications' | 'region' | 'competitive' | 'prDrivers' | 'glossary' | 'methodology';

export interface Slide {
  /** Section this slide belongs to (for the navigation panel); the cover has none. */
  section: SectionKey | null;
  elements: SlideEl[];
}

export interface Deck {
  title: string;
  company: string;
  periodLabel: string;
  slides: Slide[];
}
