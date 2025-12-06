import { PostWithProfile } from '@/app/types'
import { apiClient } from '@/libs/api-client'

const useGetAllPosts = async (): Promise<PostWithProfile[]> => {
  try {
    const response = (await apiClient.getAllPosts()) as any

    // Response structure: {success: true, data: {videos: [], pagination: {...}}}
    const videos = response?.data?.videos || response?.videos

    if (videos && Array.isArray(videos)) {
      // Map API response to PostWithProfile type
      const mapped = videos.map((video: any) => {
        // Try to get userId from video.user, fallback to video.userId, never use 'unknown'
        const userId = video.user?.id || video.userId
        if (!userId) {
          console.warn('Warning: No userId found for video:', video.id)
        }
        return {
          id: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          video_url: video.videoUrl || video.video_url || '',
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          views: video.views,
          content: video.content || '',
          created_at: video.createdAt || video.created_at || '',
          createdAt: video.createdAt,
          user: {
            id: userId || '',
            username: video.user?.username || 'Unknown User',
            fullName: video.user?.fullName || video.user?.username || 'Unknown User',
          },
        }
      })
      console.log('useGetAllPosts - Mapped posts:', mapped)
      return mapped
    }
    console.log('useGetAllPosts - No videos found in response')
    return []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default useGetAllPosts
