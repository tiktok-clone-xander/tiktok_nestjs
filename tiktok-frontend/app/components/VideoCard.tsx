import { AnimatedButton, FadeIn, StaggeredItem, StaggeredList } from '@/libs/animations'
import type { Video } from '@/libs/store'
import { useAppDispatch } from '@/libs/store'
import { useLikeVideo, useUnlikeVideo } from '@/libs/swr-hooks'
import { cn, formatUtils } from '@/libs/utils'
import { ChatBubbleLeftIcon, HeartIcon, PlayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { motion } from 'framer-motion'
import { debounce } from 'lodash'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useInView } from 'react-intersection-observer'
import { z } from 'zod'

// Zod schema for video interaction
const videoInteractionSchema = z.object({
  comment: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be 500 characters or less'),
  shareType: z.enum(['link', 'whatsapp', 'twitter', 'facebook']).optional(),
})

type VideoInteractionData = z.infer<typeof videoInteractionSchema>

interface VideoCardProps {
  video: Video
  isActive?: boolean
  onPlay?: () => void
  onPause?: () => void
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive = false, onPlay, onPause }) => {
  const dispatch = useAppDispatch()
  const [isPlaying, setIsPlaying] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isLiked, setIsLiked] = useState(video.liked || false)

  const { ref, inView } = useInView({ threshold: 0.5 })
  const { like } = useLikeVideo(video.id)
  const { unlike } = useUnlikeVideo(video.id)

  // Form for comments
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<VideoInteractionData>({
    resolver: zodResolver(videoInteractionSchema),
    mode: 'onChange',
  })

  // Auto-play when in view
  useEffect(() => {
    if (inView && isActive) {
      setIsPlaying(true)
      onPlay?.()
    } else {
      setIsPlaying(false)
      onPause?.()
    }
  }, [inView, isActive, onPlay, onPause])

  // Debounced like function to prevent spam
  const debouncedLike = useCallback(
    debounce(async () => {
      try {
        if (isLiked) {
          await unlike()
          setIsLiked(false)
          toast.success('Unliked!')
        } else {
          await like()
          setIsLiked(true)
          toast.success('Liked!')
        }
      } catch (error) {
        toast.error('Something went wrong')
        // Revert optimistic update
        setIsLiked(!isLiked)
      }
    }, 300),
    [isLiked, like, unlike]
  )

  const handleLike = () => {
    // Optimistic update
    setIsLiked(!isLiked)
    debouncedLike()
  }

  const handleShare = useCallback(
    async (shareType: string = 'link') => {
      try {
        const shareUrl = `${window.location.origin}/video/${video.id}`

        if (navigator.share && shareType === 'native') {
          await navigator.share({
            title: video.title,
            text: video.description || '',
            url: shareUrl,
          })
        } else {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied to clipboard!')
        }
      } catch (error) {
        toast.error('Failed to share video')
      }
    },
    [video]
  )

  const onCommentSubmit = (data: VideoInteractionData) => {
    // Here you would typically call an API to submit the comment
    console.log('Comment submitted:', data.comment)
    toast.success('Comment posted!')
    reset()
    setShowComments(false)
  }

  // Calculate engagement metrics using Decimal.js for precision
  const engagementRate = new Decimal(video.likeCount)
    .plus(video.commentCount)
    .plus(video.shareCount)
    .div(Math.max(video.viewCount, 1))
    .mul(100)
    .toFixed(2)

  return (
    <motion.div
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-black"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          src={video.url}
          poster={video.thumbnailUrl}
          muted
          loop
          playsInline
          autoPlay={isPlaying}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
      </div>

      {/* Play/Pause Control */}
      <motion.button
        className="absolute inset-0 flex items-center justify-center"
        onClick={() => setIsPlaying(!isPlaying)}
        whileTap={{ scale: 0.95 }}
      >
        {!isPlaying && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="rounded-full bg-black/50 p-4"
          >
            <PlayIcon className="ml-1 h-12 w-12 text-white" />
          </motion.div>
        )}
      </motion.button>

      {/* Video Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <FadeIn delay={0.2}>
          <div className="flex items-end justify-between">
            <div className="mr-4 flex-1">
              {/* User Info */}
              <div className="mb-3 flex items-center">
                <Image
                  src={video.user.avatarUrl || '/images/default-avatar.png'}
                  alt={video.user.displayName}
                  className="h-10 w-10 rounded-full border-2 border-white"
                />
                <div className="ml-3">
                  <p className="text-lg font-semibold">{video.user.displayName}</p>
                  <p className="text-sm text-gray-300">
                    {formatUtils.formatCount(video.user.followerCount)} followers
                  </p>
                </div>
                {video.user.verified && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Video Title and Description */}
              <h3 className="mb-2 line-clamp-2 text-xl font-bold">{video.title}</h3>
              {video.description && (
                <p className="mb-3 line-clamp-3 text-sm text-gray-200">{video.description}</p>
              )}

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {video.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="rounded-full bg-white/20 px-3 py-1 text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <span>{formatUtils.formatCount(video.viewCount)} views</span>
                <span>•</span>
                <span>{dayjs(video.createdAt).fromNow()}</span>
                <span>•</span>
                <span>{engagementRate}% engagement</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center space-y-4">
              <AnimatedButton
                onClick={handleLike}
                className={cn('rounded-full p-3', isLiked ? 'bg-red-500' : 'bg-white/20')}
              >
                {isLiked ? (
                  <HeartIconSolid className="h-6 w-6 text-white" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-white" />
                )}
              </AnimatedButton>
              <span className="text-sm">{formatUtils.formatCount(video.likeCount)}</span>

              <AnimatedButton
                onClick={() => setShowComments(!showComments)}
                className="rounded-full bg-white/20 p-3"
              >
                <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
              </AnimatedButton>
              <span className="text-sm">{formatUtils.formatCount(video.commentCount)}</span>

              <AnimatedButton
                onClick={() => handleShare()}
                className="rounded-full bg-white/20 p-3"
              >
                <ShareIcon className="h-6 w-6 text-white" />
              </AnimatedButton>
              <span className="text-sm">{formatUtils.formatCount(video.shareCount)}</span>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Comments Modal */}
      {showComments && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute right-0 top-0 h-full w-96 border-l border-white/20 bg-black/90 backdrop-blur-lg"
        >
          <div className="flex h-full flex-col p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Comments</h3>
              <button
                onClick={() => setShowComments(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleSubmit(onCommentSubmit)} className="mb-4">
              <div className="flex gap-2">
                <input
                  {...register('comment')}
                  placeholder="Add a comment..."
                  className={cn(
                    'flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/50',
                    'border border-white/20 outline-none focus:border-white/40',
                    errors.comment && 'border-red-500'
                  )}
                />
                <AnimatedButton
                  disabled={!isValid}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-semibold',
                    isValid
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'cursor-not-allowed bg-gray-500 text-gray-300'
                  )}
                >
                  Post
                </AnimatedButton>
              </div>
              {errors.comment && (
                <p className="mt-1 text-xs text-red-400">{errors.comment.message}</p>
              )}
            </form>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              <StaggeredList>
                {/* Mock comments for demonstration */}
                {Array.from({ length: 10 }, (_, i) => (
                  <StaggeredItem key={i}>
                    <div className="mb-4 rounded-lg bg-white/5 p-3">
                      <div className="flex items-start gap-3">
                        <Image
                          src="/images/default-avatar.png"
                          alt="Commenter"
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">User {i + 1}</p>
                          <p className="mt-1 text-sm text-white/80">
                            This is a sample comment for demonstration purposes.
                          </p>
                          <p className="mt-2 text-xs text-white/50">
                            {dayjs()
                              .subtract(i * 10, 'minutes')
                              .fromNow()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </StaggeredItem>
                ))}
              </StaggeredList>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default VideoCard
