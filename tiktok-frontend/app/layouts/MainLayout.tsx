import React from 'react'
import SideNavMain from './includes/SideNavMain'
import TopNav from './includes/TopNav'
import { usePathname } from 'next/navigation'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <TopNav />
      <div
        className={`mx-auto flex w-full justify-between px-0 lg:px-2.5 ${pathname == '/' ? 'max-w-[1140px]' : ''}`}
      >
        <SideNavMain />
        {children}
      </div>
    </>
  )
}
