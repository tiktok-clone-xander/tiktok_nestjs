'use client'

import { useVideos } from '@/libs/swr-hooks'
import { useCallback, useMemo } from 'react'
import ClientOnly from './components/ClientOnly'
import PostMain from './components/PostMain'
import MainLayout from './layouts/MainLayout'

export default function Home() {
  // Use SWR for data fetching instead of Zustand
  const { videos, isLoading, isLoadingMore, isReachingEnd, loadMore, error } = useVideos(1, 10)

  // Memoize videos to prevent re-computation
  const memoizedVideos = useMemo(() => videos, [videos])

  // Memoize load more handler
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && !isReachingEnd) {
      loadMore()
    }
  }, [isLoadingMore, isReachingEnd, loadMore])

  return (
    <MainLayout>
      <div className="ml-auto mt-[80px] w-[calc(100%-90px)] max-w-[690px]">
        <ClientOnly>
          {/* Show loading skeleton */}
          {isLoading && (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-[580px] rounded-xl bg-gray-200" />
                </div>
              ))}
            </div>
          )}

          {/* Show error */}
          {error && (
            <div className="py-10 text-center text-red-500">
              Failed to load videos. Please try again.
            </div>
          )}

          {/* Render videos - memoized to prevent re-renders */}
          {!isLoading && memoizedVideos.length > 0 && (
            <>
              {memoizedVideos.map(post => (
                <PostMain post={post} key={post.id} />
              ))}

              {/* Load more button */}
              {!isReachingEnd && (
                <div className="py-10 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="rounded-lg bg-[#F02C56] px-8 py-2 font-semibold text-white hover:bg-[#d02449] disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!isLoading && memoizedVideos.length === 0 && !error && (
            <div className="py-20 text-center text-gray-500">No videos available</div>
          )}
        </ClientOnly>
      </div>
    </MainLayout>
  )
}
