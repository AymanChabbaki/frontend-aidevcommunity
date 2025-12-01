import api from '../lib/api';

export const formService = {
  async getAllForms() {
    const response = await api.get('/forms');
    return response.data;
  },

  async createForm(data: any) {
    const response = await api.post('/forms', data);
    return response.data;
  },

  async getFormById(id: string) {
    const response = await api.get(`/forms/${id}`);
    return response.data;
  },

  async submitForm(id: string, answers: any, attachments?: any) {
    const response = await api.post(`/forms/${id}/submit`, { answers, attachments });
    return response.data;
  },

  async getUserSubmissions() {
    const response = await api.get('/forms/user-submissions');
    return response.data;
  },

  async getUserSubmission(id: string) {
    const response = await api.get(`/forms/${id}/user-submission`);
    return response.data;
  },

  async getFormResponses(id: string) {
    const response = await api.get(`/forms/${id}/responses`);
    return response.data;
  },

  async exportResponses(id: string, format: 'csv' | 'xlsx' = 'csv') {
    const response = await api.get(`/forms/${id}/responses/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  async deleteForm(id: string) {
    const response = await api.delete(`/forms/${id}`);
    return response.data;
  },
};
