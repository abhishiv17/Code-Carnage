'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '@/components/shared/GlassCard';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Flame,
  Loader2,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string | null;
  college_name: string | null;
  city: string | null;
  credits: number;
  average_rating: number;
  total_sessions: number;
}

const podiumColors = [
  {
    bg: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-400/30',
    text: 'text-amber-400',
    icon: Crown,
    label: '1st Place',
    ring: 'ring-amber-400/30',
    glow: 'shadow-amber-500/10',
  },
  {
    bg: 'from-slate-300/15 to-gray-400/10',
    border: 'border-slate-300/30',
    text: 'text-slate-300',
    icon: Medal,
    label: '2nd Place',
    ring: 'ring-slate-300/20',
    glow: 'shadow-slate-400/10',
  },
  {
    bg: 'from-orange-600/15 to-amber-700/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: Medal,
    label: '3rd Place',
    ring: 'ring-orange-400/20',
    glow: 'shadow-orange-500/10',
  },
];

export default function LeaderboardPage() {
  const supabase = createClient();

  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, college_name, city, credits, average_rating, total_sessions')
        .order('total_sessions', { ascending: false })
        .order('average_rating', { ascending: false })
        .order('credits', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Failed to fetch leaderboard:', error);
        toast.error('Failed to load leaderboard');
        throw error;
      }
      return (data || []) as LeaderboardEntry[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
          <Trophy size={28} className="text-accent-amber" />
          Leaderboard
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Top contributors on the platform — ranked by sessions, rating, and credits
        </p>
      </div>

      {/* Podium — Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Display order: 2nd, 1st, 3rd for podium effect on desktop */}
          {[top3[1], top3[0], top3[2]].map((entry, visualIdx) => {
            if (!entry) return null;
            const actualRank = visualIdx === 1 ? 0 : visualIdx === 0 ? 1 : 2;
            const style = podiumColors[actualRank];
            const Icon = style.icon;
            const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

            return (
              <GlassCard
                key={entry.id}
                className={cn(
                  'relative flex flex-col items-center text-center py-8 px-6 border',
                  style.border,
                  `bg-gradient-to-b ${style.bg}`,
                  actualRank === 0 && 'md:scale-105 md:-translate-y-2 z-10',
                  `shadow-xl ${style.glow}`
                )}
              >
                {/* Rank badge */}
                <div className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full border flex items-center gap-1.5',
                  style.border,
                  'bg-[var(--bg-surface-solid)]'
                )}>
                  <Icon size={14} className={style.text} />
                  <span className={cn('text-xs font-heading font-bold', style.text)}>
                    {style.label}
                  </span>
                </div>

                {/* Avatar */}
                <div className={cn('w-20 h-20 rounded-full overflow-hidden ring-4 mb-4 mt-2 bg-[var(--bg-surface-solid)]', style.ring)}>
                  <Image
                    src={avatarUrl}
                    alt={entry.username || 'User avatar'}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <h3 className="font-heading font-bold text-lg text-[var(--text-primary)] mb-0.5">
                  {entry.full_name || entry.username}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  @{entry.username}
                  {entry.college_name && ` · ${entry.college_name}`}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="flex items-center gap-1 font-heading font-bold text-base text-[var(--text-primary)]">
                      <Flame size={14} className="text-accent-coral" />
                      {entry.total_sessions}
                    </span>
                    <span className="text-[var(--text-muted)]">Sessions</span>
                  </div>
                  <div className="w-px h-8 bg-[var(--glass-border)]" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="flex items-center gap-1 font-heading font-bold text-base text-[var(--text-primary)]">
                      <Star size={14} className="text-accent-amber" />
                      {Number(entry.average_rating).toFixed(1)}
                    </span>
                    <span className="text-[var(--text-muted)]">Rating</span>
                  </div>
                  <div className="w-px h-8 bg-[var(--glass-border)]" />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="font-heading font-bold text-base text-accent-amber">
                      {entry.credits}
                    </span>
                    <span className="text-[var(--text-muted)]">Credits</span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Full ranked table */}
      {rest.length > 0 && (
        <GlassCard padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--bg-surface)]">
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Rank</th>
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Student</th>
                  <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] hidden md:table-cell">College</th>
                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Sessions</th>
                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Rating</th>
                  <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">Credits</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, idx) => {
                  const rank = idx + 4;
                  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-[var(--glass-border)] last:border-b-0 hover:bg-[var(--glass-bg)] transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-5 py-3">
                        <span className="font-heading font-bold text-[var(--text-muted)]">#{rank}</span>
                      </td>

                      {/* Student */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={avatarUrl}
                            alt={entry.username || 'User avatar'}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full bg-[var(--bg-surface-solid)]"
                          />
                          <div>
                            <p className="font-medium text-[var(--text-primary)] leading-tight">
                              {entry.full_name || entry.username}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">@{entry.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <GraduationCap size={12} />
                          {entry.college_name || '—'}
                        </span>
                      </td>

                      {/* Sessions */}
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)]">
                          <Flame size={12} className="text-accent-coral" />
                          {entry.total_sessions}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)]">
                          ⭐ {Number(entry.average_rating).toFixed(1)}
                        </span>
                      </td>

                      {/* Credits */}
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs font-heading font-bold text-accent-amber">
                          {entry.credits}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <Trophy size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
          <p className="text-[var(--text-muted)] text-sm">
            No students on the leaderboard yet. Be the first to complete a session!
          </p>
        </div>
      )}
    </div>
  );
}
