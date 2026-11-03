import axiosClient from '../api/axiosClient';

const adminService = {
  getAdminDashboard: async () => {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await axiosClient.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export default adminService;

