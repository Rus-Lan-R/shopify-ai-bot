import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  BlockStack,
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
    const shopAssistant = await db.session.findUnique({
      where: { id: session.id },
    });

    return {
      assistantId: shopAssistant?.assistantId,
    };
  } catch (error) {
    return { assistantId: null };
  }
};

export default function Index() {
  const { assistantId } = useLoaderData<typeof loader>();
  return (
    <Page>
      <BlockStack gap={"300"}>
        {assistantId ? (
          <>
            <Card padding={"300"}>
              <InlineStack
                gap={"500"}
                blockAlign={"center"}
                align={"space-between"}
              >
                <Text as={"h2"} variant={"headingSm"}>
                  Assistant
                </Text>
                <Button fullWidth={false} url={"/app/settings/assistant"}>
                  Edit
                </Button>
              </InlineStack>
            </Card>

            <ChatBot></ChatBot>
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
    </Page>
  );
}
