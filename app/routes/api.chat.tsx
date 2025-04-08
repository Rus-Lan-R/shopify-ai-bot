import {
  ActionFunctionArgs,
  HeadersFunction,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import { aiClient } from "app/services/openAi.server";
import {
  extractTextWithoutAnnotations,
  getOpenAIResponse,
} from "app/modules/openAi/request";
import { createWebsiteChat } from "app/actions/createWebsiteChat";

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

    preparedMessages.push({
      role: "assistant",
      text: shopSession.welcomeMessage || "Hi, how can I help you?",
    });
  }

  return json(
    {
      shopId: shopSession.id,
      chatId: chatId,
      shop: shop,
      messages: preparedMessages,
      assistantName: shopSession.assistantName,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const formData = await request.formData();
  const { action, message } = formDataToObject(formData);
  const searchParams = new URL(request.url).searchParams;
  const [shop, chatId, shopName] = [
    searchParams.get("shop"),
    searchParams.get("chatId"),
    searchParams.get("shopName"),
  ];

  if (!shop && !shopName) {
    return new Response(JSON.stringify({ error: "Chat Action Bad Request" }), {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const shopSession = await db.session.findFirst({
    where: shopName ? { shop: shopName } : { id: shop! },
  });

  if (!shopSession) {
    return new Response(JSON.stringify({ error: "Shop Not Found" }), {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  switch (action) {
    case "init": {
      if (shopSession?.assistantId) {
        const thread = await aiClient.beta.threads.create();

        await createWebsiteChat(shopSession.session_id, thread.id);

        return new Response(JSON.stringify({ chatId: thread.id }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      return new Response(JSON.stringify({ error: "Assistant ID missing" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    case "message": {
      if (!chatId) {
        return new Response(JSON.stringify({ error: "Chat not found" }), {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (shopSession?.assistantId) {
        const answer = await getOpenAIResponse({
          userText: message,
          threadId: chatId,
          assistantId: shopSession?.assistantId,
        });

        await db.session.update({
          where: { id: shopSession.session_id },
          data: {
            totalAiRequests: (shopSession.totalAiRequests || 0) + 1,
            monthlyAiRequests: (shopSession.monthlyAiRequests || 0) + 1,
          },
        });

        return new Response(JSON.stringify({ answer }), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      return new Response(JSON.stringify({ error: "Assistant ID missing" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    default:
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
  }
};
