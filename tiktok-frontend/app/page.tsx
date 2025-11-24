'use client';

import { BottomNav } from '@/components/layout/BottomNav';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import type { Comment } from '@/components/organisms/CommentDrawer';
import { CommentDrawer } from '@/components/organisms/CommentDrawer';
import { FeedScroller } from '@/components/organisms/FeedScroller';
import type { Video } from '@/components/organisms/VideoCard';
import React from 'react';

// Mock data - replace with real API calls
const mockVideos: Video[] = [
  {
    id: '1',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    caption: 'Amazing video! Check this out 🔥 #trending #viral',
    hashtags: ['trending', 'viral', 'fyp'],
    music: {
      name: 'Original Sound',
      artist: 'User123',
    },
    user: {
      id: '1',
      username: 'user123',
      displayName: 'John Doe',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      verified: true,
    },
    stats: {
      likes: 15200,
      comments: 342,
      shares: 128,
    },
    isLiked: false,
    isSaved: false,
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      id: '3',
      username: 'commenter1',
      displayName: 'Alex Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
      verified: false,
    },
    text: 'This is amazing! 🔥',
    likes: 45,
    isLiked: false,
    createdAt: new Date(Date.now() - 3600000),
  },
];

export default function HomePage() {
  const [videos, setVideos] = React.useState<Video[]>(mockVideos);
  const [commentDrawerOpen, setCommentDrawerOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const user = {
    id: '1',
    username: 'currentuser',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
  };

  const handleLike = (videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              stats: {
                ...video.stats,
                likes: video.isLiked ? video.stats.likes - 1 : video.stats.likes + 1,
              },
            }
          : video,
      ),
    );
  };

  const handleComment = () => {
    setCommentDrawerOpen(true);
  };

  const handleSave = (videoId: string) => {
    setVideos((prev) =>
      prev.map((video) => (video.id === videoId ? { ...video, isSaved: !video.isSaved } : video)),
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="flex">
        <SidebarLayout
          user={user}
          suggestedUsers={[]}
          onFollow={(userId) => console.log('Follow:', userId)}
          onUnfollow={(userId) => console.log('Unfollow:', userId)}
          onLogout={() => console.log('Logout')}
        />

        <main className="flex-1 flex justify-center bg-black">
          <div className="w-full max-w-[690px]">
            <FeedScroller
              videos={videos}
              onLike={handleLike}
              onComment={handleComment}
              onShare={(videoId) => console.log('Share:', videoId)}
              onSave={handleSave}
              onUserClick={(userId) => console.log('User click:', userId)}
              onLoadMore={() => setLoading(true)}
              loading={loading}
              hasMore={false}
            />
          </div>
        </main>
      </div>

      <BottomNav user={user} />

      <CommentDrawer
        isOpen={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        comments={mockComments}
        onAddComment={(text) => console.log('Add comment:', text)}
        onLikeComment={(commentId) => console.log('Like comment:', commentId)}
        onReply={(commentId, text) => console.log('Reply:', commentId, text)}
      />
    </div>
  );
}
