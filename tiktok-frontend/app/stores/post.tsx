import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import useGetAllPosts from '../hooks/useGetAllPosts'
import useGetPostById from '../hooks/useGetPostById'
import useGetPostsByUser from '../hooks/useGetPostsByUserId'
import { Post, PostWithProfile } from '../types'

interface PostStore {
  allPosts: PostWithProfile[]
  postsByUser: Post[]
  postById: PostWithProfile | null
  setAllPosts: () => void
  setPostsByUser: (userId: string) => void
  setPostById: (postId: string) => void
}

export const usePostStore = create<PostStore>()(
  devtools(
    persist(
      set => ({
        allPosts: [],
        postsByUser: [],
        postById: null,

        setAllPosts: async () => {
          const result = await useGetAllPosts()
          set({ allPosts: result })
        },
        setPostsByUser: async (userId: string) => {
          const result = await useGetPostsByUser(userId)
          set({ postsByUser: result as any })
        },
        setPostById: async (postId: string) => {
          const result = await useGetPostById(postId)
          set({ postById: result as any })
        },
      }),
      {
        name: 'store',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)
