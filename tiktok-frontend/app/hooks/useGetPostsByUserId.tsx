import { apiClient } from '@/libs/ApiClient'

const useGetPostsByUserId = async (userId: string) => {
  try {
    const posts = await apiClient.getPostsByUserId(userId)
    return posts
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

export default useGetPostsByUserId
