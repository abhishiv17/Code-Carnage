import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, rating, feedback } = await req.json();

    if (!sessionId || !rating) {
      return NextResponse.json({ error: 'sessionId and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Fetch the session to determine who the reviewee is
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed sessions' }, { status: 400 });
    }

    // Determine who the reviewee is (the other person in the session)
    const revieweeId = user.id === session.teacher_id
      ? session.learner_id
      : session.teacher_id;

    // Check if user already reviewed this session
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('session_id', sessionId)
      .eq('reviewer_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You have already reviewed this session' }, { status: 409 });
    }

    // Insert the review (the DB trigger will auto-update average_rating)
    const { data: review, error: reviewErr } = await supabase
      .from('reviews')
      .insert({
        session_id: sessionId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        feedback: feedback || null,
      })
      .select()
      .single();

    if (reviewErr) {
      console.error("Review insert error:", reviewErr);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Review API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
