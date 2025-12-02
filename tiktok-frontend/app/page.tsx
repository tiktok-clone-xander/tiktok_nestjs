'use client'

import { usePostStore } from '@/app/stores/post'
import { useEffect } from 'react'
import ClientOnly from './components/ClientOnly'
import PostMain from './components/PostMain'
import MainLayout from './layouts/MainLayout'

export default function Home() {
  const { allPosts, setAllPosts } = usePostStore()
  useEffect(() => {
    console.log('Fetching all posts on homepage load')
    console.log('All posts:', allPosts)
    setAllPosts()
  }, [])
  return (
    <>
      <MainLayout>
        <div className="ml-auto mt-[80px] w-[calc(100%-90px)] max-w-[690px]">
          <ClientOnly>
            {allPosts && allPosts.map((post, index) => <PostMain post={post} key={index} />)}
          </ClientOnly>
        </div>
      </MainLayout>
    </>
  )
}
