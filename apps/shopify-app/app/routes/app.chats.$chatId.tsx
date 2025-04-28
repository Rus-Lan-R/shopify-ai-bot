import { MessageRole } from "@internal/types";
import { useLoaderData, useSubmit } from "@remix-run/react";
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
import { ChatStatus } from "app/components/ChatStatus";
import { useLoading } from "app/helpers/useLoading";
import { ManagersChat } from "app/packages/ManagersChat";
import type { IChatDetailsResponse } from "app/server/app.chats.$chat.server";
import { useMemo } from "react";
export { loader, action } from "app/server/app.chats.$chat.server";

const assistantToBadge: Partial<{
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
  const { messages, chatId, chat } = useLoaderData<IChatDetailsResponse>();
  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<"toggle">();
  const submit = useSubmit();

  const currentChatBadge = useMemo(() => {
    return assistantToBadge?.[
      chat?.assistantRole ? chat?.assistantRole : MessageRole.MANAGER
    ];
  }, [chat]);

  const handleToggleRole = (newRole: MessageRole) => {
    setLoadingSlug("toggle");
    const formData = new FormData();
    formData.append("action", "toggleAssistant");
    formData.append("chatId", chatId);
    formData.append("newAssistant", newRole);
    submit(formData, { method: "POST" });
  };

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
              <ChatStatus
                currentUser={"manager"}
                path={`chats/${chatId}?chatId=manager`}
                onMessage={() => {}}
              />
            </InlineStack>
          </Card>
          <ManagersChat messages={messages} />
        </BlockStack>
      </Box>
    </Page>
  );
}
