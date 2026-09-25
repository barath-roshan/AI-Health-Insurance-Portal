import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      // Suppress token error
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

export const getProfile = async (userId = 'demo_user') => {
  const response = await api.get('/api/profile', { params: { user_id: userId } });
  return response.data;
};

export const updateProfile = async (profileData, userId = 'demo_user') => {
  const response = await api.put('/api/profile', profileData, { params: { user_id: userId } });
  return response.data;
};

export const checkEligibility = async (payload = {}) => {
  const response = await api.post('/api/eligibility/check', payload);
  return response.data;
};

export const sendChatMessage = async (message, conversationId = null) => {
  const payload = { message };
  if (conversationId) payload.conversation_id = conversationId;
  const response = await api.post('/api/chat', payload);
  return response.data;
};

export const getChatHealth = async () => {
  const response = await api.get('/api/chat/health');
  return response.data;
};

export default api;
