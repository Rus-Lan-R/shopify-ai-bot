import { BlockStack, Card } from "@shopify/polaris";

export const Stats = (props: {
  name: string;
  used: string;
  available: string;
}) => {
  return (
    <Card padding={"300"}>
      <BlockStack gap={"500"} align={"center"}>
        <div></div>
      </BlockStack>
    </Card>
  );
};
