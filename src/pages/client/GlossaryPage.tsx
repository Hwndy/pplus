import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { FilterBar, SearchInput } from '@/components/common/Filters';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/States';
import { glossaryTerms } from '@/utils/glossaryData';
import { DECK_YELLOW } from './ReportParts';

/** Header colour of the printed report's glossary table. */
const TABLE_HEADER = '#0B1F66';

export default function GlossaryPage() {
  const [search, setSearch] = useState('');

  const needle = search.trim().toLowerCase();
  const terms = needle
    ? glossaryTerms.filter((t) => t.term.toLowerCase().includes(needle) || t.definition.toLowerCase().includes(needle))
    : glossaryTerms;

  return (
    <>
      <PageHeader title="Glossary" description="What each metric in your reports means." />
      <FilterBar onReset={search ? () => setSearch('') : undefined}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search metrics…" className="sm:w-80" />
      </FilterBar>

      {terms.length ? (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-base font-bold uppercase tracking-wide" style={{ backgroundColor: TABLE_HEADER, color: DECK_YELLOW }}>
                <th scope="col" className="w-1/3 px-4 py-3 text-center sm:w-64">Metric</th>
                <th scope="col" className="px-4 py-3 text-center">Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {terms.map((t) => (
                <tr key={t.term} className="align-top transition-colors hover:bg-muted/40">
                  <th scope="row" className="border-r px-4 py-3 text-left font-semibold">{t.term}</th>
                  <td className="space-y-2 px-4 py-3 italic leading-relaxed text-muted-foreground">
                    {t.definition.split('\n\n').map((p) => <p key={p.slice(0, 32)}>{p}</p>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No matching metrics" description="Try a different search." />
      )}
    </>
  );
}
