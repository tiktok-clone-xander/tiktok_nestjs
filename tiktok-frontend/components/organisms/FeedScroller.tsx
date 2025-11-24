'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import { Video, VideoCard } from './VideoCard';

export interface FeedScrollerProps {
  videos: Video[];
  onLike?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onSave?: (videoId: string) => void;
  onUserClick?: (userId: string) => void;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export const FeedScroller: React.FC<FeedScrollerProps> = ({
  videos,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  onLoadMore,
  loading = false,
  hasMore = true,
  className = '',
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0);

  // Handle scroll to detect current video
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const videoHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / videoHeight);

      if (newIndex !== currentVideoIndex) {
        setCurrentVideoIndex(newIndex);
      }

      // Load more when near the end
      const scrollPercentage = (scrollPosition + container.clientHeight) / container.scrollHeight;

      if (scrollPercentage > 0.8 && hasMore && !loading) {
        onLoadMore?.();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentVideoIndex, hasMore, loading, onLoadMore]);

  return (
    <div
      ref={containerRef}
      className={`
        h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide
        ${className}
      `}
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onLike={() => onLike?.(video.id)}
          onComment={() => onComment?.(video.id)}
          onShare={() => onShare?.(video.id)}
          onSave={() => onSave?.(video.id)}
          onUserClick={onUserClick}
        />
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-900">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading more videos...</p>
          </div>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && videos.length > 0 && (
        <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-900">
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400 text-lg">You&apos;ve reached the end!</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              Check back later for more videos
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedScroller;
