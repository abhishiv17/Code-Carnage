import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findMatches } from '@/services/ai/matchingAgent';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Ensure user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { desiredSkill } = await req.json();
    if (!desiredSkill) {
      return NextResponse.json({ error: 'desiredSkill is required' }, { status: 400 });
    }

    // Fetch all offered skills from other users
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select('user_id, skill_name, profiles(username)')
      .eq('type', 'offered')
      .neq('user_id', user.id);

    if (skillsError) {
      console.error("DB Error:", skillsError);
      return NextResponse.json({ error: 'Failed to fetch available skills' }, { status: 500 });
    }

    // Format for the AI
    const availablePeers = skillsData.map((skill: any) => ({
      peer_id: skill.user_id,
      username: skill.profiles?.username || 'Unknown',
      offered_skill: skill.skill_name
    }));

    if (availablePeers.length === 0) {
      return NextResponse.json({ matches: [] }); // No one offering skills
    }

    // Call Groq AI
    const matchResults = await findMatches(desiredSkill, availablePeers);

    return NextResponse.json(matchResults);
  } catch (error) {
    console.error("Match API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
