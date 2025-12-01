import { apiClient } from '@/libs/api-client'

const useCreatePost = async (file: File, userId: string, caption: string) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)
    formData.append('text', caption)

    await apiClient.createPost(formData)
  } catch (error) {
    console.error('Error creating post:', error)
    throw error
  }
}

export default useCreatePost
