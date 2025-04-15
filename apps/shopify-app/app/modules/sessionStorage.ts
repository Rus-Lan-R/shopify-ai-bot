import { Session } from "@shopify/shopify-app-remix/server";
import { ISession, MongoDB, Sessions } from "@internal/database";
import { SessionStorage } from "@shopify/shopify-app-session-storage";

export type ExtendedSession = Session & ISession;
export interface MongoDBSessionStorageOptions {
  sessionCollectionName: string;
}

export class MongoDBSessionStorage implements SessionStorage {
  public ready: Promise<void>;
  private mongoDB: MongoDB;
  constructor() {
    this.mongoDB = new MongoDB(process.env.DATABASE_URL || "");
    this.ready = this.init();
  }

  private async init() {
    await this.mongoDB.connect();
  }

  public async storeSession(session: ExtendedSession): Promise<boolean> {
    await this.ready;
    await Sessions.findOneAndUpdate(
      { _id: session.id },
      { $set: session.toObject() },
      { upsert: true, new: true },
    );

    return true;
  }

  public async loadSession(id: string): Promise<ExtendedSession | undefined> {
    await this.ready;

    const result = await Sessions.findOne({ _id: id }).lean();
    return result ? new Session(result) : undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    await this.ready;

    await Sessions.deleteOne({ _id: id });
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await this.ready;

    await Sessions.deleteMany({ _id: { $in: ids } });
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<ExtendedSession[]> {
    await this.ready;

    const results = await Sessions.find({ shop }).lean();
    return results.map((doc: any) => new Session(doc));
  }
}
