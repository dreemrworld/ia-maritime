import { generateText } from "ai";
import { google } from '@ai-sdk/google';
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const { input } = await req.json();

  const aiProvider = process.env.AI_PROVIDER || 'google';
  const model = aiProvider === 'openrouter'
    ? openrouter('deepseek/deepseek-chat-v3-0324:free')
    : google(process.env.GOOGLE_MODEL_NAME || "gemini-1.5-flash");

  const result = await generateText({
    model,
    system:
      "Based on the messages, provide a title for the chat. The title should be a single sentence and no more than 10 words.",
    prompt: input,
  });

  return Response.json({ title: result.text });
}
