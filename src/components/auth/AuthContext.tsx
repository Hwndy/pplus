import { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export type UserRole = 'Admin' | 'Supervisor' |
'Analyst' | 'Client';

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
  const [user, setUser] = useState<User |
null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
         
setUser(userData);
        } catch (error) {
          console.error('Failed to parse saved user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } 
      setIsLoading(false);
    };

    checkAuth();
  }, []);
const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    console.log("In")
    try {
      const response = await fetch('https://pplus-tk49.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data || !data.token) {
        toast.error('Invalid response from server - missing token');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

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
      const token = localStorage.getItem('token');
      await fetch('https://pplus-tk49.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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