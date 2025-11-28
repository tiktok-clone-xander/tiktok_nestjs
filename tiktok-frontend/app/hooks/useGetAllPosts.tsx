import { apiClient } from '@/libs/ApiClient';

const useGetAllPosts = async () => {
  try {
    const posts = await apiClient.getAllPosts();
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export default useGetAllPosts;
