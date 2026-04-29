import Groq from 'groq-sdk';

export function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
}
