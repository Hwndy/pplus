import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { apiService, QueryParams } from '@/services/apiService';

// Generic type for paginated responses
type PaginatedResponse<T> = {
  filter(arg0: (u: any) => boolean): unknown;
  filter(arg0: (u: any) => boolean): unknown;
  length: number;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// Completely rewritten & robust API data fetching hook
export function useApiData<T>(
  apiCall: () => Promise<any>, // We accept any response shape
  dependencies: any[] = [],
  _options: {
    enableAutoRefresh?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const apiCallRef = useRef(apiCall);
  apiCallRef.current = apiCall;

  const depsRef = useRef<any[]>([]);
  const mountedRef = useRef(false);

  const depsChanged = useMemo(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      depsRef.current = [...dependencies];
      return true;
    }

    const changed =
      depsRef.current.length !== dependencies.length ||
      depsRef.current.some((dep, i) => dep !== dependencies[i]);

    if (changed) depsRef.current = [...dependencies];
    return changed;
  }, [dependencies]);

  const fetchData = useCallback(
    async (force = false) => {
      try {
        const now = Date.now();
        if (!force && now - lastFetch < 3000) return;

        setLoading(true);
        setError(null);

        const response = await apiCallRef.current();

        // ──────── ROBUST RESPONSE NORMALIZATION ────────
        let payload = response;

        // Step 1: Handle double-wrapped responses
        // { success: true, data: { data: [...], pagination: {...} } }
        if (payload?.data && payload.data.data !== undefined) {
          payload = payload.data;
        }

        // Step 2: Normalize to consistent shape
        let normalized: T;

        if (payload && typeof payload === 'object') {
          if (Array.isArray(payload.data)) {
            // Paginated list → { data: [...], pagination: {...} }
            normalized = payload as T;
          } else if (Array.isArray(payload)) {
            // Rare: plain array without wrapper
            normalized = { data: payload } as T;
          } else {
            // Single object or already correct shape
            normalized = payload as T;
          }
        } else {
          normalized = payload as T;
        }

        setData(normalized);
        // ──────── END NORMALIZATION ────────

        setLastFetch(now);
      } catch (err) {
        console.error('API fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [lastFetch]
  );

  useEffect(() => {
    if (depsChanged) {
      fetchData(true);
    }
  }, [depsChanged, fetchData]);

  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastFetch: new Date(lastFetch),
  };
}

// ────────────────────────────── AUTH ──────────────────────────────
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch {}
    setUser(null);
    apiService.clearToken();
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      setUser(null);
      apiService.clearToken();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) getProfile();
    else setLoading(false);
  }, []);

  return { user, loading, login, logout, getProfile, isAuthenticated: !!user };
}



export function useUsers(params?: Record<string, any>) {
  const deps = [
    String(params?.page ?? 1),
    String(params?.limit ?? 10),
    String(params?.search ?? ''),
    String(params?.role ?? ''),
    String(params?.status ?? ''),
    String(params?.isActive ?? ''),
  ];

  return useApiData<PaginatedResponse<any>>(
    () => apiService.getUsers(params),
    deps
  );
}

export function useUser(id: string) {
  return useApiData(() => apiService.getUserById(id), [id]);
}

export function useSupervisors() {
  return useApiData(() => apiService.getSupervisors(), []);
}

// Companies hooks
export function useCompanies(params?: QueryParams, options?: { enableAutoRefresh?: boolean; refreshInterval?: number }) {
  // Create stable dependency array
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.isActive || ''),
    String(params?.industry || '')
  ];

  return useApiData(
    () => apiService.getCompanies(params),
    deps,
    {
      enableAutoRefresh: options?.enableAutoRefresh || false,
      refreshInterval: options?.refreshInterval || 1200000 // 20 minutes default
    }
  );
}

export function useCompany(id: string) {
  return useApiData(() => apiService.getCompanyById(id), [id]);
}

export function useCompanySearch(query: string, limit?: number) {
  return useApiData(() => apiService.searchCompanies(query, limit), [query, String(limit || '')]);
}

// Publications hooks
export function usePublications(params?: QueryParams, options?: { enableAutoRefresh?: boolean; refreshInterval?: number }) {
  // Create stable dependency array
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.type || ''),
    String(params?.country || ''),
    String(params?.isActive || '')
  ];

  return useApiData(
    () => apiService.getPublications(params),
    deps,
    {
      enableAutoRefresh: false, // DISABLED
      refreshInterval: options?.refreshInterval || 900000
    }
  );
}

export function usePublication(id: string) {
  return useApiData(() => apiService.getPublicationById(id), [id]);
}

// Media Channels hooks
export function useMediaChannels(params?: Record<string, any>) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.type || ''),
    String(params?.category || ''),
    String(params?.isActive || '')
  ];

  return useApiData(() => apiService.getMediaChannels(params), deps, {
    enableAutoRefresh: false
  });
}

