import { apiClient } from '@/libs/api-client'

const useGetLikesByPostId = async (postId: string) => {
  try {
    const likes = await apiClient.getLikesByPostId(postId)
    return likes
  } catch (error) {
    console.error('Error fetching likes:', error)
    return []
  }
}

export default useGetLikesByPostId
