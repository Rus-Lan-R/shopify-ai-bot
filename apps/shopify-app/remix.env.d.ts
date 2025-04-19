/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

import { Session } from "@shopify/shopify-app-remix/server";

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: { env: { NODE_ENV: "production" | "development" } };

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env extends HydrogenEnv {
    DATABASE_URL: string;
    OPENAI_API_KEY: string;
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module "@shopify/remix-oxygen" {
  export interface AppLoadContext {
    session: Session;
    env: Env;
  }
}
