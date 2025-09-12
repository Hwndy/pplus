import { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- TYPE DEFINITIONS (Unchanged) ---
export type UserRole = 'Admin' | 'Supervisor' | 'Analyst' | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password:string) => Promise<void>;
  logout: () => void;
}

// --- CONTEXT CREATION (Unchanged) ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

// --- AUTH PROVIDER (Revised with Server-Side Validation) ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://pplus-tk49.onrender.com/api';

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  /**
   * ✅ **NEW APPROACH:** On app load, this effect now validates the token by fetching the user's profile from the server.
   * This is the most reliable way to confirm an active session.
   */
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Attempt to fetch profile with the stored token
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          // Server confirmed the token is valid. Set the user state.
          const userData = result.data;
          setUser(userData);
          // Refresh user data in local storage
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // Server rejected the token (expired, invalid, revoked).
          throw new Error(result.message || "Session validation failed");
        }
      } catch (error) {
        console.error("Session validation error:", error);
        clearAuthData(); // Clear invalid session data
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [clearAuthData]);

  /**
   * ✅ **CORRECTED:** The login function now correctly parses the specific structure of your API response.
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
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
      
      const responseData = result.data;

      // Extract token and user details from the response
      const { token, ...userDetails } = responseData;
      
      if (!token) {
        throw new Error('Login successful, but no token was provided by the server.');
      }
      
      // Store data and update state
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDetails)); // Store the user part
      setUser(userDetails);

      toast.success(`Welcome back, ${userDetails.username || 'User'}!`);
      navigate('/dashboard');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Login failed: ${errorMessage}`);
      clearAuthData();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, clearAuthData]);

  const logout = useCallback(async () => {
    // Client-side logout is immediate
    clearAuthData();
    toast.info('You have been logged out.');
    navigate('/');

    // Attempt to inform the server in the background
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Server logout failed, but client is logged out.', error);
      }
    }
  }, [navigate, clearAuthData]);

  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);