import { Chats, Messages } from "@internal/database";
import { IChat, IMessage, MessageRole } from "../../../../packages/types/src";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { ExtendedSession } from "app/modules/sessionStorage";
import { authenticate } from "app/shopify.server";
import { formDataToObject } from "app/helpers/utils";

export interface IChatDetailsResponse {
  messages: IMessage[];
  chatId: string;
  chat: { assistantRole: MessageRole; platformId: string };
}
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;

  if (!params.chatId) {
    return new Response("Chat id not found", { status: 404 });
  }

  try {
    const [messages, chat] = await Promise.all([
      Messages.find<IMessage[]>({
        sessionId: session._id,
        chatId: params.chatId,
      }).lean<IMessage[]>(),
      Chats.findById(params.chatId).lean<IChat>(),
    ]);

    return {
      chat: {
        platformId: chat?.platformId,
        assistantRole:
          chat && "assistantRole" in chat
            ? chat?.assistantRole
            : MessageRole.MANAGER,
      },
      messages: messages,
      chatId: params?.chatId,
    };
  } catch (error) {
    return new Response("Chat not found", { status: 404 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const authData = await authenticate.admin(request);
  const session = authData.session as ExtendedSession;
  const formData = await request.formData();
  const { action, chatId, platformId, text, newAssistant } =
    formDataToObject(formData);

  switch (action) {
    case "toggleAssistant": {
      console.log("update", chatId, newAssistant);
      if (newAssistant && chatId) {
        await Chats.updateOne(
          { _id: chatId, sessionId: session._id },
          {
            assistantRole: newAssistant,
          },
        );
      }
      break;
    }

    case "sendMessage": {
      if (chatId) {
        await Messages.create({
          assistantRole: MessageRole.MANAGER,
          role: MessageRole.ASSISTANT,
          sessionId: session._id,
          chatId: chatId,
          platformId: platformId,
          text: text,
        });
      }
      break;
    }

    default:
      break;
  }

  return {};
};
