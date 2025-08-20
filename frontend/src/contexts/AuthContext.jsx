import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessExpiry, setAccessExpiry] = useState(null);

  // Fonction pour rafraîchir les données utilisateur
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setUser(prev => ({ 
          ...prev, 
          ...response.data.user,
          token // Conserver le token existant
        }));
        
        if (response.data.user.subscription?.expiryDate) {
          setAccessExpiry(new Date(response.data.user.subscription.expiryDate));
        }
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser(response.data.user);
          if (response.data.user.subscription?.expiryDate) {
            setAccessExpiry(new Date(response.data.user.subscription.expiryDate));
          }
        } catch (error) {
          console.error('Erreur de chargement utilisateur:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const validateAccessCode = async (accessCode) => {
    try {
      const response = await api.post('/auth/validate-access-code', { accessCode }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Rafraîchir les données après validation
      await refreshUserData();
      
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAccessExpiry(null);
  };

  const hasPremiumAccess = () => {
    if (!accessExpiry) return false;
    return new Date() < accessExpiry;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      accessExpiry,
      login,
      register,
      validateAccessCode,
      logout,
      hasPremiumAccess,
      refreshUserData // Intégré dans le contexte
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);