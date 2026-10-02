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

export const createChatSession = async (title = 'Scheme Assistance') => {
  const response = await api.post('/api/chat/sessions', { title });
  return response.data;
};

export const getChatSessions = async () => {
  const response = await api.get('/api/chat/sessions');
  return response.data;
};

export const getChatSourceMetadata = async (sourceId) => {
  const response = await api.get(`/api/chat/sources/${sourceId}`);
  return response.data;
};

export const getChatHealth = async () => {
  const response = await api.get('/api/chat/health');
  return response.data;
};

// Citizen Support APIs
export const getSupportRequests = async () => {
  const response = await api.get('/api/support');
  return response.data;
};

export const getSupportRequestById = async (supportId) => {
  const response = await api.get(`/api/support/${supportId}`);
  return response.data;
};

// Admin APIs (Includes X-User-Role: ADMIN header for server authorization)
const getAdminHeaders = () => ({
  headers: {
    'X-User-Role': 'ADMIN',
    'X-User-ID': 'admin_user'
  }
});

export const getAdminHandoffs = async (status = null) => {
  const params = status ? { status } : {};
  const response = await api.get('/api/admin/handoffs', { ...getAdminHeaders(), params });
  return response.data;
};

export const updateAdminHandoffStatus = async (handoffId, status) => {
  const response = await api.patch(`/api/admin/handoffs/${handoffId}/status`, { status }, getAdminHeaders());
  return response.data;
};

export const getAdminSchemes = async () => {
  const response = await api.get('/api/admin/schemes', getAdminHeaders());
  return response.data;
};

export const updateAdminScheme = async (schemeId, updateData) => {
  const response = await api.patch(`/api/admin/schemes/${schemeId}`, updateData, getAdminHeaders());
  return response.data;
};

export const getAdminSchemeVersions = async (schemeId) => {
  const response = await api.get(`/api/admin/schemes/${schemeId}/versions`, getAdminHeaders());
  return response.data;
};

export const getAdminSystemStatus = async () => {
  const response = await api.get('/api/admin/system-status', getAdminHeaders());
  return response.data;
};

export default api;
