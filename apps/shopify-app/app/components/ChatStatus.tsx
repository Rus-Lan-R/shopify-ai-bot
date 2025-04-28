import { Badge, BlockStack, Box, Text, Tooltip } from "@shopify/polaris";
import { Progress, Tone } from "@shopify/polaris/build/ts/src/components/Badge";
import { ReactNode, useEffect, useState } from "react";
import {
  DisabledIcon,
  WifiIcon,
  ConnectIcon,
  RefreshIcon,
} from "@shopify/polaris-icons";
import { useWebsocket } from "app/websocket/useWebsocket";

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

export const ChatStatus = (props: {
  path: string;
  currentUser: string;
  onMessage: (data: string) => void;
}) => {
  const { path, currentUser, onMessage } = props;

  const [status, setStatus] = useState(ChatSocketStatus.OFFLINE);

  const { socket } = useWebsocket({
    path: path,
    onOpen: (ws) => {
      setStatus(ChatSocketStatus.CONNECTING);
    },
    onMessage: (e) => {
      let parsedData;
      try {
        parsedData = JSON.parse(e.data) as { type: string; users: string[] };
      } catch (error) {
        return;
      }

      switch (parsedData.type) {
        case "ONLINE_USERS":
          const onlineUsers = parsedData.users.filter(
            (item) => item !== currentUser,
          );

          if (onlineUsers.length) {
            setStatus(ChatSocketStatus.ONLINE);
          } else {
            setStatus(ChatSocketStatus.OFFLINE);
          }

          break;

        default:
          break;
      }
    },

    onClose: () => {
      setStatus(ChatSocketStatus.OFFLINE);
    },
  });

  useEffect(() => {
    if (socket) {
      setInterval(() => {
        socket.send(JSON.stringify({ type: "CHECK_ONLINE" }));
      }, 60 * 1000);
    }
  }, [socket]);

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
