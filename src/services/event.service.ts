import api from '../lib/api';

export interface Event {
  id: string;
  title: string;
  description: string;
  locationType: 'PHYSICAL' | 'VIRTUAL' | 'HYBRID';
  locationText: string;
  startAt: string;
  endAt: string;
  capacity: number;
  imageUrl?: string;
  tags?: string[];
  organizerId: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  category?: string;
  speaker?: string;
  createdAt: string;
  updatedAt: string;
  registrations?: any[];
}

export const eventService = {
  async getAllEvents(params?: { status?: string; category?: string; search?: string }) {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEventById(id: string) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async createEvent(data: any) {
    const response = await api.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: any) {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  async registerForEvent(id: string, customFieldValues?: Record<string, string>) {
    const response = await api.post(`/events/${id}/register`, customFieldValues ? { customFieldValues } : {});
    return response.data;
  },

  async registerAsGuest(id: string, data: {
    displayName: string;
    email: string;
    password: string;
    phone?: string;
    studyLevel?: string;
    studyProgram?: string;
    github?: string;
    linkedin?: string;
    customFieldValues?: Record<string, string>;
  }) {
    const response = await api.post(`/events/${id}/register-guest`, data);
    return response.data;
  },

  async checkIn(id: string, qrToken: string) {
    const response = await api.post(`/events/${id}/checkin`, { qrToken });
    return response.data;
  },

  async checkInByToken(token: string) {
    const response = await api.post('/events/registrations/check-in', { token });
    return response.data;
  },

  async getEventRegistrations(id: string) {
    const response = await api.get(`/events/${id}/registrations`);
    return response.data;
  },

  async exportRegistrations(id: string) {
    const response = await api.get(`/events/${id}/registrations/export`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getMyRegistrations() {
    const response = await api.get('/events/user/registrations');
    return response.data;
  },

  async getPendingRegistrations(status?: string, organizerId?: string) {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (organizerId) params.organizerId = organizerId;
    const response = await api.get('/events/registrations/pending', { params });
    return response.data;
  },

  async approveRegistration(id: string, comment?: string) {
    const response = await api.put(`/events/registrations/${id}/approve`, { comment });
    return response.data;
  },

  async rejectRegistration(id: string, reason?: string) {
    const response = await api.put(`/events/registrations/${id}/reject`, { reason });
    return response.data;
  },

  async deleteRegistration(id: string) {
    const response = await api.delete(`/events/registrations/${id}`);
    return response.data;
  },

  async uploadEventImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/events/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
