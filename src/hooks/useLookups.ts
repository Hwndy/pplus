import { useQuery } from '@tanstack/react-query';
import { companiesApi } from '@/api/companies';
import { parametersApi, publicationsApi, sentimentIndicatorsApi } from '@/api/reference';
import { usersApi } from '@/api/users';

/** Reference data changes rarely; share it across pages for a few minutes. */
const LOOKUP_STALE_TIME = 5 * 60 * 1000;

export const lookupKeys = {
  companies: ['lookups', 'companies'] as const,
  subsidiaries: ['lookups', 'subsidiaries'] as const,
  publications: ['lookups', 'publications'] as const,
  indicators: ['lookups', 'sentiment-indicators'] as const,
  supervisors: ['lookups', 'supervisors'] as const,
  roles: ['lookups', 'roles'] as const,
  parameter: (category: string) => ['lookups', 'parameter', category] as const,
};

export function useCompanies() {
  return useQuery({ queryKey: lookupKeys.companies, queryFn: companiesApi.all, staleTime: LOOKUP_STALE_TIME });
}

export function useSubsidiaries() {
  return useQuery({ queryKey: lookupKeys.subsidiaries, queryFn: companiesApi.subsidiaries, staleTime: LOOKUP_STALE_TIME });
}

export function usePublications() {
  return useQuery({ queryKey: lookupKeys.publications, queryFn: publicationsApi.all, staleTime: LOOKUP_STALE_TIME });
}

export function useSentimentIndicators() {
  return useQuery({ queryKey: lookupKeys.indicators, queryFn: sentimentIndicatorsApi.all, staleTime: LOOKUP_STALE_TIME });
}

export function useSupervisors(enabled = true) {
  return useQuery({ queryKey: lookupKeys.supervisors, queryFn: usersApi.supervisors, staleTime: LOOKUP_STALE_TIME, enabled });
}

export function useRoles() {
  return useQuery({ queryKey: lookupKeys.roles, queryFn: usersApi.roles, staleTime: LOOKUP_STALE_TIME });
}

/** Option values of a data-parameter category (industries, placements, reporters, …). */
export function useParameterOptions(category: string) {
  return useQuery({
    queryKey: lookupKeys.parameter(category),
    queryFn: () => parametersApi.values(category),
    staleTime: LOOKUP_STALE_TIME,
  });
}
