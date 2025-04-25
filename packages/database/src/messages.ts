import { IMessage, MessageRole } from "@internal/types";
import mongoose, { model, Schema } from "mongoose";

// 🗨️ Messages
const MessageSchema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, required: true, ref: "Chats" },
    sessionId: { type: String, required: true, ref: "Sessions" },
    platformId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Platforms",
    },
    role: { type: String, enum: MessageRole, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, collection: "Messages" }
);

export const Messages =
  mongoose.models?.Messages || model<IMessage>("Messages", MessageSchema);
