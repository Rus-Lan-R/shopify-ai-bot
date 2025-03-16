import { MessageContent } from "openai/src/resources/beta/threads/messages.js";

export const formDataToObject = (formData: FormData): Record<string, any> => {
  const object: Record<string, unknown> = {};
  for (const key of formData.keys()) {
    object[key] = formData.get(key);
  }
  return object;
};
