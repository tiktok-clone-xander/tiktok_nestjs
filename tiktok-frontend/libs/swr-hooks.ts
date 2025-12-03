import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import useSWRMutation from 'swr/mutation'
import { apiClient, apiEndpoints } from './api-client'
import type { Comment, Notification, User, Video } from './store'

// Optimized fetcher with error handling
const fetcher = async (url: string) => {
  const response = (await apiClient.get(url)) as { data: any }
  return response.data
}

// SWR Global Config for performance
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Dedupe requests within 2s
  focusThrottleInterval: 5000, // Throttle revalidation on focus
  errorRetryCount: 2,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  keepPreviousData: true, // Keep old data while fetching new
}

// Mutation functions
const mutationFetchers = {
  post: (url: string, { arg }: { arg: any }) => apiClient.post(url, arg),
  put: (url: string, { arg }: { arg: any }) => apiClient.put(url, arg),
  patch: (url: string, { arg }: { arg: any }) => apiClient.patch(url, arg),
  delete: (url: string) => apiClient.delete(url),
}

// Auth hooks
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR(
    apiClient.isTokenValid() ? apiEndpoints.auth.profile : null,
    fetcher,
    {
      ...swrConfig,
      revalidateOnMount: true,
      dedupingInterval: 60000, // User data rarely changes
    }
  )

  return {
    user: data?.data as User | undefined,
    isLoading,
    error,
    mutate,
  }
}

export function useLogin() {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.auth.login,
    mutationFetchers.post
  )

  const login = async (credentials: { email: string; password: string }) => {
    const result = await trigger(credentials)
    if ((result as any).accessToken && (result as any).refreshToken) {
      apiClient.setTokens((result as any).accessToken, (result as any).refreshToken)
    }
    return result
  }

  return {
    login,
    isLoading: isMutating,
    error,
  }
}

export function useRegister() {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.auth.register,
    mutationFetchers.post
  )

  return {
    register: trigger,
    isLoading: isMutating,
    error,
  }
}

export function useLogout() {
  const { trigger, isMutating } = useSWRMutation(apiEndpoints.auth.logout, mutationFetchers.post)

  const logout = async () => {
    try {
      await trigger({})
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      apiClient.clearTokens()
      // Stay on current page, don't redirect
      window.location.reload()
    }
  }

  return {
    logout,
    isLoading: isMutating,
  }
}

// User hooks
export function useUser(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? apiEndpoints.users.profile(userId) : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 30000, // Profile data doesn't change often
    }
  )

  return {
    user: data?.data as User | undefined,
    isLoading,
    error,
    mutate,
  }
}

export function useUserVideos(userId: string, page = 1, limit = 20) {
  const getKey = (pageIndex: number) =>
    `${apiEndpoints.users.videos(userId)}?page=${pageIndex + 1}&limit=${limit}`

  const { data, error, isLoading, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  const videos = data ? data.flatMap((page: any) => page.data?.videos || page.videos || []) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = (data as any)?.[0]?.data?.videos?.length === 0
  const isReachingEnd =
    isEmpty || (data && (data as any)[(data as any).length - 1]?.data?.videos?.length < limit)

  return {
    videos,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    error,
    loadMore: () => setSize(size + 1),
    mutate,
  }
}

export function useFollowUser(userId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.users.follow(userId),
    mutationFetchers.post,
    {
      optimisticData: (currentData: any) => {
        if (currentData?.data) {
          return {
            ...currentData,
            data: {
              ...currentData.data,
              isFollowing: true,
              followersCount: (currentData.data.followersCount || 0) + 1,
            },
          }
        }
        return currentData
      },
      revalidate: false,
    }
  )

  return {
    follow: trigger,
    isLoading: isMutating,
  }
}

export function useUnfollowUser(userId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.users.unfollow(userId),
    mutationFetchers.delete,
    {
      optimisticData: (currentData: any) => {
        if (currentData?.data) {
          return {
            ...currentData,
            data: {
              ...currentData.data,
              isFollowing: false,
              followersCount: Math.max((currentData.data.followersCount || 0) - 1, 0),
            },
          }
        }
        return currentData
      },
      revalidate: false,
    }
  )

  return {
    unfollow: trigger,
    isLoading: isMutating,
  }
}

