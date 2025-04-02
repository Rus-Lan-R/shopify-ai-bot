import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineGrid,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import { useLoaderData } from "@remix-run/react";
import { TelegramFormIntegrations } from "app/components/integrations/TelegramFormIntegration";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const telegramPlatform = await db.platform.findFirst({
    where: { sessionId: session.id, name: "Telegram" },
  });

  return {
    telegram: {
      name: telegramPlatform?.name,
      isEnabled: telegramPlatform?.isEnabled,
      primaryApiKey: telegramPlatform?.primaryApiKey,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const {
    action,
    primaryApiKey,
    platform: platformName,
    status,
  } = formDataToObject(formData);

  switch (action) {
    case "init-telegram":
      const telegramPlatform = await db.platform.findFirst({
        where: { sessionId: session.id, name: "Telegram" },
      });

      if (!telegramPlatform) {
        await db.platform.create({
          data: {
            sessionId: session.id,
            name: "Telegram",
            primaryApiKey: primaryApiKey,
          },
        });
      } else {
        await db.platform.update({
          where: {
            id: telegramPlatform.id,
          },
          data: {
            primaryApiKey: primaryApiKey,
          },
        });
      }
      break;

    case "toggle-connect":
      console.log(status);
      await db.platform.updateMany({
        where: {
          name: platformName,
          sessionId: session.id,
        },
        data: {
          isEnabled: status === "connect" ? true : false,
        },
      });

      break;

    default:
      break;
  }

  return {};
};

export default function Index() {
  const { telegram } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Integrations"
      backAction={{
        url: "/app",
      }}
    >
      <Box paddingBlockEnd={"3200"}>
        <BlockStack gap={{ xs: "800", sm: "400" }}>
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  Telegram
                </Text>
                <Text as="p" variant="bodyMd">
                  Interation with Telegram chatbot
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <TelegramFormIntegrations
                primaryApiKey={telegram.primaryApiKey}
                isEnabled={telegram.isEnabled}
              />
            </Card>
          </InlineGrid>
          <Divider />
        </BlockStack>
      </Box>
    </Page>
  );
}
