import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  photoUrl: string | null;
}

export interface BulkNotificationPayload {
  userIds: string[];
  title: string;
  message: string;
  type?: string;
  itemId?: string;
  emailSubject?: string;
  emailMessage?: string;
}

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markAsRead(id: string) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  async getAllUsers(): Promise<User[]> {
    const response = await api.get('/notifications/users');
    return response.data.data;
  },

  async sendBulkNotification(payload: BulkNotificationPayload) {
    const response = await api.post('/notifications/bulk-send', payload);
    return response.data;
  },
};
