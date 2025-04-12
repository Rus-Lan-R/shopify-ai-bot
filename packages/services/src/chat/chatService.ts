import { AiClient } from "@internal/services";
import { extractTextWithoutAnnotations } from "../openAi/ai.helpers";
import { Chats, IPlatform, ISession } from "@internal/database";

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

  async createChat(externalChatId?: string) {
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

  async getAllMessages(chatId: string) {
    const messages = await this.aiClient.beta.threads.messages.list(chatId, {
      limit: 100,
    });

    let preparedMessages = messages.data.map((item) => ({
      role: item.role,
      text: extractTextWithoutAnnotations(item.content),
    }));

    preparedMessages.push({
      role: "assistant",
      text: this.session.welcomeMessage || "Hi, how can I help you?",
    });

    return preparedMessages;
  }
}
