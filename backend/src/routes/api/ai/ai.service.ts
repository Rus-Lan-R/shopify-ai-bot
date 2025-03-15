import { Schema, model } from "mongoose";

export interface ISimpleUser {}
export interface IUser {}

const userSchema = new Schema<IUser>({}, { timestamps: true });

export const Users = model<IUser>("Users", userSchema);
