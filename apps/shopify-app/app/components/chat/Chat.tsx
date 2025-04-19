import { Box, Button, Card, InlineStack, TextField } from "@shopify/polaris";
import { ChatBody } from "./ChatBody";
import { useState } from "react";
import { IMessage } from "../publicChat/PublicChat";

export const Chat = (props: {
  isLoading: boolean;
  messagesList: IMessage[];
  onSend: (message: string) => void;
}) => {
  const { messagesList, isLoading, onSend } = props;
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!!message.trim()) {
      setMessage("");
      onSend(message);
    }
  };

  return (
    <Card>
      <ChatBody messages={messagesList}>
        <InlineStack
          gap={"300"}
          blockAlign={"stretch"}
          wrap={false}
          align={"end"}
        >
          <Box width={"100%"}>
            <TextField
              label=""
              autoComplete="off"
              value={message}
              ariaExpanded={true}
              multiline={true}
              placeholder={"Message"}
              onChange={(value) => setMessage(value)}
            ></TextField>
          </Box>

          <div style={{ height: "fit-content", marginTop: "auto" }}>
            <Button onClick={handleSubmit} loading={isLoading}>
              Send
            </Button>
          </div>
        </InlineStack>
      </ChatBody>
    </Card>
  );
};
