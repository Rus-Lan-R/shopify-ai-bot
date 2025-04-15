import { AiClient } from "@internal/services";

export const openAi = new AiClient(process?.env?.OPENAI_API_KEY);
