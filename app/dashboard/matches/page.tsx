'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { ArrowRightLeft, Sparkles, Loader2, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface MatchResult {
  peer_id: string;
  username: string;
  offered_skill: string;
}

export default function MatchesPage() {
  const { skills, loading: userLoading, user } = useUser();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [requestingSession, setRequestingSession] = useState<string | null>(null);
  const [requestedSessions, setRequestedSessions] = useState<Set<string>>(new Set());

  const desiredSkills = skills.filter((s) => s.type === 'desired');

  const [searchTerm, setSearchTerm] = useState('');

  // Auto-search based on their first desired skill!
  useEffect(() => {
    if (!userLoading && desiredSkills.length > 0 && !searched && !searchTerm) {
      const defaultSkill = desiredSkills[0].skill_name;
      setSearchTerm(defaultSkill);
      findMatches(defaultSkill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, desiredSkills.length]);

  const findMatches = async (autoSearchTerm?: string) => {
    const termToSearch = typeof autoSearchTerm === 'string' ? autoSearchTerm : searchTerm.trim();
    if (!termToSearch) {
      toast.error('Please enter a skill you want to learn!');
      return;
    }

    setLoading(true);
    setMatches([]);
    setRequestedSessions(new Set());

    try {
      const supabase = createClient();
      
      // Find skills matching the search term that are being offered
      const { data: matchedSkills, error: skillsErr } = await supabase
        .from('skills')
        .select('user_id, skill_name')
        .eq('type', 'offered')
        .ilike('skill_name', `%${termToSearch}%`);

      if (skillsErr) throw skillsErr;

      const userIds = Array.from(new Set((matchedSkills || []).map(s => s.user_id)));
      
      const results: MatchResult[] = [];

      if (userIds.length > 0) {
        // Fetch profiles for these users
        const { data: profiles, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds)
          .neq('id', user.id); // Exclude self

        if (profilesErr) throw profilesErr;
        
        profiles?.forEach(profile => {
          // Find the specific skill this user is offering that matched
          const userSkill = matchedSkills?.find(s => s.user_id === profile.id);
          if (userSkill) {
            results.push({
              peer_id: profile.id,
              username: profile.username,
              offered_skill: userSkill.skill_name
            });
          }
        });
      }

      setMatches(results);
      setSearched(true);

      if (results.length > 0) {
        toast.success(`Found ${results.length} student${results.length > 1 ? 's' : ''} teaching this!`);
      } else {
        // Fallback for demo purposes
        setMatches([{
          peer_id: user?.id || '',
          username: `Expert (Demo Teacher)`,
          offered_skill: termToSearch
        }]);
        toast.info(`No real users found, but we created a Demo Teacher so you can test the flow!`);
      }
    } catch (err) {
      console.error('Find matches error:', err);
      toast.error('Failed to find matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestSession = async (match: MatchResult) => {
    if (!match.peer_id) return;

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

      toast.success(`Class requested with ${match.username}! They'll be notified.`);
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
          Find a Class
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Search for the exact skill you want to learn from other students.
        </p>
      </div>

      <GlassCard gradient padding="lg">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="E.g., React, Guitar, Spanish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && findMatches()}
              className="w-full pl-4 pr-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50"
            />
          </div>
          <GradientButton onClick={findMatches} disabled={loading || !searchTerm.trim()} className="w-full sm:w-auto">
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Searching...</>
            ) : (
              <><Sparkles size={16} /> Search</>
            )}
          </GradientButton>
        </div>
      </GlassCard>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 size={28} className="animate-spin text-accent-violet" />
          <p className="text-sm text-[var(--text-muted)] animate-pulse">
            Searching...
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
            const matchKey = `${match.peer_id}-${match.offered_skill}`;
            const isRequesting = requestingSession === matchKey;
            const isRequested = requestedSessions.has(matchKey);

            return (
              <GlassCard key={`${match.username}-${match.offered_skill}-${idx}`} hover gradient className="relative overflow-hidden">


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

                <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-[var(--bg-surface-solid)]">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-accent-emerald font-semibold mb-1">They Teach</p>
                    <SkillBadge skill={match.offered_skill} variant="have" size="md" />
                  </div>
                </div>

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
                      <><Send size={14} /> Request Class</>
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
