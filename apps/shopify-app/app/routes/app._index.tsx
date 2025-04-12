import type { LoaderFunctionArgs } from "@remix-run/node";
import { Box, Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { session };
};

export default function Index() {
  const { session } = useLoaderData<typeof loader>();
  console.log(session);
  return (
    <Page>
      <Box paddingBlockEnd={"3200"}>loged in</Box>
    </Page>
  );
}
