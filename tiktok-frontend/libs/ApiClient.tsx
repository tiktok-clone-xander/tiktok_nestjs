// API Client for communicating with the NestJS backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: { email: string; password: string; username: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  // User/Profile endpoints
  async getProfile(userId: string) {
    return this.request(`/users/${userId}`)
  }

  async updateProfile(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async searchUsers(query: string) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`)
  }

  // Video/Post endpoints
  async getAllPosts() {
    return this.request('/videos')
  }

  async getPostById(postId: string) {
    return this.request(`/videos/${postId}`)
  }

  async getPostsByUserId(userId: string) {
    return this.request(`/videos/user/${userId}`)
  }

  async createPost(postData: FormData) {
    return this.request('/videos', {
      method: 'POST',
      body: postData,
      headers: {}, // Let the browser set the Content-Type for FormData
    })
  }

  async deletePost(postId: string) {
    return this.request(`/videos/${postId}`, {
      method: 'DELETE',
    })
  }

  // Interaction endpoints
  async getCommentsByPostId(postId: string) {
    return this.request(`/interactions/${postId}/comments`)
  }

  async createComment(postId: string, comment: string) {
    return this.request(`/interactions/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    })
  }

  async deleteComment(commentId: string) {
    return this.request(`/interactions/comments/${commentId}`, {
      method: 'DELETE',
    })
  }

  async getLikesByPostId(postId: string) {
    return this.request(`/interactions/${postId}/likes`)
  }

  async createLike(postId: string) {
    return this.request(`/interactions/${postId}/likes`, {
      method: 'POST',
    })
  }

  async deleteLike(postId: string) {
    return this.request(`/interactions/${postId}/likes`, {
      method: 'DELETE',
    })
  }

  // File upload
  async uploadFile(file: File, type: 'video' | 'image' = 'image') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the Content-Type for FormData
    })
  }
}

export const apiClient = new ApiClient()
export { ApiClient }

// Helper functions to replace AppWrite functionality
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export const createBucketUrl = (fileId: string, type: 'video' | 'image' = 'image') => {
  return `${API_BASE_URL}/files/${type}/${fileId}`
}
