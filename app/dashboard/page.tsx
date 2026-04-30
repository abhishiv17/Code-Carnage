'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { SkillCard } from '@/components/dashboard/SkillCard';
import type { MarketplaceListing } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useUser();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
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
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">
          Available Swaps
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-accent-violet" />
          </div>
        ) : listings.length === 0 ? (
          <p className="text-center py-12 text-[var(--text-muted)]">
            No listings yet. Be the first to add your skills!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <SkillCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
