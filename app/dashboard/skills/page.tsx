'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ALL_SKILLS, SKILL_CATEGORIES } from '@/lib/constants';
import { GlassCard } from '@/components/shared/GlassCard';
import { Search, BookOpen, Users, Star, GraduationCap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AIRecommendations } from '@/components/dashboard/AIRecommendations';



export default function SkillLibraryPage() {
  const [supabase] = useState(() => createClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch real-time stats for all skills
  const { data: skillStats, isLoading } = useQuery({
    queryKey: ['skill-stats'],
    queryFn: async () => {
      // Fetch all skills entries from users
      const { data: userSkills } = await supabase
        .from('skills')
        .select('skill_name, type, user_id');

      if (!userSkills) return {};

      // Calculate stats per skill
      const stats: Record<string, { teachers: number; learners: number; rating: number; teacherIds: Set<string> }> = {};
      
      userSkills.forEach(s => {
        const name = s.skill_name.toLowerCase();
        if (!stats[name]) {
          stats[name] = { teachers: 0, learners: 0, rating: 0, teacherIds: new Set() };
        }
        if (s.type === 'offered') {
          stats[name].teachers++;
          stats[name].teacherIds.add(s.user_id);
        } else {
          stats[name].learners++;
        }
      });

      // Now fetch ratings for those teachers to calculate average rating per skill
      const uniqueTeacherIds = Array.from(new Set(Array.from(Object.values(stats)).flatMap(s => Array.from(s.teacherIds))));
      
      if (uniqueTeacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, average_rating')
          .in('id', uniqueTeacherIds);
          
        const ratingMap = new Map(profiles?.map(p => [p.id, p.average_rating || 0]) || []);
        
        Object.values(stats).forEach(stat => {
          if (stat.teachers > 0) {
            let totalRating = 0;
            let ratingCount = 0;
            stat.teacherIds.forEach(tid => {
              const r = ratingMap.get(tid);
              if (r && r > 0) {
                totalRating += r;
                ratingCount++;
              }
            });
            stat.rating = ratingCount > 0 ? totalRating / ratingCount : 0;
          }
        });
      }

      return stats;
    },
    staleTime: 5 * 60 * 1000,
  });

  const filteredSkills = ALL_SKILLS.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? skill.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-page-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
            <BookOpen className="text-accent-violet" />
            Skill Library
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Explore all available skills, see their demand, and find your next learning path.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search for a skill..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-accent-violet/50 transition-colors"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium transition-all',
            !selectedCategory
              ? 'bg-accent-violet text-white shadow-lg shadow-accent-violet/20'
              : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'
          )}
        >
          All Skills
        </button>
        {SKILL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border',
              selectedCategory === cat.id
                ? 'bg-accent-violet/15 border-accent-violet/30 text-accent-violet'
                : 'bg-[var(--bg-surface-solid)] border-[var(--glass-border)] text-[var(--text-muted)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]'
            )}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-accent-violet" />
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[var(--glass-border)] rounded-2xl bg-[var(--bg-surface)]">
          <BookOpen size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-20" />
          <h3 className="font-heading font-semibold text-[var(--text-primary)] mb-2">No skills found</h3>
          <p className="text-sm text-[var(--text-muted)]">Try adjusting your search or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map(skill => {
            const stats = skillStats?.[skill.name.toLowerCase()] || { teachers: 0, learners: 0, rating: 0 };
            const category = SKILL_CATEGORIES.find(c => c.id === skill.category);
            
            return (
              <GlassCard
                key={skill.id}
                padding="md"
                className="group hover:border-accent-violet/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-violet/5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category?.icon}</span>
                    <div>
                      <h3 className="font-heading font-bold text-[var(--text-primary)] line-clamp-1">{skill.name}</h3>
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)]">{category?.label}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-5">
                  {/* Teachers */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]">
                    <GraduationCap size={14} className="text-accent-emerald mb-1" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">{stats.teachers}</span>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Teachers</span>
                  </div>
                  
                  {/* Learners */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]">
                    <Users size={14} className="text-accent-violet mb-1" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">{stats.learners}</span>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Learners</span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--glass-border)]">
                    <Star size={14} className="text-accent-amber mb-1" />
                    <span className="text-sm font-bold text-[var(--text-primary)]">{stats.rating ? stats.rating.toFixed(1) : '—'}</span>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Rating</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href={`/dashboard?search=${encodeURIComponent(skill.name)}`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-accent-violet bg-accent-violet/10 hover:bg-accent-violet hover:text-white transition-all"
                  >
                    Find Matches
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
