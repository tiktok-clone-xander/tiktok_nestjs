import { apiClient } from '@/libs/api-client'

const useGetAllPosts = async () => {
  try {
    const posts = await apiClient.getAllPosts()
    return posts
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default useGetAllPosts
