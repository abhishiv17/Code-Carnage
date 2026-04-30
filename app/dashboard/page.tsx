'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { SkillCard } from '@/components/dashboard/SkillCard';
import type { MarketplaceListing } from '@/lib/mock-data';
import { Loader2, Search } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchListings = async () => {
      const supabase = createClient();

      // Fetch all offered skills (excluding current user)
      const { data: skills } = await supabase
        .from('skills')
        .select('user_id, skill_name')
        .eq('type', 'offered')
        .neq('user_id', user.id);

      if (!skills || skills.length === 0) {
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = Array.from(new Set(skills.map((s) => s.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Get desired skills for these users
      const { data: desiredSkills } = await supabase
        .from('skills')
        .select('user_id, skill_name')
        .eq('type', 'desired')
        .in('user_id', userIds);

      // Build listings
      const listingData: MarketplaceListing[] = skills.map((skill, idx) => {
        const profile = profiles?.find((p) => p.id === skill.user_id);
        const wantedSkill = desiredSkills?.find((d) => d.user_id === skill.user_id);
        const avatar = `https://api.dicebear.com/9.x/avataaars/svg?seed=${profile?.username || 'User'}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

        const collegeName = profile?.college_name || 'SkillSwap Student';
        const yearStr = profile?.year_of_study ? `Year ${profile.year_of_study}` : '';
        const bioText = profile?.bio || profile?.about_me || '';

        return {
          id: `listing-${idx}`,
          user: {
            id: skill.user_id,
            name: profile?.full_name || profile?.username || 'Unknown',
            avatar,
            college: collegeName,
            year: yearStr,
            bio: bioText,
            skillsHave: [skill.skill_name],
            skillsWant: wantedSkill ? [wantedSkill.skill_name] : [],
            credits: profile?.credits ?? 0,
            sessionsCompleted: profile?.total_sessions ?? 0,
            rating: profile?.average_rating ?? 0,
            reviewCount: 0,
            isVerified: true,
            joinedAt: profile?.created_at || '',
          },
          skillOffered: skill.skill_name,
          skillWanted: wantedSkill?.skill_name || 'Any skill',
          description: bioText || `${profile?.full_name || profile?.username || 'A student'} is offering to teach ${skill.skill_name}. Connect to start swapping skills!`,
          creditsPerHour: 1, // Standardized for now as 1 session = 1 credit
          availability: profile?.preferred_mode === 'online' ? 'Online' : profile?.preferred_mode === 'offline' ? 'Offline' : 'Flexible',
          tags: [skill.skill_name, collegeName].filter(Boolean),
        };
      });

      setListings(listingData);
      setLoading(false);
    };
    fetchListings();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
          Marketplace
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Browse skill listings from fellow students and find your next swap
        </p>
      </div>

      {/* Stats */}
      <StatsOverview />

      {/* Listings grid */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
            Available Swaps
          </h2>
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[var(--text-muted)]" />
            </div>
            <input
              type="text"
              placeholder="Search skills, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 transition-colors"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent-violet" />
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center py-12 text-[var(--text-muted)]">
            No listings yet. Be the first to add your skills!
          </p>
        ) : (
          (() => {
            const filteredListings = listings.filter((listing) => {
              const q = searchQuery.toLowerCase();
              return (
                listing.skillOffered.toLowerCase().includes(q) ||
                listing.skillWanted.toLowerCase().includes(q) ||
                listing.user.name.toLowerCase().includes(q) ||
                listing.tags.some(tag => tag.toLowerCase().includes(q))
              );
            });

            if (filteredListings.length === 0) {
              return (
                <p className="text-center py-12 text-[var(--text-muted)]">
                  No listings found matching "{searchQuery}".
                </p>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredListings.map((listing) => (
                  <SkillCard key={listing.id} listing={listing} />
                ))}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
