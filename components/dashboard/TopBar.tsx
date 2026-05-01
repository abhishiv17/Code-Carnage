'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useNotifications } from '@/hooks/useNotifications';
import { ROUTES } from '@/lib/constants';
import { Search, Bell, Coins, UserPlus, Star, CalendarCheck, CheckCheck, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSelector } from '@/components/shared/LanguageSelector';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'session_request':
      return <UserPlus size={14} className="text-accent-violet" />;
    case 'session_accepted':
      return <CalendarCheck size={14} className="text-accent-emerald" />;
    case 'review_received':
      return <Star size={14} className="text-accent-amber" />;
    default:
      return <Bell size={14} className="text-accent-violet" />;
  }
}

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { profile } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  // Handle Search Input
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setShowSearchDropdown(true);
      const fetchResults = async () => {
        setIsSearching(true);
        const supabase = await import('@/lib/supabase/client').then(m => m.createClient());
        const { data } = await supabase
          .from('profiles')
          .select('id, username, full_name, college_name')
          .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(5);
        setSearchResults(data || []);
        setIsSearching(false);
      };
      const timeoutId = setTimeout(fetchResults, 300); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setShowSearchDropdown(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--glass-border)] px-3 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Spacer for hamburger on mobile */}
        <div className="w-10 lg:hidden shrink-0" />

        {/* Search — hidden on very small screens, shows as icon on sm */}
        <div className="relative flex-1 max-w-md hidden sm:block" ref={searchRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.length > 1) setShowSearchDropdown(true) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
          />
          
          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full mt-2 w-full glass bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-center text-[var(--text-muted)] text-sm">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col">
                  {searchResults.map((user) => (
                    <Link 
                      key={user.id} 
                      href={`/dashboard/user/${user.id}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="flex items-center gap-3 p-3 hover:bg-[var(--glass-bg)] border-b border-[var(--glass-border)] last:border-b-0 transition-colors"
                    >
                      <Image 
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username || user.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt={user.username || 'User Avatar'} width={32} height={32} className="rounded-full bg-[var(--bg-surface-solid)]" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.full_name || user.username}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">@{user.username} • {user.college_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[var(--text-muted)] text-sm">No students found</div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
          {/* Language Selector — hidden on mobile */}
          <div className="hidden md:block">
            <LanguageSelector />
          </div>
          
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Credits */}
          <Link href={ROUTES.dashboard} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl bg-accent-amber/10 border border-accent-amber/20 hover:bg-accent-amber/20 transition-all">
            <Coins size={16} className="text-accent-amber" />
            <span className="text-sm font-heading font-semibold text-accent-amber">
              {profile?.credits ?? 0}
            </span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] transition-all"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent-coral text-white text-[10px] font-bold px-1 border-2 border-[var(--bg-base)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 glass bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl shadow-2xl overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-[var(--glass-border)] flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-accent-violet hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck size={12} /> Read all
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-[10px] text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        title="Clear all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications list */}
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                      <Bell size={28} className="mx-auto mb-2 opacity-15" />
                      <p>No notifications yet</p>
                      <p className="text-[10px] mt-1 opacity-60">They&apos;ll appear here in real-time</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={notification.link || '#'}
                        onClick={() => {
                          if (!notification.is_read) markAsRead(notification.id);
                          setShowNotifications(false);
                        }}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 hover:bg-[var(--glass-bg)] transition-colors border-b border-[var(--glass-border)] last:border-b-0',
                          !notification.is_read && 'bg-accent-violet/[0.03]'
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                          !notification.is_read ? 'bg-accent-violet/10' : 'bg-[var(--bg-surface-solid)]'
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-xs leading-relaxed',
                            !notification.is_read
                              ? 'text-[var(--text-primary)] font-medium'
                              : 'text-[var(--text-muted)]'
                          )}>
                            <span className="font-semibold">{notification.title}</span>{' '}
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                            {timeAgo(notification.created_at)}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notification.is_read && (
                          <span className="mt-2 w-2 h-2 rounded-full bg-accent-violet shrink-0" />
                        )}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar — hidden on mobile (accessible via bottom nav Profile) */}
          <Link href={ROUTES.profile} className="hidden sm:block w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
            <Image
              src={avatarUrl}
              alt={profile?.username || 'User'}
              width={32}
              height={32}
              className="w-full h-full bg-[var(--bg-surface-solid)] object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
