import { apiClient } from '@/libs/api-client'

const useDeleteComment = async (commentId: string) => {
  try {
    await apiClient.deleteComment(commentId)
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}

export default useDeleteComment
