import { apiClient } from '@/libs/api-client'

const useGetProfileByUserId = async (userId: string) => {
  try {
    const profile = await apiClient.getProfile(userId)
    return profile
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

export default useGetProfileByUserId
