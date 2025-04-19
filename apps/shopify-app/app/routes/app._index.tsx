import type { LoaderFunctionArgs } from "@remix-run/node";
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
import { authenticate } from "../shopify.server";
import { Await, defer, useLoaderData } from "@remix-run/react";
import { ChatBot } from "../packages/ChatBot";
import { ExtendedSession } from "app/modules/sessionStorage";
import { Chats, Messages, Platforms } from "@internal/database";
import { StatisticsCard } from "app/components/StatisticsCard/Stats";
import { Suspense } from "react";

const getDeferedData = ({ sessionId }: { sessionId: string }) => {
  const chatsPromise = new Promise<number>(async (res) => {
    res(
      Chats.countDocuments({
        sessionId: sessionId,
      }).lean(),
    );
  });

  const messagesPromise = new Promise<number>(async (res) => {
    const messagesCount = await Messages.countDocuments({
      sessionId: sessionId,
    }).lean();
    res(messagesCount);
  });

  const platformsPromise = new Promise<number>(async (res) => {
    const platformsCount = await Platforms.countDocuments({
      sessionId: sessionId,
    }).lean();
    res(platformsCount);
  });

  return { platformsPromise, messagesPromise, chatsPromise };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  try {
    const promiseStats = getDeferedData({
      sessionId: session._id,
    });

    return defer({
      ...promiseStats,
      assistantId: session?.assistantId,
      chatId: session?.mainChatId,
      shop: session._id,
      limitations: { ...session.limitationId },
      assistant: {
        assistantName: session?.assistantName,
        assistantPrompt: session?.assistantPrompt,
      },
    });
  } catch (error) {
    console.log("error", error);
    return {
      platformsPromise: null,
      chatsPromise: null,
      messagesPromise: null,
      limitations: { platforms: 0, chats: 0, requests: 0 },
      shop: session._id,
      chatId: null,
      assistantId: null,
      assistant: {},
    };
  }
};

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
