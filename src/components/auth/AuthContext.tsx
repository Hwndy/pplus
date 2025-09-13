// import { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

// // --- TYPE DEFINITIONS (Unchanged) ---
// export type UserRole = 'Admin' | 'Supervisor' | 'Analyst' | 'Client';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar?: string;
//   status?: string;
//   mobileContact?: string;
//   countryCode?: string;
//   supervisorId?: string;
//   expirationDate?: string;
//   lastLogin?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (email: string, password:string) => Promise<void>;
//   logout: () => void;
// }

// // --- CONTEXT CREATION (Unchanged) ---
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   isAuthenticated: false,
//   isLoading: true,
//   login: async () => {},
//   logout: () => {},
// });

// // --- AUTH PROVIDER (Revised with Server-Side Validation) ---
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();
//   const API_BASE_URL = 'https://pplus-tk49.onrender.com/api';

//   const clearAuthData = useCallback(() => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//   }, []);

//   /**
//    * ✅ **NEW APPROACH:** On app load, this effect now validates the token by fetching the user's profile from the server.
//    * This is the most reliable way to confirm an active session.
//    */
//   useEffect(() => {
//     const validateSession = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         // Attempt to fetch profile with the stored token
//         const response = await fetch(`${API_BASE_URL}/auth/profile`, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         const result = await response.json();

//         if (response.ok && result.success) {
//           // Server confirmed the token is valid. Set the user state.
//           const userData = result.data;
//           setUser(userData);
//           // Refresh user data in local storage
//           localStorage.setItem('user', JSON.stringify(userData));
//         } else {
//           // Server rejected the token (expired, invalid, revoked).
//           throw new Error(result.message || "Session validation failed");
//         }
//       } catch (error) {
//         console.error("Session validation error:", error);
//         clearAuthData(); // Clear invalid session data
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     validateSession();
//   }, [clearAuthData]);

//   /**
//    * ✅ **CORRECTED:** The login function now correctly parses the specific structure of your API response.
//    */
//   const login = useCallback(async (email: string, password: string) => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const result = await response.json();
      
//       if (!response.ok || !result.success) {
//         throw new Error(result.message || 'Login failed');
//       }
      
//       const responseData = result.data;

//       // Extract token and user details from the response
//       const { token, ...userDetails } = responseData;
      
//       if (!token) {
//         throw new Error('Login successful, but no token was provided by the server.');
//       }
      
//       // Store data and update state
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(userDetails)); // Store the user part
//       setUser(userDetails);

//       toast.success(`Welcome back, ${userDetails.username || 'User'}!`);
//       navigate('/dashboard');

//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//       toast.error(`Login failed: ${errorMessage}`);
//       clearAuthData();
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   }, [navigate, clearAuthData]);

//   const logout = useCallback(async () => {
//     // Client-side logout is immediate
//     clearAuthData();
//     toast.info('You have been logged out.');
//     navigate('/');

//     // Attempt to inform the server in the background
//     const token = localStorage.getItem('token');
//     if (token) {
//       try {
//         await fetch(`${API_BASE_URL}/auth/logout`, {
//           method: 'POST',
//           headers: { 'Authorization': `Bearer ${token}` }
//         });
//       } catch (error) {
//         console.error('Server logout failed, but client is logged out.', error);
//       }
//     }
//   }, [navigate, clearAuthData]);

//   const contextValue = useMemo(() => ({
//     user,
//     isAuthenticated: !!user,
//     isLoading,
//     login,
//     logout
//   }), [user, isLoading, login, logout]);

//   return (
//     <AuthContext.Provider value={contextValue}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);

// import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

// // --- TYPE DEFINITIONS ---
// export type UserRole = 'Admin' | 'Supervisor' | 'Analyst' | 'Client';

// export interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   avatar?: string;
//   status?: string;
//   mobileContact?: string;
//   countryCode?: string;
//   supervisorId?: string;
//   expirationDate?: string;
//   lastLogin?: string;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }

// interface AuthContextType extends AuthState {
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// // --- REDUCER ---
// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   error: null,
// };

// const authReducer = (state: AuthState, action: any): AuthState => {
//   switch (action.type) {
//     case 'AUTH_START':
//       return { ...state, isLoading: true, error: null };
//     case 'AUTH_END':
//       return { ...state, isLoading: false };
//     case 'LOG_IN':
//       return {
//         ...state,
//         isAuthenticated: true,
//         user: action.payload.user,
//         token: action.payload.token,
//         isLoading: false,
//         error: null,
//       };
//     case 'LOG_OUT':
//       return {
//         ...state,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         isLoading: false,
//         error: null,
//       };
//     case 'AUTH_ERROR':
//       return {
//         ...state,
//         isAuthenticated: false,
//         user: null,
//         token: null,
//         isLoading: false,
//         error: action.payload.error,
//       };
//     default:
//       return state;
//   }
// };

