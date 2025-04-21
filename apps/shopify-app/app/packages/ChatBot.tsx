import { useEffect, useState } from "react";
import { Chat } from "app/components/chat/Chat";
import { useFetcher } from "@remix-run/react";
import { MainChatLoader } from "app/routes/api.chat";
import { IMessage } from "app/components/publicChat/PublicChat";
import { MessageRole } from "../../../../packages/types/src";

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
      setMessagesList((prev) => [
        { role: MessageRole.USER, text: message },
        ...prev,
      ]);
      setIsLoading(true);
      const response = await fetch(`/api/chat?shop=${shop}&chatId=${chatId}`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { answer: string };
      setMessagesList((prev) => [
        { role: MessageRole.ASSISTANT, text: data.answer },
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
    fetcher.load(`/api/chat?shop=${shop}&chatId=${chatId}`);
  }, []);

  return (
    <Chat
      messagesList={messagesList}
      isLoading={isLoading}
      onSend={handleSubmit}
    ></Chat>
  );
};
