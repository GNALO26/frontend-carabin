import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'https://philosophical-carp-quiz-de-carabin-14ca72a2.koyeb.app/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  (error) => Promise.reject(error)
);
// Fonction pour attendre un délai
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Intercepteur pour gérer les erreurs globales
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si erreur réseau ou absence de réponse, on réessaie
    if (!error.response && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      // Attendre 1 seconde avant de réessayer
      await sleep(1000);
      return API(originalRequest);
    }

    // Si erreur serveur (5xx), on réessaie aussi
    if (error.response && error.response.status >= 500 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      await sleep(1000);
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

    // Affichage détaillé de l'erreur côté console
    console.error('Erreur API:', {
      status: error.response ? error.response.status : 'No response',
      data: error.response ? error.response.data : error.message,
    });

    // Message d'erreur clair pour le frontend
    const message = error.response?.data?.error || error.response?.data?.message || 'Erreur inconnue de l\'API';
    return Promise.reject({ message });
  }
);

export default API;
