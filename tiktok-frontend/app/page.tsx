'use client';

import VideoCard from '@/components/VideoCard';
import { videoAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket
  useEffect(() => {
    getSocket();
  }, []);

  // Fetch video feed with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['video-feed'],
    queryFn: ({ pageParam = 1 }) => videoAPI.getFeed(pageParam, 10),
    getNextPageParam: (lastPage) => {
      if (lastPage.data.hasMore) {
        return lastPage.data.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const videos = data?.pages.flatMap((page) => page.data.videos) || [];

  // Handle scroll to change active video
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / videoHeight);

      if (newIndex !== activeVideoIndex) {
        setActiveVideoIndex(newIndex);
      }

      // Load more videos when near the end
      if (
        scrollTop + videoHeight * 2 >= container.scrollHeight &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeVideoIndex, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
          <p className="text-gray-400">Be the first to upload a video!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollBehavior: 'smooth' }}
    >
      {videos.map((video, index) => (
        <VideoCard key={index} video={video} isActive={index === activeVideoIndex} />
      ))}

      {isFetchingNextPage && (
        <div className="h-screen flex items-center justify-center bg-black">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}
