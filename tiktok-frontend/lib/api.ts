import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if needed
apiClient.interceptors.request.use(
  (config) => {
    // Token is automatically sent via cookies (HttpOnly)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await apiClient.post('/api/auth/refresh');
        // Retry the original request
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; username: string; password: string; fullName: string }) =>
    apiClient.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  
  logout: () =>
    apiClient.post('/api/auth/logout'),
  
  getMe: () =>
    apiClient.get('/api/auth/me'),
  
  refreshToken: () =>
    apiClient.post('/api/auth/refresh'),
};

// Video API
export const videoAPI = {
  getFeed: (page = 1, limit = 10) =>
    apiClient.get('/api/videos/feed', { params: { page, limit } }),
  
  getVideo: (id: string) =>
    apiClient.get(`/api/videos/${id}`),
  
  getUserVideos: (userId: string, page = 1, limit = 10) =>
    apiClient.get(`/api/videos/user/${userId}`, { params: { page, limit } }),
  
  searchVideos: (query: string, page = 1, limit = 10) =>
    apiClient.get('/api/videos/search', { params: { q: query, page, limit } }),
  
  createVideo: (data: FormData) =>
    apiClient.post('/api/videos', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  deleteVideo: (id: string) =>
    apiClient.delete(`/api/videos/${id}`),
};

// Interaction API
export const interactionAPI = {
  likeVideo: (videoId: string) =>
    apiClient.post('/api/interactions/like', { videoId }),
  
  unlikeVideo: (videoId: string) =>
    apiClient.post('/api/interactions/unlike', { videoId }),
  
  getLikeStatus: (videoId: string) =>
    apiClient.get(`/api/interactions/like-status/${videoId}`),
  
  addComment: (videoId: string, content: string) =>
    apiClient.post('/api/interactions/comment', { videoId, content }),
  
  getComments: (videoId: string, page = 1, limit = 20) =>
    apiClient.get(`/api/interactions/comments/${videoId}`, { params: { page, limit } }),
  
  deleteComment: (commentId: string) =>
    apiClient.delete(`/api/interactions/comment/${commentId}`),
  
  recordView: (videoId: string) =>
    apiClient.post('/api/interactions/view', { videoId }),
};
