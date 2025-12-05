import { useUser } from '@/app/context/user'
import useCreateComment from '@/app/hooks/useCreateComment'
import { useCommentStore } from '@/app/stores/comment'
import { useGeneralStore } from '@/app/stores/general'
import { CommentsCompTypes } from '@/app/types'
import { useState } from 'react'
import { BiLoaderCircle } from 'react-icons/bi'
import ClientOnly from '../ClientOnly'
import SingleComment from './SingleComment'

export default function Comments({ params }: CommentsCompTypes) {
  let { commentsByPost, setCommentsByPost } = useCommentStore()
  let { setIsLoginOpen } = useGeneralStore()

  const contextUser = useUser()
  const [comment, setComment] = useState<string>('')
  const [inputFocused, setInputFocused] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const addComment = async () => {
    if (!contextUser?.user) return setIsLoginOpen(true)

    try {
      setIsUploading(true)
      await useCreateComment(contextUser?.user?.id, params?.postId, comment)
      setCommentsByPost(params?.postId)
      setComment('')
      setIsUploading(false)
    } catch (error) {
      console.log(error)
      alert(error)
    }
  }

  return (
    <>
      <div
        id="Comments"
        className="relative z-0 h-[calc(100%-273px)] w-full overflow-auto border-t-2 bg-[#F8F8F8]"
      >
        <div className="pt-2" />

        <ClientOnly>
          {!Array.isArray(commentsByPost) || commentsByPost.length < 1 ? (
            <div className="mt-6 text-center text-xl text-gray-500">No comments...</div>
          ) : (
            <div>
              {commentsByPost.map((comment, index) => (
                <SingleComment key={index} comment={comment} params={params} />
              ))}
            </div>
          )}
        </ClientOnly>

        <div className="mb-28" />
      </div>

      <div
        id="CreateComment"
        className="absolute bottom-0 flex h-[85px] w-full items-center justify-between border-t-2 bg-white px-8 py-5 lg:max-w-[550px]"
      >
        <div
          className={`flex w-full items-center rounded-lg bg-[#F1F1F2] lg:max-w-[420px] ${inputFocused ? 'border-2 border-gray-400' : 'border-2 border-[#F1F1F2]'} `}
        >
          <input
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            onChange={e => setComment(e.target.value)}
            value={comment || ''}
            className="w-full rounded-lg bg-[#F1F1F2] p-2 text-[14px] focus:outline-none lg:max-w-[420px]"
            type="text"
            placeholder="Add comment..."
          />
        </div>
        {!isUploading ? (
          <button
            disabled={!comment}
            onClick={() => addComment()}
            className={`ml-5 pr-1 text-sm font-semibold ${comment ? 'cursor-pointer text-[#F02C56]' : 'text-gray-400'} `}
          >
            Post
          </button>
        ) : (
          <BiLoaderCircle className="animate-spin" color="#E91E62" size="20" />
        )}
      </div>
    </>
  )
}
