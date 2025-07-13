import { Link, Outlet, useLoaderData, useNavigation } from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu, useAppBridge } from "@shopify/app-bridge-react";
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { boundary } from "@shopify/shopify-app-remix/server";
import { authenticate } from "app/shopify.server";
import { Frame, Spinner } from "@shopify/polaris";
import { useEffect } from "react";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const navigation = useNavigation();
  const isRouteChanging =
    navigation.state === "loading" &&
    navigation.location?.pathname !== location.pathname;

  useEffect(() => {
    shopify.loading(isRouteChanging);
  }, [isRouteChanging]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/chats">Chats</Link>
        <Link to="/app/integrations">Integrations</Link>
        <Link to="/app/assistant-settings">Settings</Link>
      </NavMenu>
      <Frame>
        {/* {isRouteChanging ? (
          <Box position={"absolute"} zIndex={"1000"}>
            <Loading />
          </Box>
        ) : null} */}
        <div
          style={{
            zIndex: 999,
            position: "fixed",
            inset: 0,
            backdropFilter: "blur(1.5px)",
            // backgroundColor: "rgba(128, 128, 128, 0.125)",
            alignItems: "center",
            justifyContent: "center",
            opacity: isRouteChanging ? 1 : 0,
            pointerEvents: isRouteChanging ? "auto" : "none",
            transition: "opacity 0.3s ease",
            display: "flex",
          }}
        >
          <Spinner size={"large"}></Spinner>
        </div>
        <Outlet />
      </Frame>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
