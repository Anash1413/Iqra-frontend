import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (token) {
        try {
          const userData = await api.getMe(token);
          setUser(userData);
        } catch (err) {
          console.error('Session expired:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const authData = await api.login(email, password);
      localStorage.setItem('token', authData.token);
      setToken(authData.token);
      setUser({
        _id: authData._id,
        name: authData.name,
        email: authData.email,
        role: authData.role
      });
      return authData;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
