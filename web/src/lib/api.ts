import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: { name: string; email: string }) =>
    api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

export const assetAPI = {
  getAll: (params?: any) => api.get('/assets', { params }),
  getById: (id: number) => api.get(`/assets/${id}`),
  getBySerial: (serial: string) => api.get(`/assets/serial/${serial}`),
  create: (data: FormData) =>
    api.post('/assets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.put(`/assets/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/assets/${id}`),
  getQRCode: (id: number) => api.get(`/assets/${id}/qrcode`),
  downloadQR: (id: number) => api.get(`/assets/${id}/qrcode`, { responseType: 'blob' }),
  getActivity: (id: number) => api.get(`/assets/${id}/activity`),
};

export const departmentAPI = {
  getAll: (includeCount?: boolean) =>
    api.get('/departments', { params: { include_count: includeCount } }),
  getById: (id: number) => api.get(`/departments/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post('/departments', data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put(`/departments/${id}`, data),
  delete: (id: number) => api.delete(`/departments/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAssetStats: () => api.get('/analytics/assets'),
  getDepartmentStats: () => api.get('/analytics/departments'),
  getActivityTimeline: (limit?: number) =>
    api.get('/analytics/activity', { params: { limit } }),
  getTrends: (period?: string) =>
    api.get('/analytics/trends', { params: { period } }),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: { name: string; email: string; role: string }) =>
    api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  getActivity: (id: number) => api.get(`/users/${id}/activity`),
};
