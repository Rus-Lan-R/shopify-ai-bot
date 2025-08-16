import { PlatformName, IntegrationStatus } from "@internal/const";
export interface IPlatform {
  _id: string;
  primaryApiKey: string;
  sessionId: string;
  name: PlatformName;
  integrationStatus: IntegrationStatus;
}
