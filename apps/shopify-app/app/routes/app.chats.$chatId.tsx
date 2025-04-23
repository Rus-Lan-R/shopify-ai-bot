import { useLoaderData } from "@remix-run/react";
import { Box, Page } from "@shopify/polaris";
import { ManagersChat } from "app/packages/ManagersChat";
import type { loader } from "app/server/app.chats.$chat.server";
export { loader } from "app/server/app.chats.$chat.server";

export default function ChatDetailsPage() {
  const { messages } = useLoaderData<typeof loader>();
  return (
    <Page
      title="Chat details"
      backAction={{
        url: "/app/chats",
      }}
    >
      <Box paddingBlockEnd={"3200"}>
        <ManagersChat messages={messages} />
      </Box>
    </Page>
  );
}