export function useFollowStatus(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? apiEndpoints.users.followStatus(userId) : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 10000,
    }
  )

  return {
    isFollowing: (data as any)?.data?.isFollowing || false,
    isLoading,
    error,
    mutate,
  }
}

export function useFollowers(userId: string, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `${apiEndpoints.users.followers(userId)}?page=${page}&limit=${limit}` : null,
    fetcher,
    swrConfig
  )

  return {
    followers: (data as any)?.data?.users as User[] | undefined,
    total: (data as any)?.data?.total || 0,
    hasMore: (data as any)?.data?.hasMore || false,
    isLoading,
    error,
    mutate,
  }
}

export function useFollowing(userId: string, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `${apiEndpoints.users.following(userId)}?page=${page}&limit=${limit}` : null,
    fetcher,
    swrConfig
  )

  return {
    following: (data as any)?.data?.users as User[] | undefined,
    total: (data as any)?.data?.total || 0,
    hasMore: (data as any)?.data?.hasMore || false,
    isLoading,
    error,
    mutate,
  }
}

export function useUpdateProfile(userId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.users.update(userId),
    mutationFetchers.put
  )

  return {
    updateProfile: trigger,
    isLoading: isMutating,
    error,
  }
}

export function useSearchUsers(query: string) {
  const { data, error, isLoading } = useSWR(
    query && query.length >= 2
      ? `${apiEndpoints.users.search}?q=${encodeURIComponent(query)}`
      : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 1000, // Prevent rapid requests
      revalidateOnFocus: false,
    }
  )

  return {
    users: ((data as any)?.data?.users || (data as any)?.data || []) as User[],
    isLoading,
    error,
  }
}

// Video hooks - Optimized for performance
export function useVideos(page = 1, limit = 10) {
  const getKey = (pageIndex: number) =>
    `${apiEndpoints.videos.list}?page=${pageIndex + 1}&limit=${limit}`

  const { data, error, isLoading, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      ...swrConfig,
      revalidateFirstPage: false,
      revalidateAll: false, // Don't revalidate all pages
      persistSize: true, // Keep scroll position
      parallel: false, // Load sequentially for better UX
    }
  )

  const videos = data ? data.flatMap((page: any) => page.data?.videos || page.videos || []) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = (data as any)?.[0]?.data?.videos?.length === 0
  const isReachingEnd =
    isEmpty || (data && (data as any)[(data as any).length - 1]?.data?.videos?.length < limit)

  return {
    videos,
    isLoading,
    isLoadingMore,
    isReachingEnd,
    isValidating,
    error,
    loadMore: () => setSize(size + 1),
    mutate,
  }
}

export function useVideo(videoId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? apiEndpoints.videos.detail(videoId) : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 10000, // Video data doesn't change often
    }
  )

  return {
    video: data?.data as Video | undefined,
    isLoading,
    error,
    mutate,
  }
}

export function useTrendingVideos() {
  const { data, error, isLoading, mutate } = useSWR(apiEndpoints.videos.trending, fetcher, {
    refreshInterval: 60000, // Refresh every minute
  })

  return {
    videos: ((data as any)?.data?.videos || (data as any)?.data || []) as Video[],
    isLoading,
    error,
    mutate,
  }
}

export function useSearchVideos(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `${apiEndpoints.videos.search}?q=${encodeURIComponent(query)}` : null,
    fetcher,
    {
      dedupingInterval: 2000,
    }
  )

  return {
    videos: ((data as any)?.data?.videos || (data as any)?.data || []) as Video[],
    isLoading,
    error,
  }
}

// Optimistic like/unlike with instant UI update
export function useLikeVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.interactions.like,
    async (url: string) => {
      return mutationFetchers.post(url, { arg: { videoId } })
    },
    {
      optimisticData: (currentData: any) => {
        // Instant UI update
        if (currentData?.data) {
          return {
            ...currentData,
            data: {
              ...currentData.data,
              likesCount: (currentData.data.likesCount || 0) + 1,
              isLiked: true,
            },
          }
        }
        return currentData
      },
      populateCache: true,
      revalidate: false, // Don't revalidate immediately
    }
  )

  return {
    like: () => trigger(),
    isLoading: isMutating,
  }
}

