'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { Sparkles, ArrowRight, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface Recommendation {
  name: string;
  reason: string;
  type: 'learn' | 'teach';
}

export function AIRecommendations() {
  const { user } = useUser();

  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['ai-recommendations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user!.id }),
      });
      
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const data = await res.json();
      return (data.recommendations || []) as Recommendation[];
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });

  if (error) return null; // Fail silently, it's an optional enhancement

  return (
    <GlassCard padding="lg" gradient className="mb-8 border-accent-violet/20 bg-gradient-to-br from-accent-violet/5 to-[var(--bg-surface-solid)] overflow-hidden relative">
      {/* Decorative background blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-violet/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles size={20} className="text-accent-violet" />
        <h2 className="font-heading font-bold text-lg text-[var(--text-primary)]">AI Skill Suggestions</h2>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20 uppercase tracking-wider ml-2">
          Powered by Llama 3.1
        </span>
      </div>

      <p className="text-sm text-[var(--text-muted)] mb-6 relative z-10">
        Based on your profile, background, and current skills, here&apos;s what we think you should explore next.
      </p>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] h-32 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] animate-pulse shrink-0 snap-start" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {recommendations?.map((rec, idx) => (
            <Link
              key={idx}
              href={`/dashboard?search=${encodeURIComponent(rec.name)}`}
              className="group min-w-[280px] max-w-[280px] p-4 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface-solid)] hover:border-accent-violet/40 hover:-translate-y-1 transition-all shrink-0 snap-start relative overflow-hidden flex flex-col"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-heading font-bold text-[var(--text-primary)] pr-8">{rec.name}</h3>
                <div className={`absolute top-4 right-4 p-1.5 rounded-lg border ${
                  rec.type === 'learn' 
                    ? 'bg-accent-violet/10 border-accent-violet/20 text-accent-violet'
                    : 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald'
                }`}>
                  {rec.type === 'learn' ? <BookOpen size={14} /> : <GraduationCap size={14} />}
                </div>
              </div>
              
              <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2 flex-1">
                {rec.reason}
              </p>
              
              <div className="flex items-center gap-1.5 text-xs font-semibold mt-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent-violet">
                Find {rec.type === 'learn' ? 'teachers' : 'learners'} <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
