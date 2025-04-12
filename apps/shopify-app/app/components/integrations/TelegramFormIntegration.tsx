import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../form/FormInput";
import { BlockStack, Button, ButtonGroup, Form } from "@shopify/polaris";
import { useSubmit } from "@remix-run/react";
import { useLoading } from "app/helpers/useLoading";
import { IntegrationStatus } from "@prisma/client";

export const TelegramFormIntegrations = (props: {
  primaryApiKey?: string | null;
  status?: IntegrationStatus;
}) => {
  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<
    "telegram" | "telegram-connection"
  >();
  const submit = useSubmit();
  const { primaryApiKey, status } = props;

  const form = useForm({
    defaultValues: {
      primaryApiKey: primaryApiKey || "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setLoadingSlug("telegram");
    const fomrData = new FormData();
    fomrData.append("action", "init-platform");
    fomrData.append("platform", "Telegram");
    fomrData.append("status", "ACTIVE");
    Object.entries(data).forEach(([key, value]) => {
      fomrData.append(key, String(value));
    });
    submit(fomrData, { method: "POST" });
  });

  const handleDisconnect = () => {
    setLoadingSlug("telegram-connection");
    const fomrData = new FormData();
    fomrData.append("action", "toggle-connect");
    fomrData.append("platform", "Telegram");
    fomrData.append("status", status === "ACTIVE" ? "DISCONNECTED" : "ACTIVE");
    submit(fomrData, { method: "POST" });
  };
  return (
    <Form onSubmit={onSubmit}>
      <FormProvider {...form}>
        <BlockStack gap={"400"}>
          <FormInput
            name={"primaryApiKey"}
            label="Telegram bot api key"
            autoComplete="off"
          />
          <ButtonGroup>
            {primaryApiKey ? (
              <Button
                disabled={isLoading}
                loading={checkIsLoading("telegram-connection")}
                fullWidth={false}
                variant={"secondary"}
                onClick={handleDisconnect}
              >
                {status === "ACTIVE" ? "Disconnect" : "Connect"}
              </Button>
            ) : (
              <></>
            )}
            <Button
              submit={true}
              disabled={isLoading}
              loading={checkIsLoading("telegram")}
              fullWidth={false}
              variant={"primary"}
            >
              {primaryApiKey ? "Update" : "Connect"}
            </Button>
          </ButtonGroup>
        </BlockStack>
      </FormProvider>
    </Form>
  );
};
