import { IntegrationStatus, IPlatform, Platforms } from "@database/platforms";

import { ChatService } from "../chat";
import { Client, LocalAuth } from "whatsapp-web.js";
import { logerFunction } from "apps/bots/src/helpers/loger";
import { ISession } from "@database/sessions";

export class WhatsAppBot extends ChatService {
  private bot: Client;

  constructor(platform: IPlatform, session: ISession) {
    super(platform, session);
    this.bot = new Client({
      authStrategy: new LocalAuth({ clientId: session._id }),
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
