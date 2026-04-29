'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { SkillBadge } from '@/components/shared/SkillBadge';
import { MOCK_REVIEWS, CURRENT_USER } from '@/lib/mock-data';
import { Star, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const receivedReviews = MOCK_REVIEWS.filter((r) => r.toUser.id === CURRENT_USER.id);
  const givenReviews = MOCK_REVIEWS.filter((r) => r.fromUser.id === CURRENT_USER.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">Reviews</h1>
        <p className="text-sm text-[var(--text-muted)]">Your ratings and feedback from skill sessions</p>
      </div>

      {/* Write a review */}
      <GlassCard gradient padding="lg">
        <h2 className="font-heading font-semibold text-lg text-[var(--text-primary)] mb-4">Leave a Review</h2>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewRating(star)} className="transition-transform hover:scale-110">
              <Star size={28} className={cn('transition-colors', (hoverRating || newRating) >= star ? 'text-accent-amber fill-accent-amber' : 'text-[var(--text-muted)]')} />
            </button>
          ))}
        </div>
        <textarea placeholder="Share your experience..." className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 resize-none h-24 mb-4" />
        <GradientButton size="md">Submit Review</GradientButton>
      </GlassCard>

      {/* Received */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Reviews About You</h2>
        <div className="space-y-4">
          {receivedReviews.map((review) => (
            <GlassCard key={review.id}>
              <div className="flex items-start gap-3">
                <img src={review.fromUser.avatar} alt={review.fromUser.name} className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{review.fromUser.name}</span>
                    {review.fromUser.isVerified && <BadgeCheck size={14} className="text-accent-amber" />}
                    <SkillBadge skill={review.skill} variant="match" />
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={cn(i < review.rating ? 'text-accent-amber fill-accent-amber' : 'text-[var(--text-muted)]')} />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.comment}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-2">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Given */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Reviews You Wrote</h2>
        <div className="space-y-4">
          {givenReviews.map((review) => (
            <GlassCard key={review.id} className="opacity-80">
              <div className="flex items-start gap-3">
                <img src={review.toUser.avatar} alt={review.toUser.name} className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">To {review.toUser.name}</span>
                    <SkillBadge skill={review.skill} variant="default" />
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={cn(i < review.rating ? 'text-accent-amber fill-accent-amber' : 'text-[var(--text-muted)]')} />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{review.comment}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
