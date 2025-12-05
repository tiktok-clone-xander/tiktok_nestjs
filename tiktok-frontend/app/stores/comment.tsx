import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import useGetCommentsByPostId from '../hooks/useGetCommentsByPostId'
import { CommentWithProfile } from '../types'

interface CommentStore {
  commentsByPost: CommentWithProfile[]
  setCommentsByPost: (postId: string) => void
}

export const useCommentStore = create<CommentStore>()(
  devtools(
    persist(
      set => ({
        commentsByPost: [],

        setCommentsByPost: async (postId: string) => {
          if (!postId) {
            set({ commentsByPost: [] })
            return
          }
          const result = await useGetCommentsByPostId(postId)
          // Extract comments array from response
          const comments = (result as any)?.data?.comments || (result as any)?.comments || []
          set({ commentsByPost: Array.isArray(comments) ? comments : [] })
        },
      }),
      {
        name: 'store',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)
