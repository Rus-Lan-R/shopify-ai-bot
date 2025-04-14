import {
  ActionFunctionArgs,
  HeadersFunction,
  json,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { IPlatform, ISession, Platforms, Sessions } from "@internal/database";
import { ChatService, AiClient } from "@internal/services";
import { formDataToObject } from "../helpers/utils";

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

  const shopSession = await Sessions.findOne<ISession>(
    shopName ? { shop: shopName } : { _id: shop! },
  );

  if (!shopSession) {
    throw new Response("Shop not found", {
      status: 404,
    });
  }
  const platform = await Platforms.findOne<IPlatform>({
    name: "Website",
    sessionId: shopSession._id,
  });
  const chatService = new ChatService(platform!, shopSession);

  let preparedMessages;
  if (chatId) {
    preparedMessages = await chatService.getAllMessages(chatId);
  }

  return json(
    {
      shopId: shopSession._id,
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

  const shopSession = await Sessions.findOne<ISession>(
    shopName ? { shop: shopName } : { _id: shop! },
  );

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

  const platform = await Platforms.findOne<IPlatform>({
    name: "Website",
    sessionId: shopSession._id,
  });

  const chatService = new ChatService(platform!, shopSession);

  switch (action) {
    case "init": {
      if (shopSession?.assistantId) {
        const aiClient = new AiClient();

        const thread = await aiClient.createThread();
        await chatService.createChat();

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
        // TODO replace on service
        // await Messages.create({
        //   chatId: chatId,
        //   text: message,
        //   direction: "user",
        // });

        // const answer = await getOpenAIResponse({
        //   userText: message,
        //   threadId: chatId,
        //   assistantId: shopSession?.assistantId,
        // });
        // await Messages.create({
        //   chatId: chatId,
        //   text: answer,
        //   direction: "assistant",
        // });

        return new Response(JSON.stringify({ answer: "" }), {
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
