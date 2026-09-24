import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/format';
import type { MonitoringPair } from '@/types/api';
import type { ThematicDistributionReport } from '@/types/reports';
import { ReportShell } from './ReportShell';
import { NumberedCard, ReportHeading } from './ReportParts';
import { labelKey, noMetricCoverage, percentLabel, toNumber } from './reportUtils';

/** The printed report lists the top five media activities. */
const TOP = 5;

interface ActivityCard {
  activity: string;
  frequency: number;
  percentage: number;
  headlines: string[];
}

function Distribution({ data, pair }: { data: ThematicDistributionReport; pair: MonitoringPair }) {
  const [showAll, setShowAll] = useState(false);

  const activities: ActivityCard[] = data.activities.map((a) => ({
    activity: a.activity,
    frequency: a.frequency,
    percentage: toNumber(a.percentage),
    headlines: a.sample_editorials.map((e) => e.title?.trim()).filter((t): t is string => Boolean(t)),
  }));
  const covered = new Set(activities.map((a) => labelKey(a.activity)));
  const uncovered = Array.from(new Set(pair.media_prominence.map((m) => m.trim()).filter(Boolean)))
    .filter((metric) => !covered.has(labelKey(metric)));

  const shown = showAll ? activities : activities.slice(0, TOP);

  return (
    <div className="space-y-4">
      <ReportHeading
        description={`${formatNumber(data.total_editorials)} stories across ${formatNumber(data.unique_activities)} media activities.`}
      >
        Top – Thematic Distribution Breakdown
      </ReportHeading>

      {shown.map((a, i) => (
        <NumberedCard key={a.activity} index={i + 1} category={a.activity}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">PR drivers under this media activity</p>
            <Badge variant="muted" className="font-normal">{formatNumber(a.frequency)} {a.frequency === 1 ? 'story' : 'stories'} · {percentLabel(a.percentage)}</Badge>
          </div>
          {a.headlines.length ? (
            <ul className="list-disc space-y-1.5 pl-5">
              {a.headlines.map((h, j) => <li key={`${j}-${h}`}>{h}</li>)}
            </ul>
          ) : (
            <p className="text-muted-foreground">There were no headlines recorded under this media activity.</p>
          )}
        </NumberedCard>
      ))}

      {activities.length > TOP && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? `Show top ${TOP}` : `Show all ${formatNumber(activities.length)} media activities`}
          </Button>
        </div>
      )}

      {uncovered.map((metric, i) => (
        <NumberedCard key={metric} index={shown.length + i + 1} category={metric}>
          <ul className="list-disc pl-5">
            <li>{noMetricCoverage(metric)}</li>
          </ul>
        </NumberedCard>
      ))}
    </div>
  );
}

export default function ThematicDistributionPage() {
  return (
    <ReportShell<ThematicDistributionReport>
      report="top-thematic-distribution-breakdown"
      title="Distribution of Media Activities"
      description="The media activities driving your coverage and the stories behind them."
    >
      {(data, { pair }) => <Distribution data={data} pair={pair} />}
    </ReportShell>
  );
}
