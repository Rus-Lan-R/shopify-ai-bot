import { Box, Button, Card, InlineStack, TextField } from "@shopify/polaris";
import { ChatBody, IMessage } from "./ChatBody";
import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { MainChatLoader } from "app/routes/main-chat";

export const Chat = (props: {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messagesList, setMessagesList] = useState<IMessage[]>([]);
  const fetcher = useFetcher<MainChatLoader>();

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("action", "message");
    formData.append("message", message);
    try {
      setMessagesList((prev) => [{ role: "user", text: message }, ...prev]);
      setMessage("");
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
    <Card>
      <ChatBody messages={messagesList}>
        <InlineStack gap={"300"} blockAlign={"stretch"} wrap={false}>
          <Box width={"100%"}>
            <TextField
              label=""
              autoComplete="off"
              value={message}
              onChange={(value) => setMessage(value)}
            ></TextField>
          </Box>
          <Button onClick={handleSubmit} loading={isLoading}>
            Send
          </Button>
        </InlineStack>
      </ChatBody>
    </Card>
  );
};
