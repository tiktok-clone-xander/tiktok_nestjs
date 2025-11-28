import { create } from 'zustand'
import { persist, devtools, createJSONStorage } from 'zustand/middleware'
import { Post, PostWithProfile } from '../types'
import useGetAllPosts from '../hooks/useGetAllPosts'
import useGetPostsByUser from '../hooks/useGetPostsByUserId'
import useGetPostById from '../hooks/useGetPostById'

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
          set({ allPosts: result as any })
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
