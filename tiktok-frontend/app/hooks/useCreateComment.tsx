import { apiClient } from '@/libs/ApiClient';

const useCreateComment = async (userId: string, postId: string, comment: string) => {
  try {
    await apiClient.createComment(postId, comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export default useCreateComment;
