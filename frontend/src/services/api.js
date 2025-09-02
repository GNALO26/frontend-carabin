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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ne pas rediriger si la requête a été annulée
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Éviter la boucle de redirection
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Fonction pour créer un token d'annulation
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

export default API;