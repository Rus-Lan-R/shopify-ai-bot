import { Session } from "@shopify/shopify-app-remix/server";
import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { Sessions } from "../../../../packages/database/src";
import { ISession } from "../../../../packages/types/src";

export type ExtendedSession = Session & ISession;
export interface MongoDBSessionStorageOptions {
  sessionCollectionName: string;
}

export class MongoDBSessionStorage implements SessionStorage {
  constructor() {}

  public async storeSession(session: ExtendedSession): Promise<boolean> {
    await Sessions.findOneAndUpdate(
      { _id: session.id },
      { $set: session.toObject() },
      { upsert: true, new: true },
    );
    return true;
  }

  public async loadSession(id: string): Promise<ExtendedSession | undefined> {
    const result = await Sessions.findOne({ _id: id })
      .populate("limitationId")
      .lean();
    return result ? new Session({ ...result, id: result._id }) : undefined;
  }

  public async deleteSession(id: string): Promise<boolean> {
    await Sessions.deleteOne({ _id: id });
    return true;
  }

  public async deleteSessions(ids: string[]): Promise<boolean> {
    await Sessions.deleteMany({ _id: { $in: ids } });
    return true;
  }

  public async findSessionsByShop(shop: string): Promise<ExtendedSession[]> {
    const results = await Sessions.find({ shop }).lean();
    return results.map((doc: any) => new Session({ ...doc, id: doc._id }));
  }
}
