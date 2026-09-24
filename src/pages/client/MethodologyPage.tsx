import type { ComponentType, CSSProperties } from 'react';
import { BarChart3, Database, FileText, Monitor, ShieldCheck } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { PageHeader } from '@/components/common/PageHeader';
import { cn } from '@/lib/utils';
import { auditProcessSteps, methodologyData, principlesData } from '@/utils/methodologyData';

const STEP_ICONS: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  monitor: Monitor,
  database: Database,
  'shield-check': ShieldCheck,
  'chart-bar': BarChart3,
  'document-report': FileText,
};

const CHEVRON = 'polygon(0% 0%, 72% 0%, 100% 50%, 72% 100%, 0% 100%, 28% 50%)';
const asset = (file: string) => `${import.meta.env.BASE_URL}report-assets/${file}`;

/** Principles panel colour (teal) and methodology panel colour (yellow), as in the printed report. */
const PANEL_COLORS = { principles: '#4FC6BC', methodology: '#F2C414' };
const PANEL_TEXT = '#111827';

function ProcessStep({ step, index }: { step: (typeof auditProcessSteps)[number]; index: number }) {
  const Icon = STEP_ICONS[step.icon] ?? FileText;
  // On wide screens the descriptions alternate above and below the chevrons.
  const above = index % 2 === 0;
  const text = (
    <div className={cn('min-w-0 flex-1 lg:flex lg:h-44 lg:flex-col lg:items-center lg:text-center', above ? 'lg:order-1 lg:justify-end' : 'lg:order-3 lg:justify-start')}>
      <div className={cn('hidden lg:flex lg:flex-col lg:items-center', above ? 'lg:order-2' : 'lg:order-1')} aria-hidden>
        {!above && <span className="h-6 w-px" style={{ backgroundColor: step.color }} />}
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: step.color }} />
        {above && <span className="h-6 w-px" style={{ backgroundColor: step.color }} />}
      </div>
      <div className={cn('space-y-1', above ? 'lg:order-1 lg:pb-2' : 'lg:order-2 lg:pt-2')}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
        <h3 className="font-semibold">{step.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </div>
    </div>
  );
  return (
    <li className="flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-0">
      <div
        className="flex h-24 w-28 shrink-0 items-center justify-center lg:order-2 lg:h-32 lg:w-full"
        style={{ backgroundColor: step.color, clipPath: CHEVRON }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm lg:h-16 lg:w-16">
          <Icon className="h-6 w-6 lg:h-7 lg:w-7" style={{ color: step.color }} />
        </span>
      </div>
      {text}
      <div className={cn('hidden lg:block lg:h-44', above ? 'lg:order-3' : 'lg:order-1')} aria-hidden />
    </li>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <PageHeader title="Principle & Methodology" description="The standards and process behind every P+ report." />

      <div className="space-y-6">
        <SectionCard title="Our Audit Report Process – developed by P+ Measurement Services" description="Every report passes through each of these steps.">
          <ol className="grid grid-cols-1 gap-4 py-2 lg:grid-cols-5 lg:gap-2">
            {auditProcessSteps.map((step, index) => <ProcessStep key={step.id} step={step} index={index} />)}
          </ol>
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <img src={asset('barcelona-principles.png')} alt={`${principlesData.title} — ${principlesData.organization.toUpperCase()}`} className="aspect-[5/2] w-full bg-muted object-contain" loading="lazy" />
            <h2 className="px-5 py-2.5 text-lg font-semibold" style={{ backgroundColor: PANEL_COLORS.principles, color: PANEL_TEXT }}>Principles</h2>
            <p className="p-5 leading-relaxed">{principlesData.description}</p>
          </article>
          <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <img src={asset('methodology.jpg')} alt={methodologyData.title} className="aspect-[5/2] w-full bg-muted object-cover" loading="lazy" />
            <h2 className="px-5 py-2.5 text-lg font-semibold" style={{ backgroundColor: PANEL_COLORS.methodology, color: PANEL_TEXT }}>{methodologyData.title}</h2>
            <p className="p-5 leading-relaxed">{methodologyData.description}</p>
          </article>
        </div>
      </div>
    </>
  );
}
