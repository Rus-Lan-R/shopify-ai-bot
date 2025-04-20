export enum IntegrationStatus {
  NEW = "NEW",
  ACTIVE = "ACTIVE",
  CONNECTING = "CONNECTING",
  DISCONNECTED = "DISCONNECTED",
}

export enum PlatformName {
  TELEGRAM = "Telegram",
  INSTAGRAM = "Instagram",
  WHATSAPP = "WhatsApp",
  WEBSITE = "Website",
}

export interface IPlatform {
  _id: string;
  primaryApiKey: string;
  sessionId: string;
  name: PlatformName;
  integrationStatus: IntegrationStatus;
}
