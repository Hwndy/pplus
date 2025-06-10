
import { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

// Define our user types to match API
export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'ANALYST' | 'CLIENT';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

// No demo users - using real API

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in the API service
          apiService.setToken(token);

          // Verify the token by getting user profile
          const response = await apiService.getProfile();
          // Handle the wrapped response structure
          if (response.data?.success && response.data?.data) {
            setUser(response.data.data);
          } else if (response.data) {
            // Fallback for direct data response
            setUser(response.data);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          apiService.clearToken();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function - memoized to prevent unnecessary re-renders
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Use real API for authentication
      const response = await apiService.login(email, password);

      // Check if the response has the expected structure
      // Backend returns: { success: true, data: { user, token, refreshToken } }
      // API utility wraps it as: { data: { success: true, data: { user, token, refreshToken } }, error: null, status: 200 }
      if (response.data?.success && response.data?.data?.token && response.data?.data?.user) {
        const loginData = response.data.data;

        // Store token and user data
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));

        // Set token in API service for future requests
        apiService.setToken(loginData.token);

        // Update user state
        setUser(loginData.user);

        toast.success(`Welcome back, ${loginData.user.name}!`);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Login failed: ' + errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Logout function - memoized to prevent unnecessary re-renders
  const logout = useCallback(async () => {
    try {
      // Call logout API
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiService.clearToken();
      toast.info('You have been logged out');
      navigate('/');
    }
  }, [navigate]);

  // Memoize the context value to prevent unnecessary re-renders
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

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);
