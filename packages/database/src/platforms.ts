import mongoose, { Schema, model } from "mongoose";

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

// 🔌 Platforms
const PlatformSchema = new Schema<IPlatform>(
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

export const Platforms =
  mongoose.models?.Platforms || model("Platforms", PlatformSchema);
