import mongoose, { Schema, model } from "mongoose";

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

    // Assistant-related
    assistantId: { type: String },
    assistantName: { type: String },
    welcomeMessage: { type: String },
    assistantPrompt: { type: String },
    assistantVectorStoreId: { type: String },
    mainChatId: { type: String },
    assistantFiles: { type: mongoose.Schema.Types.Mixed },
    limitationId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Limitations",
    },
  },
  { timestamps: true, collection: "Sessions" }
);

export const Sessions =
  mongoose.models?.Sessions || model("Sessions", SessionSchema);
