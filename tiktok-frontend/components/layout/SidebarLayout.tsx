'use client';

import { Bell, Compass, Home, LogOut, LucideIcon, MessageCircle, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Avatar } from '../atoms/Avatar';
import { FollowButton } from '../molecules/FollowButton';

export interface SidebarLayoutProps {
  user?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  suggestedUsers?: Array<{
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    isFollowing?: boolean;
  }>;
  onFollow?: (userId: string) => void;
  onUnfollow?: (userId: string) => void;
  onLogout?: () => void;
  className?: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  requireAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dành cho bạn', icon: Home, href: '/' },
  { label: 'Khám phá', icon: Compass, href: '/explore' },
  { label: 'Đang Follow', icon: Users, href: '/following', requireAuth: true },
  { label: 'Bạn bè', icon: Users, href: '/friends' },
  { label: 'Tin nhắn', icon: MessageCircle, href: '/messages', requireAuth: true },
  { label: 'Hoạt động', icon: Bell, href: '/activity', requireAuth: true },
  { label: 'Tải lên', icon: Plus, href: '/upload', requireAuth: true },
];

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  user,
  suggestedUsers = [],
  onFollow,
  onUnfollow,
  onLogout,
  className = '',
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col w-60 xl:w-64
        h-screen sticky top-0
        bg-black text-white
        overflow-y-auto custom-scrollbar
        ${className}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-white">TikTok</span>
          </Link>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm"
              className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1 px-2">
          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              // Hide auth-required items if user is not logged in
              if (item.requireAuth && !user) return null;

              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    active
                      ? 'bg-gray-900 text-primary-500 font-semibold'
                      : 'text-white hover:bg-gray-900'
                  }
                `}
                >
                  <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : ''}`} />
                  <span className="text-base font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          {user && <div className="border-t border-gray-800 my-2" />}

          {/* Suggested Users */}
          {user && suggestedUsers.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-xs font-semibold text-gray-500 px-4">Các tài khoản Đã follow</h3>
              <div className="space-y-2">
                {suggestedUsers.slice(0, 5).map((suggestedUser) => (
                  <div
                    key={suggestedUser.id}
                    className="flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-900 rounded-lg"
                  >
                    <Link
                      href={`/user/${suggestedUser.id}`}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <Avatar
                        src={suggestedUser.avatarUrl}
                        alt={suggestedUser.displayName || suggestedUser.username}
                        size="sm"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {suggestedUser.displayName || suggestedUser.username}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                          @{suggestedUser.username}
                        </span>
                      </div>
                    </Link>
                    <FollowButton
                      userId={suggestedUser.id}
                      isFollowing={suggestedUser.isFollowing}
                      onFollow={() => onFollow?.(suggestedUser.id)}
                      onUnfollow={() => onUnfollow?.(suggestedUser.id)}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                ))}
              </div>
              <Link
                href="/explore/users"
                className="text-sm text-primary-500 hover:text-primary-600 font-semibold px-2"
              >
                See more
              </Link>
            </div>
          )}

          {/* Logout */}
          {user && (
            <>
              <div className="border-t border-gray-200 dark:border-dark-800" />
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-gray-900 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span className="text-base font-medium">Đăng xuất</span>
              </button>
            </>
          )}

          {/* Profile Section */}
          {user && (
            <div className="mt-auto p-4 border-t border-gray-800">
              <Link
                href={`/user/${user.id}`}
                className="flex items-center gap-3 hover:bg-gray-900 rounded-lg p-2 transition-colors"
              >
                <Avatar src={user.avatarUrl} alt={user.username} size="md" />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white truncate">Hồ sơ</span>
                  <span className="text-xs text-gray-400 truncate">@{user.username}</span>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarLayout;
