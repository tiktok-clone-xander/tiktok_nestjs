// Simple hook to check if a post is liked by a user
// This will need to be implemented based on your backend's like system

const useIsLiked = (userId: string, postId: string, likesByPost: any[]) => {
  if (!likesByPost || !Array.isArray(likesByPost)) return false

  for (let like of likesByPost) {
    if (like.user_id === userId && like.post_id === postId) {
      return true
    }
  }
  return false
}

export default useIsLiked
