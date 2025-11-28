import { apiClient } from '@/libs/ApiClient';

const useGetLikesByPostId = async (postId: string) => {
  try {
    const likes = await apiClient.getLikesByPostId(postId);
    return likes;
  } catch (error) {
    console.error('Error fetching likes:', error);
    return [];
  }
};

export default useGetLikesByPostId;
