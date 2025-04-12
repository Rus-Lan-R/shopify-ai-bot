import { Chats } from "@database/chats";
import { IPlatform } from "@database/platforms";
import { ISession } from "@database/sessions";
import { AiClient } from "@services/openAi/openAi";

export class ChatService extends AiClient {
  public platform: IPlatform;
  private session: ISession;

  constructor(platform: IPlatform, session: ISession) {
    super();
    this.platform = platform;
    this.session = session;
  }

  async findOrCreateChat(externalChatId: string) {
    let chat = await this.findExistChat(externalChatId);
    if (!chat) {
      chat = await this.createChat(externalChatId);
    }
    return chat;
  }

  async createChat(externalChatId: string) {
    const thread = await this.createThread();
    const chat = await Chats.create({
      _id: thread.id,
      sessionId: this.platform.sessionId,
      platformId: this.platform._id,
      externalChatId: externalChatId,
    });
    return chat;
  }

  async findExistChat(externalChatId: string) {
    const existChat = await Chats.findOne({
      externalChatId,
      sessionId: this.platform.sessionId,
    });
    return existChat;
  }

  get welcomeMessage() {
    return this.session.welcomeMessage;
  }

  async getAiAnswer(message: string, chatId: string) {
    const existChat = await this.findExistChat(chatId);

    if (!!this?.session?.assistantId && !!existChat?._id) {
      const responseText = this.getOpenAIResponse({
        userText: message,
        assistantId: this.session.assistantId,
        threadId: existChat?._id,
      });
      return responseText;
    } else {
      return "Setup required";
    }
  }
}
