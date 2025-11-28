'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast'
import { SWRConfig } from 'swr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { store, persistor } from '@/libs/store'
import { swrConfig } from '@/libs/swr-hooks'
import { socketManager } from '@/libs/socket-manager'
import VideoCard from '@/app/components/VideoCard'
import { PageTransition, LoadingSpinner, FadeIn } from '@/libs/animations'
import { cn } from '@/libs/utils'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// Mock video data for demonstration
const mockVideos = [
  {
    id: '1',
    title: 'Amazing Dance Performance',
    description: 'Check out this incredible dance routine! 🔥',
    url: '/mock-video-1.mp4',
    thumbnailUrl: '/mock-thumbnail-1.jpg',
    duration: 30,
    viewCount: 1250000,
    likeCount: 98500,
    shareCount: 15200,
    commentCount: 8750,
    tags: ['dance', 'viral', 'trending'],
    user: {
      id: 'user1',
      username: 'dancer_pro',
      email: 'dancer@example.com',
      displayName: 'Dance Pro',
      bio: 'Professional dancer and choreographer',
      avatarUrl: '/mock-avatar-1.jpg',
      verified: true,
      followerCount: 2500000,
      followingCount: 150,
      videoCount: 245,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    liked: false,
    bookmarked: false,
    createdAt: '2024-11-20T10:30:00Z',
    updatedAt: '2024-11-20T10:30:00Z',
  },
  {
    id: '2',
    title: 'Cooking Hack That Changed My Life',
    description: 'This simple trick will save you hours in the kitchen! 🍳👨‍🍳',
    url: '/mock-video-2.mp4',
    thumbnailUrl: '/mock-thumbnail-2.jpg',
    duration: 45,
    viewCount: 890000,
    likeCount: 67500,
    shareCount: 12800,
    commentCount: 4320,
    tags: ['cooking', 'lifehack', 'food'],
    user: {
      id: 'user2',
      username: 'chef_master',
      email: 'chef@example.com',
      displayName: 'Chef Master',
      bio: 'Sharing culinary secrets',
      avatarUrl: '/mock-avatar-2.jpg',
      verified: true,
      followerCount: 1800000,
      followingCount: 89,
      videoCount: 156,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    liked: true,
    bookmarked: false,
    createdAt: '2024-11-21T15:45:00Z',
    updatedAt: '2024-11-21T15:45:00Z',
  },
  // Add more mock videos as needed
]

interface AppProvidersProps {
  children: ReactNode
}

function AppProviders({ children }: AppProvidersProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner size={48} />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <SWRConfig value={swrConfig}>{children as any}</SWRConfig>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

interface VideoFeedProps {
  videos: typeof mockVideos
}

function VideoFeed({ videos }: VideoFeedProps) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Monitor socket connection
    const status = socketManager.getConnectionStatus()
    setIsConnected(status.connected)

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          setCurrentVideoIndex(prev => Math.max(0, prev - 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setCurrentVideoIndex(prev => Math.min(videos.length - 1, prev + 1))
          break
        case ' ':
          e.preventDefault()
          // Space bar to play/pause would be handled by VideoCard
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [videos.length])

  const currentVideo = videos[currentVideoIndex]

  if (!currentVideo) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <FadeIn>
          <p className="text-xl text-white">No videos available</p>
        </FadeIn>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Connection Status Indicator */}
      <div className="absolute left-4 top-4 z-50">
        <motion.div
          className={cn(
            'flex items-center gap-2 rounded-full px-3 py-1 text-sm',
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-400' : 'bg-red-400')}
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </motion.div>
      </div>

      {/* Video Navigation */}
      <div className="absolute right-4 top-4 z-50">
        <motion.div
          className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => setCurrentVideoIndex(prev => Math.max(0, prev - 1))}
            disabled={currentVideoIndex === 0}
            className={cn(
              'rounded-full p-2 transition-colors',
              currentVideoIndex === 0
                ? 'cursor-not-allowed text-gray-500'
                : 'text-white hover:bg-white/20'
            )}
          >
            ↑
          </button>
          <span className="min-w-[60px] text-center text-sm text-white">
            {currentVideoIndex + 1} / {videos.length}
          </span>
          <button
            onClick={() => setCurrentVideoIndex(prev => Math.min(videos.length - 1, prev + 1))}
            disabled={currentVideoIndex === videos.length - 1}
            className={cn(
              'rounded-full p-2 transition-colors',
              currentVideoIndex === videos.length - 1
                ? 'cursor-not-allowed text-gray-500'
                : 'text-white hover:bg-white/20'
            )}
          >
            ↓
          </button>
        </motion.div>
      </div>

      {/* Current Video */}
      <AnimatePresence mode="wait">
        <VideoCard key={currentVideo.id} video={currentVideo} isActive={true} />
      </AnimatePresence>

      {/* Preload next video */}
      {videos[currentVideoIndex + 1] && (
        <link rel="prefetch" href={videos[currentVideoIndex + 1].url} />
      )}
    </div>
  )
}

export default function ExamplePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoadingSpinner size={64} className="mb-4 text-white" />
          <motion.p
            className="text-xl text-white"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading TikTok Experience...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <AppProviders>
      <PageTransition>
        <div className="min-h-screen bg-black">
          <VideoFeed videos={mockVideos} />

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '8px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </div>
      </PageTransition>
    </AppProviders>
  )
}
