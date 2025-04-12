import TgBot, { Message } from "node-telegram-bot-api";
import { ChatService, logerFunction } from "@internal/services";
import { IPlatform, ISession } from "@internal/database";

export class TelegramBot extends ChatService {
  private bot: TgBot;

  constructor(platform: IPlatform, session: ISession) {
    super(platform, session);
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
}
