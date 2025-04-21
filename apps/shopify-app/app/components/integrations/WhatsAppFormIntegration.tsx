import { FormProvider, useForm } from "react-hook-form";
import { BlockStack, Button, ButtonGroup, Form } from "@shopify/polaris";
import { useSubmit } from "@remix-run/react";
import { useLoading } from "app/helpers/useLoading";
import qrcode from "qrcode";
import { useEffect, useState } from "react";
import {
  IntegrationStatus,
  PlatformName,
} from "../../../../../packages/types/src";

export const WhatsAppFormIntegration = (props: {
  primaryApiKey?: string | null;
  status: IntegrationStatus;
  isDisabled: boolean;
}) => {
  const { isLoading, checkIsLoading, setLoadingSlug } = useLoading<
    "whatsapp" | "whatsapp-connection"
  >();
  const submit = useSubmit();
  const { isDisabled, primaryApiKey, status } = props;
  const [qrCode, setQrCode] = useState<string>();
  const form = useForm({});

  const onSubmit = form.handleSubmit(() => {
    setLoadingSlug("whatsapp");
    const fomrData = new FormData();
    fomrData.append("action", "init-platform");
    fomrData.append("platform", PlatformName.WHATSAPP);
    fomrData.append("status", IntegrationStatus.NEW);
    submit(fomrData, { method: "POST" });
  });

  const handleDisconnect = () => {
    setLoadingSlug("whatsapp-connection");
    const fomrData = new FormData();
    fomrData.append("action", "toggle-connect");
    fomrData.append("platform", PlatformName.WHATSAPP);
    fomrData.append(
      "status",
      status === IntegrationStatus.ACTIVE
        ? IntegrationStatus.DISCONNECTED
        : IntegrationStatus.ACTIVE,
    );
    submit(fomrData, { method: "POST" });
  };

  useEffect(() => {
    if (primaryApiKey) {
      (async () => {
        try {
          const dataUrlQrCode = await qrcode.toDataURL(primaryApiKey, {
            margin: 0,
            width: 200,
          });
          setQrCode(dataUrlQrCode);
        } catch (error) {
        } finally {
        }
      })();
    }
  }, [primaryApiKey]);

  return (
    <Form onSubmit={onSubmit}>
      <FormProvider {...form}>
        <BlockStack gap={"400"}>
          {!!qrCode && (
            <img src={qrCode} width={200} height={200} alt={"qr code"} />
          )}
          <ButtonGroup>
            {status &&
            [IntegrationStatus.ACTIVE, IntegrationStatus.DISCONNECTED].includes(
              status,
            ) ? (
              <Button
                disabled={isLoading}
                loading={checkIsLoading("whatsapp-connection")}
                fullWidth={false}
                variant={"secondary"}
                onClick={handleDisconnect}
              >
                {status === IntegrationStatus.ACTIVE ? "Disable" : "Enable"}
              </Button>
            ) : (
              <Button
                submit={true}
                disabled={
                  isDisabled ||
                  isLoading ||
                  status === IntegrationStatus.CONNECTING
                }
                loading={checkIsLoading("whatsapp")}
                fullWidth={false}
                variant={"primary"}
              >
                {status === IntegrationStatus.CONNECTING
                  ? "Connecting"
                  : "Connect"}
              </Button>
            )}
          </ButtonGroup>
        </BlockStack>
      </FormProvider>
    </Form>
  );
};
