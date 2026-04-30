import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [profilesRes, skillsRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
  ]);

  return NextResponse.json({
    users: profilesRes.count || 0,
    skills: skillsRes.count || 0,
    sessions: sessionsRes.count || 0,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
