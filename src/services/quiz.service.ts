import api from '../lib/api';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: QuizOption[];
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  timeLimit: number;
  startAt: string;
  endAt: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions?: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  timeSpent: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  totalScore: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  totalScore: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalQuestions: number;
  rank: number;
}

export interface MonthlyLeaderboardEntry {
  userId: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  totalScore: number;
  quizCount: number;
  rank: number;
}

const quizService = {
  // Get all quizzes
  getAllQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/quizzes');
    return response.data.data || response.data;
  },

  // Get quiz by ID (with questions)
  getQuizById: async (quizId: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data.data || response.data;
  },

  // Check if user has already attempted a quiz
  checkUserAttempt: async (quizId: string): Promise<{ hasAttempted: boolean; attempt?: QuizAttempt }> => {
    const response = await api.get(`/quizzes/${quizId}/attempt`);
    return response.data;
  },

  // Submit quiz answers
  submitQuizAnswers: async (quizId: string, answers: QuizAnswer[]): Promise<{ 
    success: boolean; 
    attempt: QuizAttempt; 
    totalScore: number; 
    rank: number 
  }> => {
    const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
    return response.data;
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (quizId: string): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/quizzes/${quizId}/leaderboard`);
    return response.data.data || response.data;
  },

  // Get monthly leaderboard (all quizzes)
  getMonthlyLeaderboard: async (): Promise<MonthlyLeaderboardEntry[]> => {
    const response = await api.get('/quizzes/monthly-leaderboard');
    return response.data.data || response.data;
  },

  // Create quiz (Staff/Admin only)
  createQuiz: async (quizData: {
    title: string;
    description: string;
    coverImage?: string;
    timeLimit: number;
    startAt: string;
    endAt: string;
    questions: Array<{
      question: string;
      options: QuizOption[];
      points: number;
      order: number;
    }>;
  }): Promise<Quiz> => {
    const response = await api.post('/quizzes', quizData);
    return response.data.data || response.data;
  },

  // Update quiz (Staff/Admin only)
  updateQuiz: async (quizId: string, quizData: {
    title?: string;
    description?: string;
    coverImage?: string;
    timeLimit?: number;
    startAt?: string;
    endAt?: string;
    questions?: Array<{
      question: string;
      options: QuizOption[];
      points: number;
      order: number;
    }>;
  }): Promise<Quiz> => {
    const response = await api.put(`/quizzes/${quizId}`, quizData);
    return response.data.data || response.data;
  },

  // Delete quiz (Staff/Admin only)
  deleteQuiz: async (quizId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/quizzes/${quizId}`);
    return response.data;
  },

  // Delete participant from quiz (Staff/Admin only)
  deleteQuizParticipant: async (quizId: string, userId: string): Promise<{ message: string; deletedCount: number }> => {
    const response = await api.delete(`/quizzes/${quizId}/participants/${userId}`);
    return response.data;
  },
};

export default quizService;
