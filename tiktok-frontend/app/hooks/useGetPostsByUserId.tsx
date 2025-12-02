import { PostWithProfile } from '@/app/types'
import { apiClient } from '@/libs/api-client'

const useGetPostsByUserId = async (userId: string): Promise<PostWithProfile[]> => {
  try {
    const response = (await apiClient.getPostsByUserId(userId)) as any
    const videos = response?.data?.videos || response?.videos

    if (videos && Array.isArray(videos)) {
      // Map API response to PostWithProfile type
      return videos.map((video: any) => {
        const userId = video.user?.id || video.userId || 'unknown'
        return {
          id: video.id,
          user_id: userId,
          video_url: video.videoUrl || video.video_url || '',
          text: video.description || video.text || '',
          created_at: video.createdAt || video.created_at || '',
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          views: video.views,
          createdAt: video.createdAt,
          // Always provide profile with fallback values
          profile: {
            user_id: userId,
            name: video.user?.fullName || video.user?.username || 'Unknown User',
            image: video.user?.avatar || '',
          },
        }
      })
    }
    return []
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

export default useGetPostsByUserId
