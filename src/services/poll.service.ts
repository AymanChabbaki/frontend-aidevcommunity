import api from '../lib/api';

export const pollService = {
  async getAllPolls(params?: { status?: string }) {
    const response = await api.get('/polls', { params });
    return response.data;
  },

  async getPollById(id: string) {
    const response = await api.get(`/polls/${id}`);
    return response.data;
  },

  async createPoll(data: any) {
    const response = await api.post('/polls', data);
    return response.data;
  },

  async vote(id: string, optionId: string) {
    const response = await api.post(`/polls/${id}/vote`, { optionId });
    return response.data;
  },

  async getUserVote(id: string) {
    const response = await api.get(`/polls/${id}/user-vote`);
    return response.data;
  },

  async getPollResults(id: string) {
    const response = await api.get(`/polls/${id}/results`);
    return response.data;
  },

  async deletePoll(id: string) {
    const response = await api.delete(`/polls/${id}`);
    return response.data;
  },

  async getMyVotes() {
    const response = await api.get('/polls/user/votes');
    return response.data;
  },
};
