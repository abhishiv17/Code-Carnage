import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [profilesRes, skillsRes, sessionsRes, ratingsRes, authUsersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('skills').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('average_rating').not('average_rating', 'eq', 0),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1 }),
  ]);

  // Use auth user count (total signups) as the primary user number
  const totalUsers = authUsersRes.data?.users ? (profilesRes.count || authUsersRes.data.users.length) : (profilesRes.count || 0);

  // Calculate platform-wide average rating
  let avgRating = 4.7;
  if (ratingsRes.data && ratingsRes.data.length > 0) {
    const sum = ratingsRes.data.reduce((acc: number, p: any) => acc + (p.average_rating || 0), 0);
    avgRating = parseFloat((sum / ratingsRes.data.length).toFixed(1));
  }

  return NextResponse.json({
    users: totalUsers,
    skills: skillsRes.count || 0,
    sessions: sessionsRes.count || 0,
    avgRating,
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
