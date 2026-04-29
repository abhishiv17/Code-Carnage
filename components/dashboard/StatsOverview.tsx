'use client';

import { GlassCard } from '@/components/shared/GlassCard';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { CURRENT_USER, MOCK_SESSIONS } from '@/lib/mock-data';
import { Coins, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export function StatsOverview() {
  const upcomingSessions = MOCK_SESSIONS.filter((s) => s.status === 'upcoming').length;
  const completedSessions = MOCK_SESSIONS.filter((s) => s.status === 'completed').length;

  const stats = [
    {
      label: 'Skill Credits',
      value: CURRENT_USER.credits,
      icon: Coins,
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber/10',
    },
    {
      label: 'Sessions Done',
      value: CURRENT_USER.sessionsCompleted,
      icon: BookOpen,
      color: 'text-accent-emerald',
      bgColor: 'bg-accent-emerald/10',
    },
    {
      label: 'Upcoming',
      value: upcomingSessions,
      icon: GraduationCap,
      color: 'text-accent-violet',
      bgColor: 'bg-accent-violet/10',
    },
    {
      label: 'Rating',
      value: CURRENT_USER.rating,
      icon: TrendingUp,
      color: 'text-accent-coral',
      bgColor: 'bg-accent-coral/10',
      decimals: 1,
      prefix: '⭐ ',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <GlassCard key={stat.label} padding="md" className="group hover:scale-[1.02] transition-transform duration-200">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgColor}`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                  <AnimatedCounter
                    target={stat.value}
                    decimals={stat.decimals ?? 0}
                    prefix={stat.prefix}
                  />
                </p>
                <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
