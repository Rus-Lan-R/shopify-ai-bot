import {
  BlockStack,
  Box,
  Card,
  Icon,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { SkeletonIcon } from "@shopify/polaris-icons";
import { CircularProgress } from "./CircularProgress";
import { useMemo } from "react";
import styles from "./styles.module.css";

export const StatisticsCard = (props: {
  name: string;
  total: number;
  used: number;
}) => {
  const { total, used, name } = props;
  const progress = useMemo(() => {
    return Math.round((used * 100) / total);
  }, [used]);
  return (
    <Card padding={"400"}>
      <InlineStack gap={"400"} blockAlign={"center"} align={"center"}>
        <BlockStack gap={"500"} align={"center"}>
          <CircularProgress size={100} progress={progress} strokeWidth={10} />
        </BlockStack>
        <BlockStack gap={"200"}>
          <Text as="p" variant={"headingMd"}>
            {name}
          </Text>
          <BlockStack gap={"100"}>
            <InlineStack align={"start"} blockAlign={"center"} gap={"100"}>
              <div className={styles.icon}>
                <Icon source={SkeletonIcon} tone={"info"} />
              </div>
              <Text as={"p"}>{`Used: ${used}`}</Text>
            </InlineStack>
            <InlineStack align={"start"} blockAlign={"center"} gap={"100"}>
              <Box width={"fit-content"}>
                <Icon source={SkeletonIcon} tone={"base"} />
              </Box>
              <Text as={"p"}>{`Available: ${total - used}`}</Text>
            </InlineStack>
          </BlockStack>
        </BlockStack>
      </InlineStack>
    </Card>
  );
};
