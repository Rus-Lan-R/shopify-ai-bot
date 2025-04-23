import {
  Badge,
  Box,
  IndexTable,
  Page,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { PlatformName } from "../../../../packages/types/src";
import { useMemo } from "react";
import { Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import {
  LogoInstagramIcon,
  GlobeFilledIcon,
  SendIcon,
  MobileIcon,
} from "@shopify/polaris-icons";
import { localeTimeFormated } from "app/helpers/storeTime";
import type { loader } from "app/server/app.chats.server";
export { loader } from "app/server/app.chats.server";

const resourceName = {
  singular: "Chats",
  plural: "Chats",
};

const platformBadge: {
  [key in PlatformName]: {
    tone: Tone;
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  };
} = {
  [PlatformName.WEBSITE]: {
    tone: "attention",
    icon: GlobeFilledIcon,
  },
  [PlatformName.TELEGRAM]: {
    tone: "info",
    icon: SendIcon,
  },
  [PlatformName.INSTAGRAM]: {
    tone: "magic",
    icon: LogoInstagramIcon,
  },
  [PlatformName.WHATSAPP]: {
    tone: "success",
    icon: MobileIcon,
  },
};

export default function ChatsPage() {
  const { chats } = useLoaderData<typeof loader>();
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(chats);
  const navigate = useNavigate();

  const rowMarkup = useMemo(
    () =>
      chats?.map((chatItem, index) => {
        return (
          <IndexTable.Row
            id={chatItem._id}
            key={chatItem._id}
            selected={selectedResources.includes(chatItem._id)}
            position={index}
            onClick={() => {
              navigate(`/app/chats/${chatItem._id}`);
            }}
          >
            <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {chatItem._id}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                {...platformBadge?.[chatItem.platformId.name]}
                size={"large"}
              >
                {chatItem.platformId.name}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight={"regular"} as="span">
                {localeTimeFormated(chatItem.createdAt)}
              </Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Text variant="bodyMd" fontWeight={"regular"} as="span">
                {localeTimeFormated(chatItem.updatedAt)}
              </Text>
            </IndexTable.Cell>
          </IndexTable.Row>
        );
      }),
    [chats, selectedResources],
  );

  return (
    <Page
      title="Chat"
      backAction={{
        url: "/app",
      }}
    >
      <Box paddingBlockEnd={"3200"}>
        <IndexTable
          loading={false}
          resourceName={resourceName}
          itemCount={chats.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          hasZebraStriping={true}
          onSelectionChange={handleSelectionChange}
          // pagination={pagination}
          headings={[
            { title: "ChatId" },
            { title: "Platform" },
            { title: "Created at" },
            { title: "Last active" },
          ]}
        >
          {rowMarkup}
        </IndexTable>
      </Box>
    </Page>
  );
}
