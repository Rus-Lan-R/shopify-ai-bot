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
import { debounce } from "./helpers/debaunce";

const listenBots = async () => {
  let createdBots: TelegramBot[] = [];
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
          createdBots.push(bot);

          await bot.init();
          await bot.listenMessages();
        }
      });

    return createdBots;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw { error: "Mongo DB Url not found" };
  }
  const mongoDbInstance = new MongoDB(process.env.DATABASE_URL || "");
  await mongoDbInstance.connect();

  let createdBots = await listenBots();

  const debounceExecute = debounce(async () => {
    console.log("tg Execute");
    await Promise.all(createdBots.map((item) => item.stop()));
    createdBots = await listenBots();
  }, 15000);

  const stream = Platforms.watch(
    [
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace"] },
          "fullDocument.name": PlatformName.TELEGRAM,
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );

  stream.on("change", () => {
    console.log("tg trigger");
    debounceExecute();
  });
};

run().then(() => {
  console.log("Run Telegram Service");
});
