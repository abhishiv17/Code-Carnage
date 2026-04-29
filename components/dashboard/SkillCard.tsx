import Image from 'next/image';
import { GlassCard } from '@/components/shared/GlassCard';
import { SkillBadge } from '@/components/shared/SkillBadge';
import type { MarketplaceListing } from '@/lib/mock-data';
import { Clock, Coins, ArrowRightLeft, BadgeCheck } from 'lucide-react';
import { GradientButton } from '@/components/shared/GradientButton';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface SkillCardProps {
  listing: MarketplaceListing;
}

export function SkillCard({ listing }: SkillCardProps) {
  return (
    <GlassCard hover className="flex flex-col h-full group">
      {/* Header: user info */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={listing.user.avatar}
          alt={listing.user.name}
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
        <Link href={ROUTES.matches} className="relative z-10">
          <GradientButton size="sm">Connect</GradientButton>
        </Link>
      </div>
    </GlassCard>
  );
}
