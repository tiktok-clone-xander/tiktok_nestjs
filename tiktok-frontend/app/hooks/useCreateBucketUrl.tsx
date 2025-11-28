import { apiClient } from '@/libs/ApiClient';

const useCreateBucketUrl = (fileId: string) => {
  if (!fileId) return '';
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/files/image/${fileId}`;
};

export default useCreateBucketUrl;
