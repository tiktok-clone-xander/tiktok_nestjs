import React from 'react'
import TopNav from './includes/TopNav'

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="h-[100vh] bg-[#F8F8F8]">
        <TopNav />
        <div className="mx-auto flex w-full max-w-[1140px] justify-between px-2">{children}</div>
      </div>
    </>
  )
}
