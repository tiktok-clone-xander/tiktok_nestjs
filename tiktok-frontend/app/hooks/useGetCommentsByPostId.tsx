import { apiClient } from '@/libs/api-client'

const useGetCommentsByPostId = async (postId: string) => {
  try {
    const comments = await apiClient.getCommentsByPostId(postId)
    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
}

export default useGetCommentsByPostId
