import {
  Platforms,
  PlatformName,
  IPlatform,
  Sessions,
  ISession,
  IntegrationStatus,
  connectDb,
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
      const whatsAppBot = new WhatsAppBot(platformItem, session);

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
  await connectDb();
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
