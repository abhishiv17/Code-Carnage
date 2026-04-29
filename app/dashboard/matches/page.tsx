'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { ArrowRightLeft, Sparkles, Loader2, CheckCircle2, Send, Search, Video } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface MatchResult {
  peer_id: string;
  username: string;
  offered_skill: string;
  compatibility_score: number;
  reasoning: string;
}

// Default skills to search when user has no desired skills set (demo mode)
const DEMO_DESIRED_SKILLS = [
  { id: 'demo-1', skill_name: 'Guitar', type: 'desired' as const },
  { id: 'demo-2', skill_name: 'UI/UX Design', type: 'desired' as const },
  { id: 'demo-3', skill_name: 'Photography', type: 'desired' as const },
];

export default function MatchesPage() {
  const { skills, loading: userLoading } = useUser();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [requestingSession, setRequestingSession] = useState<string | null>(null);
  const [requestedSessions, setRequestedSessions] = useState<Record<string, { sessionId: string, status: string }>>({});
  const [customSkill, setCustomSkill] = useState('');

  const userDesiredSkills = skills.filter((s) => s.type === 'desired');
  // Use user's skills if available, otherwise fall back to demo skills
  const desiredSkills = userDesiredSkills.length > 0 ? userDesiredSkills : DEMO_DESIRED_SKILLS;
  const isDemo = userDesiredSkills.length === 0;

  const findMatches = async (skillsToSearch?: { skill_name: string }[]) => {
    const searchSkills = skillsToSearch || desiredSkills;

    if (searchSkills.length === 0) {
      toast.error('Add some desired skills in your profile first!');
      return;
    }

    setLoading(true);
    setMatches([]);
    setRequestedSessions({});

    try {
      const allMatches: MatchResult[] = [];
      let hasError = false;

      for (const skill of searchSkills) {
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
        toast.info('No matches found yet. Try searching for a different skill!');
      }
    } catch (err) {
      console.error('Find matches error:', err);
      toast.error('Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const searchCustomSkill = () => {
    if (!customSkill.trim()) {
      toast.error('Enter a skill to search for');
      return;
    }
    findMatches([{ skill_name: customSkill.trim() }]);
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
      setRequestedSessions((prev) => ({
        ...prev,
        [matchKey]: { sessionId: data.session.id, status: data.session.status }
      }));
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setRequestingSession(null);
    }
  };

  // Poll for accepted sessions
  useEffect(() => {
    const pendingSessionKeys = Object.entries(requestedSessions)
      .filter(([_, info]) => info.status === 'pending')
      .map(([key, _]) => key);

    if (pendingSessionKeys.length === 0) return;

    const intervalId = setInterval(async () => {
      const supabase = createClient();
      for (const key of pendingSessionKeys) {
        const info = requestedSessions[key];
        
        // Handle mock AI peers (auto accept after a bit)
        if (info.sessionId.startsWith('demo-')) {
          setRequestedSessions(prev => ({
            ...prev,
            [key]: { ...prev[key], status: 'active' }
          }));
          toast.success(`Your session request was accepted!`);
          playSuccessChime();
          continue;
        }

        const { data } = await supabase
          .from('sessions')
          .select('status')
          .eq('id', info.sessionId)
          .single();
          
        if (data && data.status === 'active') {
          setRequestedSessions(prev => ({
            ...prev,
            [key]: { ...prev[key], status: 'active' }
          }));
          toast.success(`Your session request was accepted!`);
          playSuccessChime();
        }
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [requestedSessions]);

  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) { /* ignore audio error */ }
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

      {/* Demo mode banner */}
      {isDemo && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20">
          <Sparkles size={16} className="text-accent-amber shrink-0" />
          <p className="text-sm text-[var(--text-secondary)]">
            <strong className="text-accent-amber">Demo Mode</strong> — Showing sample skills. Log in and add your desired skills in your profile for personalized matches!
          </p>
        </div>
      )}

      {/* Desired skills + search button */}
      <GlassCard gradient padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">
              {isDemo ? 'Sample desired skills (demo):' : 'Searching matches for your desired skills:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {desiredSkills.map((s) => (
                <SkillBadge key={s.id} skill={s.skill_name} variant="want" size="md" />
              ))}
            </div>
          </div>
          <GradientButton onClick={() => findMatches()} disabled={loading}>
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Searching...</>
            ) : (
              <><Sparkles size={16} /> Find Matches</>
            )}
          </GradientButton>
        </div>
      </GlassCard>

      {/* Custom skill search */}
      <GlassCard padding="md">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Or search for a specific skill:
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="e.g. Python, Guitar, Yoga..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomSkill()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 transition-all"
            />
          </div>
          <GradientButton onClick={searchCustomSkill} disabled={loading} size="sm">
            <Search size={14} /> Search
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
            No matches found for those skills. Try searching for something else!
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
            const requestedInfo = requestedSessions[matchKey];
            const isRequested = !!requestedInfo;
            const isAccepted = requestedInfo?.status === 'active';

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
                    <SkillBadge skill={wantedSkill || match.offered_skill} variant="want" size="md" />
                  </div>
                </div>

                {/* Reasoning */}
                <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2">
                  {match.reasoning}
                </p>

                {/* Action */}
                {isRequested ? (
                  isAccepted ? (
                    <div className="space-y-2">
                      <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm font-medium">
                        <CheckCircle2 size={16} />
                        Session Accepted!
                      </div>
                      <Link href={`/call/${match.peer_id}?skill=${encodeURIComponent(match.offered_skill)}&peer=${encodeURIComponent(match.username)}`}>
                        <GradientButton className="w-full" size="sm">
                          <Video size={14} /> Join Call
                        </GradientButton>
                      </Link>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber text-sm font-medium">
                      <Loader2 size={16} className="animate-spin" />
                      Pending Acceptance...
                    </div>
                  )
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
