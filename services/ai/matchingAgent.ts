import { groq } from './groqClient';
import { MATCHING_SYSTEM_PROMPT } from './prompts';

export interface PeerOffer {
  peer_id: string;
  username: string;
  offered_skill: string;
  college?: string;
  city?: string;
  preferred_mode?: string;
  languages?: string[];
}

export interface MatchResult {
  peer_id: string;
  username: string;
  offered_skill: string;
  compatibility_score: number;
  reasoning: string;
}

/**
 * Simple keyword-based fallback matching when AI is unavailable.
 * Checks if the desired skill name appears in (or is similar to) the offered skill.
 */
function fallbackMatch(desiredSkill: string, availablePeers: PeerOffer[]): { matches: MatchResult[] } {
  const desired = desiredSkill.toLowerCase().trim();

  const scored = availablePeers
    .map((peer) => {
      const offered = peer.offered_skill.toLowerCase().trim();

      let score = 0;
      if (offered === desired) {
        score = 100;
      } else if (offered.includes(desired) || desired.includes(offered)) {
        score = 85;
      } else {
        // Check word overlap
        const desiredWords = desired.split(/[\s\-_\/]+/);
        const offeredWords = offered.split(/[\s\-_\/]+/);
        const overlap = desiredWords.filter((w) => offeredWords.some((ow) => ow.includes(w) || w.includes(ow)));
        if (overlap.length > 0) {
          score = Math.min(75, 40 + overlap.length * 15);
        }
      }

      return { peer, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    matches: scored.map((item) => ({
      peer_id: item.peer.peer_id,
      username: item.peer.username,
      offered_skill: item.peer.offered_skill,
      compatibility_score: item.score,
      reasoning: `${item.peer.username} is offering ${item.peer.offered_skill}${item.peer.college ? ` from ${item.peer.college}` : ''}.`,
    })),
  };
}

export async function findMatches(desiredSkill: string, availablePeers: PeerOffer[]) {
  if (availablePeers.length === 0) {
    return { matches: [] };
  }

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
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No response from Groq");

    const parsed = JSON.parse(content);

    // Validate the response has the expected shape
    if (!parsed.matches || !Array.isArray(parsed.matches)) {
      console.warn("Groq returned unexpected format, using fallback:", parsed);
      return fallbackMatch(desiredSkill, availablePeers);
    }

    return parsed;
  } catch (error) {
    console.error("Error in Groq Matching Agent, using fallback:", error);
    // Fall back to keyword-based matching instead of failing completely
    return fallbackMatch(desiredSkill, availablePeers);
  }
}
