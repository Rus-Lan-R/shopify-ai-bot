export interface IMessage {
  chatId: string;
  sessionId: string;
  platformId: string;
  role: MessageRole;
  text: string;
}

export enum MessageRole {
  ASSISTANT = "assistant",
  USER = "user",
  MANAGER = "manager",
}
