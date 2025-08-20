// frontend/src/api.js
import axios from "axios";
import { API_URL } from "./config";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ✅ utile si tu utilises cookies JWT
});

// Intercepteur pour ajouter le token automatiquement
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ou sessionStorage selon ton choix
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
