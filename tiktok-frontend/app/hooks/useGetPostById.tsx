import { apiClient } from '@/libs/ApiClient'

const useGetPostById = async (id: string) => {
  try {
    const post = await apiClient.getPostById(id)
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default useGetPostById
