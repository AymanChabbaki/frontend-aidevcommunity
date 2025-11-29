import api from '../lib/api';

export const settingsService = {
  async getSettings(category?: string) {
    const response = await api.get('/settings', {
      params: { category }
    });
    return response.data;
  },

  async updateSetting(key: string, value: any, category: string) {
    const response = await api.post('/settings', {
      key,
      value,
      category
    });
    return response.data;
  },

  async bulkUpdateSettings(category: string, settings: any) {
    const response = await api.put('/settings/bulk', {
      category,
      settings
    });
    return response.data;
  },

  async initializeSettings() {
    const response = await api.post('/settings/initialize');
    return response.data;
  },

  async deleteSetting(key: string) {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  }
};
