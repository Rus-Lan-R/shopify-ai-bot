import { Platforms, Sessions, MongoDB } from "@internal/database";
import { WhatsAppBot } from "@internal/services";
import { debounce } from "./helpers/debaunce";
import {
  IntegrationStatus,
  IPlatform,
  ISession,
  PlatformName,
} from "@internal/types";

const listenBots = async () => {
  const whatsAppPlatforms = await Platforms.find<IPlatform>({
    name: PlatformName.WHATSAPP,
    integrationStatus: {
      $in: [
        IntegrationStatus.ACTIVE,
        IntegrationStatus.CONNECTING,
        IntegrationStatus.NEW,
      ],
    },
  }).lean<IPlatform[]>();

  console.log(`Run WhatsApp bots -> ${whatsAppPlatforms.length} `);
  let createdBots: WhatsAppBot[] = [];
  whatsAppPlatforms.forEach(async (platformItem: IPlatform) => {
    const session = await Sessions.findById<ISession>(
      platformItem?.sessionId
    ).lean<ISession>();

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
  return createdBots;
};

const run = async () => {
  if (!process.env.DATABASE_URL) {
    throw { error: "Mongo DB Url not found" };
  }
  const mongoDbInstance = new MongoDB(process.env.DATABASE_URL);
  await mongoDbInstance.connect();
  const stream = Platforms.watch(
    [
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace"] },
          "fullDocument.name": PlatformName.WHATSAPP,
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );
  let createdBots = await listenBots();

  const debounceExecute = debounce(async () => {
    console.log("wa Execute");
    await Promise.all(createdBots.map((item) => item.stop()));
    createdBots = await listenBots();
  }, 15000);

  stream.on("change", async () => {
    console.log("wa trigger");
    debounceExecute();
  });
};

run().then(() => {
  console.log("Run WhatsApp Service");
});
