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
          set({ commentsByPost: result as any })
        },
      }),
      {
        name: 'store',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)
