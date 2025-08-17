import { Box, CalloutCard, Text } from "@shopify/polaris";

export const InfoCard = () => {
  return (
    <CalloutCard
      title="🚧 App Still in Development 🚧"
      illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
      primaryAction={{
        content: "Send Request",
        url: "mailto:ruslan.rodionow98@gmail.com?subject=ChatPilot AI Improvements",
        target: "_blank",
      }}
    >
      <Box maxWidth={"70%"}>
        <Text as={"p"}>
          Some features are not available yet, but we’re working on it! If you
          need any improvements or fixes, just send me an email, and I’ll take
          care of it within 2 days.
          <br />
          <br />✨ For our first customers, the app will stay free forever with
          unlimited functionality. <br /> 💡 You’ll also have a direct influence
          on how the app grows — your feedback will help shape the future
          features!
        </Text>
      </Box>
    </CalloutCard>
  );
};
