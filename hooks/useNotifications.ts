'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch existing notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [user]);

  // Subscribe to realtime INSERT events
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  }, [user]);

  const clearAll = useCallback(async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    setNotifications([]);
  }, [user]);

  const removeNotification = useCallback(async (id: string) => {
    // Optimistically remove from state first
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Then delete from DB
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
  }, []);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearAll, removeNotification };
}
