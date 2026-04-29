import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { MOCK_SESSIONS, CURRENT_USER } from '@/lib/mock-data';
import { Calendar, Clock, Coins, Video, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SessionsPage() {
  const upcoming = MOCK_SESSIONS.filter((s) => s.status === 'upcoming');
  const completed = MOCK_SESSIONS.filter((s) => s.status === 'completed');

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
          Upcoming
        </h2>
        <div className="space-y-4">
          {upcoming.map((session) => {
            const isTeaching = session.teacher.id === CURRENT_USER.id;
            const peer = isTeaching ? session.learner : session.teacher;
            const date = new Date(session.scheduledAt);

            return (
              <GlassCard key={session.id} hover className="flex items-center gap-5">
                {/* Date block */}
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-accent-violet/10 border border-accent-violet/20 shrink-0">
                  <span className="text-xs font-semibold text-accent-violet uppercase">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-heading font-bold text-[var(--text-primary)]">
                    {date.getDate()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SkillBadge skill={session.skill} variant={isTeaching ? 'have' : 'want'} />
                    <span className={cn(
                      'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full',
                      isTeaching
                        ? 'bg-accent-emerald/10 text-accent-emerald'
                        : 'bg-accent-violet/10 text-accent-violet'
                    )}>
                      {isTeaching ? 'Teaching' : 'Learning'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] font-medium">
                    with {peer.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {session.duration}min
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins size={12} className="text-accent-amber" />
                      {session.creditsExchanged} credits
                    </span>
                  </div>
                </div>

                {/* Join button */}
                <Link href={`/dashboard/sessions/${session.id}`}>
                  <GradientButton size="sm">
                    <Video size={14} />
                    Join
                  </GradientButton>
                </Link>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Completed */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-accent-emerald" />
          Completed
        </h2>
        <div className="space-y-4">
          {completed.map((session) => {
            const isTeaching = session.teacher.id === CURRENT_USER.id;
            const peer = isTeaching ? session.learner : session.teacher;
            const date = new Date(session.scheduledAt);

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
                  <div className="flex items-center gap-2 mb-1">
                    <SkillBadge skill={session.skill} variant="default" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-surface-solid)] text-[var(--text-muted)]">
                      {isTeaching ? 'Taught' : 'Learned'}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] font-medium">
                    with {peer.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {session.duration}min · {isTeaching ? '+' : '-'}{session.creditsExchanged} credits
                  </p>
                </div>

                <Link href="/dashboard/reviews">
                  <GradientButton variant="outline" size="sm">Review</GradientButton>
                </Link>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
