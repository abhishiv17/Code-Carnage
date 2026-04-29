'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { useNotifications } from '@/hooks/useNotifications';
import { ROUTES } from '@/lib/constants';
import {
  Search, Bell, Coins, UserPlus, Star, CalendarCheck,
  CheckCheck, Trash2, Loader2, Video, X, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  // Track which notifications have been accepted (show "Join Session" instead of Accept/Decline)
  const [acceptedSessionIds, setAcceptedSessionIds] = useState<Set<string>>(new Set());
  // Track which notifications are fading out (for smooth removal animation)
  const [fadingOut, setFadingOut] = useState<Set<string>>(new Set());
  const notificationRef = useRef<HTMLDivElement>(null);
  const { profile } = useUser();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, removeNotification } = useNotifications();

  const handleAccept = async (notificationId: string, sessionId: string) => {
    setAcceptingId(sessionId);
    try {
      const res = await fetch('/api/sessions/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        // Mark as read
        if (!notifications.find(n => n.id === notificationId)?.is_read) {
          markAsRead(notificationId);
        }
        // Transition this notification to "Join Session" state
        setAcceptedSessionIds(prev => new Set(prev).add(notificationId));
        toast.success('Session accepted! Click "Join Session" to start.');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to accept session');
      }
    } catch {
      toast.error('Network error while accepting');
    }
    setAcceptingId(null);
  };

  const handleDecline = (notificationId: string) => {
    // Start fade-out animation
    setFadingOut(prev => new Set(prev).add(notificationId));
    // After animation, actually remove from state/DB
    setTimeout(() => {
      removeNotification(notificationId);
      setFadingOut(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      toast.success('Session request declined');
    }, 300);
  };

  const handleJoinSession = (notificationId: string, sessionId: string) => {
    setShowNotifications(false);
    // Navigate to the WebRTC call room
    router.push(`/call/${sessionId}?peer=Peer&skill=Skill Session`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--glass-border)] px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search skills, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Credits */}
          <Link href={ROUTES.dashboard} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-amber/10 border border-accent-amber/20 hover:bg-accent-amber/20 transition-all">
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
              id="notification-bell"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent-coral text-white text-[10px] font-bold px-1 border-2 border-[var(--bg-base)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] rounded-2xl shadow-2xl overflow-hidden z-[60]"
                style={{ backdropFilter: 'blur(20px)' }}
              >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-[var(--glass-border)] flex justify-between items-center bg-gradient-to-r from-accent-violet/[0.04] to-transparent">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-heading font-bold text-[var(--text-primary)]">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet text-[10px] font-bold">
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
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-14 text-center text-sm text-[var(--text-muted)]">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
                        <Bell size={24} className="opacity-20" />
                      </div>
                      <p className="font-medium">No notifications yet</p>
                      <p className="text-[10px] mt-1 opacity-60">They&apos;ll appear here in real-time</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isAccepted = acceptedSessionIds.has(notification.id);
                      const isFading = fadingOut.has(notification.id);
                      const isSessionRequest = notification.type === 'session_request' && notification.link;

                      return (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.is_read) markAsRead(notification.id);
                            // Only close and navigate if it's not a session request with action buttons
                            if (!isSessionRequest) {
                              setShowNotifications(false);
                              if (notification.link) {
                                router.push(notification.link.startsWith('/') ? notification.link : '/dashboard/sessions');
                              }
                            }
                          }}
                          className={cn(
                            'flex items-start gap-3 px-5 py-4 hover:bg-[var(--bg-surface)]/50 transition-all duration-300 border-b border-[var(--glass-border)] last:border-b-0',
                            !notification.is_read && 'bg-accent-violet/[0.03]',
                            isSessionRequest ? 'cursor-default' : 'cursor-pointer',
                            isFading && 'opacity-0 max-h-0 py-0 overflow-hidden -translate-x-4'
                          )}
                          style={{
                            transition: isFading
                              ? 'opacity 300ms ease, max-height 300ms ease, padding 300ms ease, transform 300ms ease'
                              : 'background-color 150ms ease'
                          }}
                        >
                          {/* Avatar / Icon */}
                          <div className={cn(
                            'mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden ring-2',
                            !notification.is_read
                              ? 'bg-accent-violet/10 ring-accent-violet/20'
                              : 'bg-[var(--bg-surface)] ring-[var(--glass-border)]'
                          )}>
                            {notification.type === 'session_request' ? (
                               <Image 
                                 src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${notification.title}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                                 alt="Avatar" width={40} height={40} 
                               />
                            ) : (
                               getNotificationIcon(notification.type)
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-[13px] leading-relaxed',
                              !notification.is_read
                                ? 'text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-muted)]'
                            )}>
                              <span className="font-semibold">{notification.title}</span>{' '}
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                              {timeAgo(notification.created_at)}
                            </p>

                            {/* ─── Action Buttons for Session Requests ─── */}
                            {isSessionRequest && (
                              <div className="mt-3">
                                {isAccepted ? (
                                  /* ── ACCEPTED STATE: Show "Join Session" button ── */
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJoinSession(notification.id, notification.link!);
                                    }}
                                    className="group flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-violet to-accent-emerald text-white text-xs font-bold shadow-lg shadow-accent-violet/20 hover:shadow-xl hover:shadow-accent-violet/30 hover:brightness-110 active:scale-[0.98] transition-all"
                                  >
                                    <Video size={14} className="group-hover:animate-pulse" />
                                    Join Session
                                    <span className="ml-auto text-[10px] font-normal opacity-80">Ready →</span>
                                  </button>
                                ) : (
                                  /* ── DEFAULT STATE: Show Accept / Decline ── */
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAccept(notification.id, notification.link!);
                                      }}
                                      disabled={acceptingId === notification.link}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-violet text-white text-xs font-semibold hover:bg-accent-violet/90 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm shadow-accent-violet/20"
                                    >
                                      {acceptingId === notification.link ? (
                                        <Loader2 size={12} className="animate-spin" />
                                      ) : (
                                        <Check size={12} />
                                      )}
                                      Accept
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDecline(notification.id);
                                      }}
                                      disabled={acceptingId === notification.link}
                                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[var(--text-primary)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 text-xs font-semibold transition-all border border-[var(--glass-border)] bg-[var(--bg-surface-solid)]"
                                    >
                                      <X size={12} />
                                      Decline
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Unread dot */}
                          {!notification.is_read && !isSessionRequest && (
                            <span className="mt-2 w-2 h-2 rounded-full bg-accent-violet shrink-0 animate-pulse" />
                          )}
                        </div>

                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <Link href={ROUTES.profile} className="block w-8 h-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity">
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
