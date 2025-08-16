import mongoose, { Schema, model } from "mongoose";
import type { IPlatform } from "@internal/types";
import { PlatformName, IntegrationStatus } from "@internal/const";

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
