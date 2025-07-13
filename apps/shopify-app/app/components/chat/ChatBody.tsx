import { IMessage, MessageRole } from "@internal/types";
import { BlockStack, Box, Card, Scrollable, Text } from "@shopify/polaris";
import { IChatMessage } from "../publicChat/PublicChat";

const watcherToRoleStyle: {
  [key in MessageRole]: {
    [key in MessageRole]: { position: string; style: string };
  };
} = {
  [MessageRole.USER]: {
    [MessageRole.USER]: {
      position: "flex-end",
      style: "bg-fill-info",
    },
    [MessageRole.ASSISTANT]: {
      position: "flex-start",
      style: "bg-fill-transparent",
    },
    [MessageRole.MANAGER]: {
      position: "flex-start",
      style: "bg-fill-transparent",
    },
  },
  [MessageRole.ASSISTANT]: {
    [MessageRole.USER]: {
      position: "flex-start",
      style: "bg-fill-transparent",
    },
    [MessageRole.ASSISTANT]: { position: "flex-end", style: "bg-fill-info" },
    [MessageRole.MANAGER]: { position: "flex-end", style: "bg-fill-info" },
  },
  [MessageRole.MANAGER]: {
    [MessageRole.USER]: {
      position: "flex-start",
      style: "bg-fill-transparent",
    },
    [MessageRole.ASSISTANT]: { position: "flex-end", style: "bg-fill-info" },
    [MessageRole.MANAGER]: { position: "flex-end", style: "bg-fill-info" },
  },
};

export const ChatBody = (props: {
  messages: (IChatMessage | IMessage)[];
  children: JSX.Element;
  watcherRole: MessageRole;
  isClientTyping: boolean;
}) => {
  const { isClientTyping, messages, children, watcherRole } = props;

  return (
    <Box position={"relative"} minHeight={"300px"}>
      <Scrollable
        style={{
          height: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {messages.length ? (
          messages?.map((item, index) => {
            return (
              <div
                style={{
                  alignSelf:
                    watcherToRoleStyle[watcherRole][item.role].position,
                  maxWidth: "66%",
                }}
                key={index}
              >
                <Card
                  padding={"200"}
                  // @ts-ignore
                  background={
                    watcherToRoleStyle[watcherRole]?.[item.role]?.style
                  }
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <Text as={"p"}>{item.text}</Text>
                  </div>
                </Card>
                {index === messages.length - 1 ? (
                  <Scrollable.ScrollTo />
                ) : (
                  <></>
                )}
              </div>
            );
          })
        ) : (
          <BlockStack align={"center"} inlineAlign={"center"}>
            <Text as={"p"}>Start conversation</Text>
          </BlockStack>
        )}
        {!!isClientTyping && "typing..."}
      </Scrollable>
      <Box
        position={"sticky"}
        insetBlockEnd={"0"}
        insetInlineStart={"0"}
        insetInlineEnd={"0"}
      >
        {children}
      </Box>
    </Box>
  );
};
