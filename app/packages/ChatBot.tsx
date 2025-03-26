import { useEffect, useState } from "react";
import { Chat } from "../components/chat/Chat";
import { useFetcher } from "@remix-run/react";
import { MainChatLoader } from "app/routes/chat";
import { IMessage } from "app/components/publicChat/PublicChat";

export const ChatBot = (props: { shop: string; chatId: string }) => {
  const { shop, chatId } = props;
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
      const response = await fetch(`/chat?shop=${shop}&chatId=${chatId}`, {
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
    fetcher.load(`/chat?shop=${shop}&chatId=${chatId}`);
  }, []);

  return (
    <Chat
      messagesList={messagesList}
      isLoading={isLoading}
      onSend={handleSubmit}
    ></Chat>
  );
};
