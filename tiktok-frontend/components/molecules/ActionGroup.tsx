'use client';

import { Bookmark, Heart, LucideIcon, MessageCircle, Share2 } from 'lucide-react';
import React from 'react';
import { IconButton } from '../atoms/IconButton';
import { NumberFormatter } from '../atoms/NumberFormatter';

export interface ActionGroupProps {
  likes?: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  showLabels?: boolean;
}

interface ActionItemProps {
  icon: LucideIcon;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  label: string;
  variant?: 'ghost' | 'default';
  animate?: boolean;
  showLabels?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon: Icon,
  count,
  active,
  onClick,
  label,
  variant = 'ghost',
  animate = false,
  showLabels = true,
}) => {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`relative ${animate ? 'animate-bounce' : ''}`}>
        <IconButton
          icon={Icon}
          onClick={onClick}
          variant={variant}
          size="lg"
          active={active}
          label={label}
          className={`
            ${active ? 'text-primary-500' : 'text-gray-700 dark:text-gray-300'}
            ${Icon === Heart && active ? 'fill-primary-500' : ''}
          `}
        />
      </div>
      {showLabels && count !== undefined && (
        <NumberFormatter value={count} className="text-xs text-gray-700 dark:text-gray-300" />
      )}
    </div>
  );
};

export const ActionGroup: React.FC<ActionGroupProps> = ({
  likes = 0,
  comments = 0,
  shares = 0,
  isLiked = false,
  isSaved = false,
  onLike,
  onComment,
  onShare,
  onSave,
  orientation = 'vertical',
  className = '',
  showLabels = true,
}) => {
  const [animateLike, setAnimateLike] = React.useState(false);

  const handleLike = () => {
    setAnimateLike(true);
    setTimeout(() => setAnimateLike(false), 300);
    onLike?.();
  };

  const containerClasses =
    orientation === 'vertical' ? 'flex flex-col gap-3' : 'flex flex-row gap-4 items-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <ActionItem
        icon={Heart}
        count={likes}
        active={isLiked}
        onClick={handleLike}
        label="Like"
        animate={animateLike}
        showLabels={showLabels}
      />

      <ActionItem
        icon={MessageCircle}
        count={comments}
        onClick={onComment}
        label="Comment"
        showLabels={showLabels}
      />

      <ActionItem
        icon={Share2}
        count={shares}
        onClick={onShare}
        label="Share"
        showLabels={showLabels}
      />

      <ActionItem
        icon={Bookmark}
        active={isSaved}
        onClick={onSave}
        label="Save"
        showLabels={showLabels}
      />
    </div>
  );
};

export default ActionGroup;
