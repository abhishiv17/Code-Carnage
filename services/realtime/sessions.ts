import { SupabaseClient } from '@supabase/supabase-js';

type SessionEvent = {
  id: string;
  teacher_id: string;
  learner_id: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  ended_at: string | null;
};

type SessionCallbacks = {
  onIncomingRequest?: (session: SessionEvent) => void;
  onSessionAccepted?: (session: SessionEvent) => void;
  onSessionEnded?: (session: SessionEvent) => void;
  onSessionCancelled?: (session: SessionEvent) => void;
};

/**
 * Subscribe to real-time session updates for the current user.
 * This listens for INSERT and UPDATE events on the sessions table
 * where the user is either the teacher or learner.
 *
 * Usage:
 * ```ts
 * const unsub = subscribeToSessions(supabase, userId, {
 *   onIncomingRequest: (session) => showNotification("New session request!"),
 *   onSessionAccepted: (session) => navigateToVideoRoom(session.id),
 *   onSessionEnded: (session) => showRatingModal(session.id),
 * });
 *
 * // Later, to clean up:
 * unsub();
 * ```
 */
export function subscribeToSessions(
  supabase: SupabaseClient,
  userId: string,
  callbacks: SessionCallbacks
): () => void {
  // Listen for new sessions where the user is the TEACHER (incoming requests)
  const teacherChannel = supabase
    .channel(`sessions-teacher-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sessions',
        filter: `teacher_id=eq.${userId}`,
      },
      (payload) => {
        const session = payload.new as SessionEvent;
        if (session.status === 'pending') {
          callbacks.onIncomingRequest?.(session);
        }
      }
    )
    .subscribe();

  // Listen for status updates on sessions where the user is involved
  const updateChannel = supabase
    .channel(`sessions-updates-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `teacher_id=eq.${userId}`,
      },
      (payload) => {
        const session = payload.new as SessionEvent;
        handleStatusChange(session, callbacks);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `learner_id=eq.${userId}`,
      },
      (payload) => {
        const session = payload.new as SessionEvent;
        handleStatusChange(session, callbacks);
      }
    )
    .subscribe();

  // Cleanup function
  return () => {
    supabase.removeChannel(teacherChannel);
    supabase.removeChannel(updateChannel);
  };
}

function handleStatusChange(session: SessionEvent, callbacks: SessionCallbacks) {
  switch (session.status) {
    case 'active':
      callbacks.onSessionAccepted?.(session);
      break;
    case 'completed':
      callbacks.onSessionEnded?.(session);
      break;
    case 'cancelled':
      callbacks.onSessionCancelled?.(session);
      break;
  }
}
