/** Shared chart palette so every report uses the same colours for the same meaning. */
export const CHART_COLORS = ['#1e2a78', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

export const chartAxisProps = {
  tick: { fontSize: 12, fill: '#64748b' },
  tickLine: false,
  axisLine: false,
} as const;

export const chartTooltipStyle = {
  contentStyle: { borderRadius: 8, border: '1px solid hsl(214.3 31.8% 91.4%)', fontSize: 12 },
} as const;
