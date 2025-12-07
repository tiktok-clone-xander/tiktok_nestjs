'use client'

import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useMemo, useRef } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { ImMusic } from 'react-icons/im'
import useCreateBucketUrl from '../../libs/createBucketUrl'
import { PostMainCompTypes } from '../types'
import PostMainLikes from './PostMainLikes'

// Memoized component to prevent unnecessary re-renders
const PostMain = memo(function PostMain({ post }: PostMainCompTypes) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Compute URLs (useCreateBucketUrl is not a React hook, just a utility function)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const profileImageUrl = post?.user?.id ? '../../public/images/default-avatar.png' : null
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const videoUrl = post?.videoUrl ? useCreateBucketUrl(post.videoUrl) : ''

  const profileLink = useMemo(() => `/profile/${post?.user?.id || 'unknown'}`, [post?.user?.id])

  // Intersection Observer with cleanup
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const postMainElement = document.getElementById(`PostMain-${post.id}`)

    if (postMainElement) {
      observerRef.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            video.play().catch(() => {}) // Handle autoplay errors
          } else {
            video.pause()
          }
        },
        { threshold: [0.6] }
      )

      observerRef.current.observe(postMainElement)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [post.id])

  return (
    <>
      <div id={`PostMain-${post.id}`} className="flex border-b py-6">
        <div className="cursor-pointer">
          {profileImageUrl ? (
            <Image
              alt="Profile Image"
              className="max-h-[60px] rounded-full"
              width="60"
              height="60"
              src={profileImageUrl}
            />
          ) : (
            <div className="h-[60px] w-[60px] rounded-full bg-gray-200" />
          )}
        </div>

        <div className="w-full px-4 pl-3">
          <div className="flex items-center justify-between pb-0.5">
            <Link href={`/profile/${post?.user?.id || 'unknown'}`}>
              <span className="cursor-pointer font-bold hover:underline">
                {post?.user?.fullName || 'Unknown User'}
              </span>
            </Link>

            <button className="rounded-md border border-[#F02C56] px-[21px] py-0.5 text-[15px] font-semibold text-[#F02C56] hover:bg-[#ffeef2]">
              Follow
            </button>
          </div>
          <p className="max-w-[300px] break-words pb-0.5 text-[15px] md:max-w-[400px]">
            {post.description}
          </p>
          <p className="pb-0.5 text-[14px] text-gray-500">#fun #cool #SuperAwesome</p>
          <p className="flex items-center pb-0.5 text-[14px] font-semibold">
            <ImMusic size="17" />
            <span className="px-1">original sound - AWESOME</span>
            <AiFillHeart size="20" />
          </p>

          <div className="mt-2.5 flex">
            <div className="relative flex max-h-[580px] min-h-[480px] max-w-[260px] cursor-pointer items-center rounded-xl bg-black">
              <video
                ref={videoRef}
                id={`video-${post.id}`}
                loop
                controls
                muted
                playsInline
                preload="metadata"
                className="mx-auto h-full rounded-xl object-cover"
                src={videoUrl}
              />
              <Image
                alt="TikTok Logo"
                className="absolute bottom-10 right-2"
                width={90}
                height={90}
                src="/images/tiktok-logo-white.png"
                priority={false}
                loading="lazy"
              />
            </div>

            <PostMainLikes post={post} />
          </div>
        </div>
      </div>
    </>
  )
})

export default PostMain
