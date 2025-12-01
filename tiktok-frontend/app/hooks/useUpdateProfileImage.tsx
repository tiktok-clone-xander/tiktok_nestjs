import { apiClient } from '@/libs/api-client'

const useUpdateProfileImage = async (id: string, file: File) => {
  try {
    const uploadedFile = (await apiClient.uploadFile(file, 'image')) as any
    // Update profile with new image URL
    await apiClient.updateProfile(id, { image: uploadedFile.url })
  } catch (error) {
    console.error('Error updating profile image:', error)
    throw error
  }
}

export default useUpdateProfileImage
