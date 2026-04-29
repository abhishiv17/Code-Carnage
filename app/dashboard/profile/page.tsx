'use client';

import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { Coins, BookOpen, Star, Calendar, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, skills, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

  const offeredSkills = skills.filter((s) => s.type === 'offered');
  const desiredSkills = skills.filter((s) => s.type === 'desired');
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Your skill exchange profile</p>
      </div>

      {/* Profile card */}
      <GlassCard gradient padding="lg">
        <div className="flex items-start gap-5">
          <img src={avatarUrl} alt={profile?.username || 'User'} className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-solid)]" />
          <div className="flex-1">
            <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-1">
              {profile?.username || 'Unknown'}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-1">SkillSwap Student</p>

            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-muted)] flex-wrap">
              <span className="flex items-center gap-1"><Coins size={14} className="text-accent-amber" />{profile?.credits ?? 0} credits</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-accent-amber fill-accent-amber" />{profile?.average_rating?.toFixed(1) ?? '0.0'}</span>
              <span className="flex items-center gap-1"><Calendar size={14} />Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Skills I Teach */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-emerald mb-4">Skills I Teach</h3>
        <div className="flex flex-wrap gap-2">
          {offeredSkills.length > 0 ? (
            offeredSkills.map((s) => <SkillBadge key={s.id} skill={s.skill_name} variant="have" size="md" />)
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No offered skills yet. Add some in onboarding!</p>
          )}
        </div>
      </GlassCard>

      {/* Skills I Want */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-violet mb-4">Skills I Want to Learn</h3>
        <div className="flex flex-wrap gap-2">
          {desiredSkills.length > 0 ? (
            desiredSkills.map((s) => <SkillBadge key={s.id} skill={s.skill_name} variant="want" size="md" />)
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No desired skills yet. Add some in onboarding!</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
