import { Platforms } from "@internal/database";
import { IPlatform, IntegrationStatus, ISession } from "@internal/types";
import whatsapp from "whatsapp-web.js";
import { logerFunction } from "../helpers";
import { ChatService } from "@internal/services";

export class WhatsAppBot extends ChatService {
  private bot: whatsapp.Client;

  constructor(platform: IPlatform, session: ISession, openAiApiKey: string) {
    super(platform, session, openAiApiKey);
    this.bot = new whatsapp.Client({
      puppeteer: {
        // executablePath: executablePath(),
        headless: true,
        args: ["--no-sandbox"],
      },
      authStrategy: new whatsapp.LocalAuth({ clientId: platform._id }),
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
    this.bot.initialize();
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
            if (!!aiResponse) {
              msg.reply(aiResponse);
            }
          }
        }
      })
    );
  }

  public async stop() {
    await this.bot.destroy();
  }
}
