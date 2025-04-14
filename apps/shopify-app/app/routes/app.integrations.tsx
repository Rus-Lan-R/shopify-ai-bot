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

import { useLoaderData } from "@remix-run/react";

import { useMemo } from "react";
import { IPlatform, PlatformName, Platforms } from "@internal/database";
import { formDataToObject } from "../helpers/utils";
import { TelegramFormIntegrations } from "../components/integrations/TelegramFormIntegration";
import { WhatsAppFormIntegration } from "../components/integrations/WhatsAppFormIntegration";
import { ExtendedSession } from "app/modules/sessionStorage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const platforms = await Platforms.find({ sessionId: session?._id });

  return {
    platforms,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const formData = await request.formData();
  const {
    action,
    primaryApiKey,
    platform: platformName,
    status,
  } = formDataToObject(formData);

  switch (action) {
    case "init-platform":
      const platformModule = await Platforms.findOne({
        sessionId: session?._id,
        name: platformName,
      });

      if (!platformModule) {
        await Platforms.create({
          name: platformName,
          sessionId: session?._id,
          primaryApiKey: primaryApiKey,
          integrationStatus: status,
        });
      } else {
        await Platforms.updateOne(
          {
            id: platformModule._id,
          },
          {
            primaryApiKey: primaryApiKey,
            integrationStatus: status,
          },
        );
      }
      break;

    case "toggle-connect":
      await Platforms.updateOne(
        {
          name: platformName,
          sessionId: session._id,
        },
        {
          integrationStatus: status,
        },
      );

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
    return platforms.reduce<Partial<{ [key in PlatformName]: IPlatform }>>(
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
