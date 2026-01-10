import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;
  role: 'admin' | 'manager';
  exp: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: 'admin' | 'manager' | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'manager' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUsername(decoded.sub);
          setRole(decoded.role);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      setIsAuthenticated(true);
      setUsername(decoded.sub);
      setRole(decoded.role);
      localStorage.setItem('user_role', decoded.role);
      localStorage.setItem('username', decoded.sub);
    } catch {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
