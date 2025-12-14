import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- TYPE DEFINITIONS ---
export type UserRole = 'Admin' | 'Supervisor' | 'Analyst' | 'Client';

export interface Role {
  name: UserRole;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  avatar?: string;
  status?: string;
  mobileContact?: string;
  countryCode?: string;
  supervisorId?: string;
  expirationDate?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonitoringPair {
  pair_id: number;
  pair_number: number;

  base_company: {
    id: number;
    company_name: string;
    industry: string;
    sub_industry: string;
  };

  competitors: Array<{
    id: number;
    company_name: string;
  }>;

  subsidiaries: Array<any>;

  media_prominence: string[];
  monitoring_date: string;
  is_expired: boolean;
  status: 'active' | 'expired';

  summary: {
    total_competitors: number;
    total_subsidiaries: number;
    total_companies_monitored: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSessionValidated: boolean;
  monitoringPairs: MonitoringPair[];
  activePair: MonitoringPair | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setActivePair: (pair: MonitoringPair) => void;
  loadMonitoringPairs: () => Promise<void>;
}

// --- REDUCER ---
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isSessionValidated: false,
  monitoringPairs: [],
  activePair: null,
};

const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_END':
      return { ...state, isLoading: false, isSessionValidated: action.payload?.isSessionValidated || false };
    case 'LOG_IN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOG_OUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
        monitoringPairs: [],
        activePair: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload.error,
        monitoringPairs: [],
        activePair: null,
      };
    case 'SET_MONITORING_PAIRS':
      return {
        ...state,
        monitoringPairs: action.payload,
        activePair: action.payload[0] || null,
      };
    case 'SET_ACTIVE_PAIR':
      return {
        ...state,
        activePair: action.payload,
      };
    default:
      return state;
  }
};

// --- CONTEXT CREATION ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isSessionValidated: false,
  monitoringPairs: [],
  activePair: null,
  login: async () => {},
  logout: () => {},
  setActivePair: () => {},
  loadMonitoringPairs: async () => {},
});

// --- AUTH PROVIDER ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://pplus-ipn6.onrender.com/api';

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activePairId');
    dispatch({ type: 'LOG_OUT' });
  }, []);

  const loadMonitoringPairs = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/report/monitoring-pairs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const pairs: MonitoringPair[] = result.data.pairs.map((p: any) => ({
        pair_id: p.pair_id,
        pair_number: p.pair_number,
        base_company: {
          id: p.base_company.id,
          company_name: p.base_company.company_name.trim(),
          industry: p.base_company.industry.trim(),
          sub_industry: p.base_company.sub_industry.trim(),
        },
        competitors: p.competitors || [],
        subsidiaries: p.subsidiaries || [],
        media_prominence: p.media_prominence || [],
        monitoring_date: p.monitoring_date,
        is_expired: p.is_expired,
        status: p.status,
        summary: {
          total_competitors: p.summary.total_competitors,
          total_subsidiaries: p.summary.total_subsidiaries,
          total_companies_monitored: p.summary.total_companies_monitored,
        },
      }));

        dispatch({ type: 'SET_MONITORING_PAIRS', payload: pairs });

        // Restore last selected pair from localStorage
        const savedPairId = localStorage.getItem('activePairId');
        const savedPair = pairs.find(p => p.pair_id === Number(savedPairId));
        if (savedPair) {
          dispatch({ type: 'SET_ACTIVE_PAIR', payload: savedPair });
        } else if (pairs.length > 0) {
          localStorage.setItem('activePairId', String(pairs[0].pair_id));
        }
      }
    } catch (error) {
      console.error('Failed to load monitoring pairs:', error);
      toast.error('Could not load your monitoring companies');
    }
  }, []);

  const setActivePair = useCallback((pair: MonitoringPair) => {
    dispatch({ type: 'SET_ACTIVE_PAIR', payload: pair });
    localStorage.setItem('activePairId', String(pair.pair_id));
    toast.success(`Switched to ${pair.base_company.company_name}`);
  }, []);

  // Validate session on mount
  useEffect(() => {
    const validateSession = async () => {
      dispatch({ type: 'AUTH_START' });
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token || !userData) {
        dispatch({ type: 'AUTH_END', payload: { isSessionValidated: true } });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const user = result.data;
          dispatch({
            type: 'LOG_IN',
            payload: {
              user,
              token,
            },
          });
          localStorage.setItem('user', JSON.stringify(user));

          // Load monitoring pairs after successful session
          await loadMonitoringPairs();
        } else {
          throw new Error(result.message || 'Session validation failed');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        clearAuthData();
        dispatch({
          type: 'AUTH_ERROR',
          payload: { error: 'Invalid or expired session. Please sign in again.' },
        });
        toast.error('Session expired. Please sign in again.');
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } finally {
        dispatch({ type: 'AUTH_END', payload: { isSessionValidated: true } });
      }
    };

    validateSession();
  }, [navigate, clearAuthData, loadMonitoringPairs]);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch({ type: 'AUTH_START' });
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Login failed');
        }

        const { token, ...userDetails } = result.data;

        if (!token) {
          throw new Error('Login successful, but no token was provided by the server.');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userDetails));

        dispatch({
          type: 'LOG_IN',
          payload: {
            user: userDetails,
            token,
          },
        });

        toast.success(`Welcome back, ${userDetails.username || 'User'}!`);
        navigate('/dashboard');

        // Load monitoring pairs after login
        await loadMonitoringPairs();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
        toast.error(`Login failed: ${errorMessage}`);
        throw error;
      } finally {
        dispatch({ type: 'AUTH_END' });
      }
    },
    [navigate, loadMonitoringPairs]
  );

  const logout = useCallback(async () => {
    dispatch({ type: 'AUTH_START' });
    const token = localStorage.getItem('token');
    clearAuthData();
    toast.info('You have been logged out.');
    navigate('/', { replace: true });

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error('Server logout failed, but client is logged out.', error);
      }
    }
    dispatch({ type: 'AUTH_END' });
  }, [navigate, clearAuthData]);

  const contextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      setActivePair,
      loadMonitoringPairs,
    }),
    [state, login, logout, setActivePair, loadMonitoringPairs]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// --- HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};