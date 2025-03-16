import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import {
  aiClient,
  extractTextWithoutAnnotations,
  getOpenAIResponse,
} from "app/services/openAi.server";

export type MainChatLoader = typeof loader;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shopSession = await db.session.findUnique({
    where: { id: session.id },
  });

  if (shopSession?.mainThreadId) {
    const messages = await aiClient.beta.threads.messages.list(
      shopSession?.mainThreadId,
      { limit: 100 },
    );
    const preparedMessages = messages.data.map((item) => ({
      role: item.role,
      text: extractTextWithoutAnnotations(item.content),
    }));
    return { messages: preparedMessages };
  }
  return { messages: [] };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { action, message } = formDataToObject(formData);
  const { session } = await authenticate.admin(request);
  const shopSession = await db.session.findUnique({
    where: { id: session.id },
  });

  switch (action) {
    case "message":
      if (shopSession?.mainThreadId && shopSession?.assistantId) {
        const answer = await getOpenAIResponse({
          userText: message,
          threadId: shopSession?.mainThreadId,
          assistantId: shopSession?.assistantId,
        });

        return { answer };
      }
      break;

    default:
      break;
  }

  return {};
};
