import {
  Box,
  Button,
  Card,
  InlineStack,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import { ChatBody } from "./ChatBody";
import { ReactNode, useState } from "react";
import { IChatMessage } from "../publicChat/PublicChat";
import { IMessage, MessageRole } from "../../../../../packages/types";
import ConditionalWrapper from "../ConditionalWrapper";

export const Chat = (props: {
  tooltipContent?: ReactNode;
  isLoading: boolean;
  isDisabled: boolean;
  messagesList: (IMessage | IChatMessage)[];
  watcherRole: MessageRole;
  onSend: (message: string) => void;
}) => {
  const { isDisabled, tooltipContent, messagesList, isLoading, onSend } = props;
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!!message.trim()) {
      setMessage("");
      onSend(message);
    }
  };

  return (
    <Card>
      <ChatBody
        isLoading={isLoading}
        messages={messagesList}
        watcherRole={props.watcherRole}
      >
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
            <ConditionalWrapper
              condition={!!tooltipContent}
              wrapper={(children) => (
                <Tooltip active content={tooltipContent}>
                  {children}
                </Tooltip>
              )}
            >
              <Button
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isDisabled}
              >
                Send
              </Button>
            </ConditionalWrapper>
          </div>
        </InlineStack>
      </ChatBody>
    </Card>
  );
};
