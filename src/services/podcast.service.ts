import api from '../lib/api';

export interface Podcast {
  id: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  publishedAt: string;
  discordLink?: string;
  views: number;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastSubject {
  id: string;
  title: string;
  description?: string;
  submittedBy?: string;
  status: string;
  votes: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    subjectVotes: number;
  };
}

export const podcastService = {
  // Podcast endpoints
  async getAllPodcasts(params?: { status?: string }) {
    const response = await api.get('/podcasts', { params });
    return response.data;
  },

  async getPodcastById(id: string) {
    const response = await api.get(`/podcasts/${id}`);
    return response.data;
  },

  async createPodcast(data: Partial<Podcast>) {
    const response = await api.post('/podcasts', data);
    return response.data;
  },

  async updatePodcast(id: string, data: Partial<Podcast>) {
    const response = await api.put(`/podcasts/${id}`, data);
    return response.data;
  },

  async deletePodcast(id: string) {
    const response = await api.delete(`/podcasts/${id}`);
    return response.data;
  },

  // Podcast subject endpoints
  async getAllPodcastSubjects(params?: { status?: string }) {
    const response = await api.get('/podcasts/subjects/all', { params });
    return response.data;
  },

  async getPodcastSubjectById(id: string) {
    const response = await api.get(`/podcasts/subjects/${id}`);
    return response.data;
  },

  async createPodcastSubject(data: { title: string; description?: string }) {
    const response = await api.post('/podcasts/subjects', data);
    return response.data;
  },

  async voteForPodcastSubject(id: string) {
    const response = await api.post(`/podcasts/subjects/${id}/vote`);
    return response.data;
  },

  async unvoteForPodcastSubject(id: string) {
    const response = await api.delete(`/podcasts/subjects/${id}/vote`);
    return response.data;
  },

  async getUserVoteForSubject(id: string) {
    const response = await api.get(`/podcasts/subjects/${id}/user-vote`);
    return response.data;
  },

  async updatePodcastSubjectStatus(id: string, status: string) {
    const response = await api.patch(`/podcasts/subjects/${id}/status`, { status });
    return response.data;
  },

  async deletePodcastSubject(id: string) {
    const response = await api.delete(`/podcasts/subjects/${id}`);
    return response.data;
  }
};
