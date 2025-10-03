import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
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

// Template API functions
export interface TemplateFilters {
  category?: string;
  tags?: string;
  search?: string;
  onlyFree?: boolean;
}

export const getTemplates = async (filters?: TemplateFilters) => {
  const params = new URLSearchParams();

  if (filters?.category) params.append('category', filters.category);
  if (filters?.tags) params.append('tags', filters.tags);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.onlyFree) params.append('onlyFree', 'true');

  const response = await api.get(`/api/templates?${params.toString()}`);
  return response.data;
};

export const getTemplate = async (id: string) => {
  const response = await api.get(`/api/templates/${id}`);
  return response.data;
};

export const downloadTemplate = async (id: string) => {
  const response = await api.post(`/api/templates/${id}/download`);
  return response.data;
};

// User purchases
export const getUserPurchases = async () => {
  const response = await api.get('/api/purchases');
  return response.data;
};

// AI conversations (Templates Owned)
export const getAIConversations = async () => {
  const response = await api.get('/api/ai/conversations');
  return response.data;
};

export default api;