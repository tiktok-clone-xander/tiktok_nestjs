const useGetRandomUsers = async () => {
  try {
    // TODO: Backend needs to implement /api/users/suggested or /api/users/random endpoint
    // For now, return empty array since the endpoint doesn't exist
    console.warn('Random users endpoint not yet implemented')
    return []
  } catch (error) {
    console.error('Error fetching random users:', error)
    return []
  }
}

export default useGetRandomUsers
