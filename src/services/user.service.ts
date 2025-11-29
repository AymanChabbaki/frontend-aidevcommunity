import api from '../lib/api';

export const userService = {
  async getPublicMembers() {
    const response = await api.get('/users/public');
    return response.data;
  },

  async getMe() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await api.post('/users/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
