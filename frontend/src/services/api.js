import axios from 'axios';

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

// Ajout du token
API.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
    else if (userToken) config.headers.Authorization = `Bearer ${userToken}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion des erreurs globales
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('Erreur réseau ou serveur indisponible:', error.message);
      return Promise.reject({ message: 'Serveur indisponible. Veuillez réessayer plus tard.' });
    }

    if (error.response.status === 401) {
      if (localStorage.getItem('adminToken')) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject({ message: 'Non autorisé. Redirection vers la page de login.' });
    }

    console.error('Erreur API:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });

    const message = error.response.data?.error || error.response.data?.message || 'Erreur inconnue de l’API';
    return Promise.reject({ message });
  }
);

export default API;