// // --- CONTEXT CREATION ---
// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: true,
//   error: null,
//   login: async () => {},
//   logout: () => {},
// });

// // --- AUTH PROVIDER ---
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [state, dispatch] = useReducer(authReducer, initialState);
//   const navigate = useNavigate();
//   const API_BASE_URL = 'https://pplus-tk49.onrender.com/api';

//   const clearAuthData = useCallback(() => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     dispatch({ type: 'LOG_OUT' });
//   }, []);

//   // Validate session on mount
//   useEffect(() => {
//     const validateSession = async () => {
//       dispatch({ type: 'AUTH_START' });
//       const token = localStorage.getItem('token');
//       const userData = localStorage.getItem('user');

//       if (!token || !userData) {
//         dispatch({ type: 'AUTH_END' });
//         return;
//       }

//       try {
//         const response = await fetch(`${API_BASE_URL}/auth/me`, {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         const result = await response.json();

//         if (response.ok && result.success) {
//           const user = result.data;
//           dispatch({
//             type: 'LOG_IN',
//             payload: {
//               user,
//               token,
//             },
//           });
//           localStorage.setItem('user', JSON.stringify(user));
//         } else {
//           throw new Error(result.message || 'Session validation failed');
//         }
//       } catch (error) {
//         console.error('Session validation error:', error);
//         clearAuthData();
//         dispatch({
//           type: 'AUTH_ERROR',
//           payload: { error: 'Invalid or expired session. Please sign in again.' },
//         });
//         toast.error('Session expired. Please sign in again.');
//         if (window.location.pathname !== '/login') {
//           navigate('/login', { replace: true });
//         }
//       } finally {
//         dispatch({ type: 'AUTH_END' });
//       }
//     };

//     validateSession();
//   }, [navigate, clearAuthData]);

//   const login = useCallback(
//     async (email: string, password: string) => {
//       dispatch({ type: 'AUTH_START' });
//       try {
//         const response = await fetch(`${API_BASE_URL}/auth/login`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password }),
//         });

//         const result = await response.json();

//         if (!response.ok || !result.success) {
//           throw new Error(result.message || 'Login failed');
//         }

//         const { token, ...userDetails } = result.data;

//         if (!token) {
//           throw new Error('Login successful, but no token was provided by the server.');
//         }

//         localStorage.setItem('token', token);
//         localStorage.setItem('user', JSON.stringify(userDetails));

//         dispatch({
//           type: 'LOG_IN',
//           payload: {
//             user: userDetails,
//             token,
//           },
//         });

//         toast.success(`Welcome back, ${userDetails.name || 'User'}!`);
//         navigate('/dashboard');
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
//         dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
//         toast.error(`Login failed: ${errorMessage}`);
//         throw error;
//       } finally {
//         dispatch({ type: 'AUTH_END' });
//       }
//     },
//     [navigate]
//   );

//   const logout = useCallback(async () => {
//     dispatch({ type: 'AUTH_START' });
//     const token = localStorage.getItem('token');
//     clearAuthData();
//     toast.info('You have been logged out.');
//     navigate('/', { replace: true });

//     if (token) {
//       try {
//         await fetch(`${API_BASE_URL}/auth/logout`, {
//           method: 'POST',
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       } catch (error) {
//         console.error('Server logout failed, but client is logged out.', error);
//       }
//     }
//     dispatch({ type: 'AUTH_END' });
//   }, [navigate, clearAuthData]);

//   const contextValue = useMemo(
//     () => ({
//       ...state,
//       login,
//       logout,
//     }),
//     [state, login, logout]
//   );

//   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
// };

// // --- HOOK ---
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// --- TYPE DEFINITIONS ---
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

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isSessionValidated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// --- REDUCER ---
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isSessionValidated: false,
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
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: action.payload.error,
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
  login: async () => {},
  logout: () => {},
});

// --- AUTH PROVIDER ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const API_BASE_URL = 'https://pplus-tk49.onrender.com/api';

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOG_OUT' });
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
  }, [navigate, clearAuthData]);

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

        toast.success(`Welcome back, ${userDetails.name || 'User'}!`);
        navigate('/dashboard');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        dispatch({ type: 'AUTH_ERROR', payload: { error: errorMessage } });
        toast.error(`Login failed: ${errorMessage}`);
        throw error;
      } finally {
        dispatch({ type: 'AUTH_END' });
      }
    },
    [navigate]
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
    }),
    [state, login, logout]
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