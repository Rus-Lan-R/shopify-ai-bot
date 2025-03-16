import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Button, Card, Form, Page, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "../components/form/FormInput";
import db from "../db.server";
import { formDataToObject } from "app/helpers/utils";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { assistantInit } from "app/services/openAi.server";
import { createGraphqlRequest } from "app/api/graphql";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const shopSession = await db.session.findFirst({
    where: { id: session.id },
  });

  return {
    assistant: {
      assistantName: shopSession?.assistantName,
      assistantPrompt: shopSession?.assistantPrompt,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const { action, assistantPrompt, assistantName } = formDataToObject(formData);
  const graphqlRequest = await createGraphqlRequest(request);
  if (admin) {
    switch (action) {
      case "init":
        console.log("create");
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
            },
          });
        } catch (error) {
          console.log(error);
        }

        break;

      case "products":
        break;

      default:
        break;
    }

    return {};
  }
};

export default function Index() {
  const { assistant } = useLoaderData<typeof loader>();
  const form = useForm({
    defaultValues: {
      ...assistant,
    },
  });
  const submit = useSubmit();
  const navigation = useNavigation();

  const onSubmit = form.handleSubmit((data) => {
    const formData = new FormData();
    formData.append("action", "init");
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    submit(formData, { method: "POST" });
  });

  const isLoading = navigation.state !== "idle";

  return (
    <Page>
      <Card roundedAbove="md">
        <Text as={"p"}>Assistant Settings</Text>
        <Form onSubmit={onSubmit}>
          <FormProvider {...form}>
            <FormInput
              name={"assistantName"}
              label="Assistant Name"
              autoComplete="on"
            />
            <FormInput
              name={"assistantPrompt"}
              label="Assistant Instruction"
              autoComplete="on"
              ariaExpanded={true}
            />
            <Button submit={true} loading={isLoading}>
              Create
            </Button>
          </FormProvider>
        </Form>
      </Card>
    </Page>
  );
}
