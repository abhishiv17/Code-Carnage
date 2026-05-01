'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BADGES, BADGE_MAP, RARITY_COLORS, MILESTONES } from '@/lib/badges';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/shared/GlassCard';
import { cn } from '@/lib/utils';
import { Award, TrendingUp, Lock, Sparkles } from 'lucide-react';
import { authFetch } from '@/lib/authFetch';

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

export function BadgesSection() {
  const { user, profile, skills } = useUser();
  const [supabase] = useState(() => createClient());

  // Trigger badge check on mount, then fetch results
  const { data: userBadges = [], isLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Trigger the check-and-award process
      const res = await authFetch('/api/badges', {
        method: 'POST',
        body: JSON.stringify({ userId: user!.id }),
      });
      const data = await res.json();
      return (data.badges || []) as UserBadge[];
    },
    staleTime: 60 * 1000, // 1 min
  });

  const earnedBadgeIds = new Set(userBadges.map((b) => b.badge_id));
  const earnedBadges = BADGES.filter((b) => earnedBadgeIds.has(b.id));
  const lockedBadges = BADGES.filter((b) => !earnedBadgeIds.has(b.id));

  // Milestones computation
  const offeredSkills = skills.filter((s) => s.type === 'offered');

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ['review-count', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewer_id', user!.id);
      return count || 0;
    },
    staleTime: 5 * 60 * 1000,
  });

  const milestoneValues: Record<string, number> = {
    sessions: profile?.total_sessions ?? 0,
    credits: profile?.credits ?? 0,
    reviews: reviewCount,
    skills: offeredSkills.length,
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <Award size={18} className="text-accent-amber" />
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-amber">
            Badges Earned ({earnedBadges.length}/{BADGES.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-[var(--bg-surface-solid)] animate-pulse" />
            ))}
          </div>
        ) : earnedBadges.length === 0 ? (
          <div className="text-center py-6">
            <Sparkles size={32} className="mx-auto mb-2 text-[var(--text-muted)] opacity-30" />
            <p className="text-sm text-[var(--text-muted)]">No badges yet. Complete sessions to earn your first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {earnedBadges.map((badge) => {
              const colors = RARITY_COLORS[badge.rarity];
              const earned = userBadges.find((b) => b.badge_id === badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    'group relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-default',
                    colors.bg, colors.border,
                    colors.glow && `shadow-lg ${colors.glow}`
                  )}
                  title={`${badge.name} — ${badge.description}`}
                >
                  <span className="text-2xl mb-1">{badge.icon}</span>
                  <span className="text-[10px] font-semibold text-[var(--text-primary)] text-center leading-tight">
                    {badge.name}
                  </span>
                  <span className={cn('text-[9px] font-bold uppercase tracking-wider mt-0.5', colors.text)}>
                    {badge.rarity}
                  </span>
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[10px] text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Locked badges preview */}
        {lockedBadges.length > 0 && (
          <>
            <div className="flex items-center gap-2 mt-6 mb-3">
              <Lock size={14} className="text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {lockedBadges.length} badge{lockedBadges.length !== 1 ? 's' : ''} to unlock
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="group relative flex flex-col items-center p-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] opacity-40 hover:opacity-70 transition-all cursor-default"
                  title={`${badge.name} — ${badge.description}`}
                >
                  <span className="text-2xl mb-1 grayscale">{badge.icon}</span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] text-center leading-tight">
                    {badge.name}
                  </span>
                  <Lock size={8} className="mt-0.5 text-[var(--text-muted)]" />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[10px] text-[var(--text-muted)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                    {badge.description}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </GlassCard>

      {/* Milestones */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={18} className="text-accent-emerald" />
          <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-emerald">
            Milestones
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MILESTONES.map((milestone) => {
            const value = milestoneValues[milestone.id] ?? 0;
            const nextThreshold = milestone.thresholds.find((t) => t > value) || milestone.thresholds[milestone.thresholds.length - 1];
            const prevThreshold = [...milestone.thresholds].reverse().find((t) => t <= value) || 0;
            const progress = nextThreshold > prevThreshold
              ? Math.min(100, ((value - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
              : 100;
            const completedCount = milestone.thresholds.filter((t) => value >= t).length;
            const allComplete = completedCount === milestone.thresholds.length;

            return (
              <div
                key={milestone.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  allComplete
                    ? 'border-accent-emerald/30 bg-accent-emerald/5'
                    : 'border-[var(--glass-border)] bg-[var(--bg-surface-solid)]'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{milestone.icon}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{milestone.label}</span>
                  </div>
                  <span className={cn(
                    'text-xs font-bold',
                    allComplete ? 'text-accent-emerald' : 'text-[var(--text-muted)]'
                  )}>
                    {value}/{nextThreshold}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[var(--bg-surface)] overflow-hidden mb-2">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700 ease-out',
                      allComplete
                        ? 'bg-gradient-to-r from-accent-emerald to-green-400'
                        : 'bg-gradient-to-r from-accent-violet to-accent-amber'
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Threshold dots */}
                <div className="flex items-center gap-1">
                  {milestone.thresholds.map((threshold, i) => (
                    <div key={threshold} className="flex items-center gap-1">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          value >= threshold
                            ? 'bg-accent-emerald scale-110'
                            : 'bg-[var(--bg-surface)] border border-[var(--glass-border)]'
                        )}
                      />
                      <span className={cn(
                        'text-[9px]',
                        value >= threshold ? 'text-accent-emerald font-bold' : 'text-[var(--text-muted)]'
                      )}>
                        {threshold}
                      </span>
                      {i < milestone.thresholds.length - 1 && (
                        <div className="w-2 h-px bg-[var(--glass-border)]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
