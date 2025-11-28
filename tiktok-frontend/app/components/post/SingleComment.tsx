import { useUser } from '@/app/context/user'
import Link from 'next/link'
import { useState } from 'react'
import { BiLoaderCircle } from 'react-icons/bi'
import { BsTrash3 } from 'react-icons/bs'
import { useCommentStore } from '@/app/stores/comment'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import useDeleteComment from '@/app/hooks/useDeleteComment'
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'
import { SingleCommentCompTypes } from '@/app/types'

export default function SingleComment({ comment, params }: SingleCommentCompTypes) {
  // Initialize dayjs calendar plugin
  dayjs.extend(calendar)

  const contextUser = useUser()
  let { setCommentsByPost } = useCommentStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteThisComment = async () => {
    let res = confirm('Are you sure you weant to delete this comment?')
    if (!res) return

    try {
      setIsDeleting(true)
      await useDeleteComment(comment?.id)
      setCommentsByPost(params?.postId)
      setIsDeleting(false)
    } catch (error) {
      console.log(error)
      alert(error)
    }
  }
  return (
    <>
      <div id="SingleComment" className="mt-4 flex items-center justify-between px-8">
        <div className="relative flex w-full items-center">
          <Link href={`/profile/${comment.profile.user_id}`}>
            <img
              className="absolute top-0 mx-auto rounded-full lg:mx-0"
              width="40"
              src={useCreateBucketUrl(comment.profile.image)}
            />
          </Link>
          <div className="ml-14 w-full pt-0.5">
            <div className="flex items-center justify-between text-[18px] font-semibold">
              <span className="flex items-center">
                {comment?.profile?.name} -
                <span className="ml-1 text-[12px] font-light text-gray-600">
                  {dayjs(comment?.created_at).calendar()}
                </span>
              </span>

              {contextUser?.user?.id == comment.profile.user_id ? (
                <button disabled={isDeleting} onClick={() => deleteThisComment()}>
                  {isDeleting ? (
                    <BiLoaderCircle className="animate-spin" color="#E91E62" size="20" />
                  ) : (
                    <BsTrash3 className="cursor-pointer" size="25" />
                  )}
                </button>
              ) : null}
            </div>

            <p className="text-[15px] font-light">{comment.text}</p>
          </div>
        </div>
      </div>
    </>
  )
}
