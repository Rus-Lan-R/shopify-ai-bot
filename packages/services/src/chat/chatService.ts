import { Chats, Messages } from "@internal/database";
import { AiClient } from "../openAi/openAiService";
import { MessageRole } from "@internal/const";
import type { IChat, IMessage, IPlatform, ISession } from "@internal/types";

export class ChatService extends AiClient {
  public platform: IPlatform;
  private session: ISession;

  constructor(platform: IPlatform, session: ISession, openAiApiKey: string) {
    super(openAiApiKey);
    this.platform = platform;
    this.session = session;
  }

  async findOrCreateChat(externalChatId: string, externalIsMain?: boolean) {
    let chat = await this.findExistChat(externalChatId, externalIsMain);
    if (!chat) {
      chat = (await this.createChat(externalChatId)).chat;
    }
    return chat;
  }

  async createChat(externalChatId?: string) {
    const thread = await this.createThread();
    const chat = await Chats.create<IChat>({
      threadId: thread.id,
      sessionId: this.platform.sessionId,
      platformId: this.platform._id,
      externalChatId: externalChatId || thread.id,
    });

    if (this.session.welcomeMessage) {
      await Messages.create({
        chatId: chat._id,
        role: MessageRole.ASSISTANT,
        sessionId: this.session._id,
        platformId: this.platform._id,
        text: this.session.welcomeMessage,
      });
    }

    return { chat, thread };
  }

  async findExistChat(externalChatId: string, externalIsMain?: boolean) {
    const existChat = await Chats.findOne(
      externalIsMain
        ? { _id: externalChatId, sessionId: this.platform.sessionId }
        : {
            externalChatId: externalChatId,
            sessionId: this.platform.sessionId,
          }
    ).lean<IChat>();
    return existChat;
  }

  get welcomeMessage() {
    return this.session.welcomeMessage;
  }

  async getAiAnswer(
    message: string,
    externalChatId: string,
    externalIsMain?: boolean
  ) {
    const existChat = await this.findOrCreateChat(
      externalChatId,
      externalIsMain
    );

    if (!!this?.session?.assistantId && !!existChat?._id) {
      console.log(message);
      await Messages.create({
        chatId: existChat._id,
        sessionId: existChat.sessionId,
        platformId: existChat.platformId,
        text: message,
        role: MessageRole.USER,
      });
      if (existChat.assistantRole === MessageRole.ASSISTANT) {
        const responseText = await this.getOpenAIResponse({
          userText: message,
          assistantId: this.session.assistantId,
          threadId: existChat?.threadId,
        });
        await Messages.create({
          chatId: existChat._id,
          sessionId: existChat.sessionId,
          platformId: existChat.platformId,
          text: responseText,
          role: MessageRole.ASSISTANT,
        });
        return responseText;
      }
    } else {
      console.log(this.session.assistantId, existChat?._id);
      return "Setup required";
    }
  }

  async getAllMessages(chatId: string) {
    const messages = await Messages.find(
      { chatId },
      {},
      { limit: 100, sort: { createdAt: 1 } }
    ).lean<IMessage[]>();

    return messages;
  }
}
