import { Chats, Messages, Platforms } from "../../../../packages/database/src";
import { defer, LoaderFunctionArgs } from "@remix-run/node";
import { ExtendedSession } from "app/modules/sessionStorage";
import { authenticate } from "app/shopify.server";

const getDeferedData = ({ sessionId }: { sessionId: string }) => {
  const chatsPromise = new Promise<number>(async (res) => {
    res(
      Chats.countDocuments({
        sessionId: sessionId,
      }).lean(),
    );
  });

  const messagesPromise = new Promise<number>(async (res) => {
    const messagesCount = await Messages.countDocuments({
      sessionId: sessionId,
    }).lean();
    res(messagesCount);
  });

  const platformsPromise = new Promise<number>(async (res) => {
    const platformsCount = await Platforms.countDocuments({
      sessionId: sessionId,
    }).lean();
    res(platformsCount);
  });

  return { platformsPromise, messagesPromise, chatsPromise };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  try {
    const promiseStats = getDeferedData({
      sessionId: session._id,
    });

    return defer({
      ...promiseStats,
      assistantId: session?.assistantId,
      chatId: session?.mainChatId,
      shop: session._id,
      limitations: { ...session.limitationId },
      assistant: {
        assistantName: session?.assistantName,
        assistantPrompt: session?.assistantPrompt,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      platformsPromise: null,
      chatsPromise: null,
      messagesPromise: null,
      limitations: { platforms: 0, chats: 0, requests: 0 },
      shop: session._id,
      chatId: null,
      assistantId: null,
      assistant: {},
    };
  }
};
