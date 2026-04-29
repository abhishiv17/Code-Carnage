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
      .select('user_id, skill_name')
      .eq('type', 'offered')
      .neq('user_id', user.id);

    if (skillsError) {
      return NextResponse.json({ error: `DB Error: ${skillsError.message}` }, { status: 500 });
    }

    if (!skillsData || skillsData.length === 0) {
      return NextResponse.json({ matches: [] }); // No one offering skills yet
    }

    // Fetch usernames for matched user_ids
    const userIds = [...new Set(skillsData.map((s) => s.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p.username || 'Unknown'])
    );

    // Format for the AI
    const availablePeers = skillsData.map((skill) => ({
      peer_id: skill.user_id,
      username: profileMap.get(skill.user_id) || 'Unknown',
      offered_skill: skill.skill_name,
    }));

    // Call Groq AI
    const matchResults = await findMatches(desiredSkill, availablePeers);

    return NextResponse.json(matchResults);
  } catch (error: any) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
