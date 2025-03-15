import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Button, Card, Form, Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { FormProvider, useForm } from "react-hook-form";
import { FormInput } from "shopify-app/app/components/form/FormInput";
import db from "../db.server";
import { useFetcher } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // const data = await db.session.findMany({ where: { shop: session.shop } });

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
};

export default function Index() {
  const form = useForm();
  const fetcher = useFetcher();
  const handleCreate = () => {
    fetcher.submit("/api/ai/initAssistant");
  };
  return (
    <Page>
      <Card roundedAbove="md">
        Assistant Settings
        <Form onSubmit={() => {}}>
          <FormProvider {...form}>
            <FormInput name={"assistantName"} label="Name" autoComplete="on" />
          </FormProvider>
          <Button onClick={handleCreate}>Create</Button>
        </Form>
      </Card>
    </Page>
  );
}
