import { createContext, useContext } from 'react';
import { CHART_COLORS } from './charts';

/**
 * Each client report has its own accent so the dashboards are easy to tell
 * apart. The accent drives the header gradient, the KPI tiles and the lead
 * chart colour; sentiment colours (green / grey / red) never change.
 */
export interface ReportTheme {
  /** Main colour of the report. */
  accent: string;
  /** Second stop of the header gradient. */
  gradientTo: string;
  /** Chart palette, accent first. */
  palette: string[];
}

export type ReportThemeKey =
  | 'executive-summary'
  | 'daily-mentions'
  | 'swot-analysis'
  | 'outcome-insights'
  | 'industry-landscape-overview'
  | 'brand-media-sentiment-index'
  | 'brand-media-analysis'
  | 'top-thematic-distribution-breakdown'
  | 'publication-reporter-spokesperson-analysis'
  | 'social-stats-online-coverage'
  | 'competitive-intelligence'
  | 'competitive-sentiment'
  | 'competitive-ceos'
  | 'competitive-pr';

const ACCENTS: Record<ReportThemeKey, [accent: string, gradientTo: string]> = {
  'executive-summary': ['#4f46e5', '#0ea5e9'],
  'daily-mentions': ['#0284c7', '#22d3ee'],
  'swot-analysis': ['#7c3aed', '#c026d3'],
  'outcome-insights': ['#0d9488', '#22c55e'],
  'industry-landscape-overview': ['#059669', '#0ea5e9'],
  'brand-media-sentiment-index': ['#e11d48', '#f97316'],
  'brand-media-analysis': ['#2563eb', '#7c3aed'],
  'top-thematic-distribution-breakdown': ['#d97706', '#e11d48'],
  'publication-reporter-spokesperson-analysis': ['#0891b2', '#4f46e5'],
  'social-stats-online-coverage': ['#c026d3', '#6366f1'],
  'competitive-intelligence': ['#ea580c', '#e11d48'],
  'competitive-sentiment': ['#db2777', '#7c3aed'],
  'competitive-ceos': ['#65a30d', '#0d9488'],
  'competitive-pr': ['#9333ea', '#2563eb'],
};

function paletteFor(accent: string): string[] {
  return [accent, ...CHART_COLORS.filter((c) => c.toLowerCase() !== accent.toLowerCase())];
}

export function reportTheme(key: ReportThemeKey): ReportTheme {
  const [accent, gradientTo] = ACCENTS[key];
  return { accent, gradientTo, palette: paletteFor(accent) };
}

export const DEFAULT_REPORT_THEME = reportTheme('executive-summary');

export const ReportThemeContext = createContext<ReportTheme>(DEFAULT_REPORT_THEME);

/** The current report's theme (the executive-summary theme outside a report). */
export function useReportTheme(): ReportTheme {
  return useContext(ReportThemeContext);
}

/** Chart palette for the current report, accent first. */
export function useChartColors(): string[] {
  return useReportTheme().palette;
}
