import { apiClient } from '@/libs/api-client'

const useGetRandomUsers = async () => {
  try {
    // This should be implemented in your backend to return suggested/random users
    const users = await apiClient.searchUsers('')
    return users
  } catch (error) {
    console.error('Error fetching random users:', error)
    return []
  }
}

export default useGetRandomUsers
