'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { authFetch } from '@/lib/authFetch';

interface ReviewRow {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface ProfileMap {
  [id: string]: { username: string };
}

export default function ReviewsPage() {
  const { user } = useUser();
  const [supabase] = useState(() => createClient());

  const { data, isLoading: loading } = useQuery({
    queryKey: ['reviews', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: received, error: receivedErr }, { data: given, error: givenErr }] = await Promise.all([
        supabase.from('reviews').select('*').eq('reviewee_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('reviewer_id', user!.id).order('created_at', { ascending: false }),
      ]);

      if (receivedErr || givenErr) {
        console.error('Failed to fetch reviews:', receivedErr || givenErr);
        toast.error('Failed to load reviews');
        throw receivedErr || givenErr;
      }

      const allReviews = [...(received || []), ...(given || [])];
      let profileMap: ProfileMap = {};

      // Fetch profiles
      const userIds = Array.from(new Set(
        allReviews.flatMap((r) => [r.reviewer_id, r.reviewee_id]).filter((id) => id !== user!.id)
      ));
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
        
        if (profilesErr) {
           console.error('Failed to fetch profiles:', profilesErr);
        }

        profilesData?.forEach((p) => { profileMap[p.id] = { username: p.username }; });
      }

      return {
        received: (received || []) as ReviewRow[],
        given: (given || []) as ReviewRow[],
        profiles: profileMap,
      };
    },
    staleTime: 60 * 1000,
  });

  const receivedReviews = data?.received || [];
  const givenReviews = data?.given || [];
  const profiles = data?.profiles || {};

  // New review form state
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: 'placeholder-session-id', // TODO: User needs to select a session
          rating: newRating,
          feedback: feedback || 'Great session!',
        }),
      });

      if (res.ok) {
        toast.success('Review submitted!');
        setNewRating(0);
        setFeedback('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Network error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={24} className="animate-spin text-accent-violet" />
      </div>
    );
  }

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
        <textarea
          placeholder="Share your experience..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 resize-none h-24 mb-4"
        />
        <GradientButton size="md" onClick={handleSubmitReview} disabled={submitting}>
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Review'}
        </GradientButton>
      </GlassCard>

      {/* Received */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Reviews About You</h2>
        {receivedReviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">No reviews yet. Complete a session to get rated!</p>
        ) : (
          <div className="space-y-4">
            {receivedReviews.map((review) => {
              const reviewerName = profiles[review.reviewer_id]?.username || 'A student';
              const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${reviewerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              return (
                <GlassCard key={review.id}>
                  <div className="flex items-start gap-3">
                    <Image src={avatarUrl} alt={reviewerName} width={40} height={40} className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{reviewerName}</span>
                      <div className="flex gap-0.5 mb-2 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={cn(i < review.rating ? 'text-accent-amber fill-accent-amber' : 'text-[var(--text-muted)]')} />
                        ))}
                      </div>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.feedback}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Given */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4">Reviews You Wrote</h2>
        {givenReviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] py-4">You haven&apos;t written any reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {givenReviews.map((review) => {
              const revieweeName = profiles[review.reviewee_id]?.username || 'A student';
              const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${revieweeName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              return (
                <GlassCard key={review.id} className="opacity-80">
                  <div className="flex items-start gap-3">
                    <Image src={avatarUrl} alt={revieweeName} width={40} height={40} className="w-10 h-10 rounded-full bg-[var(--bg-surface-solid)]" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">To {revieweeName}</span>
                      <div className="flex gap-0.5 mb-2 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={cn(i < review.rating ? 'text-accent-amber fill-accent-amber' : 'text-[var(--text-muted)]')} />
                        ))}
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">{review.feedback}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
