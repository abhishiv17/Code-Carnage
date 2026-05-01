import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify the caller is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { learnerId, helpRequestId, helpRequestTitle } = await req.json();
    if (!learnerId) {
      return NextResponse.json({ error: 'learnerId is required' }, { status: 400 });
    }

    // Prevent self-sessions
    if (learnerId === user.id) {
      return NextResponse.json({ error: 'Cannot create a session with yourself' }, { status: 400 });
    }

    // Use admin client to bypass RLS (teacher is creating the session, but RLS only allows learner)
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Create the session — the helper (current user) is the teacher
    const { data: session, error: sessionErr } = await supabaseAdmin
      .from('sessions')
      .insert({
        teacher_id: user.id,
        learner_id: learnerId,
        status: 'pending',
      })
      .select()
      .single();

    if (sessionErr) {
      console.error('Feed session creation error:', sessionErr);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Optionally mark the help request as claimed (update status if you have a status column)
    // For now, we just return success
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Create Feed Session Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
