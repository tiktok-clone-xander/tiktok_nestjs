'use client';

import Image from 'next/image';
import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
  online?: boolean;
  verified?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const onlineIndicatorSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  size = 'xs',
  fallback,
  className = '',
  online = false,
  verified = false,
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const initials = fallback || alt.charAt(0).toUpperCase();

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div
        className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white dark:ring-dark-800`}
      >
        {src && !imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-dark-700 animate-pulse">
                <span className="text-white font-semibold">{initials}</span>
              </div>
            )}
            <Image
              src={src}
              alt={alt}
              fill
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100px, 200px"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
            <span className="text-white font-bold">{initials}</span>
          </div>
        )}
      </div>

      {/* Online Indicator */}
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${onlineIndicatorSizes[size]} bg-green-500 rounded-full border-2 border-white dark:border-dark-800`}
        />
      )}

      {/* Verified Badge */}
      {verified && (
        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
          <svg
            className={`${size === 'xs' || size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-white`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default Avatar;
