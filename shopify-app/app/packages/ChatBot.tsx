import { useEffect, useState } from "react";
import { Chat } from "../components/chat/Chat";
import { useFetcher } from "@remix-run/react";
import { MainChatLoader } from "app/routes/main-chat";
import { IMessage } from "app/components/chat/ChatBody";

export const ChatBot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messagesList, setMessagesList] = useState<IMessage[]>([]);
  const fetcher = useFetcher<MainChatLoader>();

  const handleSubmit = async (message: string) => {
    const formData = new FormData();
    formData.append("action", "message");
    formData.append("message", message);
    try {
      setMessagesList((prev) => [{ role: "user", text: message }, ...prev]);
      setIsLoading(true);
      const response = await fetch("/main-chat", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { answer: string };
      setMessagesList((prev) => [
        { role: "assistant", text: data.answer },
        ...prev,
      ]);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMessagesList(fetcher.data?.messages || []);
  }, [fetcher.data]);

  useEffect(() => {
    fetcher.load("/main-chat");
  }, []);

  return (
    <Chat
      messagesList={messagesList}
      isLoading={isLoading}
      onSend={handleSubmit}
    ></Chat>
  );
};
