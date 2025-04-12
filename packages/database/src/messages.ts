import { model, Schema } from "mongoose";

export enum MessageRole {
  ASSISTANT = "assistant",
  USER = "user",
  MANAGER = "manager",
}
// 🗨️ Messages
const MessageSchema = new Schema(
  {
    chatId: { type: String, required: true, ref: "Chats" },
    direction: { type: String, enum: MessageRole, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, collection: "Messages" },
);

export const Messages = model("Messages", MessageSchema);
