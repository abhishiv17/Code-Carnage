import { groq } from './groqClient';
import { MATCHING_SYSTEM_PROMPT } from './prompts';

export interface PeerOffer {
  peer_id: string;
  username: string;
  offered_skill: string;
}

export async function findMatches(desiredSkill: string, availablePeers: PeerOffer[]) {
  const userPrompt = `
Desired Skill: ${desiredSkill}

Available Peers:
${JSON.stringify(availablePeers, null, 2)}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: MATCHING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in Groq Matching Agent:", error);
    throw error;
  }
}
