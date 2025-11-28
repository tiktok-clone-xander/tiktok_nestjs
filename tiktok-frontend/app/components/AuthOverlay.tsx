import { AiOutlineClose } from 'react-icons/ai'
import { useGeneralStore } from '@/app/stores/general'
import Login from '@/app/components/auth/Login'
import Register from '@/app/components/auth/Register'
import { useState } from 'react'

export default function AuthOverlay() {
  let { setIsLoginOpen } = useGeneralStore()

  let [isRegister, setIsRegister] = useState<boolean>(false)

  return (
    <>
      <div
        id="AuthOverlay"
        className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50"
      >
        <div className="relative h-[70%] w-full max-w-[470px] rounded-lg bg-white p-4">
          <div className="flex w-full justify-end">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="rounded-full bg-gray-100 p-1.5"
            >
              <AiOutlineClose size="26" />
            </button>
          </div>

          {isRegister ? <Register /> : <Login />}

          <div className="absolute bottom-0 left-0 flex w-full items-center justify-center border-t py-5">
            <span className="text-[14px] text-gray-600">Don’t have an account?</span>

            <button
              onClick={() => setIsRegister((isRegister = !isRegister))}
              className="pl-1 text-[14px] font-semibold text-[#F02C56]"
            >
              <span>{!isRegister ? 'Register' : 'log in'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
