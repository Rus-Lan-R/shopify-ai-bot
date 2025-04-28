import { Router } from "express";
const wsChatsRouter = Router();

const chatOnlineUsers = new Map<string, Map<string, WebSocket>>();

function broadcastOnlineUsers(chatId: string) {
  const chatUsers = chatOnlineUsers.get(chatId);
  if (!chatUsers) return;

  const onlineUserIds = Array.from(chatUsers.keys()).filter((item) => !!item);
  const message = JSON.stringify({
    type: "ONLINE_USERS",
    users: onlineUserIds,
  });

  for (const ws of chatUsers.values()) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }
}

wsChatsRouter?.ws("/chats/:chatId", (ws, req, next) => {
  const chatId = req.params.chatId;
  const userId = req?.query?.userId as string;

  if (!userId) {
    next();
  }

  if (!chatOnlineUsers.has(chatId)) {
    chatOnlineUsers.set(chatId, new Map());
  }

  const chatUsers = chatOnlineUsers.get(chatId)!;
  chatUsers.set(userId, ws);

  broadcastOnlineUsers(chatId);

  ws.on("close", () => {
    const chatUsers = chatOnlineUsers.get(chatId);
    if (chatUsers) {
      chatUsers.delete(userId);
      if (chatUsers.size === 0) {
        chatOnlineUsers.delete(chatId);
      }
    }
    broadcastOnlineUsers(chatId);
  });

  ws.on("message", (e) => {
    let parsedData;
    try {
      parsedData = JSON.parse(e.toString());
      if (parsedData?.type === "CHECK_ONLINE") {
        broadcastOnlineUsers(chatId);
      }
    } catch (error) {
      console.log("PAYLOAD PARSE ERROR:", error);
    }
  });
  next();
});

export default wsChatsRouter;
