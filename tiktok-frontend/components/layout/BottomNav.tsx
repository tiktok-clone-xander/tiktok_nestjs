'use client';

import { Compass, Home, LucideIcon, Plus, User, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export interface BottomNavProps {
  user?: {
    id: string;
  };
  className?: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  isUpload?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Explore', icon: Compass, href: '/explore' },
  { label: 'Upload', icon: Plus, href: '/upload', isUpload: true },
  { label: 'Following', icon: Users, href: '/following' },
  { label: 'Profile', icon: User, href: '/profile' },
];

export const BottomNav: React.FC<BottomNavProps> = ({ user, className = '' }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-30
        lg:hidden
        bg-black/95
        backdrop-blur-lg
        border-t border-gray-900
        ${className}
      `}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          // Modify profile link if user is logged in
          const href = item.href === '/profile' && user ? `/user/${user.id}` : item.href;

          return (
            <Link
              key={item.href}
              href={href}
              className={`
                flex flex-col items-center justify-center flex-1
                transition-colors duration-200 relative
              `}
            >
              {item.isUpload ? (
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <Icon className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
              ) : (
                <>
                  <Icon
                    className={`w-6 h-6 ${active ? 'text-white stroke-[2.5]' : 'text-gray-400'}`}
                  />
                  <span
                    className={`text-xs mt-1 ${
                      active ? 'text-white font-semibold' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* Safe area for iOS devices */}
      <div className="h-safe-area-inset-bottom bg-black" />
    </nav>
  );
};

export default BottomNav;
