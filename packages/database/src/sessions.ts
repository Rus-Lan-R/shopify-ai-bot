import mongoose, { Schema, model, Document } from "mongoose";

export interface ISession extends Document {
  _id: string;
  shop: string;
  accessToken: string;
  scope: string;
  isOnline: boolean;
  state: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  accountOwner: boolean;
  locale: string;
  collaborator: boolean;
  emailVerified: boolean;
  isDevStore: boolean;
  openaiApiKey?: string;

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
    state: { type: String, required: true, default: "active" },
    isOnline: { type: Boolean, default: false },
    isDevStore: { type: Boolean },
    scope: { type: String },
    accessToken: { type: String, required: true },
    expires: { type: Date, default: null },

    // Shopify Admin user fields (optional)
    userId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    accountOwner: { type: Boolean, default: false },
    locale: { type: String },
    collaborator: { type: Boolean },
    emailVerified: { type: Boolean },

    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

    // Assistant-related (опционально)
    assistantId: { type: String },
    assistantName: { type: String },
    welcomeMessage: { type: String },
    assistantPrompt: { type: String },
    assistantVectorStoreId: { type: String },
    mainChatId: { type: String },
    assistantFiles: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: "Sessions" }
);

export const Sessions =
  mongoose.models?.Sessions || model("Sessions", SessionSchema);
