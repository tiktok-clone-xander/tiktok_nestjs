import { apiClient } from '@/libs/ApiClient'

const useUpdateProfile = async (id: string, name: string, bio: string) => {
  try {
    await apiClient.updateProfile(id, { name, bio })
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

export default useUpdateProfile
