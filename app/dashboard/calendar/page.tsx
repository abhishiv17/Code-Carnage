'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  status: string;
  created_at: string;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [supabase] = useState(() => createClient());
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-sessions', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${user!.id},learner_id.eq.${user!.id}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions = (data || []) as SessionRow[];
      
      let profiles: Record<string, string> = {};
      const peerIds = Array.from(new Set(
        sessions.flatMap((s) => [s.teacher_id, s.learner_id]).filter((id) => id !== user!.id)
      ));
      
      if (peerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', peerIds);
        profilesData?.forEach((p) => { profiles[p.id] = p.username; });
      }

      return { sessions, profiles };
    },
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Map database sessions to events
  const events = (data?.sessions || []).map(session => {
    const isTeaching = session.teacher_id === user?.id;
    const peerId = isTeaching ? session.learner_id : session.teacher_id;
    const peerName = data?.profiles[peerId] || 'Unknown';
    const date = new Date(session.created_at);
    
    return {
      id: session.id,
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      title: isTeaching ? `Teaching ${peerName}` : `Learning from ${peerName}`,
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: isTeaching ? 'teaching' : 'learning',
      status: session.status
    };
  });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // Filter events for the currently viewed month
  const currentMonthEvents = events.filter(e => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-page-in">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Schedule</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your pending and active skill swap sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <GlassCard padding="lg" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] transition-colors">
                <ChevronLeft size={16} className="text-[var(--text-primary)]" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[var(--glass-bg)] border border-[var(--glass-border)] transition-colors">
                <ChevronRight size={16} className="text-[var(--text-primary)]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-medium text-[var(--text-muted)] py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday = date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              const dayEvents = currentMonthEvents.filter(e => e.date === date);

              return (
                <div 
                  key={date} 
                  className={`aspect-square rounded-xl border flex flex-col p-1 transition-all cursor-pointer hover:border-accent-violet/50 overflow-hidden ${
                    isToday ? 'border-accent-violet bg-accent-violet/10' : 'border-[var(--glass-border)] bg-[var(--bg-surface-solid)]'
                  }`}
                >
                  <span className={`text-xs font-medium ml-1 mt-1 ${isToday ? 'text-accent-violet' : 'text-[var(--text-primary)]'}`}>
                    {date}
                  </span>
                  <div className="mt-auto space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div key={idx} className={`mx-1 p-1 rounded text-[10px] truncate ${
                        event.type === 'teaching' ? 'bg-accent-amber/20 text-accent-amber' : 'bg-accent-coral/20 text-accent-coral'
                      }`}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-center text-[var(--text-muted)]">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Upcoming Events List */}
        <GlassCard padding="lg" className="h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-accent-violet" />
              <h3 className="font-semibold text-[var(--text-primary)]">Upcoming Sessions</h3>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent-violet" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
              No upcoming sessions.
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] hover:border-accent-violet/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1" title={event.title}>{event.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      event.type === 'teaching' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' 
                      : 'bg-accent-coral/10 text-accent-coral border border-accent-coral/20'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={12} /> {event.date} {new Date(event.year, event.month).toLocaleString('default', { month: 'short' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {event.time}
                    </div>
                  </div>
                  
                  {event.status === 'active' ? (
                    <Link href={`/dashboard/sessions/${event.id}`} className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-violet/10 text-accent-violet hover:bg-accent-violet hover:text-white transition-all text-xs font-bold">
                      <Video size={14} /> Join Video Call
                    </Link>
                  ) : (
                    <Link href="/dashboard/sessions" className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] text-[var(--text-secondary)] transition-all text-xs font-medium">
                      Manage Request
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
