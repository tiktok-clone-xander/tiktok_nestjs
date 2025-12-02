import { useUser } from '@/app/context/user'
import useCreateBucketUrl from '@/app/hooks/useCreateBucketUrl'
import useSearchProfilesByName from '@/app/hooks/useSearchProfilesByName'
import { useGeneralStore } from '@/app/stores/general'
import { RandomUsers } from '@/app/types'
import { debounce } from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { BiSearch, BiUser } from 'react-icons/bi'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { FiLogOut } from 'react-icons/fi'

export default function TopNav() {
  const userContext = useUser()
  const router = useRouter()
  const pathname = usePathname()

  const [searchProfiles, setSearchProfiles] = useState<RandomUsers[]>([])
  let [showMenu, setShowMenu] = useState<boolean>(false)
  const { setIsLoginOpen, setIsEditProfileOpen } = useGeneralStore()

  useEffect(() => {
    setIsEditProfileOpen(false)
  }, [])

  const handleSearchName = debounce(async (event: { target: { value: string } }) => {
    if (event.target.value == '') return setSearchProfiles([])

    try {
      const result = await useSearchProfilesByName(event.target.value)
      if (result) return setSearchProfiles(result as any)
      setSearchProfiles([])
    } catch (error) {
      console.log(error)
      setSearchProfiles([])
      alert(error)
    }
  }, 500)

  const goTo = () => {
    if (!userContext?.user) return setIsLoginOpen(true)
    router.push('/upload')
  }

  return (
    <>
      <div id="TopNav" className="fixed z-30 flex h-[60px] w-full items-center border-b bg-white">
        <div
          className={`mx-auto flex w-full items-center justify-between gap-6 px-4 ${pathname === '/' ? 'max-w-[1150px]' : ''}`}
        >
          <Link href="/">
            <Image
              width={115}
              height={40}
              alt="TikTok Logo"
              className="w-[115px] min-w-[115px]"
              src="/images/tiktok-logo.png"
            />
          </Link>

          <div className="relative hidden w-full max-w-[430px] items-center justify-end rounded-full bg-[#F1F1F2] p-1 md:flex">
            <input
              type="text"
              onChange={handleSearchName}
              className="my-2 w-full bg-transparent pl-3 text-[15px] placeholder-[#838383] focus:outline-none"
              placeholder="Search accounts"
            />

            {searchProfiles.length > 0 ? (
              <div className="absolute left-0 top-12 z-20 h-auto w-full max-w-[910px] border bg-white p-1">
                {searchProfiles.map((profile, index) => (
                  <div className="p-1" key={index}>
                    <Link
                      href={`/profile/${profile?.id}`}
                      className="flex w-full cursor-pointer items-center justify-between p-1 px-2 hover:bg-[#F12B56] hover:text-white"
                    >
                      <div className="flex items-center">
                        {profile?.image ? (
                          <Image
                            alt="Profile Image"
                            className="rounded-md"
                            width={40}
                            height={40}
                            src={useCreateBucketUrl(profile.image)!}
                          />
                        ) : (
                          <div className="h-[40px] w-[40px] rounded-md bg-gray-200" />
                        )}
                        <div className="ml-2 truncate">{profile?.name}</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex items-center border-l border-l-gray-300 px-3 py-1">
              <BiSearch color="#A1A2A7" size="22" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goTo()}
              className="flex items-center rounded-sm border py-[6px] pl-1.5 hover:bg-gray-100"
            >
              <AiOutlinePlus color="#000000" size="22" />
              <span className="px-2 text-[15px] font-medium">Upload</span>
            </button>

            {!userContext?.user?.id ? (
              <div className="flex items-center">
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="flex items-center rounded-md border bg-[#F02C56] px-3 py-[6px] text-white"
                >
                  <span className="mx-4 whitespace-nowrap text-[15px] font-medium">Log in</span>
                </button>
                <BsThreeDotsVertical color="#161724" size="25" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="relative">
                  <button
                    onClick={() => setShowMenu((showMenu = !showMenu))}
                    className="mt-1 rounded-full border border-gray-200"
                  >
                    {userContext?.user?.image ? (
                      <Image
                        width={35}
                        height={35}
                        alt="Profile Image"
                        className="h-[35px] w-[35px] rounded-full"
                        src={useCreateBucketUrl(userContext.user.image)!}
                      />
                    ) : (
                      <div className="h-[35px] w-[35px] rounded-full bg-gray-200" />
                    )}
                  </button>

                  {showMenu ? (
                    <div className="absolute right-0 top-[40px] w-[200px] rounded-lg border bg-white py-1.5 shadow-xl">
                      <button
                        onClick={() => {
                          router.push(`/profile/${userContext?.user?.id}`)
                          setShowMenu(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-start px-2 py-3 hover:bg-gray-100"
                      >
                        <BiUser size="20" />
                        <span className="pl-2 text-sm font-semibold">Profile</span>
                      </button>
                      <button
                        onClick={async () => {
                          await userContext?.logout()
                          setShowMenu(false)
                        }}
                        className="flex w-full cursor-pointer items-center justify-start border-t px-1.5 py-3 hover:bg-gray-100"
                      >
                        <FiLogOut size={20} />
                        <span className="pl-2 text-sm font-semibold">Log out</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
