'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  UserCircle,
  Star,
  Trophy,
  LogOut,
  ChevronLeft,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Marketplace', href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Matches', href: ROUTES.matches, icon: Sparkles },
  { label: 'Sessions', href: ROUTES.sessions, icon: CalendarDays },
  { label: 'Profile', href: ROUTES.profile, icon: UserCircle },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: ROUTES.notifications, icon: Bell },
  { label: 'Reviews', href: ROUTES.reviews, icon: Star },
  { label: 'Leaderboard', href: ROUTES.leaderboard, icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useUser();

  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-40 flex flex-col glass border-r border-[var(--glass-border)] transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-soft)] hover:bg-[var(--bg-surface)] transition-colors">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-matcha to-accent-slate flex items-center justify-center shrink-0">
          <span className="text-white font-heading font-bold text-sm">S</span>
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-base text-[var(--text-primary)] truncate">
            {APP_NAME}
          </span>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-accent-violet/15 text-accent-violet'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-[var(--glass-border)]">
        <Link href={ROUTES.profile} className={cn('flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--glass-bg)] transition-colors', collapsed && 'justify-center')}>
          <Image
            src={avatarUrl}
            alt={profile?.username || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full bg-[var(--bg-surface-solid)]"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {profile?.username || 'Loading...'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {profile?.credits ?? 0} credits
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 mt-2 w-full rounded-xl text-sm text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full glass border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft size={12} className={cn('transition-transform', collapsed && 'rotate-180')} />
      </button>
    </aside>
  );
}
