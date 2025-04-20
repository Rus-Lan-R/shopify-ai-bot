import { ILimitation } from "./limitations";

export interface ISession {
  _id: string;
  shop: string;
  accessToken: string;
  scope: string;
  isOnline: boolean;
  state: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  accountOwner: boolean;
  locale: string;
  collaborator: boolean;
  emailVerified: boolean;
  isDevStore: boolean;
  openaiApiKey?: string;

  // ---------------------
  assistantId?: string;
  assistantName?: string;
  welcomeMessage?: string;
  assistantPrompt?: string;
  assistantVectorStoreId?: string;
  mainChatId?: string;
  assistantFiles: {};
  isDeleted: boolean;
  limitationId?: ILimitation;
}
