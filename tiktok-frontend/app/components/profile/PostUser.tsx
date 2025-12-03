import { AiOutlineLoading3Quarters, BiErrorCircle, SiSoundcharts } from '@/app/components/icons'
import { PostUserCompTypes } from '@/app/types'
import createBucketUrl from '@/libs/createBucketUrl'
import Link from 'next/link'
import { useEffect } from 'react'

export default function PostUser({ post }: PostUserCompTypes) {
  useEffect(() => {
    const video = document.getElementById(`video${post?.id}`) as HTMLVideoElement

    setTimeout(() => {
      video.addEventListener('mouseenter', () => {
        video.play()
      })
      video.addEventListener('mouseleave', () => {
        video.pause()
      })
    }, 50)
  }, [])

  return (
    <>
      <div className="relative cursor-pointer brightness-90 hover:brightness-[1.1]">
        {!post.video_url ? (
          <div className="absolute left-0 top-0 flex aspect-[3/4] w-full items-center justify-center rounded-md bg-black object-cover">
            <AiOutlineLoading3Quarters className="ml-1 animate-spin" size="80" color="#FFFFFF" />
          </div>
        ) : post.video_url ? (
          <Link href={`/post/${post.id}/${post.user_id}`}>
            <video
              id={`video${post.id}`}
              muted
              loop
              className="aspect-[3/4] rounded-md object-cover"
              src={createBucketUrl(post.video_url)!}
            />
          </Link>
        ) : (
          <div className="aspect-[3/4] rounded-md bg-gray-200" />
        )}
        <div className="px-1">
          <p className="break-words pt-1 text-[15px] text-gray-700">{post.text}</p>
          <div className="-ml-1 flex items-center gap-1 text-xs font-bold text-gray-600">
            <SiSoundcharts size="15" />
            3%
            <BiErrorCircle size="16" />
          </div>
        </div>
      </div>
    </>
  )
}
