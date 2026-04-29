'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { ArrowRightLeft, Sparkles, Loader2, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface MatchResult {
  peer_id: string;
  username: string;
  offered_skill: string;
  compatibility_score: number;
  reasoning: string;
}

export default function MatchesPage() {
  const { skills, loading: userLoading } = useUser();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [requestingSession, setRequestingSession] = useState<string | null>(null);
  const [requestedSessions, setRequestedSessions] = useState<Set<string>>(new Set());

  const desiredSkills = skills.filter((s) => s.type === 'desired');

  const findMatches = async () => {
    if (desiredSkills.length === 0) {
      toast.error('Add some desired skills in your profile first!');
      return;
    }

    setLoading(true);
    setMatches([]);
    setRequestedSessions(new Set());

    try {
      const allMatches: MatchResult[] = [];
      let hasError = false;

      for (const skill of desiredSkills) {
        try {
          const res = await fetch('/api/ai/match', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desiredSkill: skill.skill_name }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.matches && Array.isArray(data.matches)) {
              allMatches.push(...data.matches);
            }
          } else {
            const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
            console.error(`Match API error for ${skill.skill_name}:`, errData);
            toast.error(`Error matching "${skill.skill_name}": ${errData.error || res.statusText}`);
            hasError = true;
          }
        } catch (fetchErr) {
          console.error(`Network error for ${skill.skill_name}:`, fetchErr);
          toast.error(`Network error while searching for "${skill.skill_name}"`);
          hasError = true;
        }
      }

      // Deduplicate by peer_id + skill
      const seen = new Set<string>();
      const unique = allMatches.filter((m) => {
        const key = `${m.peer_id || m.username}-${m.offered_skill}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by compatibility score
      unique.sort((a, b) => b.compatibility_score - a.compatibility_score);
      setMatches(unique);
      setSearched(true);

      if (unique.length > 0) {
        toast.success(`Found ${unique.length} match${unique.length > 1 ? 'es' : ''}!`);
      } else if (!hasError) {
        toast.info('No matches found yet. More users need to join and offer skills!');
      }
    } catch (err) {
      console.error('Find matches error:', err);
      toast.error('Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestSession = async (match: MatchResult) => {
    if (!match.peer_id) {
      toast.error('Unable to identify this user. Please try finding matches again.');
      return;
    }

    const matchKey = `${match.peer_id}-${match.offered_skill}`;
    setRequestingSession(matchKey);

    try {
      const res = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: match.peer_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to create session');
        return;
      }

      toast.success(`Session requested with ${match.username}! They'll be notified.`);
      setRequestedSessions((prev) => new Set(prev).add(matchKey));
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setRequestingSession(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          AI Matches
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Our AI matching engine finds compatible skill-swap partners for you
        </p>
      </div>

      {/* Desired skills + search button */}
      <GlassCard gradient padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              Searching matches for your desired skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {desiredSkills.length > 0 ? (
                desiredSkills.map((s) => (
                  <SkillBadge key={s.id} skill={s.skill_name} variant="want" size="md" />
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)]">No desired skills set — add some in your profile.</p>
              )}
            </div>
          </div>
          <GradientButton onClick={findMatches} disabled={loading || desiredSkills.length === 0}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Searching...</>
            ) : (
              <><Sparkles size={16} /> Find Matches</>
            )}
          </GradientButton>
        </div>
      </GlassCard>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-accent-violet" />
          <p className="text-sm text-[var(--text-muted)] animate-pulse">
            AI is analyzing skill compatibility...
          </p>
        </div>
      )}

      {!loading && searched && matches.length === 0 && (
        <div className="text-center py-12">
          <Sparkles size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-20" />
          <p className="text-[var(--text-muted)]">
            No matches found yet. More users joining will improve results!
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((match, idx) => {
            const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${match.username}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
            const wantedSkill = desiredSkills.find((s) =>
              match.reasoning?.toLowerCase().includes(s.skill_name.toLowerCase())
            )?.skill_name || desiredSkills[0]?.skill_name || '';

            const matchKey = `${match.peer_id}-${match.offered_skill}`;
            const isRequesting = requestingSession === matchKey;
            const isRequested = requestedSessions.has(matchKey);

            return (
              <GlassCard key={`${match.username}-${match.offered_skill}-${idx}`} hover gradient className="relative overflow-hidden">
                {/* Match score */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-amber/10 border border-accent-amber/20">
                  <Sparkles size={12} className="text-accent-amber" />
                  <span className="text-xs font-heading font-bold text-accent-amber">
                    {match.compatibility_score}% Match
                  </span>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 mb-5">
                  <Image
                    src={avatarUrl}
                    alt={match.username || 'User avatar'}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full bg-[var(--bg-surface-solid)]"
                  />
                  <div>
                    <span className="font-heading font-semibold text-base text-[var(--text-primary)]">
                      {match.username}
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">SkillSwap Student</p>
                  </div>
                </div>

                {/* Skill exchange */}
                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-surface-solid)]">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-accent-emerald font-semibold mb-1">They Teach</p>
                    <SkillBadge skill={match.offered_skill} variant="have" size="md" />
                  </div>
                  <ArrowRightLeft size={16} className="text-[var(--text-muted)] shrink-0" />
                  <div className="flex-1 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-accent-violet font-semibold mb-1">You Want</p>
                    <SkillBadge skill={wantedSkill} variant="want" size="md" />
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
                  {match.reasoning}
                </p>

                {/* Action */}
                {isRequested ? (
                  <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Session Requested!
                  </div>
                ) : (
                  <GradientButton
                    className="w-full"
                    size="sm"
                    onClick={() => requestSession(match)}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <><Loader2 size={14} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={14} /> Request Session</>
                    )}
                  </GradientButton>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
