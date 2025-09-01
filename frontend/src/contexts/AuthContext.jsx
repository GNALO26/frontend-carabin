import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import paymentService from '../services/paymentService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        
        // Vérifier la validité du token
        API.get('/auth/me')
          .then(response => {
            setUser(response.data.user);
          })
          .catch(error => {
            console.error('Token validation failed:', error);
            logout();
          });
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur de connexion' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: 'No token received' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    API.post('/auth/logout')
      .catch(error => console.error('Logout error:', error))
      .finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      });
  };

  const validateAccessCode = async (code) => {
    try {
      const response = await API.post('/payment/use-access-code', { code });
      
      if (response.data.success) {
        // Rafraîchir les données utilisateur
        const userResponse = await API.get('/auth/me');
        setUser(userResponse.data.user);
        localStorage.setItem('user', JSON.stringify(userResponse.data.user));
        
        return { success: true, message: response.data.message };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      console.error('Access code validation error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erreur de validation du code' 
      };
    }
  };

  const hasPremiumAccess = () => {
    if (!user) return false;
    
    if (user.subscriptionEnd) {
      return new Date() < new Date(user.subscriptionEnd);
    }
    
    if (user.subscription && user.subscription.expiryDate) {
      return new Date() < new Date(user.subscription.expiryDate);
    }
    
    return user.isSubscribed === true;
  };

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
      login,
      register,
      logout,
      validateAccessCode,
      hasPremiumAccess
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