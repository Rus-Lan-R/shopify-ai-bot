import mongoose, { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  _id: string;
  shop: string;
  accessToken: string;
  scope: string;
  isOnline: boolean;
  // ---------------------
  assistantId?: string;
  assistantName?: string;
  welcomeMessage?: string;
  assistantPrompt?: string;
  assistantVectorStoreId?: string;
  mainChatId?: string;
  assistantFiles: {};
  isDeleted: boolean;
}
// 🧠 Sessions
const SessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    shop: { type: String, required: true },
    accessToken: { type: String, required: true },
    scope: { type: String },
    isOnline: { type: Boolean, default: false },
    state: { type: String },
    expires: { type: Date },
    userId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    accountOwner: { type: Boolean, default: false },
    locale: { type: String },
    collaborator: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    assistantId: { type: String },
    assistantName: { type: String },
    welcomeMessage: { type: String },
    assistantPrompt: { type: String },
    assistantVectorStoreId: { type: String },
    mainChatId: { type: String },
    assistantFiles: { type: Schema.Types.Mixed },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "Sessions" }
);

export const Sessions =
  mongoose.models.Sessions || model("Sessions", SessionSchema);
