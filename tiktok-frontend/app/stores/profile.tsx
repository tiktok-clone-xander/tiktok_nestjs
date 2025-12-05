import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'
import useGetProfileByUserId from '../hooks/useGetProfileByUserId'
import { Profile } from '../types'

interface ProfileStore {
  currentProfile: Profile | null
  setCurrentProfile: (userId: string) => void
}

export const useProfileStore = create<ProfileStore>()(
  devtools(
    persist(
      set => ({
        currentProfile: null,

        setCurrentProfile: async (userId: string) => {
          if (!userId) {
            set({ currentProfile: null })
            return
          }
          const result = await useGetProfileByUserId(userId)
          set({ currentProfile: result as any })
        },
      }),
      {
        name: 'store',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)
