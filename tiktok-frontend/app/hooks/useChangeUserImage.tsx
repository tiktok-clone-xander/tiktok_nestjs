import { apiClient } from '@/libs/api-client'

const useChangeUserImage = async (file: File, cropped: any) => {
  try {
    const uploadedFile = await apiClient.uploadFile(file, 'image')
    return uploadedFile
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export default useChangeUserImage
