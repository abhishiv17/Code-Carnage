'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import {
  Bell, Check, X, Video, Loader2, Clock,
  CheckCheck, Trash2, UserPlus, Star, CalendarCheck,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Time ago helper ─── */
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

/* ─── Notification type icon ─── */
function getNotificationIcon(type: string) {
  switch (type) {
    case 'session_request':
      return <UserPlus size={16} className="text-purple-600" />;
    case 'session_accepted':
      return <CalendarCheck size={16} className="text-emerald-500" />;
    case 'review_received':
      return <Star size={16} className="text-amber-500" />;
    default:
      return <Bell size={16} className="text-purple-600" />;
  }
}

/* ─── Mock data for demo ─── */
interface MockNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

function getMockNotifications(): MockNotification[] {
  const now = Date.now();
  return [
    {
      id: 'mock-1',
      user_id: 'mock',
      type: 'session_request',
      title: 'kirani749',
      message: 'wants to learn from you.',
      link: 'session-mock-1',
      is_read: false,
      created_at: new Date(now - 3 * 60 * 1000).toISOString(), // 3m ago
    },
    {
      id: 'mock-2',
      user_id: 'mock',
      type: 'session_request',
      title: 'alex_dev',
      message: 'wants to learn from you.',
      link: 'session-mock-2',
      is_read: false,
      created_at: new Date(now - 12 * 60 * 1000).toISOString(), // 12m ago
    },
    {
      id: 'mock-3',
      user_id: 'mock',
      type: 'session_request',
      title: 'priya_codes',
      message: 'wants to learn from you.',
      link: 'session-mock-3',
      is_read: false,
      created_at: new Date(now - 47 * 60 * 1000).toISOString(), // 47m ago
    },
    {
      id: 'mock-4',
      user_id: 'mock',
      type: 'session_accepted',
      title: 'Session Confirmed',
      message: 'Your session with maya_ui has been confirmed.',
      link: null,
      is_read: true,
      created_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    },
    {
      id: 'mock-5',
      user_id: 'mock',
      type: 'review_received',
      title: 'New Review',
      message: 'john_music left you a 5-star review!',
      link: null,
      is_read: true,
      created_at: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    },
  ];
}

/* ═══════════════════════════════════════════════════════════
   NotificationCard Component
   ═══════════════════════════════════════════════════════════ */
