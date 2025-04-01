import db from "../db.server";

export const createWebsiteChat = async (
  sessionId: string,
  threadId: string,
) => {
  try {
    const chat = await db.chat.create({
      data: {
        sessionId: sessionId,
        threadId: threadId,
      },
    });

    const websiteChat = await db.website.create({
      data: {
        chatId: chat.id,
        sessionId: sessionId,
      },
    });

    let websitePlatform = await db.platform.findUnique({
      where: { name: "Website" },
    });

    if (!websitePlatform) {
      websitePlatform = await db.platform.create({
        data: { name: "Website" },
      });
    }

    await db.platformChat.create({
      data: {
        chatId: chat.id,
        sessionId: sessionId,
        platformId: websitePlatform.id,
      },
    });
    return {};
  } catch (error) {
    console.error("Error create Telegram:", error);
  }
};
