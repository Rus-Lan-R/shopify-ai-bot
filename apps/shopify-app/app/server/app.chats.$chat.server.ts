import { Messages } from "@internal/database";
import { IMessage } from "@internal/types";
import { LoaderFunctionArgs } from "@remix-run/node";

import { ExtendedSession } from "app/modules/sessionStorage";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  if (!params.chatId) {
    return new Response("Chat id not found", { status: 404 });
  }

  try {
    const messages = await Messages.find<IMessage[]>({
      sessionId: session._id,
      chatId: params.chatId,
    }).lean<IMessage[]>();
    return { messages: messages };
  } catch (error) {
    return new Response("Chat not found", { status: 404 });
  }
};
