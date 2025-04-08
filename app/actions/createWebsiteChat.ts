import db from "../db.server";

export const createWebsiteChat = async (
  sessionId: string,
  threadId: string,
) => {
  try {
    let websitePlatform = await db.platform.findFirst({
      where: { sessionId: sessionId },
    });

    if (!websitePlatform) {
      websitePlatform = await db.platform.create({
        data: { sessionId, name: "Website" },
      });
    }
    await db.chat.create({
      data: {
        sessionId: sessionId,
        threadId: threadId,
        platformId: websitePlatform.id,
      },
    });

    return {};
  } catch (error) {
    console.error("Error create Website:", error);
  }
};
