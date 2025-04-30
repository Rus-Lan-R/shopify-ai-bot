import { MessageRole } from "@internal/types";
import mongoose, { Schema, model } from "mongoose";

// 💬 Chat
const ChatSchema = new Schema(
  {
    threadId: { type: String, required: false },
    sessionId: { type: String, required: true, ref: "Sessions" },
    platformId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Platforms",
    },
    customerId: { type: String },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    externalChatId: { type: String },
    assistantRole: {
      type: String,
      enum: [MessageRole.ASSISTANT, MessageRole.MANAGER],
      default: MessageRole.ASSISTANT,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "Chats" }
);

export const Chats = mongoose?.models?.Chats || model("Chats", ChatSchema);
