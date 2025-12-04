'use client'

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, apiEndpoints } from './api-client'

// Optimized hooks using React Query instead of SWR

// Videos
export function useVideos(limit = 10) {
  return useInfiniteQuery({
    queryKey: ['videos'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<any>(
        `${apiEndpoints.videos.list}?page=${pageParam}&limit=${limit}`
      )
      return response.data
    },
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage?.pagination?.page < Math.ceil(lastPage?.pagination?.total / limit)
      return hasMore ? pages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useVideo(videoId: string) {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      const response = await apiClient.get<any>(apiEndpoints.videos.detail(videoId))
      return response.data
    },
    enabled: !!videoId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUserVideos(userId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['videos', 'user', userId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<any>(
        `${apiEndpoints.users.videos(userId)}?page=${pageParam}&limit=${limit}`
      )
      return response.data
    },
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage?.data?.length === limit
      return hasMore ? pages.length + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

// Like/Unlike mutations with optimistic updates
export function useLikeVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiClient.post<any>(apiEndpoints.interactions.like, { videoId })
      return response.data
    },
    onMutate: async videoId => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['video', videoId] })
      const previousData = queryClient.getQueryData(['video', videoId])

      queryClient.setQueryData(['video', videoId], (old: any) => ({
        ...old,
        likesCount: (old?.likesCount || 0) + 1,
        isLiked: true,
      }))

      return { previousData }
    },
    onError: (err, videoId, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['video', videoId], context.previousData)
      }
    },
    onSettled: (data, error, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useUnlikeVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await apiClient.delete<any>(`${apiEndpoints.interactions.like}/${videoId}`)
      return response.data
    },
    onMutate: async videoId => {
      await queryClient.cancelQueries({ queryKey: ['video', videoId] })
      const previousData = queryClient.getQueryData(['video', videoId])

      queryClient.setQueryData(['video', videoId], (old: any) => ({
        ...old,
        likesCount: Math.max((old?.likesCount || 0) - 1, 0),
        isLiked: false,
      }))

      return { previousData }
    },
    onError: (err, videoId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['video', videoId], context.previousData)
      }
    },
    onSettled: (data, error, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

// Comments
export function useComments(videoId: string) {
  return useInfiniteQuery({
    queryKey: ['comments', videoId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<any>(
        `${apiEndpoints.interactions.comments}?videoId=${videoId}&page=${pageParam}&limit=20`
      )
      return response.data
    },
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage?.data?.length === 20
      return hasMore ? pages.length + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!videoId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export function useAddComment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ videoId, content }: { videoId: string; content: string }) => {
      const response = await apiClient.post<any>(apiEndpoints.interactions.comments, {
        videoId,
        content,
      })
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.videoId] })
      queryClient.invalidateQueries({ queryKey: ['video', variables.videoId] })
    },
  })
}

// User profile
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await apiClient.get<any>(apiEndpoints.users.profile(userId))
      return response.data
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change often
  })
}
