import { create } from 'zustand';
import api from './api';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateCredits: (credits: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (email: string, password: string, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/auth/register', { email, password, name });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/auth/me');
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch user';
      set({ error: errorMessage, isLoading: false, user: null, token: null });
      localStorage.removeItem('token');
      throw new Error(errorMessage);
    }
  },

  updateCredits: (credits: number) => {
    set((state) => ({
      user: state.user ? { ...state.user, credits } : null,
    }));
  },
}));