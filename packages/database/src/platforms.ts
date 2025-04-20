import mongoose, { Schema, model } from "mongoose";
import { IPlatform, PlatformName, IntegrationStatus } from "@internal/types";

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
