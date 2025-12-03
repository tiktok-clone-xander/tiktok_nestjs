import { AiOutlineCheck } from '@/app/components/icons'
import { MenuItemFollowCompTypes } from '@/app/types'
import createBucketUrl from '@/libs/createBucketUrl'
import Image from 'next/image'
import Link from 'next/link'

export default function MenuItemFollow({ user }: MenuItemFollowCompTypes) {
  return (
    <>
      <Link
        href={`/profile/${user?.id}`}
        className="flex w-full items-center rounded-md px-2 py-1.5 hover:bg-gray-100"
      >
        {user?.image ? (
          <Image
            alt="Profile Image"
            className="mx-auto rounded-full lg:mx-0"
            width="35"
            src={createBucketUrl(user.image)!}
          />
        ) : (
          <div className="h-[35px] w-[35px] rounded-full bg-gray-200" />
        )}
        <div className="hidden lg:block lg:pl-2.5">
          <div className="flex items-center">
            <p className="truncate text-[14px] font-bold">{user?.name}</p>
            <p className="relative ml-1 h-[14px] rounded-full bg-[#58D5EC]">
              <AiOutlineCheck className="relative p-[3px]" color="#FFFFFF" size="15" />
            </p>
          </div>

          <p className="text-[12px] font-light text-gray-600">{user?.name}</p>
        </div>
      </Link>
    </>
  )
}
