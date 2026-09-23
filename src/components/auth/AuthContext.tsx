import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { fetchMonitoringPairs } from '@/api/reports';
import { ApiError, setUnauthorizedHandler, tokenStore } from '@/lib/api-client';
import { roleOf } from '@/lib/roles';
import type { MonitoringPair, User } from '@/types/api';

const ACTIVE_PAIR_KEY = 'pplus.activePairId';

/** Thrown by `login` when the account must set a new password before signing in. */
export class PasswordChangeRequiredError extends Error {
  readonly email: string;
  constructor(email: string, message: string) {
    super(message);
    this.email = email;
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Client monitoring pairs (empty for staff). */
  monitoringPairs: MonitoringPair[];
  activePair: MonitoringPair | null;
  setActivePair: (pair: MonitoringPair) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monitoringPairs, setMonitoringPairs] = useState<MonitoringPair[]>([]);
  const [activePair, setActivePairState] = useState<MonitoringPair | null>(null);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setMonitoringPairs([]);
    setActivePairState(null);
    queryClient.clear();
  }, [queryClient]);

  const loadPairs = useCallback(async (profile: User) => {
    if (roleOf(profile) !== 'Client') return;
    const pairs = await fetchMonitoringPairs().catch(() => []);
    setMonitoringPairs(pairs);
    const savedId = Number(localStorage.getItem(ACTIVE_PAIR_KEY));
    const preferred = pairs.find((p) => p.pair_id === savedId)
      ?? pairs.find((p) => !p.is_expired)
      ?? pairs[0]
      ?? null;
    setActivePairState(preferred);
  }, []);

  const loadProfile = useCallback(async () => {
    const profile = await authApi.me();
    setUser(profile);
    await loadPairs(profile);
    return profile;
  }, [loadPairs]);

  // Restore the session on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.get()) {
        setIsLoading(false);
        return;
      }
      try {
        await loadProfile();
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadProfile, clearSession]);

  // Any 401 from the API (expired/revoked token) ends the session.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await authApi.login(email, password);
      tokenStore.set(result.token);
      return await loadProfile();
    } catch (error) {
      const data = error instanceof ApiError ? (error.data as { requires_password_change?: boolean; email?: string } | null) : null;
      if (data?.requires_password_change) {
        throw new PasswordChangeRequiredError(data.email ?? email, (error as Error).message);
      }
      throw error;
    }
  }, [loadProfile]);

  const logout = useCallback(async () => {
    try {
      if (tokenStore.get()) await authApi.logout();
    } catch {
      // The session is cleared locally regardless.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  const setActivePair = useCallback((pair: MonitoringPair) => {
    localStorage.setItem(ACTIVE_PAIR_KEY, String(pair.pair_id));
    setActivePairState(pair);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    refreshUser,
    monitoringPairs,
    activePair,
    setActivePair,
  }), [user, isLoading, login, logout, refreshUser, monitoringPairs, activePair, setActivePair]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
