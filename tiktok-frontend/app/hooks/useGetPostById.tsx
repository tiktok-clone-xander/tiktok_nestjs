import { PostWithProfile } from '@/app/types'
import { apiClient } from '@/libs/api-client'

const useGetPostById = async (id: string): Promise<PostWithProfile | null> => {
  try {
    const response = (await apiClient.getPostById(id)) as any
    const video = response?.data

    if (video) {
      // userId can come from video.user.id or video.userId
      const userId = video.user?.id || video.userId
      if (!userId) {
        console.warn('Warning: No userId found for video:', video.id)
      }
      // Map API response to PostWithProfile type
      return {
        id: video.id,
        video_url: video.videoUrl || video.video_url || '',
        content: video.content,
        created_at: video.createdAt || video.created_at || '',
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        createdAt: video.createdAt,
        // Always provide profile with fallback values
        user: {
          id: userId || 'unknown',
          fullName: video.user?.fullName || 'Unknown User',
          username: video.user?.username || 'unknown',
        },
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default useGetPostById
