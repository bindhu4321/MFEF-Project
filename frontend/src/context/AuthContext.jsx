import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('sbfms_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('sbfms_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('sbfms_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success) {
      setUser(data.user);
      setToken(data.token);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUserData = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        updateUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

