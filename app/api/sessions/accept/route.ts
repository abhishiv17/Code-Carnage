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

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // Fetch the session
    const { data: session, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only the teacher can accept the session
    if (session.teacher_id !== user.id) {
      return NextResponse.json({ error: 'Only the teacher can accept this session' }, { status: 403 });
    }

    // Session must be in pending state to be accepted
    if (session.status !== 'pending') {
      return NextResponse.json({ error: `Cannot accept a session with status: ${session.status}` }, { status: 400 });
    }

    // Update status to active
    const { error: updateErr } = await supabase
      .from('sessions')
      .update({ status: 'active' })
      .eq('id', sessionId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to accept session' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Session accepted. Ready for video call.' });
  } catch (error: any) {
    console.error("Accept Session Error:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
