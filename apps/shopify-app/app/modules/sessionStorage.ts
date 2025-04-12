import { Sessions } from "@internal/database";
import { Session } from "@shopify/shopify-app-remix";

export class SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    const findById = await Sessions.findById(session.id);
    if (findById) {
      await Sessions.findByIdAndUpdate(session.id, {
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken,
      });
    } else {
      await Sessions.create({
        _id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken,
      });
    }
    return true;
  }
  /**
   * Loads a session from storage.
   *
   * @param id Id of the session to load
   */
  async loadSession(id: string): Promise<Session | undefined> {
    console.log("LOAD");
    const session = await Sessions.findById<Session>(id);
    return !session ? undefined : session;
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
    const sessionsByShop = await Sessions.find<Session>({ shop });
    return sessionsByShop;
  }
}
