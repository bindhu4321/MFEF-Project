import axiosClient from '../api/axiosClient';

const authService = {
  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('sbfms_token', response.data.token);
      localStorage.setItem('sbfms_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('sbfms_token', response.data.token);
      localStorage.setItem('sbfms_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/auth/profile', profileData);
    if (response.data.success && response.data.user) {
      const stored = JSON.parse(localStorage.getItem('sbfms_user') || '{}');
      localStorage.setItem('sbfms_user', JSON.stringify({ ...stored, ...response.data.user }));
    }
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await axiosClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('sbfms_token');
    localStorage.removeItem('sbfms_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('sbfms_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('sbfms_token');
  }
};

export default authService;

