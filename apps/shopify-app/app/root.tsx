import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Sprite from "./components/SpriteIcon/Sprite";
import { LoaderFunctionArgs } from "@remix-run/node";

export type RootLoader = typeof loader;
export async function loader({ request }: LoaderFunctionArgs) {
  return {
    ENV: {
      WS_URL: process.env.WS_URL,
    },
  };
}

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <div
          style={{
            width: 0,
            height: 0,
            overflow: "hidden",
            visibility: "hidden",
          }}
        >
          <Sprite />
        </div>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
