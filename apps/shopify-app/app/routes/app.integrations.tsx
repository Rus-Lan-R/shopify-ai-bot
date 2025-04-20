import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineGrid,
  Page,
  Text,
} from "@shopify/polaris";
import { useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { IPlatform, PlatformName } from "@internal/types";
import { TelegramFormIntegrations } from "app/components/integrations/TelegramFormIntegration";
import { WhatsAppFormIntegration } from "app/components/integrations/WhatsAppFormIntegration";
import type { loader } from "app/routes/app.integrations.server";
export { loader, action } from "app/routes/app.integrations.server";

export default function Index() {
  const { platforms, isNewDisabled } = useLoaderData<typeof loader>();

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
                isDisabled={!!isNewDisabled}
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
                isDisabled={!!isNewDisabled}
                status={platformsBySlug?.WhatsApp?.integrationStatus!}
                primaryApiKey={platformsBySlug.WhatsApp?.primaryApiKey}
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
                  Instagram
                </Text>
                <Text as="p" variant="bodyMd">
                  Interation with Instagram chatbot
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <Text as={"p"} variant={"headingLg"} fontWeight={"regular"}>
                Coming soon
              </Text>
            </Card>
          </InlineGrid>
        </BlockStack>
      </Box>
    </Page>
  );
}
