import {
  connectDb,
  ISession,
  Sessions,
  IPlatform,
  PlatformName,
  Platforms,
} from "@internal/database";
import { TelegramBot } from "@internal/services";

const run = async () => {
  await connectDb();
  try {
    const telegramPlatforms = await Platforms.find<IPlatform>({
      name: PlatformName.TELEGRAM,
      isEnabled: true,
    });

    telegramPlatforms
      .filter((item) => !!item.primaryApiKey)
      .forEach(async (platformItem) => {
        const session = await Sessions.findById<ISession>(
          platformItem?.sessionId
        );

        if (session) {
          const bot = new TelegramBot(platformItem, session);
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
