'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { Star, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReviewRow {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

interface SessionRow {
  id: string;
  teacher_id: string;
  learner_id: string;
  status: string;
  created_at: string;
  ended_at: string | null;
}

interface ProfileMap {
  [id: string]: { username: string };
}

export default function ReviewsPage() {
  const { user, refreshProfile } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const highlightedSessionId = searchParams.get('sessionId');

  // Track which session the user is currently reviewing
  const [reviewingSessionId, setReviewingSessionId] = useState<string | null>(highlightedSessionId);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['reviews-page', user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch all reviews (given & received)
      const [{ data: received, error: receivedErr }, { data: given, error: givenErr }] = await Promise.all([
        supabase.from('reviews').select('*').eq('reviewee_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').eq('reviewer_id', user!.id).order('created_at', { ascending: false }),
      ]);

      if (receivedErr || givenErr) {
        console.error('Failed to fetch reviews:', receivedErr || givenErr);
        throw receivedErr || givenErr;
      }

      // Fetch completed sessions the user participated in
      const { data: completedSessions, error: sessErr } = await supabase
        .from('sessions')
        .select('*')
        .or(`teacher_id.eq.${user!.id},learner_id.eq.${user!.id}`)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false });

      if (sessErr) {
        console.error('Failed to fetch sessions:', sessErr);
        throw sessErr;
      }

      // Figure out which sessions the user hasn't reviewed yet
      const reviewedSessionIds = new Set((given || []).map((r) => r.session_id));
      const pendingReviewSessions = (completedSessions || []).filter(
        (s) => !reviewedSessionIds.has(s.id)
      ) as SessionRow[];

      // Gather all peer IDs we need names for
      const allReviews = [...(received || []), ...(given || [])];
      const allSessions = [...(completedSessions || []), ...pendingReviewSessions];
      const peerIds = Array.from(new Set([
        ...allReviews.flatMap((r) => [r.reviewer_id, r.reviewee_id]),
        ...allSessions.flatMap((s) => [s.teacher_id, s.learner_id]),
      ].filter((id) => id !== user!.id)));

      let profileMap: ProfileMap = {};
      if (peerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', peerIds);
        profilesData?.forEach((p) => { profileMap[p.id] = { username: p.username }; });
      }

      return {
        received: (received || []) as ReviewRow[],
        given: (given || []) as ReviewRow[],
        pendingReviewSessions,
        profiles: profileMap,
      };
    },
    staleTime: 30 * 1000,
  });

  const receivedReviews = data?.received || [];
  const givenReviews = data?.given || [];
  const pendingReviewSessions = data?.pendingReviewSessions || [];
  const profiles = data?.profiles || {};

  const handleSubmitReview = async (sessionId: string) => {
    if (newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating: newRating,
          feedback: feedback || null,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        toast.success('Review submitted! ⭐');
        setNewRating(0);
        setHoverRating(0);
        setFeedback('');
        setReviewingSessionId(null);
        refetch();
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        refreshProfile();
      } else {
        toast.error(resData.error || 'Failed to submit review');
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
        <p className="text-sm text-[var(--text-muted)]">Rate your sessions and see what others think of you</p>
      </div>

      {/* Pending Reviews — sessions you need to review */}
      {pendingReviewSessions.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-accent-amber" />
            Pending Reviews ({pendingReviewSessions.length})
          </h2>
          <div className="space-y-4">
            {pendingReviewSessions.map((session) => {
              const isTeaching = session.teacher_id === user!.id;
              const peerId = isTeaching ? session.learner_id : session.teacher_id;
              const peerName = profiles[peerId]?.username || 'Unknown';
              const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${peerName}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
              const isReviewingThis = reviewingSessionId === session.id;
              const endDate = session.ended_at
                ? new Date(session.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'recently';

              return (
                <GlassCard key={session.id} gradient={isReviewingThis} padding="lg">
                  <div className="flex items-center gap-4 mb-3">
                    <Image src={avatarUrl} alt={peerName} width={48} height={48} className="w-12 h-12 rounded-full bg-[var(--bg-surface-solid)]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {isTeaching ? 'You taught' : 'You learned from'} {peerName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Session ended {endDate}
                      </p>
                    </div>
                    {!isReviewingThis && (
                      <GradientButton size="sm" onClick={() => {
                        setReviewingSessionId(session.id);
                        setNewRating(0);
                        setHoverRating(0);
                        setFeedback('');
                      }}>
                        <Star size={14} /> Rate
                      </GradientButton>
                    )}
                  </div>

                  {/* Review form for this session */}
                  {isReviewingThis && (
                    <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                      <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                        How was your session with {peerName}?
                      </p>
                      {/* Star rating */}
                      <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(star)}
                            className="transition-transform hover:scale-125"
                          >
                            <Star
                              size={32}
                              className={cn(
                                'transition-colors',
                                (hoverRating || newRating) >= star
                                  ? 'text-accent-amber fill-accent-amber'
                                  : 'text-[var(--text-muted)]'
                              )}
                            />
                          </button>
                        ))}
                        {newRating > 0 && (
                          <span className="ml-2 text-sm text-[var(--text-muted)] self-center">
                            {['', 'Needs improvement', 'Fair', 'Good', 'Great', 'Excellent'][newRating]}
                          </span>
                        )}
                      </div>
                      {/* Feedback */}
                      <textarea
                        placeholder="Share your experience (optional)..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/30 resize-none h-24 mb-4 transition-all"
                      />
                      {/* Buttons */}
                      <div className="flex gap-3">
                        <GradientButton
                          size="md"
                          onClick={() => handleSubmitReview(session.id)}
                          disabled={submitting || newRating === 0}
                        >
                          {submitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                          ) : (
                            <><Star size={16} /> Submit Review</>
                          )}
                        </GradientButton>
                        <button
                          onClick={() => setReviewingSessionId(null)}
                          className="px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* All done message */}
      {pendingReviewSessions.length === 0 && (
        <GlassCard padding="lg" className="text-center">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-accent-emerald" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">All caught up!</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">No pending reviews right now.</p>
        </GlassCard>
      )}

      {/* Received */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Star size={18} className="text-accent-amber fill-accent-amber" />
          Reviews About You ({receivedReviews.length})
        </h2>
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
                      {review.feedback && (
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.feedback}</p>
                      )}
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
                      {review.feedback && (
                        <p className="text-sm text-[var(--text-muted)]">{review.feedback}</p>
                      )}
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
