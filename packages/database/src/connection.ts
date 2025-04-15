import mongoose from "mongoose";

export class MongoDB {
  private dbHost: string;
  constructor(dbHost: string) {
    this.dbHost = dbHost;
  }

  async connect() {
    try {
      console.log("MongoDB connecting...");
      await mongoose.connect(this.dbHost);
      console.log("MongoDB connected!");
    } catch (error) {
      console.error("MongoDB connection error: ", error);
    }
  }
  async disconnect() {
    await mongoose.disconnect();
  }
}
