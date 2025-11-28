import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'
import useSWRMutation from 'swr/mutation'
import { apiClient, apiEndpoints } from './api-client'
import type { User, Video, Comment, Notification } from './store'

// Generic fetcher function
const fetcher = (url: string) => apiClient.get(url)

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
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  )

  return {
    user: data as User | undefined,
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
      window.location.href = '/login'
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
    fetcher
  )

  return {
    user: data as User | undefined,
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

  const videos = data ? data.flatMap((page: any) => page.data || []) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = (data as any)?.[0]?.data?.length === 0
  const isReachingEnd =
    isEmpty || (data && (data as any)[(data as any).length - 1]?.data?.length < limit)

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
    mutationFetchers.post
  )

  return {
    follow: trigger,
    isLoading: isMutating,
  }
}

export function useUnfollowUser(userId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.users.unfollow(userId),
    mutationFetchers.delete
  )

  return {
    unfollow: trigger,
    isLoading: isMutating,
  }
}

export function useSearchUsers(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `${apiEndpoints.users.search}?q=${encodeURIComponent(query)}` : null,
    fetcher,
    {
      dedupingInterval: 2000,
    }
  )

  return {
    users: (data as any)?.data as User[] | undefined,
    isLoading,
    error,
  }
}

// Video hooks
export function useVideos(page = 1, limit = 10) {
  const getKey = (pageIndex: number) =>
    `${apiEndpoints.videos.list}?page=${pageIndex + 1}&limit=${limit}`

  const { data, error, isLoading, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  )

  const videos = data ? data.flatMap((page: any) => page.data || []) : []
  const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined')
  const isEmpty = (data as any)?.[0]?.data?.length === 0
  const isReachingEnd =
    isEmpty || (data && (data as any)[(data as any).length - 1]?.data?.length < limit)

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

export function useVideo(videoId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? apiEndpoints.videos.detail(videoId) : null,
    fetcher
  )

  return {
    video: data as Video | undefined,
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
    videos: (data as any)?.data as Video[] | undefined,
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
    videos: (data as any)?.data as Video[] | undefined,
    isLoading,
    error,
  }
}

export function useLikeVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.videos.like(videoId),
    mutationFetchers.post
  )

  return {
    like: trigger,
    isLoading: isMutating,
  }
}

export function useUnlikeVideo(videoId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.videos.unlike(videoId),
    mutationFetchers.delete
  )

  return {
    unlike: trigger,
    isLoading: isMutating,
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

// Comment hooks
export function useVideoComments(videoId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    videoId ? apiEndpoints.comments.list(videoId) : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  )

  return {
    comments: (data as any)?.data as Comment[] | undefined,
    isLoading,
    error,
    mutate,
  }
}

export function useCreateComment(videoId: string) {
  const { trigger, isMutating, error } = useSWRMutation(
    apiEndpoints.comments.create(videoId),
    mutationFetchers.post
  )

  return {
    createComment: trigger,
    isLoading: isMutating,
    error,
  }
}

export function useLikeComment(commentId: string) {
  const { trigger, isMutating } = useSWRMutation(
    apiEndpoints.comments.like(commentId),
    mutationFetchers.post
  )

  return {
    like: trigger,
    isLoading: isMutating,
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

// Generic SWR configuration
export const swrConfig = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}