export function useMediaChannel(id: string) {
  return useApiData(() => apiService.getMediaChannelById(id), [id]);
}

// Data Parameters hooks
export function useDataParameters(params?: Record<string, any>) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.category || ''),
    String(params?.isActive || '')
  ];

  return useApiData(() => apiService.getDataParameters(params), deps, {
    enableAutoRefresh: false
  });
}

export function useDataParameter(id: string) {
  return useApiData(() => apiService.getDataParameterById(id), [id]);
}

// Data Entries hooks
export function useDataEntries(params?: QueryParams, options?: { enableAutoRefresh?: boolean; refreshInterval?: number }) {
  // Create stable dependency array
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.companyId || ''),
    String(params?.parameterId || ''),
    String(params?.channelId || ''),
    String(params?.status || ''),
    String(params?.analystId || ''),
    String(params?.startDate || ''),
    String(params?.endDate || '')
  ];

  return useApiData(
    () => apiService.getDataEntries(params),
    deps,
    {
      enableAutoRefresh: false, // DISABLED
      refreshInterval: options?.refreshInterval || 900000
    }
  );
}

export function useDataEntry(id: string) {
  return useApiData(() => apiService.getDataEntryById(id), [id]);
}

// Editorials hooks
export function useEditorials(params?: QueryParams, options?: { enableAutoRefresh?: boolean; refreshInterval?: number }) {
  // Create stable dependency array
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.companyId || ''),
    String(params?.publicationId || ''),
    String(params?.mediaType || ''),
    String(params?.sentiment || ''),
    String(params?.status || ''),
    String(params?.analystId || ''),
    String(params?.startDate || ''),
    String(params?.endDate || '')
  ];

  return useApiData(
    () => apiService.getEditorials(params),
    deps,
    {
      enableAutoRefresh: false, // DISABLED
      refreshInterval: options?.refreshInterval || 900000
    }
  );
}

export function useEditorial(id: string) {
  return useApiData(() => apiService.getEditorialById(id), [id]);
}

// SWOT Analysis hooks
export function useSwotAnalyses(params?: Record<string, any>) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.companyId || ''),
    String(params?.analystId || '')
  ];

  return useApiData(() => apiService.getSwotAnalyses(params), deps, {
    enableAutoRefresh: false
  });
}

export function useSwotAnalysis(id: string) {
  return useApiData(() => apiService.getSwotAnalysisById(id), [id]);
}

// Daily Mentions hooks
export function useDailyMentions(params?: QueryParams, options?: { enableAutoRefresh?: boolean; refreshInterval?: number }) {
  // Create stable dependency array
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.companyId || ''),
    String(params?.date || ''),
    String(params?.analystId || '')
  ];

  return useApiData(
    () => apiService.getDailyMentions(params),
    deps,
    {
      enableAutoRefresh: false, // DISABLED
      refreshInterval: options?.refreshInterval || 900000
    }
  );
}

export function useDailyMention(id: string) {
  return useApiData(() => apiService.getDailyMentionById(id), [id]);
}

// Analytics hooks
export function useDashboardSummary(params?: Record<string, any>) {
  const deps = [
    String(params?.startDate || ''),
    String(params?.endDate || ''),
    String(params?.companyId || '')
  ];

  return useApiData(() => apiService.getDashboardSummary(params), deps, {
    enableAutoRefresh: false
  });
}

export function useMentionsTrend(params?: Record<string, any>) {
  const deps = [
    String(params?.startDate || ''),
    String(params?.endDate || ''),
    String(params?.companyId || ''),
    String(params?.period || '')
  ];

  return useApiData(() => apiService.getMentionsTrend(params), deps, {
    enableAutoRefresh: false
  });
}

export function useSentimentAnalysis(params?: Record<string, any>) {
  const deps = [
    String(params?.startDate || ''),
    String(params?.endDate || ''),
    String(params?.companyId || '')
  ];

  return useApiData(() => apiService.getSentimentAnalysis(params), deps, {
    enableAutoRefresh: false
  });
}

export function useMediaChannelAnalysis(params?: Record<string, any>) {
  const deps = [
    String(params?.startDate || ''),
    String(params?.endDate || ''),
    String(params?.companyId || '')
  ];

  return useApiData(() => apiService.getMediaChannelAnalysis(params), deps, {
    enableAutoRefresh: false
  });
}

export function useCompanyComparison(params?: QueryParams) {
  const deps = [
    String(params?.companyIds || ''),
    String(params?.startDate || ''),
    String(params?.endDate || '')
  ];

  return useApiData(() => apiService.getCompanyComparison(params), deps, {
    enableAutoRefresh: false
  });
}

// File management hooks
export function useFiles(params?: QueryParams) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.type || '')
  ];

  return useApiData(() => apiService.getFiles(params), deps, {
    enableAutoRefresh: false
  });
}

