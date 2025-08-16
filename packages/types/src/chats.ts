import { MessageRole } from "@internal/const";
export interface IChat {
  _id: string;
  threadId: string;
  sessionId: string;
  platformId: string;
  customerId: string;
  isArchived: boolean;
  isDeleted: boolean;
  externalChatId: string;
  createdAt: Date;
  updatedAt: Date;
  assistantRole: MessageRole;
}
