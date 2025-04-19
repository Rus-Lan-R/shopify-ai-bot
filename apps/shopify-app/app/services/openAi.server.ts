import { AiClient } from "@internal/services";

export const openAiKey = process?.env?.OPENAI_API_KEY ?? "";
export const openAi = new AiClient(openAiKey);
