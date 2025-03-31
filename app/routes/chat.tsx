import {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import { aiClient } from "app/services/openAi.server";
import {
  extractTextWithoutAnnotations,
  getOpenAIResponse,
} from "app/modules/openAi/request";

export type MainChatLoader = typeof loader;

export const headers: HeadersFunction = ({}) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const [shop, chatId, shopName] = [
    searchParams.get("shop"),
    searchParams.get("chatId"),
    searchParams.get("shopName"),
  ];

  if ((!shop && !shopName) || !chatId) {
    throw new Response("Chat Loader Bad Request", {
      status: 400,
    });
  }

  const shopSession = await db.session.findFirst({
    where: shopName ? { shop: shopName } : { id: shop! },
  });

  if (!shopSession) {
    throw new Response("Shop not found", {
      status: 404,
    });
  }

  let preparedMessages;
  if (chatId) {
    const messages = await aiClient.beta.threads.messages.list(chatId, {
      limit: 100,
    });

    preparedMessages = messages.data.map((item) => ({
      role: item.role,
      text: extractTextWithoutAnnotations(item.content),
    }));
  }

  return {
    shopId: shopSession.id,
    chatId: chatId,
    shop: shop,
    messages: preparedMessages,
    assistantName: shopSession.assistantName,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { action, message } = formDataToObject(formData);
  const searchParams = new URL(request.url).searchParams;
  const [shop, chatId, shopName] = [
    searchParams.get("shop"),
    searchParams.get("chatId"),
    searchParams.get("shopName"),
  ];

  if (!shop && !shopName) {
    throw new Response("Chat Action Bad Request", {
      status: 400,
    });
  }

  const shopSession = await db.session.findFirst({
    where: shopName ? { shop: shopName } : { id: shop! },
  });

  if (!shopSession) {
    throw new Response("Shop Not Found", {
      status: 404,
    });
  }

  switch (action) {
    case "init": {
      if (shopSession?.assistantId) {
        const thread = await aiClient.beta.threads.create();

        await db.chat.create({
          data: {
            sessionId: shopSession.id,
            threadId: thread.id,
          },
        });
        await db.session.update({
          where: { id: shopSession.id },
          data: {
            totalChats: (shopSession.totalChats || 0) + 1,
          },
        });

        return new Response(JSON.stringify({ chatId: thread.id }), {
          headers: { "content-type": "application/json" },
        });
      }
      // add error response
    }
    case "message":
      if (!chatId) {
        throw new Response("Chat not found", {
          status: 404,
        });
      }

      if (shopSession?.assistantId) {
        const answer = await getOpenAIResponse({
          userText: message,
          threadId: chatId,
          assistantId: shopSession?.assistantId,
        });
        await db.session.update({
          where: { id: shopSession.id },
          data: {
            totalAiRequests: (shopSession.totalAiRequests || 0) + 1,
            monthlyAiRequests: (shopSession.monthlyAiRequests || 0) + 1,
          },
        });

        return new Response(JSON.stringify({ answer }), {
          headers: { "content-type": "application/json" },
        });
      }
      // add error response
      break;

    default:
      break;
    // add error respons
  }

  return {};
};
