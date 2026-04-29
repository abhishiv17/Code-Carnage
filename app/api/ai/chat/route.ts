import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}

export async function POST(req: Request) {
  try {
    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: 'AI chat is not configured on this server.' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    // Fetch user's own profile for context
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    
    // Fetch all available skills on the platform to act as a matchmaker
    const { data: skillsData } = await supabase
      .from('skills')
      .select('user_id, skill_name')
      .eq('type', 'offered')
      .neq('user_id', user.id);

    // Fetch usernames for those peers
    let peerContext = 'No other users available right now.';
    if (skillsData && skillsData.length > 0) {
      const userIds = Array.from(new Set(skillsData.map((s) => s.user_id)));
      const { data: peerProfiles } = await supabase
        .from('profiles')
        .select('id, username, college_name, preferred_mode')
        .in('id', userIds);
        
      const profileMap = new Map((peerProfiles || []).map((p) => [p.id, p]));
      
      const peerSummaries = skillsData.map((s) => {
        const p = profileMap.get(s.user_id);
        const name = p?.username || 'Unknown';
        const college = p?.college_name ? ` (from ${p.college_name})` : '';
        const mode = p?.preferred_mode ? ` - prefers ${p.preferred_mode}` : '';
        return `${name}${college} teaches ${s.skill_name}${mode}.`;
      });
      
      peerContext = Array.from(new Set(peerSummaries)).join('\n');
    }

    const systemPrompt = `You are the SkillSwap AI Assistant, a friendly and helpful guide for a peer-to-peer skill exchange platform for college students.

You are talking to: ${profile?.full_name || profile?.username || 'A student'}
Their info: College: ${profile?.college_name || 'Unknown'}, City: ${profile?.city || 'Unknown'}, Degree: ${profile?.degree || 'Unknown'}

YOUR CAPABILITIES:
1. SMART MATCHMAKER: If they want to learn a skill, recommend specific peers from the available list below.
2. PLATFORM GUIDE: Explain how credits work (you spend 1 credit to learn, earn 1 to teach), how to set up video calls, etc.
3. PREP TUTOR: If they ask for a crash course or study guide before a session, provide a concise, excellent summary of the topic.
4. ICEBREAKERS: Suggest conversation starters if they are nervous.

AVAILABLE PEERS TO RECOMMEND:
${peerContext}

Keep your answers formatting with markdown, clear, enthusiastic, and concise (under 150 words unless explaining a technical concept).`;

    // We will use streaming
    const stream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
