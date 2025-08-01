import { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiService } from '@/services/apiService';

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

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Since there's no profile endpoint, use saved user data
          const userData = JSON.parse(savedUser);
          apiService.setToken(token);
          setUser(userData);
        } catch (error) {
          console.error('Failed to parse saved user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          apiService.clearToken();
        }
      } else if (token) {
        // Token exists but no user data, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        apiService.clearToken();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    console.log("In")
    try {
      const response = await apiService.login(email, password);
      // Your API returns user info directly in `data` with a `token` field
      const userData = response;
      console.log(userData);

      if(response.error){
        if(Array.isArray(response.error) && response.error?.length){
          console.log(response.error)
          toast.error(response.error[0]?.message);
        }else{
          toast.error(response.error);
        }
      }

      const data = response.data;
      console.log('Login data:', data);

      if (!data || !data.token) {
        toast.error('Invalid response from server - missing token');
        return;
      }






      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user || data));

      // Set token in apiService
      apiService.setToken(data.token);
      setUser(data.user || (data as User));

      toast.success(`Welcome back, ${data.user?.name || data.user?.email || 'User'}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Login failed: ' + errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      apiService.clearToken();
      toast.info('You have been logged out');
      navigate('/');
    }
  }, [navigate]);

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
