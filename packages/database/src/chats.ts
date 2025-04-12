import { Schema, Types, model } from "mongoose";

// 💬 Chat
const ChatSchema = new Schema(
  {
    _id: { type: String, required: true },
    sessionId: { type: String, required: true, ref: "Sessions" },
    customerId: { type: String },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    externalChatId: { type: String },
    platformId: { type: Types.ObjectId, required: true, ref: "Platforms" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "Chats" }
);

export const Chats = model("Chats", ChatSchema);
