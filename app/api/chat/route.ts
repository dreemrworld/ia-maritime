import { google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { experimental_createMCPClient as createMCPClient } from "@ai-sdk/mcp";

export const maxDuration = 30;

const mcpClient = await createMCPClient({
  // TODO adjust this to point to your MCP server URL
  transport: {
    type: "sse",
    url: "https://docs.mcp.cloudflare.com/sse",
  },
});

const mcpTools = await mcpClient.tools();

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  const aiProvider = process.env.AI_PROVIDER || 'google';
  let model;
  if (aiProvider === 'openrouter') {
    // For OpenRouter, free model example: microsoft/wizardlm-2-8x22b
    // Note: OpenRouter offers many free models with varying quality and rate limits
    // Top free models on OpenRouter: deepseek/deepseek-chat, qwen/qwen2.5-turbo, etc.
    model = openrouter('deepseek/deepseek-chat');
  } else if (aiProvider === 'google') {
    model = google(process.env.GOOGLE_MODEL_NAME || "gemini-1.5-flash");
  } else {
    model = google(process.env.GOOGLE_MODEL_NAME || "gemini-1.5-flash"); // default to google
  }

  const result = streamText({
    model,
    messages: convertToModelMessages(messages),
    system,
    stopWhen: stepCountIs(10),
    tools: {
      ...mcpTools,
      ...frontendTools(tools),
      // add backend tools here
    },
  });

  return result.toUIMessageStreamResponse();
}
