'use client';

import { BadgeCheck } from 'lucide-react';
import React from 'react';
import { Avatar } from '../atoms/Avatar';

export interface UserBadgeProps {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  verified?: boolean;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  showSubtitle?: boolean;
}

const sizeConfig = {
  sm: {
    avatar: 'sm' as const,
    nameText: 'text-sm',
    subtitleText: 'text-xs',
  },
  md: {
    avatar: 'md' as const,
    nameText: 'text-base',
    subtitleText: 'text-sm',
  },
  lg: {
    avatar: 'lg' as const,
    nameText: 'text-lg',
    subtitleText: 'text-base',
  },
};

export const UserBadge: React.FC<UserBadgeProps> = ({
  username,
  displayName,
  avatarUrl,
  verified = false,
  subtitle,
  size = 'md',
  className = '',
  onClick,
  showSubtitle = true,
}) => {
  const config = sizeConfig[size];

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <Avatar
        src={avatarUrl}
        alt={displayName || username}
        size={config.avatar}
        verified={verified}
      />

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1">
          <span
            className={`font-semibold text-gray-900 dark:text-gray-100 truncate ${config.nameText}`}
          >
            {displayName || username}
          </span>
          {verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
        </div>

        {showSubtitle && (subtitle || username) && (
          <span className={`text-gray-500 dark:text-gray-400 truncate ${config.subtitleText}`}>
            {subtitle || `@${username}`}
          </span>
        )}
      </div>
    </div>
  );
};

export default UserBadge;
