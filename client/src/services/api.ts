import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  // 认证
  auth: {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getCurrentUser: () => api.get('/users/me'),
  },

  // 项目
  projects: {
    getAll: () => api.get('/projects'),
    getById: (id: number) => api.get(`/projects/${id}`),
    create: (data: any) => api.post('/projects', data),
    update: (id: number, data: any) => api.put(`/projects/${id}`, data),
    delete: (id: number) => api.delete(`/projects/${id}`),
    addMember: (id: number, data: any) => api.post(`/projects/${id}/members`, data),
    removeMember: (id: number, userId: number) => api.delete(`/projects/${id}/members/${userId}`),
  },

  // 文档
  documents: {
    getByProject: (projectId: number) => api.get(`/projects/${projectId}/documents`),
    getById: (id: number) => api.get(`/documents/${id}`),
    create: (data: any) => api.post('/documents', data),
    update: (id: number, data: any) => api.put(`/documents/${id}`, data),
    publish: (id: number) => api.post(`/documents/${id}/publish`),
    delete: (id: number) => api.delete(`/documents/${id}`),
    getPublished: () => api.get('/documents/published'),
  },

  // 任务
  tasks: {
    getByProject: (projectId: number) => api.get(`/projects/${projectId}/tasks`),
    getById: (id: number) => api.get(`/tasks/${id}`),
    getMyTasks: () => api.get('/tasks/my'),
    create: (data: any) => api.post('/tasks', data),
    update: (id: number, data: any) => api.put(`/tasks/${id}`, data),
    delete: (id: number) => api.delete(`/tasks/${id}`),
  },

  // 用户
  users: {
    getAll: () => api.get('/users'),
  },
};
