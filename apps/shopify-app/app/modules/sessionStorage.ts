import { Sessions } from "@internal/database";
import { Session } from "@shopify/shopify-app-remix/server";

export class SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    try {
      const findById = await Sessions.findById(session.id);

      if (findById) {
        console.log("Update");

        await Sessions.findByIdAndUpdate(session.id, {
          ...session,
          state: "active",
        });
      } else {
        await Sessions.create({
          _id: session.id,
          ...session,
          state: "active",
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Loads a session from storage.
   *
   * @param id Id of the session to load
   */
  async loadSession(id: string): Promise<Session | undefined> {
    console.log("LoadSession", id);
    try {
      const session = await Sessions.findById<Session>(id);
      const sessionInstance = !session
        ? undefined
        : new Session({ ...session });
      console.log(
        "isActive",
        sessionInstance,
        sessionInstance?.isActive(sessionInstance.scope),
      );
      return sessionInstance;
    } catch (error) {}
  }
  /**
   * Deletes a session from storage.
   *
   * @param id Id of the session to delete
   */
  async deleteSession(id: string): Promise<boolean> {
    try {
      await Sessions.findByIdAndDelete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Deletes an array of sessions from storage.
   *
   * @param ids Array of session id's to delete
   */
  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await Sessions.deleteMany({ $in: ids });
      return true;
    } catch (error) {
      return false;
    }
  }
  /**
   * Return an array of sessions for a given shop (or [] if none found).
   *
   * @param shop shop of the session(s) to return
   */
  async findSessionsByShop(shop: string): Promise<Session[]> {
    console.log("LoadSessionsByShop", shop);
    try {
      const sessionsByShop = await Sessions.find<Session>({ shop });
      return sessionsByShop.map((item) => new Session({ ...item }));
    } catch (error) {
      return [];
    }
  }
}
