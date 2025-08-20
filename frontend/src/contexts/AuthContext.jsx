import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessExpiry, setAccessExpiry] = useState(null);

  // Rafraîchir les données utilisateur
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
          token // ✅ garder le token dans l'objet user
        }));

        if (response.data.user.subscription?.expiryDate) {
          setAccessExpiry(new Date(response.data.user.subscription.expiryDate));
        }
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
    }
  };

  // Charger l'utilisateur si token présent
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });

          setUser({ ...response.data.user, token }); // ✅ inclure token
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

  // Connexion
  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      setUser({ ...response.data.user, token: response.data.token }); // ✅ inclure token
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser({ ...response.data.user, token: response.data.token }); // ✅ inclure token
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur d’inscription' };
    }
  };

  // Validation code d'accès
  const validateAccessCode = async (accessCode) => {
    try {
      const response = await api.post('/auth/validate-access-code', { accessCode }, {
        headers: { Authorization: `Bearer ${user?.token}` } // ✅ sécurité
      });

      // Rafraîchir les données après validation
      await refreshUserData();

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur validation code' };
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAccessExpiry(null);
  };

  // Vérification accès premium
  const hasPremiumAccess = () => {
    if (!accessExpiry) return false;
    return new Date() < accessExpiry;
  };

  // Pendant chargement -> écran "loading"
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium">Chargement...</p>
      </div>
    );
  }

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
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