export function useUnlikeVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.interactions.unlike,
    async (url: string) => {
      return mutationFetchers.post(url, { arg: { videoId } })
    },
    {
      optimisticData: (currentData: any) => {
        // Instant UI update
        if (currentData?.data) {
          return {
            ...currentData,
            data: {
              ...currentData.data,
              likesCount: Math.max((currentData.data.likesCount || 0) - 1, 0),
              isLiked: false,
            },
          }
        }
        return currentData
      },
      populateCache: true,
      revalidate: false,
    }
  )

  return {
    unlike: () => trigger(),
    isLoading: isMutating,
  }
}

export function useLikeStatus(videoId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? apiEndpoints.interactions.likeStatus(videoId) : null,
    fetcher,
    {
      ...swrConfig,
      dedupingInterval: 10000,
    }
  )

  return {
    isLiked: (data as any)?.data?.hasLiked || false,
    isLoading,
    error,
    mutate,
  }
}

export function useShareVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.videos.share(videoId),
    mutationFetchers.post
  )

  return {
    share: trigger,
    isLoading: isMutating,
  }
}

export function useCreateVideo() {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.videos.create,
    async (url: string, { arg }: { arg: { file: File } & Record<string, any> }) => {
      return apiClient.uploadFile(url, arg.file, undefined, arg)
    }
  )

  return {
    createVideo: trigger,
    isLoading: isMutating,
    error,
  }
}

export function useDeleteVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.videos.delete(videoId),
    mutationFetchers.delete
  )

  return {
    deleteVideo: trigger,
    isLoading: isMutating,
  }
}

// Comment hooks - Optimized
export function useVideoComments(videoId: string, page = 1, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? `${apiEndpoints.comments.list(videoId)}?page=${page}&limit=${limit}` : null,
    fetcher,
    {
      ...swrConfig,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000,
    }
  )

  return {
    comments: ((data as any)?.comments || (data as any)?.data?.comments || []) as Comment[],
    total: (data as any)?.total || (data as any)?.data?.total || 0,
    hasMore: (data as any)?.hasMore || (data as any)?.data?.hasMore || false,
    isLoading,
    error,
    mutate,
  }
}

export function useCreateComment(videoId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.interactions.comment,
    async (url: string, { arg }: { arg: { content: string } }) => {
      return apiClient.post(url, { videoId, content: arg.content })
    }
  )

  return {
    createComment: trigger,
    isLoading: isMutating,
    error,
  }
}

export function useDeleteComment(commentId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.comments.delete(commentId),
    mutationFetchers.delete
  )

  return {
    deleteComment: trigger,
    isLoading: isMutating,
  }
}

// Notification hooks
export function useNotifications() {
  const { data, error, isLoading, mutate } = useSWR(apiEndpoints.notifications.list, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  return {
    notifications: (data as any)?.data as Notification[] | undefined,
    isLoading,
    error,
    mutate,
  }
}

export function useUnreadNotificationCount() {
  const { data, error, isLoading } = useSWR(apiEndpoints.notifications.count, fetcher, {
    refreshInterval: 15000, // Refresh every 15 seconds
  })

  return {
    count: (data as any)?.count as number | undefined,
    isLoading,
    error,
  }
}

export function useMarkNotificationAsRead(notificationId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.notifications.markAsRead(notificationId),
    mutationFetchers.post
  )

  return {
    markAsRead: trigger,
    isLoading: isMutating,
  }
}

export function useMarkAllNotificationsAsRead() {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.notifications.markAllAsRead,
    mutationFetchers.post
  )

  return {
    markAllAsRead: trigger,
    isLoading: isMutating,
  }
}

// Custom hooks combining SWR with Socket.IO for real-time updates
export function useRealTimeVideos() {
  const { videos, isLoading, error, mutate } = useVideos()

  // This would be used with socket manager for real-time updates
  // const { socketManager } = useSocket()

  // useEffect(() => {
  //   const cleanup = socketManager.on('video_created', (data) => {
  //     mutate()
  //   })
  //   return cleanup
  // }, [mutate])

  return {
    videos,
    isLoading,
    error,
    mutate,
  }
}
