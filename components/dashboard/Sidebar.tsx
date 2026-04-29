'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, ROUTES } from '@/lib/constants';
import { CURRENT_USER } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  UserCircle,
  Star,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Marketplace', href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Matches', href: ROUTES.matches, icon: Sparkles },
  { label: 'Sessions', href: ROUTES.sessions, icon: CalendarDays },
  { label: 'Profile', href: ROUTES.profile, icon: UserCircle },
  { label: 'Reviews', href: ROUTES.reviews, icon: Star },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        <div className={cn('flex items-center gap-3 px-2', collapsed && 'justify-center')}>
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            className="w-8 h-8 rounded-full bg-[var(--bg-surface-solid)]"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {CURRENT_USER.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {CURRENT_USER.credits} credits
              </p>
            </div>
          )}
        </div>
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
