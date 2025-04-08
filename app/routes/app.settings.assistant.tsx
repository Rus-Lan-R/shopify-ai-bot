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
import { useLoaderData, useSubmit } from "@remix-run/react";
import { createGraphqlRequest } from "app/api/graphql";
import { dataSync } from "app/modules/vectoreStoreSync";
import { FileTypes, VsFile } from "app/modules/openAi/openAi.interfaces";
import { assistantInit, assistantUpdate } from "app/modules/openAi/assistant";
import { CREATE_SCRIPT, DELETE_SCRIPT } from "app/api/scripts/scripts.gql";
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

  const shopSession = await db.session.findFirst({
    where: { id: session.id },
  });

  if (admin && shopSession) {
    switch (action) {
      case "init":
        try {
          const { assistantId, vectorStoreId, mainThreadId } =
            await assistantInit({
              shopId: session.id,
              assistantName,
              assistantPrompt,
            });
          let initAssistantFiles = Object.values(FileTypes).map((item) => ({
            type: item,
            fileId: "",
          }));

          const files = await Promise.all(
            initAssistantFiles.map((item) => {
              const promiseData = dataSync({
                vsId: vectorStoreId,
                type: item.type,
                shopId: session.id,
                vsFiles: initAssistantFiles,
                graphqlRequest,
              });
              return promiseData;
            }),
          );

          await db.session.update({
            where: { id: shopSession.session_id },
            data: {
              assistantName: assistantName || "",
              assistantPrompt: assistantPrompt || "",
              assistantVectorStoreId: vectorStoreId,
              welcomeMessage: welcomeMessage || "",
              assistantId,
              mainThreadId,
              assistantFiles: initAssistantFiles.map((item) => {
                const uploadedFileId = files.find(
                  (fileItem) => fileItem.newFile?.type === item.type,
                );
                return { ...item, fileId: uploadedFileId?.newFile?.fileId };
              }),
            },
          });
        } catch (error) {
          console.log(error);
        }
        break;
      case "update":
        try {
          const shop = await db.session.findUnique({
            where: { id: shopSession.session_id },
          });

          if (shop?.assistantId) {
            await assistantUpdate({
              assistantId: shop?.assistantId,
              assistantName,
              assistantPrompt,
            });
            await db.session.update({
              where: { id: shopSession.session_id },
              data: {
                assistantName: assistantName || "",
                assistantPrompt: assistantPrompt || "",
                welcomeMessage: welcomeMessage || "",
              },
            });
          }
        } catch (error) {
          console.log(error);
        }
        break;

      case "sync": {
        const shop = await db.session.findUnique({
          where: { id: shopSession.session_id },
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
              where: { id: shopSession.session_id },
              data: {
                assistantFiles: JSON.parse(JSON.stringify(updatedVsFiles)),
              },
            });
          }
        }

        break;
      }
      case "chat-init": {
        const response = await graphqlRequest(CREATE_SCRIPT, {
          input: {
            displayScope: "ALL",
            src: `${process.env.SHOPIFY_APP_URL}/chat.js`,
          },
        });
        console.log(response);
        break;
      }
      case "delete-script": {
        const scriptId = formData.get("scriptId");
        await graphqlRequest(DELETE_SCRIPT, {
          id: scriptId,
        });
        break;
      }

      default:
        break;
    }

    return {};
  }
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

  const onSyncData = (type: FileTypes) => {
    setLoadingSlug(type);
    const formData = new FormData();
    formData.append("action", "sync");
    formData.append("fileType", type);
    submit(formData, { method: "POST" });
  };

  console.log(mainTheme);
  return (
    <Page
      title="Settings"
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
                      name={"welcomeMessage"}
                      label="Welcome message"
                      autoComplete="on"
                      ariaExpanded={true}
                      multiline={2}
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
                        disabled={isLoading}
                        loading={checkIsLoading("main")}
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
                  Chat widget
                </Text>
                <Text as="p" variant="bodyMd">
                  Add an assistant to the store
                </Text>
              </BlockStack>
            </Box>
            <Card roundedAbove="sm">
              <BlockStack gap={"300"}>
                <InlineStack align={"space-between"}>
                  {assistant.id ? (
                    <Text as="p" variant="bodyMd">
                      Widget enabled
                    </Text>
                  ) : (
                    <Text as="p" variant="bodyMd">
                      Enable "AI Assistant widget" in the theme settings
                    </Text>
                  )}
                </InlineStack>
                <ButtonGroup>
                  <Button
                    disabled={isLoading || !assistant.id}
                    fullWidth={false}
                    variant={"primary"}
                    onClick={() => {
                      const id = mainTheme?.id.split("/").at(-1);
                      open(
                        `shopify:admin/themes/${id}/editor?context=apps`,
                        "_top",
                      );
                    }}
                  >
                    Enable widget
                  </Button>
                </ButtonGroup>
              </BlockStack>
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
                {files?.length ? (
                  files?.map((item, index) => (
                    <Box
                      borderColor={"input-border"}
                      key={`${item.type}-${item.fileId}`}
                    >
                      <BlockStack gap={"300"}>
                        {!!index && <Divider></Divider>}
                        <InlineStack align={"space-between"}>
                          <Text as={"p"}>
                            {firstLetterUpperCase(item.type)}
                          </Text>
                          <Badge tone={item.fileId ? "success" : "critical"}>
                            {item.fileId ? "Connected" : "Empty"}
                          </Badge>
                        </InlineStack>
                        <ButtonGroup>
                          <Button
                            variant={"primary"}
                            tone={"critical"}
                            disabled={!item.fileId || isLoading}
                          >
                            Delete
                          </Button>
                          <Button
                            disabled={isLoading}
                            loading={checkIsLoading(item.type)}
                            onClick={() => onSyncData(item.type)}
                          >
                            {item.fileId ? "Update" : "Sync"}
                          </Button>
                        </ButtonGroup>
                      </BlockStack>
                    </Box>
                  ))
                ) : (
                  <Text as="p" variant="bodyMd">
                    Fill in the block with "Assistant Settings"
                  </Text>
                )}
              </BlockStack>
            </Card>
          </InlineGrid>
        </BlockStack>
      </Box>
    </Page>
  );
}
