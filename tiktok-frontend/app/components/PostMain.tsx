'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { AiFillHeart } from 'react-icons/ai'
import { ImMusic } from 'react-icons/im'
import useCreateBucketUrl from '../hooks/useCreateBucketUrl'
import { PostMainCompTypes } from '../types'
import PostMainLikes from './PostMainLikes'

export default function PostMain({ post }: PostMainCompTypes) {
  useEffect(() => {
    const video = document.getElementById(`video-${post?.id}`) as HTMLVideoElement
    const postMainElement = document.getElementById(`PostMain-${post.id}`)

    if (postMainElement) {
      const observer = new IntersectionObserver(
        entries => {
          entries[0].isIntersecting ? video.play() : video.pause()
        },
        { threshold: [0.6] }
      )

      observer.observe(postMainElement)
    }
  }, [])

  return (
    <>
      <div id={`PostMain-${post.id}`} className="flex border-b py-6">
        <div className="cursor-pointer">
          {post?.profile?.image ? (
            <Image
              alt="Profile Image"
              className="max-h-[60px] rounded-full"
              width="60"
              src={useCreateBucketUrl(post.profile.image)!}
            />
          ) : (
            <div className="h-[60px] w-[60px] rounded-full bg-gray-200" />
          )}
        </div>

        <div className="w-full px-4 pl-3">
          <div className="flex items-center justify-between pb-0.5">
            <Link href={`/profile/${post?.profile?.user_id || 'unknown'}`}>
              <span className="cursor-pointer font-bold hover:underline">
                {post?.profile?.name || 'Unknown User'}
              </span>
            </Link>

            <button className="rounded-md border border-[#F02C56] px-[21px] py-0.5 text-[15px] font-semibold text-[#F02C56] hover:bg-[#ffeef2]">
              Follow
            </button>
          </div>
          <p className="max-w-[300px] break-words pb-0.5 text-[15px] md:max-w-[400px]">
            {post.text}
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
                id={`video-${post.id}`}
                loop
                controls
                muted
                className="mx-auto h-full rounded-xl object-cover"
                src={useCreateBucketUrl(post?.videoUrl || '')!}
              />
              <Image
                alt="TikTok Logo"
                className="absolute bottom-10 right-2"
                width={90}
                height={90}
                src="/images/tiktok-logo-white.png"
              />
            </div>

            <PostMainLikes post={post} />
          </div>
        </div>
      </div>
    </>
  )
}
