import api from '../lib/api';

export interface HomeContent {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  featuredEventIds: string[];
  showPastEvents: boolean;
  statsEnabled: boolean;
  totalEvents: number;
  totalMembers: number;
  activeProjects: number;
  createdAt: string;
  updatedAt: string;
}

export const homeContentService = {
  async getHomeContent() {
    const response = await api.get('/home-content');
    return response.data;
  },

  async updateHomeContent(data: Partial<HomeContent>) {
    const response = await api.put('/home-content', data);
    return response.data;
  },

  async initializeHomeContent() {
    const response = await api.post('/home-content/initialize');
    return response.data;
  }
};
