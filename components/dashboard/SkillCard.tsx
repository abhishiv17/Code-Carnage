'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GlassCard } from '@/components/shared/GlassCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import type { MarketplaceListing } from '@/lib/mock-data';
import { Clock, Coins, ArrowRightLeft, BadgeCheck, Check, Send } from 'lucide-react';
import { GradientButton } from '@/components/shared/GradientButton';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SkillCardProps {
  listing: MarketplaceListing;
}

export function SkillCard({ listing }: SkillCardProps) {
  const { user: currentUser } = useUser();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    if (!currentUser) {
      toast.error('You must be logged in to connect.');
      return;
    }
    
    setIsConnecting(true);
    const supabase = createClient();
    
    try {
      // 1. Create a connection request
      const { error: connectionError } = await supabase
        .from('connections')
        .upsert({
          requester_id: currentUser.id,
          receiver_id: listing.user.id,
          status: 'pending'
        }, { onConflict: 'requester_id,receiver_id' });
        
      if (connectionError) throw connectionError;
      
      // 2. Fetch current user's profile to get their name
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', currentUser.id)
        .single();
        
      const myName = profile?.username || 'Someone';

      // 3. Send notification
      await supabase.from('notifications').insert({
        user_id: listing.user.id,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${myName} wants to connect with you to swap skills!`,
        link: `/dashboard/user/${currentUser.id}`
      });
      
      setConnected(true);
      toast.success(`Connection request sent to ${listing.user.name}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <GlassCard hover className="flex flex-col h-full group">
      {/* Header: user info */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={listing.user.avatar}
          alt={listing.user.name || 'User avatar'}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {listing.user.name}
            </span>
            {listing.user.isVerified && (
              <BadgeCheck size={14} className="text-accent-amber shrink-0" />
            )}
          </div>
          <p className="text-xs text-[var(--text-muted)] truncate">{listing.user.year}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-accent-amber">
          <span>⭐</span>
          <span className="font-medium">{listing.user.rating}</span>
        </div>
      </div>

      {/* Skill swap */}
      <div className="flex items-center gap-2 mb-3">
        <SkillBadge skill={listing.skillOffered} variant="have" size="md" />
        <ArrowRightLeft size={14} className="text-[var(--text-muted)] shrink-0" />
        <SkillBadge skill={listing.skillWanted} variant="want" size="md" />
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4 flex-1 line-clamp-3">
        {listing.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {listing.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-surface-solid)] text-[var(--text-muted)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--glass-border)]">
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Coins size={12} className="text-accent-amber" />
            {listing.creditsPerHour}/hr
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {listing.availability}
          </span>
        </div>
        <div className="relative z-10">
          <GradientButton 
            size="sm" 
            onClick={handleConnect} 
            disabled={isConnecting || connected}
            className="flex items-center gap-2"
          >
            {connected ? (
              <><Check size={14} /> Requested</>
            ) : isConnecting ? (
              <><Send size={14} className="animate-pulse" /> Sending...</>
            ) : (
              'Connect'
            )}
          </GradientButton>
        </div>
      </div>
    </GlassCard>
  );
}
