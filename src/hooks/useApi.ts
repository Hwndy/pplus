import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/apiService';

// Generic API hook for data fetching
export function useApiData<T>(
  apiCall: () => Promise<{ data: T }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();

      // Handle the wrapped response structure
      // API returns: { data: { success: true, data: actualData }, error: null, status: 200 }
      if (response.data?.success && response.data?.data !== undefined) {
        setData(response.data.data);
      } else if (response.data) {
        // Fallback for direct data response
        setData(response.data);
      } else {
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Authentication hooks
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      // Handle wrapped response structure
      if (response.data?.success && response.data?.data?.user) {
        setUser(response.data.data.user);
      } else if (response.data?.user) {
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
      setUser(null);
      apiService.clearToken();
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      apiService.clearToken();
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProfile();
      // Handle wrapped response structure
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        return response.data.data;
      } else if (response.data) {
        setUser(response.data);
        return response.data;
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
    if (token) {
      getProfile();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    getProfile,
    isAuthenticated: !!user,
  };
}

// Users hooks
export function useUsers(params?: Record<string, any>) {
  return useApiData(() => apiService.getUsers(params), [params]);
}

export function useUser(id: string) {
  return useApiData(() => apiService.getUserById(id), [id]);
}

export function useSupervisors() {
  return useApiData(() => apiService.getSupervisors(), []);
}

// Companies hooks
export function useCompanies(params?: Record<string, any>) {
  return useApiData(() => apiService.getCompanies(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.isActive,
    params?.industry
  ]);
}

export function useCompany(id: string) {
  return useApiData(() => apiService.getCompanyById(id), [id]);
}

export function useCompanySearch(query: string, limit?: number) {
  return useApiData(() => apiService.searchCompanies(query, limit), [query, limit]);
}

// Publications hooks
export function usePublications(params?: Record<string, any>) {
  return useApiData(() => apiService.getPublications(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.type,
    params?.country,
    params?.isActive
  ]);
}

export function usePublication(id: string) {
  return useApiData(() => apiService.getPublicationById(id), [id]);
}

// Media Channels hooks
export function useMediaChannels(params?: Record<string, any>) {
  return useApiData(() => apiService.getMediaChannels(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.type,
    params?.category,
    params?.isActive
  ]);
}

export function useMediaChannel(id: string) {
  return useApiData(() => apiService.getMediaChannelById(id), [id]);
}

// Data Parameters hooks
export function useDataParameters(params?: Record<string, any>) {
  return useApiData(() => apiService.getDataParameters(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.category,
    params?.isActive
  ]);
}

export function useDataParameter(id: string) {
  return useApiData(() => apiService.getDataParameterById(id), [id]);
}

// Data Entries hooks
export function useDataEntries(params?: Record<string, any>) {
  return useApiData(() => apiService.getDataEntries(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.companyId,
    params?.parameterId,
    params?.channelId,
    params?.status,
    params?.analystId,
    params?.startDate,
    params?.endDate
  ]);
}

export function useDataEntry(id: string) {
  return useApiData(() => apiService.getDataEntryById(id), [id]);
}

// Editorials hooks
export function useEditorials(params?: Record<string, any>) {
  return useApiData(() => apiService.getEditorials(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.companyId,
    params?.publicationId,
    params?.mediaType,
    params?.sentiment,
    params?.status,
    params?.analystId,
    params?.startDate,
    params?.endDate
  ]);
}

export function useEditorial(id: string) {
  return useApiData(() => apiService.getEditorialById(id), [id]);
}

// SWOT Analysis hooks
export function useSwotAnalyses(params?: Record<string, any>) {
  return useApiData(() => apiService.getSwotAnalyses(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.companyId,
    params?.analystId
  ]);
}

export function useSwotAnalysis(id: string) {
  return useApiData(() => apiService.getSwotAnalysisById(id), [id]);
}

// Daily Mentions hooks
export function useDailyMentions(params?: Record<string, any>) {
  return useApiData(() => apiService.getDailyMentions(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.companyId,
    params?.date,
    params?.analystId
  ]);
}

export function useDailyMention(id: string) {
  return useApiData(() => apiService.getDailyMentionById(id), [id]);
}

// Analytics hooks
export function useDashboardSummary(params?: Record<string, any>) {
  return useApiData(() => apiService.getDashboardSummary(params), [
    params?.startDate,
    params?.endDate,
    params?.companyId
  ]);
}

export function useMentionsTrend(params?: Record<string, any>) {
  return useApiData(() => apiService.getMentionsTrend(params), [
    params?.startDate,
    params?.endDate,
    params?.companyId,
    params?.period
  ]);
}

export function useSentimentAnalysis(params?: Record<string, any>) {
  return useApiData(() => apiService.getSentimentAnalysis(params), [
    params?.startDate,
    params?.endDate,
    params?.companyId
  ]);
}

export function useMediaChannelAnalysis(params?: Record<string, any>) {
  return useApiData(() => apiService.getMediaChannelAnalysis(params), [
    params?.startDate,
    params?.endDate,
    params?.companyId
  ]);
}

export function useCompanyComparison(params?: Record<string, any>) {
  return useApiData(() => apiService.getCompanyComparison(params), [
    params?.companyIds,
    params?.startDate,
    params?.endDate
  ]);
}

// File management hooks
export function useFiles(params?: Record<string, any>) {
  return useApiData(() => apiService.getFiles(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.type
  ]);
}

export function useFile(id: string) {
  return useApiData(() => apiService.getFileById(id), [id]);
}

// Audit logs hooks
export function useAuditLogs(params?: Record<string, any>) {
  return useApiData(() => apiService.getAuditLogs(params), [
    params?.page,
    params?.limit,
    params?.search,
    params?.action,
    params?.userId,
    params?.startDate,
    params?.endDate
  ]);
}

export function useAuditLogStats(params?: Record<string, any>) {
  return useApiData(() => apiService.getAuditLogStats(params), [
    params?.startDate,
    params?.endDate
  ]);
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
      if (response.data?.success && response.data?.data !== undefined) {
        return response.data.data;
      } else if (response.data) {
        // Fallback for direct data response
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
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

export function useFileUpload() {
  return useApiMutation((file: File) => apiService.uploadFile(file));
}

export function usePasswordReset() {
  const forgotPassword = useApiMutation((email: string) => apiService.forgotPassword(email));
  const resetPassword = useApiMutation(({ token, newPassword }: { token: string; newPassword: string }) => 
    apiService.resetPassword(token, newPassword)
  );

  return { forgotPassword, resetPassword };
}
