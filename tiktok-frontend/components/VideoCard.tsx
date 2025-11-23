'use client';

import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react';
import { interactionAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { joinVideoRoom, leaveVideoRoom, onVideoLiked, onVideoComment } from '@/lib/socket';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    views: number;
    likesCount: number;
    commentsCount: number;
    user: {
      id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
  };
  isActive?: boolean;
}

export default function VideoCard({ video, isActive = false }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [commentsCount, setCommentsCount] = useState(video.commentsCount);
  const { isAuthenticated } = useAuthStore();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Join video room for real-time updates
    joinVideoRoom(video.id);

    // Listen for like events
    onVideoLiked((data) => {
      if (data.videoId === video.id) {
        setLikesCount(data.totalLikes);
      }
    });

    // Listen for comment events
    onVideoComment((data) => {
      if (data.videoId === video.id) {
        setCommentsCount(data.totalComments);
      }
    });

    return () => {
      leaveVideoRoom(video.id);
    };
  }, [video.id]);

  useEffect(() => {
    // Auto-play when active
    if (isActive) {
      setIsPlaying(true);
      // Record view
      interactionAPI.recordView(video.id).catch(console.error);
    } else {
      setIsPlaying(false);
    }
  }, [isActive, video.id]);

  useEffect(() => {
    // Check if user liked this video
    if (isAuthenticated) {
      interactionAPI
        .getLikeStatus(video.id)
        .then((res) => setIsLiked(res.data.hasLiked))
        .catch(console.error);
    }
  }, [isAuthenticated, video.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like videos');
      return;
    }

    try {
      if (isLiked) {
        await interactionAPI.unlikeVideo(video.id);
        setIsLiked(false);
      } else {
        await interactionAPI.likeVideo(video.id);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen snap-start snap-always flex items-center justify-center bg-black"
    >
      {/* Video Player */}
      <div className="relative w-full max-w-[500px] h-full">
        <ReactPlayer
          ref={playerRef}
          url={video.videoUrl}
          playing={isPlaying}
          loop
          muted={false}
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0 }}
          controls={false}
          playsinline
        />

        {/* Play/Pause overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayPause}
        >
          {!isPlaying && (
            <Play className="w-20 h-20 text-white opacity-80" fill="white" />
          )}
        </div>

        {/* Video Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
              {video.user.avatar ? (
                <img src={video.user.avatar} alt={video.user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-500 text-white font-bold">
                  {video.user.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-semibold">{video.user.username}</p>
              <p className="text-white/80 text-sm">{video.user.fullName}</p>
            </div>
          </div>
          <h3 className="text-white font-semibold mb-1">{video.title}</h3>
          {video.description && (
            <p className="text-white/90 text-sm mb-2">{video.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center gap-1 transition-transform hover:scale-110"
          >
            <Heart
              className={`w-8 h-8 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`}
            />
            <span className="text-white text-xs font-semibold">
              {likesCount > 0 ? likesCount : ''}
            </span>
          </button>

          {/* Comment Button */}
          <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
            <MessageCircle className="w-8 h-8 text-white" />
            <span className="text-white text-xs font-semibold">
              {commentsCount > 0 ? commentsCount : ''}
            </span>
          </button>

          {/* Share Button */}
          <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110">
            <Share2 className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
