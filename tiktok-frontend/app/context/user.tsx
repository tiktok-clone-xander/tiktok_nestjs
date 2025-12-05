'use client'

import { apiClient } from '@/libs/api-client'
import { useRouter } from 'next/navigation'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { User, UserContextTypes } from '../types'

const UserContext = createContext<UserContextTypes | null>(null)

const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkUser = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Checking user authentication...')
      // Check if user is authenticated via the API
      // This will use the access token sent in Authorization header and cookies
      const response = (await apiClient.get('api/auth/me')) as any

      console.log('✅ Auth check response:', response)

      if (response && response.data.id) {
        console.log('✅ User is authenticated:', response.data)
        setUser({
          id: response.data.id,
          name: response.data.username || response.data.fullName || '',
          bio: response.data.bio || '',
          image: response.data.avatar || '',
        })
      } else {
        console.log('❌ No user data in response')
        setUser(null)
      }
    } catch (error) {
      console.log('❌ User not authenticated or session expired:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkUser()
  }, [])

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = (await apiClient.register({ username: name, email, password })) as any

      // Response contains user data and tokens
      if (response.success && response.data?.user) {
        const userData = response.data.user
        const { accessToken, refreshToken } = response.data

        // Store tokens if provided
        if (accessToken && refreshToken) {
          apiClient.setTokens(accessToken, refreshToken)
        }

        setUser({
          id: userData.id,
          name: userData.username || userData.fullName || '',
          bio: userData.bio || '',
          image: userData.avatar || '',
        })
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      // Backend expects 'username' field, but we can use email as username
      const response = (await apiClient.login({ username: email, password })) as any

      // Response contains user data and tokens
      if (response.success && response.data?.user) {
        const userData = response.data.user
        const { accessToken, refreshToken } = response.data

        // Store tokens if provided - this makes them available for future requests
        if (accessToken && refreshToken) {
          apiClient.setTokens(accessToken, refreshToken)
        }

        setUser({
          id: userData.id,
          name: userData.username || userData.fullName || '',
          bio: userData.bio || '',
          image: userData.avatar || '',
        })
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
      // Clear tokens from client side
      apiClient.clearTokens()
      // Clear user state
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error(error)
      // Clear user and tokens even if API call fails
      apiClient.clearTokens()
      setUser(null)
      router.push('/')
    }
  }

  return (
    <UserContext.Provider value={{ user, register, login, logout, checkUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider

export const useUser = () => useContext(UserContext)
