import { apiClient } from '@/libs/api-client'

const useCreateLike = async (userId: string, postId: string) => {
  try {
    await apiClient.createLike(postId)
  } catch (error) {
    console.error('Error creating like:', error)
    throw error
  }
}

export default useCreateLike
