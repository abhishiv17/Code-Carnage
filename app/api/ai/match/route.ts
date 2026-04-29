import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findMatches } from '@/services/ai/matchingAgent';
import type { PeerOffer } from '@/services/ai/matchingAgent';

// ─── Mock peers for demo/development when DB is empty ───
const MOCK_PEERS: PeerOffer[] = [
  {
    peer_id: 'mock-u1',
    username: 'Priya Sharma',
    offered_skill: 'Guitar',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Hindi', 'Tamil'],
  },
  {
    peer_id: 'mock-u2',
    username: 'Rahul Menon',
    offered_skill: 'UI/UX Design',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Malayalam'],
  },
  {
    peer_id: 'mock-u3',
    username: 'Ananya Iyer',
    offered_skill: 'Photography',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Tamil'],
  },
  {
    peer_id: 'mock-u4',
    username: 'Karthik Nair',
    offered_skill: 'C++',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'offline',
    languages: ['English', 'Hindi'],
  },
  {
    peer_id: 'mock-u5',
    username: 'Meera Krishnan',
    offered_skill: 'Japanese',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'French', 'Japanese'],
  },
  {
    peer_id: 'mock-u6',
    username: 'Aditya Patel',
    offered_skill: 'Yoga',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'offline',
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    peer_id: 'mock-u7',
    username: 'Priya Sharma',
    offered_skill: 'Piano',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Hindi', 'Tamil'],
  },
  {
    peer_id: 'mock-u8',
    username: 'Rahul Menon',
    offered_skill: 'Figma',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Malayalam'],
  },
  {
    peer_id: 'mock-u9',
    username: 'Karthik Nair',
    offered_skill: 'Java',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'offline',
    languages: ['English', 'Hindi'],
  },
  {
    peer_id: 'mock-u10',
    username: 'Meera Krishnan',
    offered_skill: 'French',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'French', 'Japanese'],
  },
  {
    peer_id: 'mock-u11',
    username: 'Ananya Iyer',
    offered_skill: 'Physics',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Tamil'],
  },
  {
    peer_id: 'mock-u12',
    username: 'Aditya Patel',
    offered_skill: 'Music Production',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    peer_id: 'mock-u13',
    username: 'Sneha Gupta',
    offered_skill: 'Python',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Hindi'],
  },
  {
    peer_id: 'mock-u14',
    username: 'Vikram Singh',
    offered_skill: 'React',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Hindi', 'Punjabi'],
  },
  {
    peer_id: 'mock-u15',
    username: 'Deepa Nair',
    offered_skill: 'Machine Learning',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Malayalam'],
  },
  {
    peer_id: 'mock-u16',
    username: 'Arjun Reddy',
    offered_skill: 'Video Editing',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Telugu'],
  },
  {
    peer_id: 'mock-u17',
    username: 'Kavya Raman',
    offered_skill: 'Spanish',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Spanish', 'Tamil'],
  },
  {
    peer_id: 'mock-u18',
    username: 'Rohan Das',
    offered_skill: 'Flutter',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'both',
    languages: ['English', 'Bengali'],
  },
  {
    peer_id: 'mock-u19',
    username: 'Isha Mehta',
    offered_skill: 'Graphic Design',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'online',
    languages: ['English', 'Hindi', 'Gujarati'],
  },
  {
    peer_id: 'mock-u20',
    username: 'Siddharth Kumar',
    offered_skill: 'Basketball',
    college: 'VIT Chennai',
    city: 'Chennai',
    preferred_mode: 'offline',
    languages: ['English', 'Hindi'],
  },
];

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated — for demo, allow unauthenticated requests
    const { data: { user } } = await supabase.auth.getUser();

    const { desiredSkill } = await req.json();
    if (!desiredSkill) {
      return NextResponse.json({ error: 'desiredSkill is required' }, { status: 400 });
    }

    let availablePeers: PeerOffer[] = [];

    // Try fetching real data from Supabase
    if (user) {
      const { data: skillsData } = await supabase
        .from('skills')
        .select('user_id, skill_name')
        .eq('type', 'offered')
        .neq('user_id', user.id);

      if (skillsData && skillsData.length > 0) {
        // Fetch profiles with extended info
        const userIds = Array.from(new Set(skillsData.map((s) => s.user_id)));
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, college_name, city, preferred_mode, languages')
          .in('id', userIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p])
        );

        availablePeers = skillsData.map((skill) => {
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
      }
    }

    // Fallback to mock data if database is empty or user is not authenticated
    if (availablePeers.length === 0) {
      console.log(`[Match API] No real peers found, using mock data for "${desiredSkill}"`);
      availablePeers = MOCK_PEERS;
    }

    console.log(`[Match API] Searching "${desiredSkill}" — ${availablePeers.length} peers available`);

    // Call Groq AI (with fallback to keyword matching)
    const matchResults = await findMatches(desiredSkill, availablePeers);

    console.log(`[Match API] Returning ${matchResults?.matches?.length ?? 0} matches`);

    return NextResponse.json(matchResults);
  } catch (error: any) {
    console.error("Match API Error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message}` },
      { status: 500 }
    );
  }
}
