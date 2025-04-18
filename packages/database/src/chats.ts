import mongoose, { Schema, model } from "mongoose";

export interface IChat {
  _id: string;
  sessionId: string;
  platformId: string;
  customerId: string;
  isArchived: boolean;
  isDeleted: boolean;
  externalChatId: string;
  createdAt: Date;
  updatedAt: Date;
}
// 💬 Chat
const ChatSchema = new Schema(
  {
    _id: { type: String, required: true },
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "Chats" }
);

export const Chats = mongoose?.models?.Chats || model("Chats", ChatSchema);
