import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Badge,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Card,
  Divider,
  Form,
  InlineGrid,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../components/form/FormInput";
import db from "../db.server";
import { firstLetterUpperCase, formDataToObject } from "app/helpers/utils";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { createGraphqlRequest } from "app/api/graphql";
import { dataSync } from "app/modules/vectoreStoreSync";
import { FileTypes, VsFile } from "app/modules/openAi/openAi.interfaces";
import { assistantInit, assistantUpdate } from "app/modules/openAi/assistant";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shopSession = await db.session.findFirst({
    where: { id: session.id },
  });

  return {
    files: shopSession?.assistantFiles as { type: FileTypes; fileId: string }[],
    assistant: {
      id: shopSession?.assistantId,
      assistantName: shopSession?.assistantName,
      assistantPrompt: shopSession?.assistantPrompt,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const { action, assistantPrompt, assistantName, fileType } =
    formDataToObject(formData);
  const graphqlRequest = await createGraphqlRequest(request);

  if (admin) {
    switch (action) {
      case "init":
        try {
          const { assistantId, vectorStoreId, mainThreadId } =
            await assistantInit({
              shopId: session.id,
              assistantName,
              assistantPrompt,
            });
          await db.session.update({
            where: { id: session.id },
            data: {
              assistantName,
              assistantPrompt,
              assistantVectorStoreId: vectorStoreId,
              assistantId,
              mainThreadId,
              assistantFiles: Object.values(FileTypes).map((item) => ({
                type: item,
                fileId: "",
              })),
            },
          });
        } catch (error) {
          console.log(error);
        }
        break;
      case "update":
        try {
          const shop = await db.session.findUnique({
            where: { id: session.id },
          });

          if (shop?.assistantId) {
            await assistantUpdate({
              assistantId: shop?.assistantId,
              assistantName,
              assistantPrompt,
            });
            await db.session.update({
              where: { id: session.id },
              data: {
                assistantName,
                assistantPrompt,
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
        break;

      case "sync": {
        const shop = await db.session.findUnique({
          where: { id: session.id },
        });

        if (fileType && shop?.assistantVectorStoreId) {
          const { updatedVsFiles } = await dataSync({
            vsId: shop.assistantVectorStoreId,
            type: fileType as FileTypes,
            shopId: shop.id,
            vsFiles: shop.assistantFiles as VsFile[],
            graphqlRequest,
          });
          if (!!updatedVsFiles?.length) {
            await db.session.update({
              where: { id: session.id },
              data: {
                assistantFiles: JSON.parse(JSON.stringify(updatedVsFiles)),
              },
            });
          }
        }

        break;
      }

      default:
        break;
    }

    return {};
  }
};

export default function Index() {
  const { assistant, files } = useLoaderData<typeof loader>();
  const form = useForm({
    defaultValues: {
      ...assistant,
    },
  });
  const submit = useSubmit();
  const navigation = useNavigation();

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("action", assistant.id ? "update" : "init");
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    submit(formData, { method: "POST" });
  });

  const onSyncData = (type: FileTypes) => {
    const formData = new FormData();
    formData.append("action", "sync");
    formData.append("fileType", type);
    submit(formData, { method: "POST" });
  };

  const isLoading = navigation.state !== "idle";

  return (
    <Page
      title="Settings"
      backAction={{
        url: "/app",
      }}
    >
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Assistant Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Give your assistant a name and instructions to define its
                personality and behavior. The name helps identify your
                assistant, while the instructions guide how it responds to
                users.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form onSubmit={onSubmit}>
              <FormProvider {...form}>
                <BlockStack gap={"400"}>
                  <FormInput
                    name={"assistantName"}
                    label="Name"
                    autoComplete="on"
                  />
                  <FormInput
                    name={"assistantPrompt"}
                    label="Instruction"
                    autoComplete="on"
                    ariaExpanded={true}
                    multiline={4}
                  />
                  <ButtonGroup>
                    <Button
                      submit={true}
                      loading={isLoading}
                      fullWidth={false}
                      variant={"primary"}
                    >
                      {assistant.id ? "Save" : "Create"}
                    </Button>
                  </ButtonGroup>
                </BlockStack>
              </FormProvider>
            </Form>
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
                Synchronized data
              </Text>
              <BlockStack gap={"200"}>
                <Text as="p" variant={"bodyMd"}>
                  Connect Files to Your AI Assistant Upload files to enhance
                  your assistant’s knowledge with Shopify store data.
                </Text>
                <Text as="p" variant="bodyMd">
                  Your assistant will use this data to provide accurate and
                  helpful responses to users. 🚀
                </Text>
              </BlockStack>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap={"400"}>
              {files?.map((item) => (
                <Box borderColor={"input-border"}>
                  <BlockStack gap={"300"}>
                    <InlineStack align={"space-between"}>
                      <Text as={"p"}>{firstLetterUpperCase(item.type)}</Text>
                      <Badge tone={item.fileId ? "success" : "critical"}>
                        {item.fileId ? "Connected" : "Empty"}
                      </Badge>
                    </InlineStack>
                    <ButtonGroup>
                      <Button variant={"primary"} tone={"critical"}>
                        Delete
                      </Button>
                      <Button onClick={() => onSyncData(item.type)}>
                        Sync
                      </Button>
                    </ButtonGroup>
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
