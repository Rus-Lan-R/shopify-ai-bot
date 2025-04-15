import { Chats, IPlatform, ISession, Messages } from "@internal/database";
import { AiClient } from "../openAi/openAiService";
import { extractTextWithoutAnnotations } from "../helpers";

export class ChatService extends AiClient {
  public platform: IPlatform;
  private session: ISession;

  constructor(platform: IPlatform, session: ISession, openAiApiKey: string) {
    super(openAiApiKey);
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
      externalChatId: externalChatId || thread.id,
    });

    return { chat, thread };
  }

  async findExistChat(externalChatId: string) {
    const existChat = await Chats.findOne({
      externalChatId: externalChatId,
      sessionId: this.platform.sessionId,
    });
    return existChat;
  }

  get welcomeMessage() {
    return this.session.welcomeMessage;
  }

  async getAiAnswer(message: string, externalChatId: string) {
    const existChat = await this.findExistChat(externalChatId);

    if (!!this?.session?.assistantId && !!existChat?._id) {
      await Messages.create({
        chatId: existChat._id,
        text: message,
        direction: "user",
      });
      const responseText = await this.getOpenAIResponse({
        userText: message,
        assistantId: this.session.assistantId,
        threadId: existChat?._id,
      });
      await Messages.create({
        chatId: existChat._id,
        text: responseText,
        direction: "assistant",
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
