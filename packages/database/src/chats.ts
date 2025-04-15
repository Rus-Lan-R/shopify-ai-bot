import mongoose, { Schema, Types, model } from "mongoose";

// 💬 Chat
const ChatSchema = new Schema(
  {
    _id: { type: String, required: true },
    sessionId: { type: String, required: true, ref: "Sessions" },
    platformId: { type: String, required: true, ref: "Platforms" },
    customerId: { type: String },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    externalChatId: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "Chats" }
);

export const Chats = mongoose?.models?.Chats || model("Chats", ChatSchema);
