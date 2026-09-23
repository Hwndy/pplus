import type { ComponentType } from 'react';
import { Award, BarChart3, Database, FileText, Microscope, Monitor, ShieldCheck } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { PageHeader } from '@/components/common/PageHeader';
import { auditProcessSteps, methodologyData, principlesData } from '@/utils/methodologyData';

const STEP_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  monitor: Monitor,
  database: Database,
  'shield-check': ShieldCheck,
  'chart-bar': BarChart3,
  'document-report': FileText,
};

export default function MethodologyPage() {
  return (
    <>
      <PageHeader title="Principles & methodology" description="The standards and process behind every P+ report." />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Principles">
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold">{principlesData.title}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{principlesData.organization.toUpperCase()}</p>
                <p className="pt-2 text-sm leading-relaxed text-foreground">{principlesData.description}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={methodologyData.title}>
            <div className="flex items-start gap-4">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <Microscope className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">{methodologyData.description}</p>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Our audit report process" description="Developed by P+ Measurement Services; each report passes through every step.">
          <ol className="relative ml-5 space-y-6 border-l pl-8">
            {auditProcessSteps.map((step, index) => {
              const Icon = STEP_ICONS[step.icon] ?? FileText;
              return (
                <li key={step.id} className="relative">
                  <span className="absolute -left-[3.125rem] flex h-9 w-9 items-center justify-center rounded-full border bg-card text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {index + 1}</p>
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </SectionCard>
      </div>
    </>
  );
}
