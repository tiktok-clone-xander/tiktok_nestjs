'use client'

import React, { useEffect, useState } from 'react'
import UploadLayout from '../layouts/UploadLayout'
import { BiLoaderCircle, BiSolidCloudUpload } from 'react-icons/bi'
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { PiKnifeLight } from 'react-icons/pi'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/user'
import { UploadError } from '../types'
import useCreatePost from '../hooks/useCreatePost'

export default function Upload() {
  const contextUser = useUser()
  const router = useRouter()

  let [fileDisplay, setFileDisplay] = useState<string>('')
  let [caption, setCaption] = useState<string>('')
  let [file, setFile] = useState<File | null>(null)
  let [error, setError] = useState<UploadError | null>(null)
  let [isUploading, setIsUploading] = useState<boolean>(false)

  useEffect(() => {
    if (!contextUser?.user) router.push('/')
  }, [contextUser])

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files && files.length > 0) {
      const file = files[0]
      const fileUrl = URL.createObjectURL(file)
      setFileDisplay(fileUrl)
      setFile(file)
    }
  }

  const discard = () => {
    setFileDisplay('')
    setFile(null)
    setCaption('')
  }

  const clearVideo = () => {
    setFileDisplay('')
    setFile(null)
  }

  const validate = () => {
    setError(null)
    let isError = false

    if (!file) {
      setError({ type: 'File', message: 'A video is required' })
      isError = true
    } else if (!caption) {
      setError({ type: 'caption', message: 'A caption is required' })
      isError = true
    }
    return isError
  }

  const createNewPost = async () => {
    let isError = validate()
    if (isError) return
    if (!file || !contextUser?.user) return
    setIsUploading(true)

    try {
      await useCreatePost(file, contextUser?.user?.id, caption)
      router.push(`/profile/${contextUser?.user?.id}`)
      setIsUploading(false)
    } catch (error) {
      console.log(error)
      setIsUploading(false)
      alert(error)
    }
  }

  return (
    <>
      <UploadLayout>
        <div className="mb-[40px] mt-[80px] w-full rounded-md bg-white px-4 py-6 shadow-lg md:px-10">
          <div>
            <h1 className="text-[23px] font-semibold">Upload video</h1>
            <h2 className="mt-1 text-gray-400">Post a video to your account</h2>
          </div>

          <div className="mt-8 gap-6 md:flex">
            {!fileDisplay ? (
              <label
                htmlFor="fileInput"
                className="mx-auto mb-6 mt-4 flex h-[470px] w-full max-w-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 text-center hover:bg-gray-100 md:mx-0"
              >
                <BiSolidCloudUpload size="40" color="#b3b3b1" />
                <p className="mt-4 text-[17px]">Select video to upload</p>
                <p className="mt-1.5 text-[13px] text-gray-500">Or drag and drop a file</p>
                <p className="mt-12 text-sm text-gray-400">MP4</p>
                <p className="mt-2 text-[13px] text-gray-400">Up to 30 minutes</p>
                <p className="mt-2 text-[13px] text-gray-400">Less than 2 GB</p>
                <label
                  htmlFor="fileInput"
                  className="mt-8 w-[80%] cursor-pointer rounded-sm bg-[#F02C56] px-2 py-1.5 text-[15px] text-white"
                >
                  Select file
                </label>
                <input type="file" id="fileInput" onChange={onChange} hidden accept=".mp4" />
              </label>
            ) : (
              <div className="relative mx-auto mb-16 mt-4 flex h-[540px] w-full max-w-[260px] cursor-pointer items-center justify-center rounded-2xl p-3 md:mx-0 md:mb-12">
                {isUploading ? (
                  <div className="absolute z-20 flex h-full w-full items-center justify-center rounded-[50px] bg-black bg-opacity-50">
                    <div className="mx-auto flex items-center justify-center gap-1">
                      <BiLoaderCircle className="animate-spin" color="#F12B56" size={30} />
                      <div className="font-bold text-white">Uploading...</div>
                    </div>
                  </div>
                ) : null}

                <img className="pointer-events-none absolute z-20" src="/images/mobile-case.png" />
                <img
                  className="absolute bottom-6 right-4 z-20"
                  width="90"
                  src="/images/tiktok-logo-white.png"
                />
                <video
                  autoPlay
                  loop
                  muted
                  className="absolute z-10 h-full w-full rounded-xl object-cover p-[13px]"
                  src={fileDisplay}
                />

                <div className="absolute -bottom-12 z-50 flex w-full items-center justify-between rounded-xl border border-gray-300 p-2">
                  <div className="flex items-center truncate">
                    <AiOutlineCheckCircle size="16" className="min-w-[16px]" />
                    <p className="truncate text-ellipsis pl-1 text-[11px]">{File.name}</p>
                  </div>
                  <button onClick={() => clearVideo()} className="ml-2 text-[11px] font-semibold">
                    Change
                  </button>
                </div>
              </div>
            )}

            <div className="mb-6 mt-4">
              <div className="flex bg-[#F8F8F8] px-6 py-4">
                <div>
                  <PiKnifeLight className="mr-4" size="20" />
                </div>
                <div>
                  <div className="text-semibold mb-1.5 text-[15px]">Divide videos and edit</div>
                  <div className="text-semibold text-[13px] text-gray-400">
                    You can quickly divide videos into multiple parts, remove redundant parts and
                    turn landscape videos into portrait videos
                  </div>
                </div>
                <div className="my-auto flex h-full w-full max-w-[130px] justify-end text-center">
                  <button className="rounded-sm bg-[#F02C56] px-8 py-1.5 text-[15px] text-white">
                    Edit
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="mb-1 text-[15px]">Caption</div>
                  <div className="text-[12px] text-gray-400">{caption.length}/150</div>
                </div>
                <input
                  maxLength={150}
                  type="text"
                  className="w-full rounded-md border p-2.5 focus:outline-none"
                  value={caption}
                  onChange={event => setCaption(event.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  disabled={isUploading}
                  onClick={() => discard()}
                  className="mt-8 rounded-sm border px-10 py-2.5 text-[16px] hover:bg-gray-100"
                >
                  Discard
                </button>
                <button
                  disabled={isUploading}
                  onClick={() => createNewPost()}
                  className="mt-8 rounded-sm border bg-[#F02C56] px-10 py-2.5 text-[16px] text-white"
                >
                  {isUploading ? (
                    <BiLoaderCircle className="animate-spin" color="#ffffff" size={25} />
                  ) : (
                    'Post'
                  )}
                </button>
              </div>

              {error ? <div className="mt-4 text-red-600">{error.message}</div> : null}
            </div>
          </div>
        </div>
      </UploadLayout>
    </>
  )
}
