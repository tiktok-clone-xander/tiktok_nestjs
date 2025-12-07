'use client'

import { useUser } from '@/app/context/user'
import { useCommentStore } from '@/app/stores/comment'
import { useGeneralStore } from '@/app/stores/general'
import { CommentsHeaderCompTypes } from '@/app/types'
import { apiClient } from '@/libs/api-client'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { BiLoaderCircle } from 'react-icons/bi'
import { BsChatDots, BsTrash3 } from 'react-icons/bs'
import { ImMusic } from 'react-icons/im'
import ClientOnly from '../ClientOnly'

export default function CommentsHeader({ post, params }: CommentsHeaderCompTypes) {
  // Initialize dayjs calendar plugin
  dayjs.extend(calendar)

  const { commentsByPost, setCommentsByPost } = useCommentStore()
  const { setIsLoginOpen } = useGeneralStore()

  const contextUser = useUser()
  const router = useRouter()
  const [hasClickedLike, setHasClickedLike] = useState<boolean>(false)
  const [isDeleteing, setIsDeleteing] = useState<boolean>(false)
  const [userLiked, setUserLiked] = useState<boolean>(false)
  const [likesCount, setLikesCount] = useState<number>(0)

  useEffect(() => {
    setCommentsByPost(params?.postId)
    fetchLikeStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.postId])

  const fetchLikeStatus = async () => {
    if (!contextUser?.user?.id) {
      setUserLiked(false)
      setLikesCount(0)
      return
    }
    try {
      const response = await apiClient.getLikeStatus(params.postId)
      setUserLiked(response.hasLiked)
      setLikesCount(response.likesCount)
    } catch (error) {
      console.error('Failed to fetch like status:', error)
      setUserLiked(false)
      setLikesCount(0)
    }
  }

  const like = async () => {
    try {
      setHasClickedLike(true)
      await apiClient.createLike(params.postId)
      await fetchLikeStatus()
      setHasClickedLike(false)
    } catch (error) {
      console.log(error)
      alert(error)
      setHasClickedLike(false)
    }
  }

  const unlike = async () => {
    try {
      setHasClickedLike(true)
      await apiClient.deleteLike(params.postId)
      await fetchLikeStatus()
      setHasClickedLike(false)
    } catch (error) {
      console.log(error)
      alert(error)
      setHasClickedLike(false)
    }
  }

  const likeOrUnlike = () => {
    if (!contextUser?.user) return setIsLoginOpen(true)

    if (!userLiked) {
      like()
    } else {
      unlike()
    }
  }

  const deletePost = async () => {
    const res = confirm('Are you sure you want to delete this post?')
    if (!res) return

    setIsDeleteing(true)

    try {
      if (params?.postId) {
        await apiClient.deletePost(params.postId)
        router.push(`/profile/${params.userId}`)
      }
      setIsDeleteing(false)
    } catch (error) {
      console.log(error)
      setIsDeleteing(false)
      alert(error)
    }
  }

  const profileImageUrl = '../../../public/images/default-avatar.png'

  return (
    <>
      <div className="flex items-center justify-between px-8">
        <div className="flex items-center">
          <Link href={`/profile/${post?.user?.id}`}>
            {profileImageUrl ? (
              <Image
                className="mx-auto rounded-full lg:mx-0"
                width="40"
                height="40"
                src={profileImageUrl}
                alt={`${post?.user?.fullName}'s profile picture`}
              />
            ) : (
              <div className="h-[40px] w-[40px] rounded-full bg-gray-200"></div>
            )}
          </Link>
          <div className="ml-3 pt-0.5">
            <Link
              href={`/profile/${post?.user?.id}`}
              className="relative z-10 text-[17px] font-semibold hover:underline"
            >
              {post?.user?.fullName}
            </Link>

            <div className="relative z-0 -mt-5 text-[13px] font-light">
              {post?.user?.fullName}
              <span className="relative -top-[2px] pl-1 pr-0.5 text-[30px]">.</span>
              <span className="font-medium">{dayjs(post?.created_at).calendar()}</span>
            </div>
          </div>
        </div>

        {contextUser?.user?.id == post?.user?.id ? (
          <div>
            {isDeleteing ? (
              <BiLoaderCircle className="animate-spin" size="25" />
            ) : (
              <button disabled={isDeleteing} onClick={() => deletePost()}>
                <BsTrash3 className="cursor-pointer" size="25" />
              </button>
            )}
          </div>
        ) : null}
      </div>

      <p className="mt-4 px-8 text-sm">{post?.content}</p>

      <p className="item-center mt-4 flex gap-2 px-8 text-sm font-bold">
        <ImMusic size="17" />
        original sound - {post?.user?.fullName}
      </p>

      <div className="mt-8 flex items-center px-8">
        <ClientOnly>
          <div className="flex items-center pb-4 text-center">
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
            <span className="pl-2 pr-4 text-xs font-semibold text-gray-800">{likesCount}</span>
          </div>
        </ClientOnly>

        <div className="flex items-center pb-4 text-center">
          <div className="cursor-pointer rounded-full bg-gray-200 p-2">
            <BsChatDots size={25} />
          </div>
          <span className="pl-2 text-xs font-semibold text-gray-800">{commentsByPost?.length}</span>
        </div>
      </div>
    </>
  )
}
