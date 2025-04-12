import { Schema, model, Document } from "mongoose";

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

export interface IPlatform extends Document {
  primaryApiKey: string;
  sessionId: string;
  name: string;
  integrationStatus: IntegrationStatus;
}

// 🔌 Platforms
const PlatformSchema = new Schema(
  {
    primaryApiKey: { type: String },
    sessionId: { type: String, required: true, ref: "Sessions" },
    name: { type: String, enum: PlatformName, required: true },
    integrationStatus: { type: String, enum: IntegrationStatus },
  },
  {
    timestamps: true,
    collection: "Platforms",
  }
);

export const Platforms = model("Platforms", PlatformSchema);
