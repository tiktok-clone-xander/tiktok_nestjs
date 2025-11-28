import { apiClient } from '@/libs/ApiClient'

const useSearchProfilesByName = async (searchTerm: string) => {
  try {
    if (!searchTerm.trim()) return []
    const profiles = await apiClient.searchUsers(searchTerm)
    return profiles
  } catch (error) {
    console.error('Error searching profiles:', error)
    return []
  }
}

export default useSearchProfilesByName
