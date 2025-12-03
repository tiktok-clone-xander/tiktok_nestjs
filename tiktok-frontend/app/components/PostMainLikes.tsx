import { AiFillHeart } from '@/app/components/icons'
import { apiClient } from '@/libs/api-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BiLoaderCircle } from 'react-icons/bi'
import { FaCommentDots, FaShare } from 'react-icons/fa'
import { useUser } from '../context/user'
import { Comment, PostMainLikesCompTypes } from '../types'

export default function PostMainLikes({ post }: PostMainLikesCompTypes) {
  const router = useRouter()
  const contextUser = useUser()
  const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
  const [userLiked, setUserLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    fetchLikeStatus()
    getAllCommentsByPost()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id])

  const fetchLikeStatus = async () => {
    if (!contextUser?.user?.id || !post?.id) {
      setUserLiked(false)
      setLikesCount(0)
      return
    }
    try {
      const response = await apiClient.getLikeStatus(post.id)
      setUserLiked(response.hasLiked)
      setLikesCount(response.likesCount)
    } catch (error) {
      console.error('Failed to fetch like status:', error)
      setUserLiked(false)
      setLikesCount(0)
    }
  }

  const getAllCommentsByPost = async () => {
    if (!post?.id) return
    try {
      const result = await apiClient.getCommentsByPostId(post.id)
      setComments((result as Comment[]) || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    }
  }

  const like = async () => {
    try {
      setHasClickedLike(true)
      await apiClient.createLike(post?.id || '')
      await fetchLikeStatus()
      setHasClickedLike(false)
    } catch (error) {
      console.error('Failed to like:', error)
      setHasClickedLike(false)
    }
  }

  const unlike = async () => {
    try {
      setHasClickedLike(true)
      await apiClient.deleteLike(post?.id || '')
      await fetchLikeStatus()
      setHasClickedLike(false)
    } catch (error) {
      console.error('Failed to unlike:', error)
      setHasClickedLike(false)
    }
  }

  const likeOrUnlike = () => {
    if (!contextUser?.user?.id) {
      return
    }

    if (!userLiked) {
      like()
    } else {
      unlike()
    }
  }

  return (
    <>
      <div id={`PostMainLikes-${post?.id}`} className="relative mr-[75px]">
        <div className="absolute bottom-0 pl-2">
          <div className="pb-4 text-center">
            <button
              disabled={hasClickedLike}
              onClick={() => likeOrUnlike()}
              className="cursor-pointer rounded-full bg-gray-200 p-2"
            >
              {!hasClickedLike ? (
                <AiFillHeart color={userLiked ? '#ff2626' : ''} size="25" />
              ) : (
                <BiLoaderCircle className="animate-spin" size="25" />
              )}
            </button>
            <span className="text-xs font-semibold text-gray-800">{likesCount}</span>
          </div>

          <button
            onClick={() => router.push(`/post/${post?.id}/${post?.profile?.user_id}`)}
            className="pb-4 text-center"
          >
            <div className="cursor-pointer rounded-full bg-gray-200 p-2">
              <FaCommentDots size="25" />
            </div>
            <span className="text-xs font-semibold text-gray-800">{comments?.length}</span>
          </button>

          <button className="text-center">
            <div className="cursor-pointer rounded-full bg-gray-200 p-2">
              <FaShare size="25" />
            </div>
            <span className="text-xs font-semibold text-gray-800">55</span>
          </button>
        </div>
      </div>
    </>
  )
}
