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

    const { teacherId } = await req.json();
    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId is required' }, { status: 400 });
    }

    // Handle mock/demo peer IDs — return a simulated success
    if (teacherId.startsWith('mock-')) {
      return NextResponse.json({
        session: {
          id: `demo-session-${Date.now()}`,
          teacher_id: teacherId,
          learner_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          demo: true,
        },
      });
    }

    // Verify the learner has enough credits
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'Could not fetch your profile' }, { status: 500 });
    }

    if (profile.credits < 1) {
      return NextResponse.json({ error: 'Insufficient credits. Teach a session to earn more!' }, { status: 403 });
    }

    // Create the session
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        learner_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (sessionErr) {
      console.error("Session creation error:", sessionErr);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Fetch learner's username for the notification message
    const { data: learnerProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    const learnerName = learnerProfile?.username || 'Someone';

    // Try to send a notification (ignore if notifications table doesn't exist)
    try {
      await supabase.from('notifications').insert({
        user_id: teacherId,
        type: 'session_request',
        title: 'New Session Request!',
        message: `${learnerName} wants to learn from you.`,
        link: '/dashboard/sessions',
      });
    } catch {
      // Notifications table may not exist yet — safe to ignore
      console.log('[Sessions] Notifications table not available, skipping notification');
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Create Session Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
