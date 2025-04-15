import mongoose, { model, Schema, Types } from "mongoose";

export enum MessageRole {
  ASSISTANT = "assistant",
  USER = "user",
  MANAGER = "manager",
}
// 🗨️ Messages
const MessageSchema = new Schema(
  {
    chatId: { type: String, required: true, ref: "Chats" },
    sessionId: { type: String, required: true, ref: "Sessions" },
    platformId: {
      type: String,
      required: false,
      ref: "Platforms",
    },
    direction: { type: String, enum: MessageRole, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, collection: "Messages" }
);

export const Messages =
  mongoose.models?.Messages || model("Messages", MessageSchema);
