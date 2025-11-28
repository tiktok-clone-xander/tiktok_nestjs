'use client'

import Comments from '@/app/components/post/Comments'
import CommentsHeader from '@/app/components/post/CommentsHeader'
import Link from 'next/link'
import { useEffect } from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import ClientOnly from '@/app/components/ClientOnly'
import { type Post, PostPageTypes } from '@/app/types'
import { usePostStore } from '@/app/stores/post'
import { useLikeStore } from '@/app/stores/like'
import { useCommentStore } from '@/app/stores/comment'
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'

export default async function Post({ params }: PostPageTypes) {
  const { postId, userId } = await params

  const { postById, postsByUser, setPostById, setPostsByUser } = usePostStore()
  const { setLikesByPost } = useLikeStore()
  const { setCommentsByPost } = useCommentStore()

  const router = useRouter()

  useEffect(() => {
    setPostById(postId)
    setCommentsByPost(postId)
    setLikesByPost(postId)
    setPostsByUser(userId)
  }, [])

  const loopThroughPostsUp = () => {
    postsByUser.forEach(post => {
      if (post.id > postId) {
        router.push(`/post/${post.id}/${userId}`)
      }
    })
  }

  const loopThroughPostsDown = () => {
    postsByUser.forEach(post => {
      if (post.id < postId) {
        router.push(`/post/${post.id}/${userId}`)
      }
    })
  }

  return (
    <>
      <div id="PostPage" className="h-screen w-full justify-between overflow-auto bg-black lg:flex">
        <div className="relative h-full lg:w-[calc(100%-540px)]">
          <Link
            href={`/profile/${userId}`}
            className="absolute z-20 m-5 rounded-full bg-gray-700 p-1.5 text-white hover:bg-gray-800"
          >
            <AiOutlineClose size="27" />
          </Link>

          <div>
            <button
              onClick={() => loopThroughPostsUp()}
              className="absolute right-4 top-4 z-20 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
            >
              <BiChevronUp size="30" color="#FFFFFF" />
            </button>

            <button
              onClick={() => loopThroughPostsDown()}
              className="absolute right-4 top-20 z-20 flex items-center justify-center rounded-full bg-gray-700 p-1.5 hover:bg-gray-800"
            >
              <BiChevronDown size="30" color="#FFFFFF" />
            </button>
          </div>

          <img
            className="absolute left-[70px] top-[18px] z-20 mx-auto rounded-full lg:mx-0"
            width="45"
            src="/images/tiktok-logo-small.png"
          />

          <ClientOnly>
            {postById?.video_url ? (
              <video
                className="fixed z-[0] my-auto h-screen w-full object-cover"
                src={useCreateBucketUrl(postById?.video_url)}
              />
            ) : null}

            <div className="relative z-10 bg-black bg-opacity-70 lg:min-w-[480px]">
              {postById?.video_url ? (
                <video
                  autoPlay
                  controls
                  loop
                  muted
                  className="mx-auto h-screen"
                  src={useCreateBucketUrl(postById.video_url)}
                />
              ) : null}
            </div>
          </ClientOnly>
        </div>

        <div id="InfoSection" className="relative h-full w-full bg-white lg:max-w-[550px]">
          <div className="py-7" />

          <ClientOnly>
            {postById ? <CommentsHeader post={postById} params={{ postId, userId }} /> : null}
          </ClientOnly>
          <Comments params={{ postId, userId }} />
        </div>
      </div>
    </>
  )
}
