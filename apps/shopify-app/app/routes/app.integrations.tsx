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
import { WhatsAppFormIntegration } from "app/components/integrations/WhatsAppFormIntegration";
import { useMemo } from "react";
import { Platform, PlatformName } from "@prisma/client";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const platforms = await db.platform.findMany({
    where: { sessionId: session?.id },
  });

  return {
    platforms,
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

  const shopSession = await db.session.findFirst({
    where: { id: session.id },
  });

  if (!shopSession) {
    throw { message: "Session not found" };
  }

  switch (action) {
    case "init-platform":
      const platformModule = await db.platform.findFirst({
        where: { sessionId: shopSession?.id, name: platformName },
      });

      if (!platformModule) {
        await db.platform.create({
          data: {
            name: platformName as PlatformName,
            sessionId: shopSession?.id,
            primaryApiKey: primaryApiKey,
            integrationStatus: status,
          },
        });
      } else {
        await db.platform.update({
          where: {
            id: platformModule.id,
          },
          data: {
            primaryApiKey: primaryApiKey,
            integrationStatus: status,
          },
        });
      }
      break;

    case "toggle-connect":
      await db.platform.updateMany({
        where: {
          name: platformName,
          sessionId: shopSession.id,
        },
        data: {
          integrationStatus: status,
        },
      });

      break;

    default:
      break;
  }

  return {};
};

// const availablePlatforms: PlatformName[] = [
//   PlatformName.Telegram,
//   PlatformName.WhatsApp,
// ];

export default function Index() {
  const { platforms } = useLoaderData<typeof loader>();

  const platformsBySlug = useMemo(() => {
    return platforms.reduce<Partial<{ [key in PlatformName]: Platform }>>(
      (acc, item) => {
        return { ...acc, [item.name]: item };
      },
      {},
    );
  }, [platforms]);

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
                primaryApiKey={platformsBySlug?.Telegram?.primaryApiKey}
                status={platformsBySlug?.Telegram?.integrationStatus!}
              />
            </Card>
          </InlineGrid>
          <Divider />
          <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
            <Box
              as="section"
              paddingInlineStart={{ xs: "400", sm: "0" }}
              paddingInlineEnd={{ xs: "400", sm: "0" }}
            >
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  WhatsApp
                </Text>
                <Text as="p" variant="bodyMd">
                  Interation with WhatsApp chatbot
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <WhatsAppFormIntegration
                status={platformsBySlug?.WhatsApp?.integrationStatus!}
                primaryApiKey={platformsBySlug.WhatsApp?.primaryApiKey}
              />
            </Card>
          </InlineGrid>
        </BlockStack>
      </Box>
    </Page>
  );
}
