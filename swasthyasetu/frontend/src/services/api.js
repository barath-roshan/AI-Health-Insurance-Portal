import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios request interceptor to attach Supabase JWT token to FastAPI requests
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      // Suppress token error if auth is not initialized or user is guest
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getBackendHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getSchemes = async (params = {}) => {
  const response = await api.get('/api/schemes', { params });
  return response.data;
};

export const getSchemeDetail = async (schemeId) => {
  const response = await api.get(`/api/schemes/${schemeId}`);
  return response.data;
};

export default api;
