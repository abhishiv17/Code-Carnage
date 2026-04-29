import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY environment variable is not set');
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
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
5. REGIONAL LANGUAGES: You are a native polyglot. If the user speaks or asks to speak in ANY regional language (e.g., Hindi, Kannada, Tamil, Telugu, Marathi, Bengali), YOU MUST respond fluently in that exact language using its native script or transliterated Roman script (whichever they use). Do NOT output English translations unless requested.

AVAILABLE PEERS TO RECOMMEND:
${peerContext}

Keep your answers formatting with markdown, clear, enthusiastic, and concise (under 150 words unless explaining a technical concept).`;

    // Format messages for Groq API, handling image URLs for vision models
    let hasImage = false;
    const formattedMessages = messages.map((m: any) => {
      if (m.image && m.role === 'user') {
        hasImage = true;
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content || 'Please analyze this image.' },
            { type: 'image_url', image_url: { url: m.image } }
          ]
        };
      }
      return { role: m.role, content: m.content };
    });

    // We will use streaming
    const stream = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...formattedMessages
      ],
      model: hasImage ? 'llama-3.2-11b-vision-preview' : 'llama-3.1-8b-instant',
      temperature: 0.7,
      stream: true,
    });

    // Save the newest user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      // Background save user message
      supabase.from('ai_chat_history').insert({
        user_id: user.id,
        role: 'user',
        content: lastMessage.content,
        image_url: lastMessage.image || null
      }).then(({error}) => { if (error) console.error("Error saving user message:", error); });
    }

    const encoder = new TextEncoder();
    let assistantResponse = '';
    
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            assistantResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
        
        // Background save assistant response
        if (assistantResponse) {
          supabase.from('ai_chat_history').insert({
            user_id: user.id,
            role: 'assistant',
            content: assistantResponse
          }).then(({error}) => { if (error) console.error("Error saving AI response:", error); });
        }
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
