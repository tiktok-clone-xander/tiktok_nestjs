import { apiClient } from '@/libs/ApiClient'

const useDeletePostById = async (postId: string, videoUrl: string) => {
  try {
    await apiClient.deletePost(postId)
  } catch (error) {
    console.error('Error deleting post:', error)
    throw error
  }
}

export default useDeletePostById
