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
import { FormProvider, useForm } from "react-hook-form";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useLoading } from "app/helpers/useLoading";
import { FileTypes } from "app/modules/openAi/openAi.interfaces";
import { FormInput } from "app/components/form/FormInput";
import { firstLetterUpperCase } from "app/helpers/utils";
import type { SettingsLoaderType } from "app/server/app.assistant-settings.server";
export { loader, action } from "app/server/app.assistant-settings.server";

export default function Index() {
  const { assistant, files, mainTheme } = useLoaderData<SettingsLoaderType>();

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
