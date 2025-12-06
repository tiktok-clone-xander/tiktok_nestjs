import { useUser } from '@/app/context/user'
import useDeleteComment from '@/app/hooks/useDeleteComment'
import { useCommentStore } from '@/app/stores/comment'
import { SingleCommentCompTypes } from '@/app/types'
import createBucketUrl from '@/libs/createBucketUrl'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BiLoaderCircle } from 'react-icons/bi'
import { BsTrash3 } from 'react-icons/bs'

export default function SingleComment({ comment, params }: SingleCommentCompTypes) {
  // Initialize dayjs calendar plugin
  dayjs.extend(calendar)

  const contextUser = useUser()
  const { setCommentsByPost } = useCommentStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteThisComment = async () => {
    const res = confirm('Are you sure you weant to delete this comment?')
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
          <Link href={`/profile/${comment.user_id}`}>
            {comment.user.avatar ? (
              <Image
                alt="Profile Image"
                className="absolute top-0 mx-auto rounded-full lg:mx-0"
                width={40}
                height={40}
                src={createBucketUrl(comment.user.avatar)!}
              />
            ) : (
              <div className="absolute top-0 h-[40px] w-[40px] rounded-full bg-gray-200" />
            )}
          </Link>
          <div className="ml-14 w-full pt-0.5">
            <div className="flex items-center justify-between text-[18px] font-semibold">
              <span className="flex items-center">
                {comment?.user?.fullName} -
                <span className="ml-1 text-[12px] font-light text-gray-600">
                  {dayjs(comment?.created_at).calendar()}
                </span>
              </span>

              {contextUser?.user?.id == comment.user_id ? (
                <button disabled={isDeleting} onClick={() => deleteThisComment()}>
                  {isDeleting ? (
                    <BiLoaderCircle className="animate-spin" color="#E91E62" size="20" />
                  ) : (
                    <BsTrash3 className="cursor-pointer" size="25" />
                  )}
                </button>
              ) : null}
            </div>

            <p className="text-[15px] font-light">{comment.content}</p>
          </div>
        </div>
      </div>
    </>
  )
}
