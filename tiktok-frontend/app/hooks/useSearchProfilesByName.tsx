import { apiClient } from '@/libs/api-client'

const useSearchProfilesByName = async (searchTerm: string) => {
  try {
    if (!searchTerm.trim()) return []
    const response = (await apiClient.searchUsers(searchTerm)) as any
    // Handle the API response format
    if (response?.data?.data?.users && Array.isArray(response.data.data.users)) {
      return response.data.data.users
    }
    return []
  } catch (error) {
    console.error('Error searching profiles:', error)
    return []
  }
}

export default useSearchProfilesByName
