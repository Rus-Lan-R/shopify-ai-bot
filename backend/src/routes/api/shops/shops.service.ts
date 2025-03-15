import { Schema, model } from "mongoose";

export interface ISimpleUser {
  _id: number;
  firstName: string;
  lastName: string;
  photoUrl: string;
}
export interface IUser {
  _id: number;
  firstName: string;
  lastName: string;
  username: string;
  tgId: number;
  photoUrl: string;
  languageCode: string;
  role: string;
  pixelCoins: number;
  referrals: ISimpleUser[];
}

const userSchema = new Schema<IUser>(
  {
    tgId: { type: Number, required: true },
    role: { type: String, required: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    photoUrl: { type: String },
    languageCode: { type: String },
    pixelCoins: { type: Number, default: 100 },
    referrals: [{ type: Schema.Types.ObjectId, ref: "Users" }],
  },
  { timestamps: true }
);

export const Users = model<IUser>("Users", userSchema);
