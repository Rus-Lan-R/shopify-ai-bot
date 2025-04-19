import TgBot, { Message } from "node-telegram-bot-api";
import { IPlatform, ISession } from "@internal/database";
import { ChatService } from "../chat/chatService";
import { logerFunction } from "../helpers";

export class TelegramBot extends ChatService {
  private bot: TgBot;

  constructor(platform: IPlatform, session: ISession, openAiApiKey: string) {
    super(platform, session, openAiApiKey);
    this.bot = new TgBot(this.platform.primaryApiKey!, {
      polling: true,
    });
  }

  async init() {
    this.bot.onText(
      /\/start/,
      logerFunction<Message>(async (msg) => {
        const chatId = String(msg?.chat?.id);
        const existChat = await this.findExistChat(chatId);
        if (!existChat) {
          await this.createChat(chatId);
          const welcomeMessage = this.welcomeMessage;
          await this.bot.sendMessage(chatId, welcomeMessage || "");
        } else {
          await this.bot.sendMessage(chatId, "Chat already exist");
        }
      })
    );
  }

  async listenMessages() {
    this.bot.on(
      "message",
      logerFunction<Message>(async (msg) => {
        if (msg.text && msg.text.startsWith("/")) return;
        const chatId = String(msg.chat.id);
        if (msg.text) {
          const chatAnswer = await this.getAiAnswer(msg.text, chatId);
          await this.bot.sendMessage(chatId, chatAnswer);
        }
      })
    );
  }

  public async stop() {
    console.log("Bot stoped ", this.platform.sessionId);
    try {
      this.bot.removeAllListeners();
      await this.bot.deleteWebHook();
      await this.bot.stopPolling();
    } catch (error) {
      console.log(error);
    }
  }
}
