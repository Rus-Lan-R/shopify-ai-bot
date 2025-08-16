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
import ConditionalWrapper from "../ConditionalWrapper";
import { useIsTyping } from "app/hooks/useIsTyping";
import type { IMessage } from "@internal/types";
import { MessageRole } from "@internal/const";

export const Chat = (props: {
  tooltipContent?: ReactNode;
  isLoading: boolean;
  isDisabled: boolean;
  messagesList: (IMessage | IChatMessage)[];
  watcherRole: MessageRole;
  isClientTyping: boolean;
  onSend: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
}) => {
  const {
    isDisabled,
    tooltipContent,
    messagesList,
    isLoading,
    isClientTyping,
    onTyping,
    onSend,
  } = props;
  const [message, setMessage] = useState("");
  const { setIsTyping } = useIsTyping({
    value: message,
    onTypingChange: onTyping,
  });

  const handleInput = (value: string) => {
    setMessage(value);
  };

  const handleSubmit = () => {
    if (!!message.trim()) {
      setMessage("");
      onSend(message);
    }
  };

  return (
    <Card>
      <ChatBody
        isClientTyping={isClientTyping}
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
              onChange={handleInput}
              onBlur={() => setIsTyping(false)}
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