export function useFile(id: string) {
  return useApiData(() => apiService.getFileById(id), [id]);
}

// Audit logs hooks
export function useAuditLogs(params?: QueryParams) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.action || ''),
    String(params?.userId || ''),
    String(params?.startDate || ''),
    String(params?.endDate || '')
  ];

  return useApiData(() => apiService.getAuditLogs(params), deps, {
    enableAutoRefresh: false
  });
}

export function useAuditLogStats(params?: Record<string, any>) {
  const deps = [
    String(params?.startDate || ''),
    String(params?.endDate || '')
  ];

  return useApiData(() => apiService.getAuditLogsStats(), deps, {
    enableAutoRefresh: false
  });
}

// Mutation hooks for create/update/delete operations
export function useApiMutation<T, P>(
  apiCall: (params: P) => Promise<{ data: T }>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (params: P): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall(params);

      // Handle the wrapped response structure
      if (response && typeof response === 'object' && 'data' in response) {
        const apiResponse = response as any;
        if (apiResponse.success && apiResponse.data !== undefined) {
          return apiResponse.data;
        } else if (apiResponse.data !== undefined) {
          return apiResponse.data;
        }
      }

      // Fallback for direct response
      return response as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Specific mutation hooks
export function useCreateUser() {
  return useApiMutation((userData: any) => apiService.createUser(userData));
}

export function useUpdateUser() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    apiService.updateUser(id, data)
  );
}

export function useDeleteUser() {
  return useApiMutation((id: string) => apiService.deleteUser(id));
}

export function useCreateCompany() {
  return useApiMutation((companyData: any) => apiService.createCompany(companyData));
}

export function useUpdateCompany() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    apiService.updateCompany(id, data)
  );
}

export function useDeleteCompany() {
  return useApiMutation((id: string) => apiService.deleteCompany(id));
}

export function useCreatePublication() {
  return useApiMutation((publicationData: any) => apiService.createPublication(publicationData));
}

export function useUpdatePublication() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    apiService.updatePublication(id, data)
  );
}

export function useDeletePublication() {
  return useApiMutation((id: string) => apiService.deletePublication(id));
}

export function useCreateEditorial() {
  return useApiMutation((editorialData: any) => apiService.createEditorial(editorialData));
}

export function useUpdateEditorial() {
  return useApiMutation(({ id, data }: { id: string; data: any }) => 
    apiService.updateEditorial(id, data)
  );
}

export function useDeleteEditorial() {
  return useApiMutation((id: string) => apiService.deleteEditorial(id));
}

// SWOT Analysis mutation hooks
export function useCreateSwotAnalysis() {
  return useApiMutation((swotData: any) => apiService.createSwotAnalysis(swotData));
}

export function useUpdateSwotAnalysis() {
  return useApiMutation(({ id, data }: { id: string; data: any }) =>
    apiService.updateSwotAnalysis(id, data)
  );
}

export function useDeleteSwotAnalysis() {
  return useApiMutation((id: string) => apiService.deleteSwotAnalysis(id));
}

export function useSwotAnalysisById(id: string) {
  return useApiData(() => apiService.getSwotAnalysisById(id), [id]);
}

// Outcome Insights mutation hooks
export function useOutcomeInsights(params?: Record<string, any>) {
  const deps = [
    String(params?.page || 1),
    String(params?.limit || 10),
    String(params?.search || ''),
    String(params?.companyId || ''),
  ];

  return useApiData(() => apiService.getOutcomeInsights(params), deps, {
    enableAutoRefresh: false
  });
}

export function useCreateOutcomeInsight() {
  return useApiMutation((outcomeData: any) => apiService.createOutcomeInsight(outcomeData));
}

export function useUpdateOutcomeInsight() {
  return useApiMutation(({ id, data }: { id: string; data: any }) =>
    apiService.updateOutcomeInsight(id, data)
  );
}

export function useDeleteOutcomeInsight() {
  return useApiMutation((id: string) => apiService.deleteOutcomeInsight(id));
}

export function useOutcomeInsightById(id: string) {
  return useApiData(() => apiService.getOutcomeInsightById(id), [id]);
}

export function useFileUpload() {
  return useApiMutation((file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.uploadFile(formData);
  });
}

// Note: Password reset endpoints don't exist on backend yet
export function usePasswordReset() {
  const forgotPassword = useApiMutation((_email: string) => {
    // Placeholder - endpoint doesn't exist yet
    return Promise.reject(new Error('Forgot password endpoint not implemented'));
  });
  const resetPassword = useApiMutation(({ token: _token, newPassword: _newPassword }: { token: string; newPassword: string }) => {
    // Placeholder - endpoint doesn't exist yet
    return Promise.reject(new Error('Reset password endpoint not implemented'));
  });

  return { forgotPassword, resetPassword };
}
