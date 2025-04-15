import {
  type IPlatform,
  type ISession,
  IntegrationStatus,
  Platforms,
} from "@internal/database";
import { ChatService } from "../chat/chatService";
import { logerFunction } from "../helpers";
import whatsapp from "whatsapp-web.js";

export class WhatsAppBot extends ChatService {
  private bot: whatsapp.Client;

  constructor(platform: IPlatform, session: ISession, openAiApiKey: string) {
    super(platform, session, openAiApiKey);
    this.bot = new whatsapp.Client({
      authStrategy: new whatsapp.LocalAuth({ clientId: session._id }),
    });
  }

  async run() {
    this.bot.initialize();
  }

  async auth() {
    this.bot.on("qr", async (qr) => {
      console.log("QR received");
      await Platforms.updateOne(
        { _id: this.platform._id },
        {
          integrationStatus: IntegrationStatus.CONNECTING,
          primaryApiKey: qr,
        }
      );
    });

    this.bot.on("ready", async () => {
      console.log("✅ Auth success");
      await Platforms.updateOne(
        { _id: this.platform._id },
        {
          integrationStatus: IntegrationStatus.ACTIVE,
          primaryApiKey: null,
        }
      );
    });
  }

  async listenMessages() {
    this.bot.on(
      "message",
      logerFunction(async (msg) => {
        if (!msg.fromMe) {
          const chat = await this.findOrCreateChat(msg.from);
          if (!!chat) {
            const aiResponse = await this.getAiAnswer(
              msg.body,
              chat.externalChatId
            );
            msg.reply(aiResponse);
          }
        }
      })
    );
  }
}
