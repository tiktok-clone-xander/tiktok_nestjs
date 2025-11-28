'use client'

import { AiOutlineHome } from 'react-icons/ai'
import { RiGroupLine } from 'react-icons/ri'
import { BsCameraVideo } from 'react-icons/bs'
import { MenuItemTypes } from '@/app/types'

export default function MenuItem({ iconString, colorString, sizeString }: MenuItemTypes) {
  const icons = () => {
    if (iconString == 'For You') return <AiOutlineHome size={sizeString} color={colorString} />
    if (iconString == 'Following') return <RiGroupLine size={sizeString} color={colorString} />
    if (iconString == 'LIVE') return <BsCameraVideo size={sizeString} color={colorString} />
  }

  return (
    <>
      <div className="flex w-full items-center rounded-md p-2.5 hover:bg-gray-100">
        <div className="mx-auto flex items-center lg:mx-0">
          {icons()}

          <p
            className={`mt-0.5 hidden pl-[9px] text-[17px] font-semibold lg:block text-[${colorString}]`}
          >
            {iconString}
          </p>
        </div>
      </div>
    </>
  )
}
