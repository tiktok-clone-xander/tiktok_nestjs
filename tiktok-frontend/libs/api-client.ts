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
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      config => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
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
    // Redirect to login or show auth modal
    toast.error('Session expired. Please login again.')
    window.location.href = '/login'
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
    Cookies.set(TOKEN_KEY, accessToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
  }

  public clearTokens() {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
  }

  public isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const decoded: any = jwtDecode(token)
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch {
      return false
    }
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
    return this.post('/auth/logout')
  }

  // User/Profile methods
  async getProfile(userId: string) {
    return this.get(`/users/${userId}`)
  }

  async updateProfile(userId: string, data: any) {
    return this.put(`/users/${userId}`, data)
  }

  async searchUsers(query: string) {
    return this.get(`/users/search?q=${encodeURIComponent(query)}`)
  }

  // Video/Post methods
  async getAllPosts() {
    return this.get('/videos')
  }

  async getPostById(postId: string) {
    return this.get(`/videos/${postId}`)
  }

  async getPostsByUserId(userId: string) {
    return this.get(`/videos/user/${userId}`)
  }

  async createPost(postData: FormData) {
    return this.post('/videos', postData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  async deletePost(postId: string) {
    return this.delete(`/videos/${postId}`)
  }

  // Interaction methods
  async getCommentsByPostId(postId: string) {
    return this.get(`/interactions/${postId}/comments`)
  }

  async createComment(postId: string, comment: string) {
    return this.post(`/interactions/${postId}/comments`, { comment })
  }

  async deleteComment(commentId: string) {
    return this.delete(`/interactions/comments/${commentId}`)
  }

  async getLikesByPostId(postId: string) {
    return this.get(`/interactions/${postId}/likes`)
  }

  async createLike(postId: string) {
    return this.post(`/interactions/${postId}/likes`)
  }

  async deleteLike(postId: string) {
    return this.delete(`/interactions/${postId}/likes`)
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
    profile: (userId: string) => `/users/${userId}`,
    follow: (userId: string) => `/users/${userId}/follow`,
    unfollow: (userId: string) => `/users/${userId}/unfollow`,
    followers: (userId: string) => `/users/${userId}/followers`,
    following: (userId: string) => `/users/${userId}/following`,
    videos: (userId: string) => `/users/${userId}/videos`,
    search: '/users/search',
  },

  // Video endpoints
  videos: {
    list: '/videos',
    create: '/videos',
    detail: (videoId: string) => `/videos/${videoId}`,
    update: (videoId: string) => `/videos/${videoId}`,
    delete: (videoId: string) => `/videos/${videoId}`,
    like: (videoId: string) => `/videos/${videoId}/like`,
    unlike: (videoId: string) => `/videos/${videoId}/unlike`,
    share: (videoId: string) => `/videos/${videoId}/share`,
    trending: '/videos/trending',
    search: '/videos/search',
    upload: '/videos/upload',
  },

  // Comment endpoints
  comments: {
    list: (videoId: string) => `/videos/${videoId}/comments`,
    create: (videoId: string) => `/videos/${videoId}/comments`,
    update: (commentId: string) => `/comments/${commentId}`,
    delete: (commentId: string) => `/comments/${commentId}`,
    like: (commentId: string) => `/comments/${commentId}/like`,
    unlike: (commentId: string) => `/comments/${commentId}/unlike`,
  },

  // Notification endpoints
  notifications: {
    list: '/notifications',
    markAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
    markAllAsRead: '/notifications/read-all',
    count: '/notifications/unread-count',
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
