import api from '../lib/api';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const contactService = {
  // Public function
  sendMessage: async (data: ContactMessage) => {
    return api.post('/contact', data);
  },

  // Admin functions
  getMessages: async (status?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (status) params.status = status;
    return api.get('/contact/messages', { params });
  },

  getMessage: async (id: string) => {
    return api.get(`/contact/messages/${id}`);
  },

  updateStatus: async (id: string, status: string) => {
    return api.patch(`/contact/messages/${id}/status`, { status });
  },

  deleteMessage: async (id: string) => {
    return api.delete(`/contact/messages/${id}`);
  },

  getStats: async () => {
    return api.get('/contact/messages/stats');
  }
};
