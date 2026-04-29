import { GlassCard } from '@/components/shared/GlassCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { CURRENT_USER } from '@/lib/mock-data';
import { BadgeCheck, Coins, BookOpen, Star, Calendar } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Your skill exchange profile</p>
      </div>

      {/* Profile card */}
      <GlassCard gradient padding="lg">
        <div className="flex items-start gap-5">
          <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-solid)]" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-heading text-xl font-bold text-[var(--text-primary)]">{CURRENT_USER.name}</h2>
              {CURRENT_USER.isVerified && <BadgeCheck size={18} className="text-accent-amber" />}
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{CURRENT_USER.college} · {CURRENT_USER.year}</p>
            <p className="text-sm text-[var(--text-secondary)]">{CURRENT_USER.bio}</p>

            <div className="flex items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Coins size={14} className="text-accent-amber" />{CURRENT_USER.credits} credits</span>
              <span className="flex items-center gap-1"><BookOpen size={14} className="text-accent-emerald" />{CURRENT_USER.sessionsCompleted} sessions</span>
              <span className="flex items-center gap-1"><Star size={14} className="text-accent-amber fill-accent-amber" />{CURRENT_USER.rating} ({CURRENT_USER.reviewCount} reviews)</span>
              <span className="flex items-center gap-1"><Calendar size={14} />Joined {new Date(CURRENT_USER.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Skills I Teach */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-emerald mb-4">Skills I Teach</h3>
        <div className="flex flex-wrap gap-2">
          {CURRENT_USER.skillsHave.map((s) => <SkillBadge key={s} skill={s} variant="have" size="md" />)}
        </div>
      </GlassCard>

      {/* Skills I Want */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-accent-violet mb-4">Skills I Want to Learn</h3>
        <div className="flex flex-wrap gap-2">
          {CURRENT_USER.skillsWant.map((s) => <SkillBadge key={s} skill={s} variant="want" size="md" />)}
        </div>
      </GlassCard>
    </div>
  );
}
