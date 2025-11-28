import { apiClient } from '@/libs/ApiClient';

const useUpdateProfileImage = async (id: string, file: File) => {
  try {
    const uploadedFile = await apiClient.uploadFile(file, 'image');
    // Update profile with new image URL
    await apiClient.updateProfile(id, { image: uploadedFile.url });
  } catch (error) {
    console.error('Error updating profile image:', error);
    throw error;
  }
};

export default useUpdateProfileImage;
