import {
  generateGeminiResponse,
  generateLocalAIResponse,
} from "../gemini/config";
import { buildTutorPrompt } from "./prompts";

export type ChatTurn = { role: "user" | "model"; content: string };

export async function generateTutorResponse(
  userMessage: string,
  history: ChatTurn[] = []
): Promise<string> {
  const prompt = buildTutorPrompt(userMessage, history);
  try {
    const res = await generateGeminiResponse(prompt, history);
    return res?.trim() || generateLocalAIResponse(userMessage);
  } catch {
    return generateLocalAIResponse(userMessage);
  }
}
