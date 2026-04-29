'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { Calendar, Clock, Coins, Video, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  status: string;
  created_at: string;
  ended_at: string | null;
}

interface ProfileMap {
  [id: string]: { username: string };
}

export default function SessionsPage() {
  const { user } = useUser();
  const supabase = createClient();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${user!.id},learner_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch sessions:', error);
        toast.error('Failed to load sessions');
        throw error;
      }

      let profileMap: ProfileMap = {};
      if (data && data.length > 0) {
        // Fetch profiles for all peer IDs
        const peerIds = Array.from(new Set(
          data.flatMap((s) => [s.teacher_id, s.learner_id]).filter((id) => id !== user!.id)
        ));
        if (peerIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', peerIds);
          
          if (profilesError) {
             console.error('Failed to fetch peer profiles:', profilesError);
          }
            
          profilesData?.forEach((p) => { profileMap[p.id] = { username: p.username }; });
        }
      }
      return { sessions: (data || []) as SessionRow[], profiles: profileMap };
    },
    staleTime: 60 * 1000, // 1 minute
  });

  const sessions = data?.sessions || [];
  const profiles = data?.profiles || {};

  const handleAcceptSession = async (sessionId: string) => {
    setAcceptingId(sessionId);
    try {
      const res = await fetch('/api/sessions/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const resData = await res.json();
      if (!res.ok) {
        toast.error(resData.error || 'Failed to accept session');
        return;
      }
      toast.success('Session accepted! You can now join the call.');
      refetch();
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const upcoming = sessions.filter((s) => s.status === 'pending' || s.status === 'active');
  const completed = sessions.filter((s) => s.status === 'completed');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          Sessions
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Your upcoming and past skill-swap sessions
        </p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-accent-violet" />
          Active / Pending
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">No active sessions right now.</p>
        ) : (
          <div className="space-y-4">
            {upcoming.map((session) => {
              const isTeaching = session.teacher_id === user!.id;
              const peerId = isTeaching ? session.learner_id : session.teacher_id;
              const peerName = profiles[peerId]?.username || 'Unknown';
              const date = new Date(session.created_at);

              return (
                <GlassCard key={session.id} hover className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-accent-violet/10 border border-accent-violet/20 shrink-0">
                    <span className="text-xs font-semibold text-accent-violet uppercase">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-heading font-bold text-[var(--text-primary)]">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full',
                        isTeaching
                          ? 'bg-accent-emerald/10 text-accent-emerald'
                          : 'bg-accent-violet/10 text-accent-violet'
                      )}>
                        {isTeaching ? 'Teaching' : 'Learning'}
                      </span>
                      <span className={cn(
                        'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full',
                        session.status === 'active'
                          ? 'bg-accent-amber/10 text-accent-amber'
                          : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)]'
                      )}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      with {peerName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins size={12} className="text-accent-amber" />
                        1 credit
                      </span>
                    </div>
                  </div>

                  {session.status === 'active' && (
                    <GradientButton asChild size="sm">
                      <Link href={`/dashboard/sessions/${session.id}`}>
                        <Video size={14} />
                        Join
                      </Link>
                    </GradientButton>
                  )}

                  {session.status === 'pending' && isTeaching && (
                    <GradientButton 
                      size="sm" 
                      onClick={() => handleAcceptSession(session.id)}
                      disabled={acceptingId === session.id}
                    >
                      {acceptingId === session.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Accept
                    </GradientButton>
                  )}
                  
                  {session.status === 'pending' && !isTeaching && (
                    <span className="text-xs text-[var(--text-muted)] italic px-3 py-1.5 bg-[var(--bg-surface-solid)] rounded-lg border border-[var(--glass-border)]">
                      Waiting...
                    </span>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-accent-emerald" />
          Completed
        </h2>
        {completed.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">No completed sessions yet.</p>
        ) : (
          <div className="space-y-4">
            {completed.map((session) => {
              const isTeaching = session.teacher_id === user!.id;
              const peerId = isTeaching ? session.learner_id : session.teacher_id;
              const peerName = profiles[peerId]?.username || 'Unknown';
              const date = new Date(session.created_at);

              return (
                <GlassCard key={session.id} className="flex items-center gap-5 opacity-75">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[var(--bg-surface-solid)] shrink-0">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-heading font-bold text-[var(--text-secondary)]">
                      {date.getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface-solid)] text-[var(--text-muted)]">
                      {isTeaching ? 'Taught' : 'Learned'}
                    </span>
                    <p className="text-sm text-[var(--text-secondary)] font-medium mt-1">
                      with {peerName}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {isTeaching ? '+1' : '-1'} credit
                    </p>
                  </div>

                  <GradientButton asChild variant="outline" size="sm">
                    <Link href="/dashboard/reviews">Review</Link>
                  </GradientButton>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
