import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { MOCK_MATCHES } from '@/lib/mock-data';
import { ArrowRightLeft, BadgeCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export default function MatchesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          AI Matches
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Our matching engine found these compatible skill-swap partners for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_MATCHES.map((match) => (
          <GlassCard key={match.id} hover gradient className="relative overflow-hidden">
            {/* Match score */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20">
              <Sparkles size={12} className="text-accent-amber" />
              <span className="text-xs font-heading font-bold text-accent-amber">
                {match.matchScore}% Match
              </span>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 mb-5">
              <img
                src={match.user.avatar}
                alt={match.user.name}
                className="w-14 h-14 rounded-full bg-[var(--bg-surface-solid)]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-semibold text-base text-[var(--text-primary)]">
                    {match.user.name}
                  </span>
                  {match.user.isVerified && (
                    <BadgeCheck size={16} className="text-accent-amber" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{match.user.year}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  ⭐ {match.user.rating} · {match.user.sessionsCompleted} sessions
                </p>
              </div>
            </div>

            {/* Skill exchange */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-surface-solid)]">
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-wider text-accent-emerald font-semibold mb-1">They Teach</p>
                <SkillBadge skill={match.matchedSkillOffer} variant="have" size="md" />
              </div>
              <ArrowRightLeft size={16} className="text-[var(--text-muted)] shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-[10px] uppercase tracking-wider text-accent-violet font-semibold mb-1">They Want</p>
                <SkillBadge skill={match.matchedSkillWant} variant="want" size="md" />
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
              {match.user.bio}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {match.status === 'accepted' ? (
                <Link href={ROUTES.sessions} className="flex-1">
                  <GradientButton className="w-full" size="sm">
                    Schedule Session
                  </GradientButton>
                </Link>
              ) : (
                <>
                  <GradientButton className="flex-1" size="sm">
                    Accept Match
                  </GradientButton>
                  <GradientButton variant="ghost" size="sm">
                    Decline
                  </GradientButton>
                </>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
