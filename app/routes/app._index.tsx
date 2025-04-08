import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { ChatBot } from "app/packages/ChatBot";
import db from "../db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  try {
    const shopSession = await db.session.findUnique({
      where: { id: session.id },
    });

    const totalChats = await db.chat.count({
      where: { sessionId: shopSession?.session_id },
    });

    return {
      assistantId: shopSession?.assistantId,
      chatId: shopSession?.mainThreadId,
      shop: session.id,
      data: {
        totalRequests: shopSession?.totalAiRequests,
        totalChats: totalChats,
      },
      assistant: {
        assistantName: shopSession?.assistantName,
        assistantPrompt: shopSession?.assistantPrompt,
      },
    };
  } catch (error) {
    return {
      data: {},
      shop: session.id,
      chatId: "",
      assistantId: null,
      assistant: {},
    };
  }
};

export default function Index() {
  const { data, assistantId, assistant, shop, chatId } =
    useLoaderData<typeof loader>();

  return (
    <Page>
      <Box paddingBlockEnd={"3200"}>
        <BlockStack gap={"300"}>
          {assistantId ? (
            <>
              <Card padding={"300"}>
                <BlockStack gap={"500"}>
                  <InlineStack
                    gap={"500"}
                    blockAlign={"center"}
                    align={"space-between"}
                  >
                    <Text as={"h2"} variant={"headingSm"}>
                      Ai Assistant Info
                    </Text>
                    <Button fullWidth={false} url={"/app/settings/assistant"}>
                      Edit
                    </Button>
                  </InlineStack>
                  {!!assistant?.assistantName && (
                    <BlockStack>
                      <InlineStack gap={"100"}>
                        <Text as="p" fontWeight={"bold"}>{`Name: `}</Text>
                        <Text as="p">{assistant.assistantName}</Text>
                      </InlineStack>
                      <InlineStack gap={"100"}>
                        <Text
                          as="p"
                          fontWeight={"bold"}
                        >{`Instruction: `}</Text>
                        <Text as="p">{assistant.assistantPrompt}</Text>
                      </InlineStack>
                      <InlineStack gap={"100"}>
                        <Text as="p" fontWeight={"bold"}>{`Chats: `}</Text>
                        <Text as="p">{data?.totalChats || 0}</Text>
                      </InlineStack>
                      <InlineStack gap={"100"}>
                        <Text
                          as="p"
                          fontWeight={"bold"}
                        >{`Total requests: `}</Text>
                        <Text as="p">{data?.totalRequests || 0}</Text>
                      </InlineStack>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>

              {chatId && shop ? <ChatBot shop={shop} chatId={chatId} /> : <></>}
            </>
          ) : (
            <EmptyState
              heading="Start working with AI Assistant"
              action={{
                content: "Setup Assistant",
                url: "/app/settings/assistant",
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <Text as={"p"}>Set up your assistant</Text>
            </EmptyState>
          )}
        </BlockStack>
      </Box>
    </Page>
  );
}
