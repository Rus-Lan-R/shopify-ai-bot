import { Message as TgMessage } from "node-telegram-bot-api";
import { Message as WaMessage } from "whatsapp-web.js";

type Message = TgMessage | WaMessage;

export function logerFunction<T extends Message>(cb: (msg: T) => any) {
  return async function (data: T) {
    try {
    } catch (error) {
      console.log(`Logger error: ${error}`);
    }

    const result = await cb(data);
    return result;
  };
}
