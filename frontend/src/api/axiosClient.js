import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');
const API_KEY = import.meta.env.VITE_API_KEY || 'sbfms-secure-api-key-2026-v1';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sbfms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthRequest = (error.config?.url || '').includes('/auth/login') || (error.config?.url || '').includes('/auth/register');

      if (currentPath !== '/login' && currentPath !== '/register' && !isAuthRequest) {
        localStorage.removeItem('sbfms_token');
        localStorage.removeItem('sbfms_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
