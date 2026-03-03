import api from '@/lib/api';

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: { id: string; displayName: string; photoUrl?: string | null };
  _count: { likes: number; comments: number };
  likedByMe: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  postId: string;
  userId: string;
  parentId?: string | null;
  user: { id: string; displayName: string; photoUrl?: string | null };
  likedByMe: boolean;
  _count: { likes: number; replies: number };
  replies?: Comment[];
}

export const blogService = {
  async getPosts(page = 1, limit = 10): Promise<{ data: Post[]; total: number }> {
    const res = await api.get(`/blog?page=${page}&limit=${limit}`);
    return res.data;
  },

  async createPost(formData: FormData): Promise<Post> {
    const res = await api.post('/blog', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async updatePost(id: string, formData: FormData): Promise<Post> {
    const res = await api.put(`/blog/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/blog/${id}`);
  },

  async toggleLike(id: string): Promise<{ liked: boolean; count: number }> {
    const res = await api.post(`/blog/${id}/like`);
    return res.data;
  },

  async getComments(postId: string): Promise<Comment[]> {
    const res = await api.get(`/blog/${postId}/comments`);
    return res.data.data;
  },

  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const res = await api.post(`/blog/${postId}/comments`, { content, ...(parentId ? { parentId } : {}) });
    return res.data.data;
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/blog/comments/${commentId}`);
  },

  async toggleCommentLike(commentId: string): Promise<{ liked: boolean; count: number }> {
    const res = await api.post(`/blog/comments/${commentId}/like`);
    return res.data;
  },
};
