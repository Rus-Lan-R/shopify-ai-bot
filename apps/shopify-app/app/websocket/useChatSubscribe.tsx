import { useEffect, useRef } from "react";

const wsHost = process.env.NEXT_PUBLIC_BASE_WS_HOST || "ws://localhost:8080";

export const useChatSubscribe = ({
  id,
  onOpen,
  onClose,
  onMessage,
}: {
  id: string;
  topics: {
    connect: string;
  };
  onOpen: () => void;
  onClose: () => void;
  onMessage: () => void;
}) => {
  let websocket = useRef<WebSocket>();

  useEffect(() => {
    if (!websocket.current) {
      const connection = new WebSocket(`${wsHost}/ws/chats/${id}`);
      connection.addEventListener("open", () => {
        console.log("CHATS SOCKET OPEN");
      });

      connection.addEventListener("message", (event) => {
        const parsedData = JSON.parse(event.data);
      });

      connection.addEventListener("close", () => {
        console.log("CHAT SOCKET CLOSED");
      });
      websocket.current = connection;
    }
    return () => {
      if (websocket?.current) {
        websocket.current?.close();
      }
    };
  }, []);

  return {};
};
