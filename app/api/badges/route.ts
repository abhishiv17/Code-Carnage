import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Call the DB function to check and award badges
    const { error } = await supabaseAdmin.rpc('check_and_award_badges', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Badge check error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch the user's current badges
    const { data: userBadges, error: fetchError } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ badges: userBadges || [] });
  } catch (err) {
    console.error('Badge API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Fetch badges for a user without awarding new ones
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const { data: userBadges, error } = await supabaseAdmin
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ badges: userBadges || [] });
}
