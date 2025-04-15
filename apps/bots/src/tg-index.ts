import {
  ISession,
  Sessions,
  IPlatform,
  PlatformName,
  Platforms,
  MongoDB,
  IntegrationStatus,
} from "@internal/database";
import { TelegramBot } from "@internal/services";

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw { error: "Mongo DB Url not found" };
  }
  const mongoDbInstance = new MongoDB(process.env.DATABASE_URL || "");
  await mongoDbInstance.connect();
  try {
    const telegramPlatforms = await Platforms.find<IPlatform>({
      name: PlatformName.TELEGRAM,
      integrationStatus: IntegrationStatus.ACTIVE,
    });

    console.log("Telegram Platforms -> ", telegramPlatforms.length);

    telegramPlatforms
      .filter((item) => !!item.primaryApiKey)
      .forEach(async (platformItem) => {
        const session = await Sessions.findById<ISession>(
          platformItem?.sessionId
        );

        if (session) {
          const bot = new TelegramBot(
            platformItem,
            session,
            process.env.OPENAI_API_KEY || ""
          );
          await bot.init();
          await bot.listenMessages();
        }
      });
  } catch (error) {
    console.log(error);
  }
};

run().then(() => {
  console.log("Run Telegram Service");
});
