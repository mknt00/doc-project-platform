import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const isAuthenticated = ref<boolean>(!!token.value);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.auth.login(credentials);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      isAuthenticated.value = true;
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await api.auth.register(userData);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      isAuthenticated.value = true;
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('token');
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.auth.getCurrentUser();
      user.value = response.data;
      return response.data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchCurrentUser,
  };
});
