'use client'

import { useCreateComment, useDeleteComment, useVideoComments } from '@/libs/swr-hooks'
import Image from 'next/image'
import { useState } from 'react'
import { useUser } from '../context/user'
import { useGeneralStore } from '../stores/general'
import { BiLoaderCircle } from './icons'

// Utility function to create bucket URL
const createBucketUrl = (fileId: string | undefined) => {
  if (!fileId) return undefined
  if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
    return fileId
  }
  return `/uploads/images/${fileId}`
}

interface VideoComment {
  id: string
  userId: string
  videoId: string
  content: string
  createdAt: string
  user?: {
    id: string
    username: string
    fullName: string
    avatar?: string
  }
}

interface CommentsComponentProps {
  videoId: string
  className?: string
}

export default function CommentsComponent({ videoId, className = '' }: CommentsComponentProps) {
  const userContext = useUser()
  const { setIsLoginOpen } = useGeneralStore()
  const [commentText, setCommentText] = useState('')
  const [page, setPage] = useState(1)

  const { comments, total, hasMore, isLoading, mutate } = useVideoComments(videoId, page, 20)
  const { createComment, isLoading: isCreating } = useCreateComment(videoId)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userContext?.user) {
      setIsLoginOpen(true)
      return
    }

    if (!commentText.trim()) return

    try {
      await createComment({ content: commentText })
      setCommentText('')
      mutate() // Refresh comments
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Comment Input */}
      <form onSubmit={handleSubmitComment} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-shrink-0">
            {userContext?.user?.image ? (
              <Image
                src={createBucketUrl(userContext.user.image)!}
                alt="Your avatar"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#F12B56] focus:outline-none"
              disabled={isCreating}
            />
          </div>
          <button
            type="submit"
            disabled={!commentText.trim() || isCreating}
            className="rounded-lg bg-[#F12B56] px-6 py-2 font-semibold text-white transition hover:bg-[#d91f47] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? <BiLoaderCircle className="animate-spin" size={20} /> : 'Post'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-8">
            <BiLoaderCircle className="animate-spin" size={32} />
          </div>
        ) : comments && comments.length > 0 ? (
          <>
            {comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment as unknown as VideoComment}
                currentUserId={userContext?.user?.id}
                onDelete={() => mutate()}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 px-6 py-2 font-semibold transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? <BiLoaderCircle className="animate-spin" size={20} /> : 'Load more'}
                </button>
              </div>
            )}

            {/* Comments Count */}
            <div className="text-center text-sm text-gray-500">
              Showing {comments.length} of {total} comments
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: VideoComment
  currentUserId?: string
  onDelete: () => void
}

function CommentItem({ comment, currentUserId, onDelete }: CommentItemProps) {
  const { deleteComment, isLoading: isDeleting } = useDeleteComment(comment.id)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteComment()
      onDelete()
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        {comment.user?.avatar ? (
          <Image
            src={createBucketUrl(comment.user.avatar)!}
            alt={comment.user?.username || 'User'}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{comment.user?.username || 'User'}</span>
          <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 text-gray-800">{comment.content}</p>

        {/* Delete Button for Own Comments */}
        {currentUserId === comment.userId && (
          <div className="mt-2">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-600"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
