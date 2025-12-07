'use client'

import ClientOnly from '@/app/components/ClientOnly'
import FollowButton from '@/app/components/FollowButton'
import { BsPencil } from '@/app/components/icons'
import PostUser from '@/app/components/profile/PostUser'
import { useUser } from '@/app/context/user'
import MainLayout from '@/app/layouts/MainLayout'
import { useGeneralStore } from '@/app/stores/general'
import { usePostStore } from '@/app/stores/post'
import { useProfileStore } from '@/app/stores/profile'
import { User } from '@/app/types'
import createBucketUrl from '@/libs/createBucketUrl'
import { useFollowers, useFollowing, useUser as useSWRUser } from '@/libs/swr-hooks'
import Image from 'next/image'
import React, { useEffect } from 'react'

export default function Profile({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = React.useState<string | null>(null)
  const [isReady, setIsReady] = React.useState(false)
  const contextUser = useUser()
  const { postsByUser, setPostsByUser } = usePostStore()
  const { setCurrentProfile, currentProfile } = useProfileStore()
  let { isEditProfileOpen, setIsEditProfileOpen } = useGeneralStore()

  // Parse params safely
  React.useEffect(() => {
    let isMounted = true
    params.then(({ id: paramId }) => {
      if (isMounted && paramId && paramId !== 'undefined') {
        setId(paramId)
        setIsReady(true)
      } else {
        setIsReady(true)
      }
    })
    return () => {
      isMounted = false
    }
  }, [params])

  // Fetch user data with SWR (only if id is ready)
  const { user: profileUser } = useSWRUser((isReady && id) || '')
  const { followers, total: followersCount } = useFollowers((isReady && id) || '', 1, 1)
  const { following, total: followingCount } = useFollowing((isReady && id) || '', 1, 1)

  useEffect(() => {
    if (isReady && id) {
      setCurrentProfile(id)
      setPostsByUser(id)
    }
  }, [id, isReady, setCurrentProfile, setPostsByUser])

  return (
    <>
      <MainLayout>
        <div className="ml-[90px] w-[calc(100%-90px)] max-w-[1800px] pr-3 pt-[90px] lg:pl-[160px] lg:pr-0 2xl:mx-auto 2xl:pl-[185px]">
          <div className="flex w-[calc(100vw-230px)]">
            <ClientOnly>
              {currentProfile?.image ? (
                <Image
                  alt="Profile Image"
                  className="w-[120px] min-w-[120px] rounded-full"
                  src={createBucketUrl(currentProfile.image)!}
                  width={120}
                  height={120}
                />
              ) : (
                <div className="h-[120px] min-w-[120px] rounded-full bg-gray-200" />
              )}
            </ClientOnly>

            <div className="ml-5 w-full">
              <ClientOnly>
                {(currentProfile as User)?.name ? (
                  <div>
                    <p className="truncate text-[30px] font-bold">{currentProfile?.name}</p>
                    <p className="truncate text-[18px]">{currentProfile?.name}</p>
                  </div>
                ) : (
                  <div className="h-[60px]" />
                )}
              </ClientOnly>

              {contextUser?.user?.id === id ? (
                <button
                  onClick={() => setIsEditProfileOpen(!isEditProfileOpen)}
                  className="item-center mt-3 flex rounded-md border px-3.5 py-1.5 text-[15px] font-semibold hover:bg-gray-100"
                >
                  <BsPencil className="mr-1 mt-0.5" size="18" />
                  <span>Edit profile</span>
                </button>
              ) : (
                id && <FollowButton userId={id} size="md" />
              )}
            </div>
          </div>

          <div className="flex items-center pt-4">
            <div className="mr-4">
              <span className="font-bold">{followingCount || 0}</span>
              <span className="pl-1.5 text-[15px] font-light text-gray-500">Following</span>
            </div>
            <div className="mr-4">
              <span className="font-bold">{followersCount || 0}</span>
              <span className="pl-1.5 text-[15px] font-light text-gray-500">Followers</span>
            </div>
          </div>

          <ClientOnly>
            <p className="mr-4 max-w-[500px] pl-1.5 pt-4 text-[15px] font-light text-gray-500">
              {profileUser?.bio || currentProfile?.bio || 'No bio yet'}
            </p>
          </ClientOnly>

          <ul className="flex w-full items-center border-b pt-4">
            <li className="w-60 border-b-2 border-b-black py-2 text-center text-[17px] font-semibold">
              Videos
            </li>
            <li className="w-60 py-2 text-center text-[17px] font-semibold text-gray-500">Liked</li>
          </ul>

          <ClientOnly>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {postsByUser?.map((post, index) => (
                <PostUser key={index} post={post} />
              ))}
            </div>
          </ClientOnly>

          <div className="pb-20" />
        </div>
      </MainLayout>
    </>
  )
}
