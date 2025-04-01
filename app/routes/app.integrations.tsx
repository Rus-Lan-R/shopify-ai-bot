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
import { useForm } from "react-hook-form";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { createGraphqlRequest } from "app/api/graphql";
import { FileTypes } from "app/modules/openAi/openAi.interfaces";
import { useLoading } from "app/helpers/useLoading";
import { getMainTheme } from "app/modules/themes/getThemes";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const graphqlRequest = await createGraphqlRequest(request);

  const shopSession = await db.session.findFirst({
    where: { id: session.id },
  });

  const { mainTheme } = await getMainTheme({ graphqlRequest });
  return {
    files: shopSession?.assistantFiles as { type: FileTypes; fileId: string }[],
    mainTheme,
    assistant: {
      id: shopSession?.assistantId,
      assistantName: shopSession?.assistantName,
      welcomeMessage: shopSession?.welcomeMessage,
      assistantPrompt: shopSession?.assistantPrompt,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const { action, assistantPrompt, assistantName, welcomeMessage, fileType } =
    formDataToObject(formData);
  const graphqlRequest = await createGraphqlRequest(request);

  return {};
};

export default function Index() {
  const { assistant, files, mainTheme } = useLoaderData<typeof loader>();
  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<
    FileTypes | "widget" | "main"
  >();
  const form = useForm({
    defaultValues: {
      ...assistant,
    },
  });
  const submit = useSubmit();

  const onSubmit = form.handleSubmit((data) => {
    setLoadingSlug("main");
    const formData = new FormData();
    formData.append("action", assistant.id ? "update" : "init");
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    submit(formData, { method: "POST" });
  });

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
            <Card roundedAbove="sm"></Card>
          </InlineGrid>
          <Divider />
        </BlockStack>
      </Box>
    </Page>
  );
}
