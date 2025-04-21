import { Message as TgMessage } from "node-telegram-bot-api";
import { Message as WaMessage } from "whatsapp-web.js";
import { MessageContent } from "openai/resources/beta/threads/messages";

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

export const extractTextWithoutAnnotations = (data: MessageContent[]) => {
  return data
    .map((item) => {
      if (item.type === "text" && item.text && item.text.value) {
        let textValue = item.text.value;
        item.text.annotations.forEach((annotation) => {
          textValue = textValue.replace(annotation.text, "");
        });
        return textValue.trim();
      }
      return "";
    })
    .filter((value) => value !== "")
    .join("\n");
};
