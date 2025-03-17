import { BlockStack, Box, Card, Scrollable, Text } from "@shopify/polaris";

export interface IMessage {
  role: "assistant" | "user";
  text: string;
}
export const ChatBody = (props: {
  messages: IMessage[];
  children: JSX.Element;
}) => {
  const { messages, children } = props;

  return (
    <Box position={"relative"} minHeight={"300px"}>
      <Scrollable
        style={{
          height: "300px",
          display: "flex",
          flexDirection: "column-reverse",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <Scrollable.ScrollTo />
        {messages.length ? (
          messages?.map((item, index) => {
            const isRight = item.role === "user";
            return (
              <div
                style={{
                  alignSelf: isRight ? "flex-end" : "flex-start",
                  maxWidth: "66%",
                }}
                key={index}
              >
                <Card
                  padding={"200"}
                  background={isRight ? "bg-fill-info" : "bg-fill-transparent"}
                >
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <Text alignment={isRight ? "end" : "start"} as={"p"}>
                      {item.text}
                    </Text>
                  </div>
                </Card>
              </div>
            );
          })
        ) : (
          <BlockStack align={"center"} inlineAlign={"center"}>
            <Text as={"p"}>Start conversation</Text>
          </BlockStack>
        )}
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
