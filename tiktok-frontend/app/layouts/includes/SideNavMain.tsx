import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MenuItem from './MenuItem'
import MenuItemFollow from './MenuItemFollow'
import { useEffect } from 'react'
import { useUser } from '@/app/context/user'
import ClientOnly from '@/app/components/ClientOnly'
import { useGeneralStore } from '@/app/stores/general'

export default function SideNavMain() {
  let { setRandomUsers, randomUsers } = useGeneralStore()

  const contextUser = useUser()
  const pathname = usePathname()

  useEffect(() => {
    setRandomUsers()
  }, [])
  return (
    <>
      <div
        id="SideNavMain"
        className={`fixed z-20 h-full w-[75px] overflow-auto border-r bg-white pt-[70px] lg:border-r-0 ${pathname === '/' ? 'lg:w-[310px]' : 'lg:w-[220px]'} `}
      >
        <div className="mx-auto w-[55px] lg:w-full">
          <Link href="/">
            <MenuItem
              iconString="For You"
              colorString={pathname == '/' ? '#F02C56' : ''}
              sizeString="25"
            />
          </Link>
          <MenuItem iconString="Following" colorString="#000000" sizeString="25" />
          <MenuItem iconString="LIVE" colorString="#000000" sizeString="25" />

          <div className="mt-2 border-b lg:ml-2" />
          <h3 className="hidden px-2 pb-2 pt-4 text-xs font-semibold text-gray-600 lg:block">
            Suggested accounts
          </h3>

          <div className="block pt-3 lg:hidden" />
          <ClientOnly>
            <div className="cursor-pointer">
              {randomUsers?.map((user, index) => (
                <MenuItemFollow key={index} user={user} />
              ))}
            </div>
          </ClientOnly>

          <button className="hidden pl-2 pt-1.5 text-[13px] text-[#F02C56] lg:block">
            See all
          </button>

          {contextUser?.user?.id ? (
            <div>
              <div className="mt-2 border-b lg:ml-2" />
              <h3 className="hidden px-2 pb-2 pt-4 text-xs font-semibold text-gray-600 lg:block">
                Following accounts
              </h3>

              <div className="block pt-3 lg:hidden" />
              <ClientOnly>
                <div className="cursor-pointer">
                  {randomUsers?.map((user, index) => (
                    <MenuItemFollow key={index} user={user} />
                  ))}
                </div>
              </ClientOnly>

              <button className="hidden pl-2 pt-1.5 text-[13px] text-[#F02C56] lg:block">
                See more
              </button>
            </div>
          ) : null}
          <div className="mt-2 hidden border-b lg:ml-2 lg:block" />

          <div className="hidden text-[11px] text-gray-500 lg:block">
            <p className="px-2 pt-4">About Newsroom TikTok Shop Contact Careers ByteDance</p>
            <p className="px-2 pt-4">
              TikTok for Good Advertise Developers Transparency TikTok Rewards TikTok Browse TikTok
              Embeds
            </p>
            <p className="px-2 pt-4">
              Help Safety Terms Privacy Creator Portal Community Guidelines
            </p>
            <p className="px-2 pt-4">© 2023 TikTok</p>
          </div>

          <div className="pb-14"></div>
        </div>
      </div>
    </>
  )
}
