import { apiClient } from '@/libs/api-client'

const useGetAllPosts = async () => {
  try {
    const response = await apiClient.getAllPosts()
    // Handle different response formats
    if (Array.isArray(response)) {
      return response
    }
    if (response?.data && Array.isArray(response.data)) {
      return response.data
    }
    if (response?.videos && Array.isArray(response.videos)) {
      return response.videos
    }
    return []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default useGetAllPosts
