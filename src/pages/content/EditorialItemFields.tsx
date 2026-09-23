import type { ReactNode } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { ComboboxField, SelectField, TextField, toOptions } from '@/components/common/FormFields';
import { useParameterOptions, usePublications, useSentimentIndicators } from '@/hooks/useLookups';
import { PARAMETER_CATEGORIES } from '@/api/reference';
import { SENTIMENT_OPTIONS, type EditorialItemValues } from './EditorialItemSchema';

interface EditorialItemFieldsProps<T extends FieldValues> {
  control: Control<T>;
  /** Path prefix of the item inside the form, e.g. `editorials.0.` (empty for a flat form). */
  prefix?: string;
}

function FieldGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </fieldset>
  );
}

/** Inputs for one editorial item; used by the create page and the edit dialog. */
export function EditorialItemFields<T extends FieldValues>({ control, prefix = '' }: EditorialItemFieldsProps<T>) {
  const name = (field: keyof EditorialItemValues) => `${prefix}${field}` as FieldPath<T>;
  const publications = usePublications();
  const indicators = useSentimentIndicators();
  const placement = useParameterOptions(PARAMETER_CATEGORIES.placement);
  const onlineChannel = useParameterOptions(PARAMETER_CATEGORIES.onlineChannel);
  const reporter = useParameterOptions(PARAMETER_CATEGORIES.reporter);
  const spokesperson = useParameterOptions(PARAMETER_CATEGORIES.spokesperson);
  const activities = useParameterOptions(PARAMETER_CATEGORIES.activities);
  const language = useParameterOptions(PARAMETER_CATEGORIES.language);
  const country = useParameterOptions(PARAMETER_CATEGORIES.country);
  const pageSize = useParameterOptions(PARAMETER_CATEGORIES.pageSize);
  const ceoThoughtLeadership = useParameterOptions(PARAMETER_CATEGORIES.ceoThoughtLeadership);

  return (
    <div className="space-y-6">
      <FieldGroup title="Coverage">
        <TextField control={control} name={name('title')} label="Title" required className="sm:col-span-2 lg:col-span-3" />
        <ComboboxField control={control} name={name('source')} label="Source / publication" allowCustom
          loading={publications.isLoading} options={toOptions(publications.data?.map((p) => p.name))} />
        <ComboboxField control={control} name={name('online_channel')} label="Online channel" allowCustom
          loading={onlineChannel.isLoading} options={toOptions(onlineChannel.data)} />
        <ComboboxField control={control} name={name('placement')} label="Placement" allowCustom
          loading={placement.isLoading} options={toOptions(placement.data)} />
        <ComboboxField control={control} name={name('activity')} label="Activity" allowCustom
          loading={activities.isLoading} options={toOptions(activities.data)} />
        <ComboboxField control={control} name={name('language')} label="Language" allowCustom
          loading={language.isLoading} options={toOptions(language.data)} />
        <ComboboxField control={control} name={name('country')} label="Country" allowCustom
          loading={country.isLoading} options={toOptions(country.data)} />
      </FieldGroup>

      <FieldGroup title="People">
        <ComboboxField control={control} name={name('reporter')} label="Reporter" allowCustom
          loading={reporter.isLoading} options={toOptions(reporter.data)} />
        <ComboboxField control={control} name={name('spokesperson')} label="Spokesperson" allowCustom
          loading={spokesperson.isLoading} options={toOptions(spokesperson.data)} />
        <ComboboxField control={control} name={name('ceo_thought_leadership')} label="CEO thought leadership" allowCustom
          loading={ceoThoughtLeadership.isLoading} options={toOptions(ceoThoughtLeadership.data)} />
      </FieldGroup>

      <FieldGroup title="Sentiment">
        <SelectField control={control} name={name('sentiment')} label="Sentiment" options={SENTIMENT_OPTIONS} />
        <ComboboxField control={control} name={name('sentiment_keyword_indicator_id')} label="Sentiment keyword indicator" numeric
          loading={indicators.isLoading}
          options={(indicators.data ?? []).map((i) => ({ value: String(i.id), label: `${i.keyword_indicator} (${i.classification})` }))} />
      </FieldGroup>

      <FieldGroup title="Print details">
        <ComboboxField control={control} name={name('page_size')} label="Page size" allowCustom
          loading={pageSize.isLoading} options={toOptions(pageSize.data)} />
        <TextField control={control} name={name('page_number')} label="Page number" />
        <TextField control={control} name={name('print_web_clips')} label="Print / web clips" />
      </FieldGroup>

      <FieldGroup title="Reach">
        <TextField control={control} name={name('audience_reach')} label="Audience reach" type="number" />
        <TextField control={control} name={name('advert_spend')} label="Advert spend" type="number" />
        <TextField control={control} name={name('circulation')} label="Circulation" type="number" />
      </FieldGroup>
    </div>
  );
}
