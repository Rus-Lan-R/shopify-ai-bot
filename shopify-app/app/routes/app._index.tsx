import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Card, Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
};

export default function Index() {
  return (
    <Page>
      <Card></Card>
    </Page>
  );
}
