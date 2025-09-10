import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);
      // Verify token validity
      introspectToken(savedToken).then((valid) => {
        if (valid) {
          // Extract user info from token or fetch from API
          setUser({ id: 'user-id', email: 'user@example.com' });
        } else {
          localStorage.removeItem('accessToken');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const introspectToken = async (token: string): Promise<boolean> => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.INTROSPECT, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.active;
    } catch (error) {
      return false;
    }
  };

  const login = async (email: string, password: string, totpCode?: string): Promise<void> => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        totp_code: totpCode
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('accessToken', access_token);
      
      // Set user info (in real app, would decode JWT or fetch user info)
      setUser({ id: 'user-id', email });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await axios.post(API_ENDPOINTS.AUTH.LOGOUT, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};