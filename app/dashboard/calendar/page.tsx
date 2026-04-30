'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Loader2,
  Plus,
  X,
  Pencil,
  Trash2,
  Check,
  Tag,
} from 'lucide-react';
import Link from 'next/link';

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  status: string;
  created_at: string;
}

interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  category: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'session', label: 'Session', color: 'bg-accent-violet/10 text-accent-violet border-accent-violet/20' },
  { value: 'study', label: 'Study', color: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' },
  { value: 'deadline', label: 'Deadline', color: 'bg-accent-coral/10 text-accent-coral border-accent-coral/20' },
  { value: 'other', label: 'Other', color: 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20' },
];

function getCategoryStyle(category: string) {
  return CATEGORIES.find(c => c.value === category)?.color || CATEGORIES[3].color;
}

export default function CalendarPage() {
  const { user } = useUser();
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  // CRUD form state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formCategory, setFormCategory] = useState('session');
  const [submitting, setSubmitting] = useState(false);

  // Selected day for detail view
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['calendar-data', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch sessions
      const { data: sessionsData, error: sessionsErr } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${user!.id},learner_id.eq.${user!.id}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      if (sessionsErr) throw sessionsErr;
      const sessions = (sessionsData || []) as SessionRow[];

      // Fetch peer profiles
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

      // Fetch user's calendar events
      const { data: eventsData } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user!.id)
        .order('event_date', { ascending: true });

      return { sessions, profiles, events: (eventsData || []) as CalendarEvent[] };
    },
  });

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Map sessions to display items
  const sessionEvents = (data?.sessions || []).map(session => {
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
      status: session.status,
      source: 'session' as const,
    };
  });

  // Map custom calendar events to display items
  const customEvents = (data?.events || []).map(event => {
    const date = new Date(event.event_date);
    return {
      id: event.id,
      date: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      title: event.title,
      time: event.event_time || '',
      type: event.category,
      status: event.category,
      source: 'custom' as const,
      description: event.description,
    };
  });

  const allEvents = [...sessionEvents, ...customEvents];
  const currentMonthEvents = allEvents.filter(e => e.month === currentDate.getMonth() && e.year === currentDate.getFullYear());

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // --- CRUD ---
  const resetForm = useCallback(() => {
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormTime('');
    setFormCategory('session');
    setEditingEvent(null);
    setShowForm(false);
  }, []);

  const openCreateForm = useCallback((day?: number) => {
    resetForm();
    if (day) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setFormDate(d.toISOString().split('T')[0]);
    }
    setShowForm(true);
  }, [currentDate, resetForm]);

  const openEditForm = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormDate(event.event_date);
    setFormTime(event.event_time || '');
    setFormCategory(event.category || 'other');
    setShowForm(true);
  }, []);

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formTitle || !formDate) {
      toast.error('Title and date are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        // UPDATE
        const { error } = await supabase
          .from('calendar_events')
          .update({
            title: formTitle,
            description: formDescription,
            event_date: formDate,
            event_time: formTime,
            category: formCategory,
          })
          .eq('id', editingEvent.id)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('Event updated!');
      } else {
        // CREATE
        const { error } = await supabase
          .from('calendar_events')
          .insert({
            user_id: user.id,
            title: formTitle,
            description: formDescription,
            event_date: formDate,
            event_time: formTime,
            category: formCategory,
          });

        if (error) throw error;
        toast.success('Event created!');
      }

      queryClient.invalidateQueries({ queryKey: ['calendar-data', user.id] });
      resetForm();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Event deleted.');
      queryClient.invalidateQueries({ queryKey: ['calendar-data', user.id] });
    } catch {
      toast.error('Failed to delete event.');
    }
  };

  // Events for selected day
  const selectedDayEvents = selectedDay !== null
    ? currentMonthEvents.filter(e => e.date === selectedDay)
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-page-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Schedule</h1>
          <p className="text-sm text-[var(--text-muted)]">Manage your sessions and personal calendar events</p>
        </div>
        <GradientButton onClick={() => openCreateForm()} className="flex items-center gap-2">
          <Plus size={16} /> Add Event
        </GradientButton>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <GlassCard gradient padding="lg" className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-sm text-[var(--text-primary)]">
              {editingEvent ? 'Edit Event' : 'New Event'}
            </h3>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-[var(--glass-bg)] text-[var(--text-muted)]">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSaveEvent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Title</label>
              <input
                type="text"
                placeholder="e.g., DSA Mock Interview Prep"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Description (optional)</label>
              <textarea
                placeholder="Add notes or details…"
                rows={2}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Time (optional)</label>
                <input
                  type="time"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        formCategory === cat.value
                          ? cat.color + ' ring-2 ring-offset-1 ring-offset-transparent'
                          : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border-[var(--glass-border)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                Cancel
              </button>
              <GradientButton type="submit" disabled={submitting || !formTitle || !formDate}>
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : editingEvent ? 'Update Event' : 'Create Event'}
              </GradientButton>
            </div>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
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
              const isSelected = selectedDay === date;

              return (
                <div
                  key={date}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={`aspect-square rounded-xl border flex flex-col p-1 transition-all cursor-pointer hover:border-accent-violet/50 overflow-hidden ${
                    isSelected ? 'border-accent-violet bg-accent-violet/15 ring-2 ring-accent-violet/20' :
                    isToday ? 'border-accent-violet bg-accent-violet/10' : 'border-[var(--glass-border)] bg-[var(--bg-surface-solid)]'
                  }`}
                >
                  <span className={`text-xs font-medium ml-1 mt-1 ${isToday ? 'text-accent-violet' : 'text-[var(--text-primary)]'}`}>
                    {date}
                  </span>
                  <div className="mt-auto space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div key={idx} className={`mx-1 p-1 rounded text-[10px] truncate ${
                        event.source === 'session'
                          ? (event.type === 'teaching' ? 'bg-accent-amber/20 text-accent-amber' : 'bg-accent-coral/20 text-accent-coral')
                          : getCategoryStyle(event.type)
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

        {/* Sidebar: Selected Day / Upcoming */}
        <GlassCard padding="lg" className="h-fit">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-accent-violet" />
              <h3 className="font-semibold text-[var(--text-primary)]">
                {selectedDay !== null
                  ? `${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDay}`
                  : 'Upcoming'}
              </h3>
            </div>
            {selectedDay !== null && (
              <button
                onClick={() => openCreateForm(selectedDay)}
                className="p-1.5 rounded-lg hover:bg-accent-violet/10 text-accent-violet transition-colors"
                title="Add event on this day"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-accent-violet" />
            </div>
          ) : (selectedDay !== null ? selectedDayEvents : allEvents).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-muted)] mb-3">
                {selectedDay !== null ? 'No events on this day.' : 'No upcoming sessions.'}
              </p>
              {selectedDay !== null && (
                <button
                  onClick={() => openCreateForm(selectedDay)}
                  className="text-xs text-accent-violet font-semibold hover:underline"
                >
                  + Add event
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {(selectedDay !== null ? selectedDayEvents : allEvents).map((event) => (
                <div key={event.id} className="p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] hover:border-accent-violet/30 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1 flex-1" title={event.title}>{event.title}</h4>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        event.source === 'session'
                          ? (event.type === 'teaching' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-accent-coral/10 text-accent-coral border-accent-coral/20')
                          : getCategoryStyle(event.type)
                      }`}>
                        {event.source === 'session' ? event.type : event.status}
                      </span>
                    </div>
                  </div>
                  {'description' in event && event.description && (
                    <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon size={12} /> {event.date} {new Date(event.year, event.month).toLocaleString('default', { month: 'short' })}
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} /> {event.time}
                        </div>
                      )}
                    </div>

                    {/* CRUD buttons for custom events */}
                    {event.source === 'custom' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const original = data?.events.find(ev => ev.id === event.id);
                            if (original) openEditForm(original);
                          }}
                          className="p-1.5 rounded-md hover:bg-accent-violet/10 text-[var(--text-muted)] hover:text-accent-violet transition-colors"
                          title="Edit event"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 rounded-md hover:bg-accent-coral/10 text-[var(--text-muted)] hover:text-accent-coral transition-colors"
                          title="Delete event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {event.source === 'session' && event.status === 'active' && (
                    <Link href={`/dashboard/sessions/${event.id}`} className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-violet/10 text-accent-violet hover:bg-accent-violet hover:text-white transition-all text-xs font-bold">
                      <Video size={14} /> Join Video Call
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
