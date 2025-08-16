import type { IMessage } from "@internal/types";
import { MessageRole } from "@internal/const";
import { useLoaderData, useRouteLoaderData, useSubmit } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Card,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { Chat } from "app/components/chat/Chat";
import { ChatSocketStatus, ChatStatus } from "app/components/ChatStatus";
import { useLoading } from "app/helpers/useLoading";
import { RootLoader } from "app/root";
import type { IChatDetailsResponse } from "app/server/app.chats.$chat.server";
import { useWebsocket } from "app/websocket/useWebsocket";
import { useEffect, useMemo, useState } from "react";
export { loader, action } from "app/server/app.chats.$chat.server";

export const assistantToBadge: Partial<{
  [key in MessageRole]: {
    tone: Tone;
    buttonText: string;
    badgeText: string;
    toggleRole: MessageRole;
  };
}> = {
  [MessageRole.ASSISTANT]: {
    tone: "success",
    buttonText: "Turn off",
    badgeText: "ON",
    toggleRole: MessageRole.MANAGER,
  },
  [MessageRole.MANAGER]: {
    tone: "new",
    buttonText: "Turn on",
    badgeText: "OFF",
    toggleRole: MessageRole.ASSISTANT,
  },
};

export default function ChatDetailsPage() {
  const submit = useSubmit();
  const rootLoader = useRouteLoaderData<RootLoader>("root");
  const { messages, chatId, chat } = useLoaderData<IChatDetailsResponse>();
  const [messagesList, setMessagesList] = useState<IMessage[]>(messages);
  const [isClientTyping, setIsClientTyping] = useState<boolean>(false);
  const [status, setStatus] = useState(ChatSocketStatus.OFFLINE);

  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<
    "toggle" | "sendMessage"
  >();

  const { socket } = useWebsocket({
    wsUrl: rootLoader?.ENV?.WS_URL || "",
    path: `chats/${chatId}?userId=manager`,
    onOpen: (ws) => {
      setStatus(ChatSocketStatus.CONNECTING);
    },
    onMessage: (e) => {
      let parsedData;
      try {
        parsedData = JSON.parse(e.data) as {
          type: string;
          data: IMessage | { isTyping: boolean };
          users: string[];
        };
      } catch (error) {
        return;
      }

      switch (parsedData.type) {
        case "ONLINE_USERS":
          const onlineUsers = parsedData.users.filter(
            (item) => item !== "manager",
          );

          if (onlineUsers.length) {
            setStatus(ChatSocketStatus.ONLINE);
          } else {
            setStatus(ChatSocketStatus.OFFLINE);
          }

          break;

        case "NEW_MESSAGE": {
          if ("text" in parsedData?.data)
            setMessagesList((prev) => {
              return [...prev, parsedData.data];
            });
          break;
        }

        case "TYPING": {
          if ("isTyping" in parsedData.data) {
            setIsClientTyping(parsedData.data.isTyping);
          }
          break;
        }
        default:
          break;
      }
    },

    onClose: () => {
      setStatus(ChatSocketStatus.OFFLINE);
    },
  });

  const handleToggleRole = (newRole: MessageRole) => {
    setLoadingSlug("toggle");
    const formData = new FormData();
    formData.append("action", "toggleAssistant");
    formData.append("chatId", chatId);
    formData.append("newAssistant", newRole);
    submit(formData, { method: "POST" });
  };

  const handleTyping = (isTyping: boolean) => {
    socket?.send(JSON.stringify({ type: "TYPING", data: { isTyping } }));
  };

  const handleSubmit = (message: string) => {
    setLoadingSlug("sendMessage");
    const messageData = {
      role: MessageRole.MANAGER,
      text: message,
    } as IMessage;
    socket?.send(
      JSON.stringify({
        type: "NEW_MESSAGE",
        data: messageData,
      }),
    );
    setMessagesList((prev) => {
      return [...prev, messageData];
    });

    const formData = new FormData();
    formData.append("action", "sendMessage");
    formData.append("chatId", chatId);
    formData.append("platformId", chat?.platformId || "");
    formData.append("text", message);

    submit(formData, { method: "POST" });
  };

  const currentChatBadge = useMemo(() => {
    return assistantToBadge?.[
      chat?.assistantRole ? chat?.assistantRole : MessageRole.MANAGER
    ];
  }, [chat]);

  useEffect(() => {
    if (socket) {
      setInterval(() => {
        socket.send(JSON.stringify({ type: "CHECK_ONLINE" }));
      }, 60 * 1000);
    }
  }, [socket]);

  return (
    <Page
      title="Chat details"
      backAction={{
        url: "/app/chats",
      }}
    >
      <Box paddingBlockEnd={"3200"}>
        <BlockStack gap={"300"}>
          <Card>
            <InlineStack blockAlign={"center"} align={"space-between"}>
              <InlineStack align="center" gap={"100"}>
                <Text as="p" variant={"headingMd"}>
                  AI Assistant
                </Text>
                <Badge {...currentChatBadge}>
                  {currentChatBadge?.badgeText}
                </Badge>
                <Button
                  loading={checkIsLoading("toggle")}
                  size={"micro"}
                  onClick={() =>
                    currentChatBadge?.toggleRole &&
                    handleToggleRole(currentChatBadge?.toggleRole)
                  }
                >
                  {currentChatBadge?.buttonText}
                </Button>
              </InlineStack>
              <ChatStatus status={status} />
            </InlineStack>
          </Card>
          <Chat
            tooltipContent={
              chat.assistantRole !== MessageRole.MANAGER
                ? "Turn off the AI Assistant to send messages"
                : null
            }
            isDisabled={chat.assistantRole !== MessageRole.MANAGER}
            watcherRole={MessageRole.MANAGER}
            messagesList={messagesList}
            isLoading={checkIsLoading("sendMessage")}
            isClientTyping={isClientTyping}
            onSend={handleSubmit}
            onTyping={handleTyping}
          ></Chat>
        </BlockStack>
      </Box>
    </Page>
  );
}
