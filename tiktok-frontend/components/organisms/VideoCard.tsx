'use client';

import { Music } from 'lucide-react';
import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { VideoPlayer } from './VideoPlayer';

export interface Video {
  id: string;
  url: string;
  thumbnail?: string;
  caption: string;
  hashtags?: string[];
  music?: {
    name: string;
    artist: string;
  };
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface VideoCardProps {
  video: Video;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onUserClick?: (userId: string) => void;
  className?: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onLike,
  onComment,
  onShare,
  onSave,
  onUserClick,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-screen snap-start snap-always ${className}`}>
      {/* Video Player */}
      <VideoPlayer url={video.url} thumbnail={video.thumbnail} autoPlay={false} loop muted />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {/* Top Section - Username */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 pointer-events-auto">
            <Avatar
              src={video.user.avatarUrl}
              alt={video.user.username}
              size="md"
              onClick={() => onUserClick?.(video.user.id)}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-base">
                  {video.user.displayName || video.user.username}
                </span>
                {video.user.verified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <button className="ml-2 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded pointer-events-auto transition-colors">
              Follow
            </button>
          </div>
          <button className="pointer-events-auto text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Bottom Section - Caption & Actions */}
        <div className="p-4 pb-20 md:pb-4">
          <div className="flex items-end justify-between gap-4">
            {/* Left Side - Caption */}
            <div className="flex-1 space-y-2 pointer-events-auto max-w-md">
              {/* Username */}
              <div className="text-white font-semibold text-base">{video.user.username}</div>

              {/* Caption */}
              <p className="text-white text-sm leading-relaxed line-clamp-2">{video.caption}</p>

              {/* Music Info */}
              {video.music && (
                <div className="flex items-center gap-2 text-white">
                  <Music className="w-4 h-4" />
                  <span className="text-sm truncate">
                    {video.music.name} - {video.music.artist}
                  </span>
                </div>
              )}
            </div>

            {/* Right Side - Actions */}
            <div className="pointer-events-auto flex flex-col gap-4 items-center">
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onLike}
                  className="w-12 h-12 rounded-full bg-gray-900/50 hover:bg-gray-900/70 flex items-center justify-center transition-colors"
                >
                  <svg
                    className={`w-7 h-7 ${video.isLiked ? 'text-primary-500 fill-current' : 'text-white'}`}
                    fill={video.isLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">
                  {video.stats.likes > 999
                    ? `${(video.stats.likes / 1000).toFixed(1)}K`
                    : video.stats.likes}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onComment}
                  className="w-12 h-12 rounded-full bg-gray-900/50 hover:bg-gray-900/70 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">{video.stats.comments}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onSave}
                  className="w-12 h-12 rounded-full bg-gray-900/50 hover:bg-gray-900/70 flex items-center justify-center transition-colors"
                >
                  <svg
                    className={`w-7 h-7 ${video.isSaved ? 'text-yellow-500 fill-current' : 'text-white'}`}
                    fill={video.isSaved ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">{video.stats.shares}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={onShare}
                  className="w-12 h-12 rounded-full bg-gray-900/50 hover:bg-gray-900/70 flex items-center justify-center transition-colors"
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
                <span className="text-white text-xs font-semibold">Share</span>
              </div>

              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                <Avatar src={video.user.avatarUrl} alt={video.user.username} size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
