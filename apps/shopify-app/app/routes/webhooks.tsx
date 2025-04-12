import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import db from "../db.server";
import { aiClient } from "app/services/openAi.server";
import { FileTypes } from "app/modules/openAi/openAi.interfaces";

const deleteShop = async (shop: string) => {
  const shopSession = await db.session.findUnique({ where: { id: shop } });
  if (shopSession?.assistantId) {
    await Promise.all(
      (
        JSON.parse(String(shopSession.assistantFiles) || "") as {
          type: FileTypes;
          fileId: string;
        }[]
      ).map(async (item) => {
        try {
          await aiClient.vectorStores.del(item.fileId);
        } catch (error) {}
        try {
          await aiClient.files.del(item.fileId);
        } catch (error) {}
      }),
    );
    console.log("Vector store files deleted");

    const allShopChats = await db.chat.findMany({
      where: { sessionId: shopSession.id },
    });

    await db.platform.deleteMany({
      where: { sessionId: shopSession.id },
    });

    console.log("Shop deleted");
    try {
      await Promise.all(
        allShopChats.map(
          (item) => item.id && aiClient.beta.threads.del(item.id),
        ),
      );
      console.log("Threads deleted");
    } catch (error) {
      console.error(`Threads delete error: ${error}`);
    }
    try {
      await aiClient.beta.assistants.del(shopSession?.assistantId);
    } catch (error) {
      console.error(`Assistant delete error: ${error}`);
    }
    await db.chat.deleteMany({
      where: { sessionId: shopSession.id },
    });

    await db.session.delete({ where: { id: shopSession.id } });
  }

  console.log("SHOP FULLY DELETED");
};

// "CUSTOMERS_DATA_REQUEST":  "SHOP_REDACT":

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } =
    await authenticate.webhook(request);

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
      await db.session.update({
        where: {
          id: session?.id,
        },
        data: {
          scope: current.toString(),
        },
      });
      break;
    case "CUSTOMERS_DATA_REQUEST":
      return [];
      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
