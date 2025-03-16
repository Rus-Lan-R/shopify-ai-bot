import { Box, Card, Text } from "@shopify/polaris";

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
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column-reverse",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        {messages?.map((item, index) => {
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
                <Text alignment={isRight ? "end" : "start"} as={"p"}>
                  {item.text}
                </Text>
              </Card>
            </div>
          );
        })}
      </div>
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
