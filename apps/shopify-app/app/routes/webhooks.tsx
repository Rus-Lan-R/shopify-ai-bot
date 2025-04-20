import type { ActionFunctionArgs } from "@remix-run/node";
import { Chats, Messages, Platforms, Sessions } from "@internal/database";
import { IChat } from "@internal/types";

import { ExtendedSession } from "app/modules/sessionStorage";
import { FileTypes } from "app/modules/openAi/openAi.interfaces";
import { openAi } from "app/services/openAi.server";
import { authenticate } from "app/shopify.server";

const deleteShop = async (shop: string) => {
  const shopSession = await Sessions.findById(shop);
  if (shopSession?.assistantId) {
    await Promise.all(
      (
        JSON.parse(String(shopSession.assistantFiles) || "") as {
          type: FileTypes;
          fileId: string;
        }[]
      ).map(async (item) => {
        try {
          await openAi.aiClient.vectorStores.del(item.fileId);
        } catch (error) {}
        try {
          await openAi.aiClient.files.del(item.fileId);
        } catch (error) {}
      }),
    );
    console.log("Vector store files deleted");

    const allShopChats = await Chats.find<IChat>({
      sessionId: shopSession._id,
    }).lean();

    console.log("Shop deleted");
    try {
      await Promise.all(
        allShopChats.map(
          (item) =>
            item?._id &&
            typeof item?._id === "string" &&
            openAi?.aiClient.beta.threads.del(item._id),
        ),
      );
      console.log("Threads deleted");
    } catch (error) {
      console.error(`Threads delete error: ${error}`);
    }
    try {
      await openAi?.aiClient.beta.assistants.del(shopSession?.assistantId);
    } catch (error) {
      console.error(`Assistant delete error: ${error}`);
    }

    await Promise.all([
      Platforms.deleteMany({ sessionId: shopSession._id }),
      Chats.deleteMany({
        sessionId: shopSession._id,
      }),
      Messages.deleteMany({
        sessionId: shopSession._id,
      }),
    ]);

    await Sessions.deleteOne({ _id: shopSession._id });
  }

  console.log("SHOP FULLY DELETED");
};

// "CUSTOMERS_DATA_REQUEST":  "SHOP_REDACT":

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, admin, payload, ...rest } =
    await authenticate.webhook(request);
  const session = rest.session as ExtendedSession;

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }
  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED":
    case "SHOP_REDACT":
      await deleteShop(shop);
      break;
    case "SCOPES_UPDATE":
      const current = payload.current as string[];
      await Sessions.updateOne(
        {
          _id: session?._id,
        },
        {
          scope: current.toString(),
        },
      );
      break;
    case "CUSTOMERS_DATA_REQUEST":
      return [];
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
