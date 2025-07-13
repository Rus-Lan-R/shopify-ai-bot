import { Badge, BlockStack, Box, Text, Tooltip } from "@shopify/polaris";
import { Progress, Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { ReactNode } from "react";
import {
  DisabledIcon,
  WifiIcon,
  ConnectIcon,
  RefreshIcon,
} from "@shopify/polaris-icons";

export const enum ChatSocketStatus {
  ONLINE = "ONLINE",
  CONNECTING = "CONNECTING",
  OFFLINE = "OFFLINE",
  RECONNECTING = "RECONNECTING",
}

const OnlineInfo = () => (
  <BlockStack>
    <Text as="p" variant={"bodyMd"} alignment={"center"}>
      User is online
    </Text>
  </BlockStack>
);

const OffLine = () => (
  <Box>
    <Text as="p" variant={"bodyMd"}>
      The user is offline now
    </Text>
  </Box>
);

const websocketStatusMap: {
  [key in ChatSocketStatus]: {
    tone: Tone;
    progress: Progress;
    text: string;
    icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    tooltip?: ReactNode;
  };
} = {
  [ChatSocketStatus.ONLINE]: {
    tone: "success-strong",
    progress: "complete",
    text: "Online",
    icon: WifiIcon,
    tooltip: <OnlineInfo />,
  },
  [ChatSocketStatus.OFFLINE]: {
    tone: "new",
    progress: "incomplete",
    text: "Offline",
    icon: DisabledIcon,
    tooltip: <OffLine />,
  },
  [ChatSocketStatus.CONNECTING]: {
    tone: "magic",
    progress: "partiallyComplete",
    text: "Connecting",
    icon: ConnectIcon,
  },
  [ChatSocketStatus.RECONNECTING]: {
    tone: "info-strong",
    progress: "partiallyComplete",
    text: "Reconnecting",
    icon: RefreshIcon,
  },
};

export const ChatStatus = (props: { status: ChatSocketStatus }) => {
  const { status } = props;

  return (
    <Tooltip
      active
      preferredPosition={"above"}
      content={
        websocketStatusMap?.[status].tooltip ||
        websocketStatusMap?.[status]?.text
      }
    >
      <Badge
        {...websocketStatusMap[status]}
        size={"large"}
        progress={undefined}
      >
        {websocketStatusMap?.[status]?.text}
      </Badge>
    </Tooltip>
  );
};
