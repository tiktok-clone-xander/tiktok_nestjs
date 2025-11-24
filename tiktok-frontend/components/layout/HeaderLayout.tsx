'use client';

import { Bell, Menu, MessageCircle, Moon, Plus, Sun } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { IconButton } from '../atoms/IconButton';
import { SearchInput } from '../molecules/SearchInput';

export interface HeaderLayoutProps {
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onMessageClick?: () => void;
  onMenuClick?: () => void;
  notificationCount?: number;
  messageCount?: number;
  className?: string;
}

export const HeaderLayout: React.FC<HeaderLayoutProps> = ({
  user,
  onSearch,
  onNotificationClick,
  onMessageClick,
  onMenuClick,
  notificationCount = 0,
  messageCount = 0,
  className = '',
}) => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Check system preference
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={`
        sticky top-0 z-30
        bg-white/80 dark:bg-dark-900/80
        backdrop-blur-lg border-b border-gray-200 dark:border-dark-800
        ${className}
      `}
    >
      <div className="max-w-screen-2xl mx-auto px-3 h-14 flex items-center justify-between gap-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <IconButton
            icon={Menu}
            onClick={onMenuClick}
            variant="ghost"
            className="md:hidden"
            label="Menu"
          />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-base">T</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
              TikTok
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <SearchInput onSearch={onSearch} placeholder="Search users, videos, hashtags..." />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          {user && (
            <Link href="/upload">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Upload</span>
              </button>
            </Link>
          )}

          {/* Theme Toggle */}
          <IconButton
            icon={isDark ? Sun : Moon}
            onClick={toggleTheme}
            variant="ghost"
            label="Toggle theme"
          />

          {/* Notifications */}
          {user && (
            <>
              <IconButton
                icon={Bell}
                onClick={onNotificationClick}
                variant="ghost"
                badge={notificationCount > 0 ? notificationCount : undefined}
                label="Notifications"
              />

              {/* Messages */}
              <IconButton
                icon={MessageCircle}
                onClick={onMessageClick}
                variant="ghost"
                badge={messageCount > 0 ? messageCount : undefined}
                label="Messages"
              />

              {/* User Avatar */}
              <Link href={`/user/${user.id}`}>
                <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
              </Link>
            </>
          )}

          {/* Login Button */}
          {!user && (
            <Link href="/login">
              <button className="btn-primary">Log in</button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <SearchInput onSearch={onSearch} placeholder="Search..." />
      </div>
    </header>
  );
};

export default HeaderLayout;
