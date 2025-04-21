import { AiClient } from "../../../../packages/services/src";

export const openAiKey = process?.env?.OPENAI_API_KEY ?? "";
export const openAi = new AiClient(openAiKey);
