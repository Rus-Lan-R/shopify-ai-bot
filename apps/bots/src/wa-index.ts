import {
  Platforms,
  PlatformName,
  IPlatform,
  Sessions,
  ISession,
  IntegrationStatus,
  MongoDB,
} from "@internal/database";
import { WhatsAppBot } from "@internal/services";

const botsList = async () => {
  const whatsAppPlatforms = await Platforms.find<IPlatform>({
    name: PlatformName.WHATSAPP,
  });
  console.log(`Run WhatsApp bots -> ${whatsAppPlatforms.length} `);
  whatsAppPlatforms.forEach(async (platformItem) => {
    const session = await Sessions.findById<ISession>(platformItem?.sessionId);

    if (session?._id) {
      const whatsAppBot = new WhatsAppBot(
        platformItem,
        session,
        process.env.OPENAI_API_KEY || ""
      );

      if (platformItem.integrationStatus === IntegrationStatus.NEW) {
        console.log("auth");
        await whatsAppBot.auth();
      }

      if (platformItem.integrationStatus === IntegrationStatus.ACTIVE) {
        await whatsAppBot.run();
        await whatsAppBot.listenMessages();
      }
    }
  });
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw { error: "Mongo DB Url not found" };
  }
  const mongoDbInstance = new MongoDB(process.env.DATABASE_URL);
  await mongoDbInstance.connect();
  const queueEventEmitter = Platforms.watch();
  await botsList();
  queueEventEmitter.on("change", async () => {
    console.log("Update listiners");
    await botsList();
  });
};

run().then(() => {
  console.log("Run WhatsApp Service");
});
