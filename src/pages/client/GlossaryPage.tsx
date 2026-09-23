import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { SectionCard } from '@/components/common/Cards';
import { FilterBar, SearchInput } from '@/components/common/Filters';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/States';
import { glossaryTerms } from '@/utils/glossaryData';
import { groupBy } from './reportUtils';

const SORTED_TERMS = [...glossaryTerms].sort((a, b) => a.term.localeCompare(b.term));

export default function GlossaryPage() {
  const [search, setSearch] = useState('');

  const needle = search.trim().toLowerCase();
  const terms = needle
    ? SORTED_TERMS.filter((t) => t.term.toLowerCase().includes(needle) || t.definition.toLowerCase().includes(needle))
    : SORTED_TERMS;
  const groups = groupBy(terms, (t) => t.term.charAt(0).toUpperCase());

  return (
    <>
      <PageHeader title="Glossary" description="What each metric in your reports means." />
      <FilterBar onReset={search ? () => setSearch('') : undefined}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search terms…" className="sm:w-80" />
      </FilterBar>

      {groups.length ? (
        <div className="space-y-6">
          <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
            {groups.map((g) => (
              <a
                key={g.key}
                href={`#glossary-${g.key}`}
                className="flex h-8 w-8 items-center justify-center rounded-md border bg-card text-sm font-medium hover:bg-muted"
              >
                {g.key}
              </a>
            ))}
          </nav>
          {groups.map((g) => (
            <div key={g.key} id={`glossary-${g.key}`} className="scroll-mt-20">
              <SectionCard title={g.key}>
                <dl className="divide-y">
                  {g.items.map((t) => (
                    <div key={t.term} className="py-3 first:pt-0 last:pb-0">
                      <dt className="text-sm font-semibold">{t.term}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.definition}</dd>
                    </div>
                  ))}
                </dl>
              </SectionCard>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No matching terms" description="Try a different search." />
      )}
    </>
  );
}
