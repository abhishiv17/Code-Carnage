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
  Calendar,
  FileQuestion,
  Menu,
  X,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { label: 'Marketplace', href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Campus Feed', href: '/dashboard/feed', icon: FileQuestion },
  { label: 'Community Forum', href: ROUTES.forum, icon: MessageCircle },
  { label: 'Skill Library', href: ROUTES.skills, icon: BookOpen },
  { label: 'Matches', href: ROUTES.matches, icon: Sparkles },
  { label: 'Sessions', href: ROUTES.sessions, icon: CalendarDays },
  { label: 'Messages', href: ROUTES.messages, icon: MessageSquare },
  { label: 'Calendar', href: ROUTES.calendar, icon: Calendar },
  { label: 'Profile', href: ROUTES.profile, icon: UserCircle },
  { label: 'Reviews', href: ROUTES.reviews, icon: Star },
  { label: 'Leaderboard', href: ROUTES.leaderboard, icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useUser();

  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-xl glass border border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col glass border-r border-[var(--glass-border)] transition-all duration-300',
          // Desktop: always visible, collapsible
          'hidden lg:flex',
          collapsed ? 'w-[72px]' : 'w-[240px]'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border-soft)] hover:bg-[var(--bg-surface)] transition-colors">
          <div className="w-8 h-8 shrink-0 relative flex items-center justify-center overflow-hidden rounded-lg">
            <Image src="/logo.png" alt="SkillSwap Logo" fill className="object-cover" />
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

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full glass border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft size={12} className={cn('transition-transform', collapsed && 'rotate-180')} />
        </button>
      </aside>

      {/* Mobile sidebar — slides in from left */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 flex flex-col glass border-r border-[var(--glass-border)] w-[280px] transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-soft)]">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 shrink-0 relative flex items-center justify-center overflow-hidden rounded-lg">
              <Image src="/logo.png" alt="SkillSwap Logo" fill className="object-cover" />
            </div>
            <span className="font-heading font-bold text-base text-[var(--text-primary)]">
              {APP_NAME}
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent-violet/15 text-accent-violet'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]'
                )}
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile user section */}
        <div className="px-3 py-4 border-t border-[var(--glass-border)]">
          <Link href={ROUTES.profile} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--glass-bg)] transition-colors">
            <Image
              src={avatarUrl}
              alt={profile?.username || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full bg-[var(--bg-surface-solid)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {profile?.username || 'Loading...'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {profile?.credits ?? 0} credits
              </p>
            </div>
          </Link>
          <button
            onClick={() => { signOut(); setMobileOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 mt-2 w-full rounded-xl text-sm text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-[var(--glass-border)] safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {[
            { label: 'Home', href: ROUTES.dashboard, icon: LayoutDashboard },
            { label: 'Matches', href: ROUTES.matches, icon: Sparkles },
            { label: 'Messages', href: ROUTES.messages, icon: MessageSquare },
            { label: 'Sessions', href: ROUTES.sessions, icon: CalendarDays },
            { label: 'Profile', href: ROUTES.profile, icon: UserCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all min-w-[52px]',
                  isActive
                    ? 'text-accent-violet'
                    : 'text-[var(--text-muted)]'
                )}
              >
                <Icon size={20} className={isActive ? 'text-accent-violet' : ''} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
