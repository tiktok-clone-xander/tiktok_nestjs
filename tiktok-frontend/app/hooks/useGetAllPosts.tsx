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
