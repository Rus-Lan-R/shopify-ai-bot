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
import { Limitations, Sessions } from "../../../../packages/database/src";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { createGraphqlRequest } from "app/api/graphql";
import { FileTypes, VsFile } from "app/modules/openAi/openAi.interfaces";
import { ExtendedSession } from "app/modules/sessionStorage";
import { getMainTheme } from "app/modules/themes/getThemes";
import { authenticate } from "app/shopify.server";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "app/components/form/FormInput";
import { CREATE_SCRIPT, DELETE_SCRIPT } from "app/api/scripts/scripts.gql";
import { dataSync } from "app/modules/vectoreStoreSync";
import { getShopInfo } from "app/modules/shop/getShopInfo";
import { assistantInit, assistantUpdate } from "app/modules/openAi/assistant";
import { ILimitation } from "../../../../packages/types/src";
import { firstLetterUpperCase, formDataToObject } from "app/helpers/utils";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useLoading } from "app/helpers/useLoading";

export type SettingsLoaderType = typeof loader;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  const graphqlRequest = await createGraphqlRequest(request);

  const shopSession = await Sessions.findById(session._id);

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
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;
  const { admin } = authData;

  const formData = await request.formData();
  const { action, assistantPrompt, assistantName, welcomeMessage, fileType } =
    formDataToObject(formData);
  const graphqlRequest = await createGraphqlRequest(request);

  if (admin && session._id) {
    switch (action) {
      case "init":
        try {
          const { assistantId, vectorStoreId, mainChatId } =
            await assistantInit({
              shopSession: session,
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
                shopId: session._id,
                vsFiles: initAssistantFiles,
                graphqlRequest,
              });
              return promiseData;
            }),
          );

          const shopData = await getShopInfo({ graphqlRequest });
          const isDevStore = !!shopData.shopInfo.shop.plan.partnerDevelopment;
          const limitation = await Limitations.findOne<ILimitation>(
            isDevStore ? { slug: "dev" } : { slug: "base" },
          );
          console.log(limitation?._id);

          await Sessions.updateOne(
            { _id: session._id },
            {
              assistantName: assistantName || "",
              assistantPrompt: assistantPrompt || "",
              assistantVectorStoreId: vectorStoreId,
              welcomeMessage: welcomeMessage || "",
              assistantId,
              mainChatId,
              isDevStore: isDevStore,
              assistantFiles: initAssistantFiles.map((item) => {
                const uploadedFileId = files.find(
                  (fileItem) => fileItem.newFile?.type === item.type,
                );
                return { ...item, fileId: uploadedFileId?.newFile?.fileId };
              }),
              limitationId: limitation?._id,
            },
          );
        } catch (error) {
          console.log(error);
        }
        break;
      case "update":
        try {
          if (session._id && !!session?.assistantId) {
            const shopData = await getShopInfo({ graphqlRequest });

            const isDevStore = !!shopData.shopInfo.shop.plan.partnerDevelopment;
            const limitation = await Limitations.findOne<ILimitation>(
              isDevStore ? { slug: "dev" } : { slug: "base" },
            ).lean();
            console.log(limitation?._id);
            await assistantUpdate({
              assistantId: session.assistantId,
              assistantName,
              assistantPrompt,
            });

            await Sessions.updateOne(
              { _id: session._id },
              {
                isDevStore: !!shopData.shopInfo.shop.plan.partnerDevelopment,
                assistantName: assistantName || "",
                assistantPrompt: assistantPrompt || "",
                welcomeMessage: welcomeMessage || "",
                limitationId: limitation?._id,
              },
            );
          }
        } catch (error) {
          console.log(error);
        }
        break;

      case "sync": {
        if (fileType && session?.assistantVectorStoreId) {
          const { updatedVsFiles } = await dataSync({
            vsId: session?.assistantVectorStoreId,
            type: fileType as FileTypes,
            shopId: session._id,
            vsFiles: session.assistantFiles as VsFile[],
            graphqlRequest,
          });
          if (!!updatedVsFiles?.length) {
            await Sessions.updateOne(
              { _id: session._id },
              {
                assistantFiles: JSON.parse(JSON.stringify(updatedVsFiles)),
              },
            );
          }
        }

        break;
      }
      case "chat-init": {
        await graphqlRequest(CREATE_SCRIPT, {
          input: {
            displayScope: "ALL",
            src: `${process.env.SHOPIFY_APP_URL}/chat.js`,
          },
        });

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

export default function SetingsPage() {
  const { assistant, mainTheme, files } = useLoaderData<typeof loader>();

  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<
    string | "widget" | "main"
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

  const onSyncData = (type: string) => {
    setLoadingSlug(type);
    const formData = new FormData();
    formData.append("action", "sync");
    formData.append("fileType", type);
    submit(formData, { method: "POST" });
  };

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
