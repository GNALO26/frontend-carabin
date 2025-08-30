import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessExpiry, setAccessExpiry] = useState(null);

  // Fonction pour récupérer le token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Rafraîchir les données utilisateur
  const refreshUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log('Aucun token disponible pour le rafraîchissement');
        return;
      }

      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setUser(response.data.user);
        
        if (response.data.user.subscription?.expiryDate) {
          setAccessExpiry(new Date(response.data.user.subscription.expiryDate));
        }
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
      if (error.response?.status === 401) {
        // Token invalide ou expiré, déconnecter l'utilisateur
        logout();
      }
    }
  };

  // Charger l'utilisateur si token présent
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
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
          if (error.response?.status === 401) {
            logout();
          }
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
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  };

  // Inscription
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error.response?.data || { message: 'Erreur d\'inscription' };
    }
  };

  // Validation code d'accès
  const validateAccessCode = async (accessCode) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Token non disponible');
      }

      const response = await api.post('/auth/validate-access-code', { accessCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Rafraîchir les données après validation
      await refreshUserData();

      return response.data;
    } catch (error) {
      console.error('Erreur validation code:', error);
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
  if (!user) return false;
  
  // Vérifier l'abonnement avec les deux structures possibles
  if (user.subscriptionEnd) {
    return new Date() < new Date(user.subscriptionEnd);
  }
  if (user.subscription && user.subscription.expiryDate) 
    {
    return new Date() < new Date(user.subscription.expiryDate);
    }
  
  return user.isSubscribed === true;
};

  // Pendant chargement -> écran "loading"
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé within an AuthProvider');
  }
  return context;
};