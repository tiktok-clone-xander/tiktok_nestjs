import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-hot-toast'
import { errorUtils } from './utils'

// API Configuration
const API_BASE_URL = 'http://localhost:4000'
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Token management
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

/**
 * Enhanced API client with authentication, error handling, and retry logic
 */
class ApiClient {
  private instance: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      withCredentials: true, // Enable sending cookies with requests
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - add access token to Authorization header
    this.instance.interceptors.request.use(
      config => {
        const token = Cookies.get(TOKEN_KEY)
        if (token) {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${token}`
            console.log('🔐 Authorization header set with token')
          }
        } else {
          console.log('⚠️  No token found in cookies, will rely on HttpOnly cookies from backend')
        }
        return config
      },
      error => Promise.reject(error)
    )

    // Response interceptor for token refresh and error handling
    this.instance.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return this.addRefreshSubscriber(originalRequest)
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.refreshToken()
            this.onRefreshed(newToken)
            return this.instance(originalRequest)
          } catch (refreshError) {
            this.onRefreshFailure()
            return Promise.reject(refreshError)
          }
        }

        // Handle other errors
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = Cookies.get(REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data
      this.setTokens(accessToken, newRefreshToken)
      return accessToken
    } catch (error) {
      this.clearTokens()
      throw error
    } finally {
      this.isRefreshing = false
    }
  }

  private addRefreshSubscriber(originalRequest: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise(resolve => {
      this.refreshSubscribers.push((token: string) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`
        }
        resolve(this.instance(originalRequest))
      })
    })
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  private onRefreshFailure() {
    this.refreshSubscribers = []
    this.clearTokens()
    // Just show error, don't redirect
    toast.error('Session expired. Please login again.')
  }

  private handleError(error: AxiosError) {
    const message = errorUtils.getErrorMessage(error)

    // Don't show toast for certain errors
    const silentErrors = [401, 403]
    if (!silentErrors.includes(error.response?.status || 0)) {
      toast.error(message)
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error)
    }
  }

  // Token management methods
  public getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null
  }

  public setTokens(accessToken: string, refreshToken: string) {
    // Store tokens in accessible cookies so they can be added to Authorization header
    // Backend also sets HttpOnly cookies, but we need accessible cookies for Authorization header
    console.log('💾 Storing access token and refresh token in cookies')
    Cookies.set(TOKEN_KEY, accessToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Allow cross-site requests
    })
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Allow cross-site requests
    })
    console.log('✅ Tokens stored successfully')
  }

  public clearTokens() {
    // HttpOnly cookies are cleared by the server on logout
    // Remove any client-side tokens if they exist (fallback)
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
  }

  public isTokenValid(): boolean {
    // Since cookies are HttpOnly, we can't validate client-side
    // Just return true and let the backend validate
    // The /api/auth/me endpoint will return 401 if invalid
    return true
  }

  public getTokenPayload(): any | null {
    const token = this.getToken()
    if (!token) return null

    try {
      return jwtDecode(token)
    } catch {
      return null
    }
  }

  // HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  // File upload with progress - supports both old and new signatures
  public async uploadFile<T = any>(
    urlOrFile: string | File,
    fileOrType?: File | 'video' | 'image',
    onProgressOrType?: ((progress: number) => void) | 'video' | 'image',
    additionalData?: Record<string, any>
  ): Promise<T> {
    // Support old signature: uploadFile(file: File, type: 'video' | 'image')
    if (urlOrFile instanceof File) {
      const file = urlOrFile
      const type = (fileOrType as 'video' | 'image') || 'image'
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await this.instance.post<T>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }

    // Support new signature: uploadFile(url, file, onProgress, additionalData)
    const url = urlOrFile as string
    const file = fileOrType as File
    const onProgress = onProgressOrType as ((progress: number) => void) | undefined
    const formData = new FormData()
    formData.append('file', file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: progressEvent => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // Download file
  public async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Convenience methods for backward compatibility
  // Auth methods
  async login(credentials: { username: string; password: string }) {
    return this.post('api/auth/login', credentials)
  }

  async register(userData: {
    email: string
    password: string
    username: string
    fullName?: string
  }) {
    return this.post('api/auth/register', userData)
  }

  async logout() {
    return this.post('api/auth/logout')
  }

  // User/Profile methods
  async getProfile(userId: string) {
    return this.get(`/users/${userId}`)
  }

  async updateProfile(userId: string, data: any) {
    return this.put(`/users/${userId}`, data)
  }

  async searchUsers(query: string) {
    // TODO: Backend endpoint /api/users/search needs to be implemented
    // For now, return empty array to prevent 404 errors
    if (!query || !query.trim()) {
      return { data: { success: true, data: { users: [] } } }
    }
    try {
      return this.get(`api/users/search?q=${encodeURIComponent(query)}`)
    } catch (error) {
      console.warn('Search endpoint not yet implemented:', error)
      return { data: { success: true, data: { users: [] } } }
    }
  }

  // Video/Post methods
  async getAllPosts() {
    return this.get('api/videos')
  }

  async getPostById(postId: string) {
    return this.get(`api/videos/${postId}`)
  }

  async getPostsByUserId(userId: string) {
    return this.get(`api/videos/user/${userId}`)
  }

  async createPost(postData: FormData) {
    return this.post('api/videos', postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async deletePost(postId: string) {
    return this.delete(`api/videos/${postId}`)
  }

  // Interaction methods
  async getCommentsByPostId(postId: string) {
    return this.get(`api/interactions/comments/${postId}`)
  }

  async createComment(postId: string, comment: string) {
    return this.post(`api/interactions/comment`, { videoId: postId, content: comment })
  }

  async deleteComment(commentId: string) {
    return this.delete(`api/interactions/comment/${commentId}`)
  }

  async getLikesByPostId(postId: string) {
    // This endpoint doesn't exist in backend, return video likes count from video detail
    // For now, return empty array to prevent errors
    return []
  }

  async getLikeStatus(videoId: string) {
    return this.get<{ hasLiked: boolean; likesCount: number }>(
      `api/interactions/like-status/${videoId}`
    )
  }

  async createLike(postId: string) {
    return this.post(`api/interactions/like`, { videoId: postId })
  }

  async deleteLike(postId: string) {
    return this.post(`api/interactions/unlike`, { videoId: postId })
  }
}

// API endpoints
export const apiEndpoints = {
  // Auth endpoints
  auth: {
    login: 'api/auth/login',
    register: 'api/auth/register',
    logout: 'api/auth/logout',
    refresh: 'api/auth/refresh',
    profile: 'api/auth/profile',
    forgotPassword: 'api/auth/forgot-password',
    resetPassword: 'api/auth/reset-password',
    verifyEmail: 'api/auth/verify-email',
  },

  // User endpoints
  users: {
    profile: (userId: string) => `api/users/${userId}`,
    update: (userId: string) => `api/users/${userId}`,
    follow: (userId: string) => `api/users/${userId}/follow`,
    unfollow: (userId: string) => `api/users/${userId}/follow`,
    followStatus: (userId: string) => `api/users/${userId}/follow-status`,
    followers: (userId: string) => `api/users/${userId}/followers`,
    following: (userId: string) => `api/users/${userId}/following`,
    videos: (userId: string) => `api/videos/user/${userId}`,
    search: 'api/users/search',
  },

  // Video endpoints
  videos: {
    list: 'api/videos',
    create: 'api/videos',
    detail: (videoId: string) => `api/videos/${videoId}`,
    update: (videoId: string) => `api/videos/${videoId}`,
    delete: (videoId: string) => `api/videos/${videoId}`,
    like: (videoId: string) => `api/videos/${videoId}/like`,
    unlike: (videoId: string) => `api/videos/${videoId}/unlike`,
    share: (videoId: string) => `api/videos/${videoId}/share`,
    trending: 'api/videos/trending',
    search: 'api/videos/search',
    upload: 'api/videos/upload',
  },

  // Comment endpoints (via interactions)
  comments: {
    list: (videoId: string) => `api/interactions/comments/${videoId}`,
    create: (videoId: string) => `api/interactions/comment`,
    delete: (commentId: string) => `api/interactions/comment/${commentId}`,
  },

  // Interaction endpoints
  interactions: {
    like: 'api/interactions/like',
    unlike: 'api/interactions/unlike',
    likeStatus: (videoId: string) => `api/interactions/like-status/${videoId}`,
    comment: 'api/interactions/comment',
    comments: `api/interactions/comments`,
    deleteComment: (commentId: string) => `api/interactions/comment/${commentId}`,
    view: 'api/interactions/view',
  },

  // Notification endpoints
  notifications: {
    list: 'api/notifications',
    markAsRead: (notificationId: string) => `api/notifications/${notificationId}/read`,
    markAllAsRead: 'api/notifications/read-all',
    count: 'api/notifications/unread-count',
  },
}

// Create and export the API client instance
export const apiClient = new ApiClient()

// Export types for better TypeScript support
export type { AxiosError, AxiosRequestConfig, AxiosResponse }

// Helper functions for backward compatibility
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export const createBucketUrl = (fileId: string, type: 'video' | 'image' = 'image') => {
  return `${API_BASE_URL}/files/${type}/${fileId}`
}

export default apiClient
