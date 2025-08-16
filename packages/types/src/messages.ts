import { MessageRole } from "@internal/const";

export interface IMessage {
  chatId: string;
  sessionId: string;
  platformId: string;
  role: MessageRole;
  text: string;
}
