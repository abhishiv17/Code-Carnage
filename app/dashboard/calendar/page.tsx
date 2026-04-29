'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Video } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const mockEvents = [
    { date: 12, title: 'React Session with Arjun', time: '10:00 AM', type: 'learning' },
    { date: 15, title: 'Teaching Python Basics', time: '2:30 PM', type: 'teaching' },
    { date: 20, title: 'UI/UX Review', time: '11:00 AM', type: 'teaching' },
  ];

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-page-in">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Schedule</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your upcoming skill swap sessions</p>
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
              const isToday = date === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
              const event = mockEvents.find(e => e.date === date);

              return (
                <div 
                  key={date} 
                  className={`aspect-square rounded-xl border flex flex-col p-1 transition-all cursor-pointer hover:border-accent-violet/50 ${
                    isToday ? 'border-accent-violet bg-accent-violet/10' : 'border-[var(--glass-border)] bg-[var(--bg-surface-solid)]'
                  }`}
                >
                  <span className={`text-xs font-medium ml-1 mt-1 ${isToday ? 'text-accent-violet' : 'text-[var(--text-primary)]'}`}>
                    {date}
                  </span>
                  {event && (
                    <div className={`mt-auto mx-1 mb-1 p-1 rounded text-[10px] truncate ${
                      event.type === 'teaching' ? 'bg-accent-amber/20 text-accent-amber' : 'bg-accent-coral/20 text-accent-coral'
                    }`}>
                      {event.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Upcoming Events List */}
        <GlassCard padding="lg" className="h-fit">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon size={18} className="text-accent-violet" />
            <h3 className="font-semibold text-[var(--text-primary)]">Upcoming Sessions</h3>
          </div>

          <div className="space-y-4">
            {mockEvents.map((event, i) => (
              <div key={i} className="p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] hover:border-accent-violet/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-[var(--text-primary)]">{event.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    event.type === 'teaching' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' 
                    : 'bg-accent-coral/10 text-accent-coral border border-accent-coral/20'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={12} /> {event.date} {currentDate.toLocaleString('default', { month: 'short' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} /> {event.time}
                  </div>
                </div>
                <button className="w-full mt-3 flex items-center justify-center gap-2 py-2 rounded-lg bg-accent-violet/10 text-accent-violet hover:bg-accent-violet hover:text-white transition-all text-xs font-medium">
                  <Video size={14} /> Join Meeting
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
