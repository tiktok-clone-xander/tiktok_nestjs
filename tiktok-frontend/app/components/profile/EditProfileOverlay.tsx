import { AiOutlineClose, BiLoaderCircle, BsPencil } from '@/app/components/icons'
import { useUser } from '@/app/context/user'
import createBucketUrl from '@/libs/createBucketUrl'
import useChangeUserImage from '@/app/hooks/useChangeUserImage'
import useUpdateProfile from '@/app/hooks/useUpdateProfile'
import useUpdateProfileImage from '@/app/hooks/useUpdateProfileImage'
import { useGeneralStore } from '@/app/stores/general'
import { useProfileStore } from '@/app/stores/profile'
import { CropperDimensions, ShowErrorObject } from '@/app/types'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Cropper } from 'react-advanced-cropper'
import TextInput from '../TextInput'

export default function EditProfileOverlay() {
  const { currentProfile, setCurrentProfile } = useProfileStore()
  const { setIsEditProfileOpen } = useGeneralStore()

  const contextUser = useUser()
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [cropper, setCropper] = useState<CropperDimensions | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [userImage, setUserImage] = useState<string | ''>('')
  const [userName, setUserName] = useState<string | ''>('')
  const [userBio, setUserBio] = useState<string | ''>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<ShowErrorObject | null>(null)

  useEffect(() => {
    setUserName(currentProfile?.name || '')
    setUserBio(currentProfile?.bio || '')
    setUserImage(currentProfile?.image || '')
  }, [])

  const getUploadedImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0]

    if (selectedFile) {
      setFile(selectedFile)
      setUploadedImage(URL.createObjectURL(selectedFile))
    } else {
      setFile(null)
      setUploadedImage(null)
    }
  }

  const updateUserInfo = async () => {
    const isError = validate()
    if (isError) return
    if (!contextUser?.user) return

    try {
      setIsUpdating(true)
      await useUpdateProfile(currentProfile?.id || '', userName, userBio)
      setCurrentProfile(contextUser?.user?.id)
      setIsEditProfileOpen(false)
      router.refresh()
    } catch (error) {
      console.log(error)
    }
  }

  const cropAndUpdateImage = async () => {
    const isError = validate()
    if (isError) return
    if (!contextUser?.user) return

    try {
      if (!file) return alert('You have no file')
      if (!cropper) return alert('You have no file')
      setIsUpdating(true)

      const newImageId = await useChangeUserImage(file, cropper)
      await useUpdateProfileImage(currentProfile?.id || '', newImageId as File)

      await contextUser.checkUser()
      setCurrentProfile(contextUser?.user?.id)
      setIsEditProfileOpen(false)
      setIsUpdating(false)
    } catch (error) {
      console.log(error)
      setIsUpdating(false)
      alert(error)
    }
  }

  const showError = (type: string) => {
    if (error && Object.entries(error).length > 0 && error?.type == type) {
      return error.message
    }
    return ''
  }

  const validate = () => {
    setError(null)
    let isError = false

    if (!userName) {
      setError({ type: 'userName', message: 'A Username is required' })
      isError = true
    }
    return isError
  }

  return (
    <>
      <div
        id="EditProfileOverlay"
        className="fixed left-0 top-0 z-50 flex h-full w-full justify-center overflow-auto bg-black bg-opacity-50 pt-14 md:pt-[105px]"
      >
        <div
          className={`relative mx-3 mb-10 h-[655px] w-full max-w-[700px] rounded-lg bg-white p-4 sm:h-[580px] ${!uploadedImage ? 'h-[655px]' : 'h-[580px]'} `}
        >
          <div className="absolute left-0 top-0 flex w-full items-center justify-between border-b border-b-gray-300 p-5">
            <h1 className="text-[22px] font-medium">Edit profile</h1>
            <button
              disabled={isUpdating}
              onClick={() => setIsEditProfileOpen(false)}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <AiOutlineClose size="25" />
            </button>
          </div>

          <div className={`h-[calc(500px-200px)] ${!uploadedImage ? 'mt-16' : 'mt-[58px]'}`}>
            {!uploadedImage ? (
              <div>
                <div
                  id="ProfilePhotoSection"
                  className="flex h-[145px] w-full flex-col border-b px-1.5 py-2 sm:h-[118px]"
                >
                  <h3 className="mb-1 text-center text-[15px] font-semibold text-gray-700 sm:mb-0 sm:w-[160px] sm:text-left">
                    Profile photo
                  </h3>

                  <div className="flex items-center justify-center sm:-mt-6">
                    <label htmlFor="image" className="relative cursor-pointer">
                      {userImage ? (
                        <Image
                          alt="Profile Image"
                          className="rounded-full"
                          width="95"
                          src={createBucketUrl(userImage)!}
                        />
                      ) : (
                        <div className="h-[95px] w-[95px] rounded-full bg-gray-200" />
                      )}

                      <button className="absolute bottom-0 right-0 inline-block h-[32px] w-[32px] rounded-full border border-gray-300 bg-white p-1 shadow-xl">
                        <BsPencil size="17" className="ml-0.5" />
                      </button>
                    </label>
                    <input
                      className="hidden"
                      type="file"
                      id="image"
                      onChange={getUploadedImage}
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </div>
                </div>

                <div
                  id="UserNameSection"
                  className="mt-1.5 flex w-full flex-col border-b px-1.5 py-2 sm:h-[118px]"
                >
                  <h3 className="mb-1 text-center text-[15px] font-semibold text-gray-700 sm:mb-0 sm:w-[160px] sm:text-left">
                    Name
                  </h3>

                  <div className="flex items-center justify-center sm:-mt-6">
                    <div className="w-full max-w-md sm:w-[60%]">
                      <TextInput
                        string={userName}
                        placeholder="Username"
                        onUpdate={setUserName}
                        inputType="text"
                        error={showError('userName')}
                      />

                      <p
                        className={`relative text-[11px] text-gray-500 ${error ? 'mt-1' : 'mt-4'}`}
                      >
                        Usernames can only contain letters, numbers, underscores, and periods.
                        Changing your username will also change your profile link.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  id="UserBioSection"
                  className="mt-2 flex w-full flex-col px-1.5 py-2 sm:h-[120px]"
                >
                  <h3 className="mb-1 text-center text-[15px] font-semibold text-gray-700 sm:mb-0 sm:w-[160px] sm:text-left">
                    Bio
                  </h3>

                  <div className="flex items-center justify-center sm:-mt-6">
                    <div className="w-full max-w-md sm:w-[60%]">
                      <textarea
                        cols={30}
                        rows={4}
                        onChange={e => setUserBio(e.target.value)}
                        value={userBio || ''}
                        maxLength={80}
                        className="w-full resize-none rounded-md border border-gray-300 bg-[#F1F1F2] px-3 py-2.5 text-gray-800 focus:outline-none"
                      ></textarea>
                      <p className="text-[11px] text-gray-500">{userBio ? userBio.length : 0}/80</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="circle-stencil mx-auto max-h-[420px] w-full bg-black">
                <Cropper
                  stencilProps={{ aspectRatio: 1 }}
                  className="h-[400px]"
                  onChange={cropper => setCropper(cropper.getCoordinates())}
                  src={uploadedImage}
                />
              </div>
            )}
          </div>

          <div
            id="ButtonSection"
            className="absolute bottom-0 left-0 w-full border-t border-t-gray-300 p-5"
          >
            {!uploadedImage ? (
              <div id="UpdateInfoButtons" className="flex items-center justify-end">
                <button
                  disabled={isUpdating}
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex items-center rounded-sm border px-3 py-[6px] hover:bg-gray-100"
                >
                  <span className="px-2 text-[15px] font-medium">Cancel</span>
                </button>

                <button
                  disabled={isUpdating}
                  onClick={() => updateUserInfo()}
                  className="ml-3 flex items-center rounded-md border bg-[#F02C56] px-3 py-[6px] text-white"
                >
                  <span className="mx-4 text-[15px] font-medium">
                    {isUpdating ? (
                      <BiLoaderCircle color="#ffffff" className="mx-2.5 my-1 animate-spin" />
                    ) : (
                      'Save'
                    )}
                  </span>
                </button>
              </div>
            ) : (
              <div id="CropperButtons" className="flex items-center justify-end">
                <button
                  onClick={() => setUploadedImage(null)}
                  className="flex items-center rounded-sm border px-3 py-[6px] hover:bg-gray-100"
                >
                  <span className="px-2 text-[15px] font-medium">Cancel</span>
                </button>

                <button
                  onClick={() => cropAndUpdateImage()}
                  className="ml-3 flex items-center rounded-md border bg-[#F02C56] px-3 py-[6px] text-white"
                >
                  <span className="mx-4 text-[15px] font-medium">
                    {isUpdating ? (
                      <BiLoaderCircle color="#ffffff" className="mx-2.5 my-1 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