function NotificationCard({
  notification,
  isAccepted,
  isFading,
  isAccepting,
  onAccept,
  onDecline,
  onJoin,
  index,
}: {
  notification: MockNotification;
  isAccepted: boolean;
  isFading: boolean;
  isAccepting: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onJoin: () => void;
  index: number;
}) {
  const isSessionRequest = notification.type === 'session_request' && notification.link;
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${notification.title}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  // Get initials
  const initials = notification.title
    .split(/[_\s]/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'group relative rounded-2xl border transition-all duration-500 overflow-hidden',
        isFading && 'opacity-0 scale-95 max-h-0 !py-0 !my-0 pointer-events-none -translate-x-6',
        !isFading && 'opacity-100 scale-100 max-h-[300px]',
        !notification.is_read
          ? 'bg-white border-purple-100 shadow-sm shadow-purple-500/5'
          : 'bg-gray-50/70 border-gray-100',
        isAccepted && !isFading && 'border-purple-200 bg-purple-50/30 shadow-md shadow-purple-500/10',
      )}
      style={{
        animationDelay: `${index * 80}ms`,
        transition: isFading
          ? 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={cn(
                'w-12 h-12 rounded-full overflow-hidden ring-2 transition-all',
                !notification.is_read
                  ? 'ring-purple-200'
                  : 'ring-gray-200',
                isAccepted && 'ring-purple-300 ring-offset-2 ring-offset-purple-50'
              )}
            >
              {isSessionRequest ? (
                <Image src={avatarUrl} alt={notification.title} width={48} height={48} className="w-full h-full" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
              )}
            </div>
            {/* Unread indicator */}
            {!notification.is_read && !isAccepted && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white animate-pulse" />
            )}
            {/* Accepted checkmark */}
            {isAccepted && (
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                <Check size={10} className="text-white" />
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isSessionRequest && (
              <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-100 text-purple-700">
                New Session Request!
              </span>
            )}

            <p className={cn(
              'text-sm leading-relaxed',
              !notification.is_read ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              <span className="font-bold text-purple-700">{notification.title}</span>{' '}
              {notification.message}
            </p>

            <div className="flex items-center gap-2 mt-1.5">
              <Clock size={11} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">{timeAgo(notification.created_at)}</span>
            </div>

            {/* ─── Action Buttons ─── */}
            {isSessionRequest && (
              <div className="mt-4">
                {isAccepted ? (
                  /* ── Join Live Session Button ── */
                  <button
                    onClick={(e) => { e.stopPropagation(); onJoin(); }}
                    id={`join-session-${notification.id}`}
                    className="group/btn flex items-center gap-2.5 w-full px-5 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/35 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover/btn:bg-white/30 transition-colors">
                      <Video size={16} className="group-hover/btn:animate-pulse" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block">Join Live Session</span>
                      <span className="block text-[10px] font-normal text-purple-200 mt-0.5">Start video call with {notification.title}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover/btn:translate-x-1 transition-transform">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  /* ── Accept / Decline Buttons ── */
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onAccept(); }}
                      disabled={isAccepting}
                      id={`accept-${notification.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm shadow-purple-500/20"
                    >
                      {isAccepting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDecline(); }}
                      disabled={isAccepting}
                      id={`decline-${notification.id}`}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-600 text-sm font-semibold transition-all border border-gray-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-[0.97]"
                    >
                      <X size={14} />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications: realNotifications,
    unreadCount: realUnreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotifications();

  // Combine mock + real notifications
  const [mockNotifications, setMockNotifications] = useState<MockNotification[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  const [fadingIds, setFadingIds] = useState<Set<string>>(new Set());
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Init mock data on mount
  useEffect(() => {
    setMockNotifications(getMockNotifications());
  }, []);

  // Merge mock + real
  const allNotifications: MockNotification[] = [
    ...mockNotifications,
    ...realNotifications.map((n: Notification) => ({
      ...n,
      user_id: n.user_id,
    })),
  ];

  // Sort by date descending
  allNotifications.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Count new (unread session requests)
  const newCount = allNotifications.filter(
    (n) => !n.is_read && !acceptedIds.has(n.id) && !fadingIds.has(n.id)
  ).length;

  const handleAccept = useCallback(async (notificationId: string, sessionId: string | null) => {
    setAcceptingId(notificationId);

    // If it's a real notification, call the API
    const isMock = notificationId.startsWith('mock-');
    if (!isMock && sessionId) {
      try {
        const res = await fetch('/api/sessions/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error || 'Failed to accept session');
          setAcceptingId(null);
          return;
        }
      } catch {
        toast.error('Network error while accepting');
        setAcceptingId(null);
        return;
      }
    }

    // Simulate a brief delay for mock notifications
    if (isMock) {
      await new Promise((r) => setTimeout(r, 600));
    }

    // Transition to "accepted" state
    setAcceptedIds((prev) => new Set(prev).add(notificationId));

    // Mark as read in mock data
    setMockNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );

    // Mark as read in real data
    if (!isMock) {
      markAsRead(notificationId);
    }

    toast.success('Session accepted! Joining call...');
    // Auto redirect
    const title = notificationId.startsWith('mock-') 
      ? mockNotifications.find(n => n.id === notificationId)?.title || 'Peer'
      : realNotifications.find(n => n.id === notificationId)?.title || 'Peer';
    
    window.location.href = `/session/room_${sessionId || notificationId}_${title}`;
    setAcceptingId(null);
  }, [markAsRead, mockNotifications, realNotifications]);

  const handleDecline = useCallback((notificationId: string) => {
    // Start fade-out
    setFadingIds((prev) => new Set(prev).add(notificationId));

    // Remove after animation
    setTimeout(() => {
      const isMock = notificationId.startsWith('mock-');
      if (isMock) {
        setMockNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } else {
        removeNotification(notificationId);
      }
      setFadingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
      toast.success('Session request declined');
    }, 400);
  }, [removeNotification]);

  const handleJoinSession = useCallback((notification: MockNotification) => {
    const roomId = `room_${notification.link || notification.id}_${notification.title}`;
    window.location.href = `/session/${roomId}`;
  }, []);

  const handleMarkAllRead = useCallback(() => {
    // Mark all mock as read
    setMockNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    // Mark all real as read
    markAllAsRead();
  }, [markAllAsRead]);

  const handleClearAll = useCallback(() => {
    setMockNotifications([]);
    clearAll();
  }, [clearAll]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bell size={20} className="text-purple-600" />
            </div>
            Notifications
          </h1>
          <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] ml-[52px]">
            Session requests and activity updates
          </p>
        </div>

        {/* Badge + Actions */}
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold animate-pulse">
              {newCount} new
            </span>
          )}
          {newCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <CheckCheck size={14} />
              Read all
            </button>
          )}
          {allNotifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Notification cards */}
      <div className="space-y-3">
        {allNotifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Bell size={32} className="text-gray-300" />
            </div>
            <p className="font-heading font-semibold text-gray-400 mb-1">No notifications yet</p>
            <p className="text-xs text-gray-400">They&apos;ll appear here in real-time</p>
          </div>
        ) : (
          allNotifications.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isAccepted={acceptedIds.has(notification.id)}
              isFading={fadingIds.has(notification.id)}
              isAccepting={acceptingId === notification.id}
              onAccept={() => handleAccept(notification.id, notification.link)}
              onDecline={() => handleDecline(notification.id)}
              onJoin={() => handleJoinSession(notification)}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
}
