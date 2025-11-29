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

  async registerForEvent(id: string) {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  async checkIn(id: string, qrToken: string) {
    const response = await api.post(`/events/${id}/checkin`, { qrToken });
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
};
