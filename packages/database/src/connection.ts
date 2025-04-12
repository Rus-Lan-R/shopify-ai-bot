import mongoose from "mongoose";

const dbConnectionURL = process.env.DATABASE_URL || "";

export const connectDb = () => mongoose.connect(dbConnectionURL);

export const disconnect = () => {
  mongoose.disconnect();
};
