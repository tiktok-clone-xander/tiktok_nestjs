import { apiClient } from '@/libs/api-client'

const useDeleteLike = async (userId: string, postId: string) => {
  try {
    await apiClient.deleteLike(postId)
  } catch (error) {
    console.error('Error deleting like:', error)
    throw error
  }
}

export default useDeleteLike
