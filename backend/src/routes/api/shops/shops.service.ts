import { Schema, model } from "mongoose";

export interface IShop {
  _id: number;
  shop: string;
}

const shopSchema = new Schema<IShop>(
  {
    shop: { type: String, required: true },
  },
  { timestamps: true }
);

export const Shops = model<IShop>("Shops", shopSchema);
