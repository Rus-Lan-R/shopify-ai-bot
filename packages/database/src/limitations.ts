import { ILimitation } from "@internal/types";
import mongoose, { Schema, model } from "mongoose";

// 🔌 Platforms
const LimitationsSchema = new Schema<ILimitation>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    chats: { type: Number, required: true },
    platforms: { type: Number, required: true },
    requests: { type: Number, required: true },
  },
  {
    timestamps: false,
    collection: "Limitations",
  }
);

export const Limitations =
  mongoose.models?.Limitations || model("Limitations", LimitationsSchema);
