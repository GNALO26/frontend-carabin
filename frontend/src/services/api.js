import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
API.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => {
    console.error('Erreur configuration requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies de réessai
    if (originalRequest && originalRequest._retryCount) {
      originalRequest._retryCount++;
      if (originalRequest._retryCount > 3) {
        return Promise.reject(error);
      }
    } else if (originalRequest) {
      originalRequest._retryCount = 1;
    }
    
    // Si erreur réseau ou absence de réponse, on réessaie
    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return API(originalRequest);
    }

    // Si erreur serveur (5xx), on réessaie aussi
    if (error.response && error.response.status >= 500 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 1000));
      return API(originalRequest);
    }

    // Erreur 401 : non autorisé
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject({ message: 'Non autorisé. Redirection vers la page de login.' });
    }

    // Message d'erreur clair pour le frontend
    const message = error.response?.data?.error || 
                   error.response?.data?.message || 
                   error.message || 
                   'Erreur de connexion au serveur';
    
    // Log plus détaillé uniquement en développement
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erreur API détaillée:', {
        status: error.response ? error.response.status : 'No response',
        data: error.response ? error.response.data : error.message,
        url: originalRequest?.url,
        config: error.config
      });
    }
    
    return Promise.reject({ 
      message,
      status: error.response?.status,
      url: originalRequest?.url
    });
  }
);

export default API;