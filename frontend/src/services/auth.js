import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const validateAccessCode = async (accessCode) => {
  const response = await api.post('/auth/validate-access', { accessCode });
  return response.data;
};