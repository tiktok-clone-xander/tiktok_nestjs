'use client'

import { apiClient } from '@/libs/api-client'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import useCreateProfile from '../hooks/useCreateProfile'
import { User, UserContextTypes } from '../types'

const UserContext = createContext<UserContextTypes | null>(null)

const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  const checkUser = async () => {
    try {
      // This should be implemented to check if user is authenticated
      // For now, we'll check if there's a stored user token
      const token = localStorage.getItem('authToken')
      if (!token) {
        setUser(null)
        return
      }

      // You'll need to implement a "me" endpoint in your backend
      // const currentUser = await apiClient.getCurrentUser()
      // const profile = await useGetProfileByUserId(currentUser.id)
      // setUser({ id: currentUser.id, name: currentUser.name, bio: profile?.bio, image: profile?.image });

      setUser(null) // Placeholder until you implement authentication
    } catch (error) {
      setUser(null)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = (await apiClient.register({ username: name, email, password })) as any

      // Store the auth token
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      // Create profile
      await useCreateProfile(response.user.id, name, '', '')
      await checkUser()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = (await apiClient.login({ email, password })) as any

      // Store the auth token
      if (response.token) {
        localStorage.setItem('authToken', response.token)
      }

      checkUser()
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      localStorage.removeItem('authToken')
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <UserContext.Provider value={{ user, register, login, logout, checkUser }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider

export const useUser = () => useContext(UserContext)
