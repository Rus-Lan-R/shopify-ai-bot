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
import { useLoaderData } from "@remix-run/react";
import { ChatBot } from "../packages/ChatBot";
import { ExtendedSession } from "app/modules/sessionStorage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  try {
    // const totalChats = await Chats.count({
    //   where: { _id: session?.id },
    // });

    return {
      assistantId: session?.assistantId,
      chatId: session?.mainChatId,
      shop: session._id,
      data: {
        totalRequests: 0,
        totalChats: 0,
      },
      assistant: {
        assistantName: session?.assistantName,
        assistantPrompt: session?.assistantPrompt,
      },
    };
  } catch (error) {
    return {
      data: {},
      shop: session._id,
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
