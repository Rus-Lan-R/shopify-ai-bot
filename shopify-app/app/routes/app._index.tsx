import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  BlockStack,
  Button,
  Card,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { ChatBot } from "app/packages/ChatBot";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  return (
    <Page>
      <BlockStack gap={"300"}>
        <Card padding={"500"}>
          <InlineStack gap={"500"} blockAlign={"center"}>
            <Text as={"p"}>Assistant</Text>
            <Button fullWidth={false} url={"/app/settings/assistance"}>
              Edit
            </Button>
          </InlineStack>
        </Card>
        <Card padding={"500"}>
          <Text as={"p"}>Whats up</Text>
        </Card>
        <Card padding={"500"}>
          <Text as={"p"}>Telegram</Text>
        </Card>

        <ChatBot></ChatBot>
      </BlockStack>
    </Page>
  );
}
