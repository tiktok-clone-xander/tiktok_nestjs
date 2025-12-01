import { apiClient } from '@/libs/api-client'

const useCreateProfile = async (userId: string, name: string, bio: string, image: string) => {
  try {
    // This will depend on your authentication system
    // For now, this is a placeholder
    await apiClient.updateProfile(userId, { name, bio, image })
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

export default useCreateProfile
