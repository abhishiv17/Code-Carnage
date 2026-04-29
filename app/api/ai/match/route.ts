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

    // Fetch profiles with extended info for matched user_ids
    const userIds = Array.from(new Set(skillsData.map((s) => s.user_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, college_name, city, preferred_mode, languages')
      .in('id', userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    // Format for the AI with extra context
    const availablePeers = skillsData.map((skill) => {
      const peerProfile = profileMap.get(skill.user_id);
      return {
        peer_id: skill.user_id,
        username: peerProfile?.username || 'Unknown',
        offered_skill: skill.skill_name,
        college: peerProfile?.college_name || undefined,
        city: peerProfile?.city || undefined,
        preferred_mode: peerProfile?.preferred_mode || undefined,
        languages: peerProfile?.languages || undefined,
      };
    });

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
