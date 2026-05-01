import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

    // Fetch user profile and skills
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('bio, degree, branch, year_of_study')
      .eq('id', userId)
      .single();

    const { data: skills } = await supabaseAdmin
      .from('skills')
      .select('skill_name, type')
      .eq('user_id', userId);

    const offeredSkills = skills?.filter(s => s.type === 'offered').map(s => s.skill_name) || [];
    const desiredSkills = skills?.filter(s => s.type === 'desired').map(s => s.skill_name) || [];

    // Prompt for Llama 3.1
    const prompt = `
You are an expert AI career and skill-building coach for a student skill-bartering platform.
Analyze the following student profile and recommend 3 specific skills they should learn next to complement their existing skills.
Also recommend 1 skill they might be good at teaching based on their background.

Student Profile:
- Degree: ${profile?.degree || 'Unknown'} in ${profile?.branch || 'Unknown'} (Year ${profile?.year_of_study || 'Unknown'})
- Bio: ${profile?.bio || 'None'}
- Skills they currently TEACH: ${offeredSkills.join(', ') || 'None'}
- Skills they currently WANT TO LEARN: ${desiredSkills.join(', ') || 'None'}

Response format MUST be a valid JSON array of objects (do NOT wrap in markdown \`\`\`json... just the array).
Each object should have:
- "name": (string) the skill name
- "reason": (string) why it's a good fit for them (1 short sentence)
- "type": (string) either "learn" or "teach"

Return EXACTLY 4 recommendations (3 "learn", 1 "teach").
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
    });

    let result = chatCompletion.choices[0]?.message?.content || '[]';
    
    // Clean up potential markdown wrapping
    result = result.replace(/```json/g, '').replace(/```/g, '').trim();

    const recommendations = JSON.parse(result);

    return NextResponse.json({ recommendations });
  } catch (error: any) {
    console.error('AI Recommendations Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
