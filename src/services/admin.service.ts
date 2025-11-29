import api from '../lib/api';

export const adminService = {
  async getAllUsers(params?: { role?: string; search?: string }) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(id: string, role: string, staffRole?: string) {
    const response = await api.put(`/admin/users/${id}/role`, { role, staffRole });
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  async getAuditLogs(params?: { limit?: number; entity?: string }) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};
