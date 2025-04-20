import {
  BlockStack,
  Box,
  Button,
  Card,
  EmptyState,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { Await, useLoaderData } from "@remix-run/react";
import { StatisticsCard } from "app/components/StatisticsCard/Stats";
import { Suspense } from "react";
import { ChatBot } from "app/packages/ChatBot";
import type { loader } from "app/routes/app.index.server.js";
export { loader } from "app/routes/app.index.server.js";

export default function Index() {
  const {
    assistantId,
    assistant,
    shop,
    chatId,
    limitations,
    messagesPromise,
    chatsPromise,
    platformsPromise,
  } = useLoaderData<typeof loader>() ?? {};

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
                    <Button fullWidth={false} url={"/app/assistant-settings"}>
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
                        >{`Instructions: `}</Text>
                        <Text as="p">{assistant.assistantPrompt}</Text>
                      </InlineStack>
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
              <InlineGrid gap={"300"} columns={3}>
                <Suspense fallback={<p>Loading stats...</p>}>
                  <Await resolve={messagesPromise}>
                    {(data) => {
                      return (
                        <StatisticsCard
                          name={"Total requests"}
                          used={data || 0}
                          total={limitations.requests || 0}
                        />
                      );
                    }}
                  </Await>
                </Suspense>
                <Suspense fallback={<p>Loading stats...</p>}>
                  <Await resolve={chatsPromise}>
                    {(data) => (
                      <StatisticsCard
                        name={"Active chats"}
                        used={data}
                        total={limitations?.chats || 0}
                      />
                    )}
                  </Await>
                </Suspense>
                <Suspense fallback={<p>Loading stats...</p>}>
                  <Await resolve={platformsPromise}>
                    {(data) => (
                      <StatisticsCard
                        name={"Platforms"}
                        used={data}
                        total={limitations?.platforms || 0}
                      />
                    )}
                  </Await>
                </Suspense>
              </InlineGrid>
              {chatId && shop ? <ChatBot shop={shop} chatId={chatId} /> : <></>}
            </>
          ) : (
            <EmptyState
              heading="Start working with AI Assistant"
              action={{
                content: "Setup Assistant",
                url: "/app/assistant-settings",
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
