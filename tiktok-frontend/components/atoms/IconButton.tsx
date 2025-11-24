'use client';

import { LucideIcon } from 'lucide-react';
import React from 'react';

export interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  active?: boolean;
  label?: string;
  badge?: number | string;
}

const variantClasses = {
  default:
    'bg-gray-100 hover:bg-gray-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300',
  primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-button',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

const iconSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  active = false,
  label,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        relative inline-flex items-center justify-center rounded-full
        transition-all duration-200 active:scale-90
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${active ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-900' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <Icon className={iconSizeClasses[size]} />

      {/* Badge */}
      {badge !== undefined && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
          {typeof badge === 'number' && badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
};

export default IconButton;
