import { Chats } from "@internal/database";
import type { IChat, IPlatform } from "@internal/types";
import { LoaderFunctionArgs } from "@remix-run/node";
import { ExtendedSession } from "app/modules/sessionStorage";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const chats = await Chats.find<IChat>(
    {
      sessionId: session?._id,
    },
    {},
    { limit: 10, sort: { createdAt: -1 } },
  ).populate<{ platformId: IPlatform }>("platformId");

  return {
    chats,
  };
};
