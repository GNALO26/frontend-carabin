import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useIsMounted } from '../hooks';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Vérifier la validité du token
          const response = await API.get('/auth/me');
          if (isMounted.current) {
            setUser(response.data.user);
            setAuthError(null);
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          if (isMounted.current) {
            setAuthError('Session expirée. Veuillez vous reconnecter.');
            logout();
          }
        }
      }
      
      if (isMounted.current) {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isMounted]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await API.get('/auth/me');
      if (isMounted.current) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAuthError(null);
      }
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user:', error);
      if (isMounted.current) {
        setAuthError('Erreur lors de la mise à jour du profil');
      }
      throw error;
    }
  }, [isMounted]);

  const login = useCallback(async (credentials) => {
    try {
      setAuthError(null);
      const response = await API.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (isMounted.current) {
          setUser(response.data.user);
          setAuthError(null);
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      
      if (isMounted.current) {
        setAuthError(errorMessage);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [isMounted]);

  const register = useCallback(async (userData) => {
    try {
      setAuthError(null);
      const response = await API.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (isMounted.current) {
          setUser(response.data.user);
          setAuthError(null);
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Erreur d\'inscription';
      
      if (isMounted.current) {
        setAuthError(errorMessage);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [isMounted]);

  const logout = useCallback(() => {
    API.post('/auth/logout')
      .catch(error => console.error('Logout error:', error))
      .finally(() => {
        if (isMounted.current) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setAuthError(null);
        }
      });
  }, [isMounted]);

  const validateAccessCode = useCallback(async (code) => {
    try {
      setAuthError(null);
      const response = await API.post('/payment/use-access-code', { code });
      
      if (response.data.success) {
        // Rafraîchir les données utilisateur
        await refreshUser();
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Access code validation error:', error);
      const errorMessage = error.response?.data?.error || 'Erreur de validation du code';
      
      if (isMounted.current) {
        setAuthError(errorMessage);
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [refreshUser, isMounted]);

  const hasPremiumAccess = useCallback(() => {
    if (!user) return false;
    
    if (user.subscriptionEnd) {
      return new Date() < new Date(user.subscriptionEnd);
    }
    
    if (user.subscription && user.subscription.expiryDate) {
      return new Date() < new Date(user.subscription.expiryDate);
    }
    
    return user.isSubscribed === true;
  }, [user]);

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
      authError,
      login,
      register,
      logout,
      validateAccessCode,
      hasPremiumAccess,
      refreshUser
    }}>
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