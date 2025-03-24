import styles from "./styles.module.css";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import SpriteIcon from "app/components/SpriteIcon";
import { formDataToObject, mergeClassNames } from "app/helpers/utils";
import { IMessage } from "app/components/chat/ChatBody";
import {
  extractTextWithoutAnnotations,
  getOpenAIResponse,
} from "app/modules/openAi/request";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import db from "../../db.server";
import { aiClient } from "app/services/openAi.server";

const roleToStyleMap = {
  assistant: styles.chatMessage_assistant,
  user: styles.chatMessage_user,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const [shop, chatId] = [searchParams.get("shop"), searchParams.get("chatId")];

  if (!shop || !chatId) {
    throw new Response("Loader Bad Request", {
      status: 400,
    });
  }

  const shopSession = await db.session.findFirst({
    where: { id: shop },
  });

  if (!shopSession) {
    throw new Response("Shop not found", {
      status: 404,
    });
  }

  const messages = await aiClient.beta.threads.messages.list(chatId, {
    limit: 100,
  });

  const preparedMessages = messages.data.map((item) => ({
    role: item.role,
    text: extractTextWithoutAnnotations(item.content),
  }));
  return {
    chatId: chatId,
    shop: shop,
    messages: preparedMessages,
    assistantName: shopSession.assistantName,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { action, message } = formDataToObject(formData);
  const searchParams = new URL(request.url).searchParams;
  const [shop, chatId] = [searchParams.get("shop"), searchParams.get("chatId")];
  if (!shop || !chatId) {
    throw new Response("Chat not found", {
      status: 404,
    });
  }

  const shopSession = await db.session.findUnique({
    where: { id: shop },
  });

  if (!shopSession) {
    throw new Response("Shop not found", {
      status: 404,
    });
  }
  console.log(action);
  switch (action) {
    case "message":
      if (shopSession?.assistantId) {
        const answer = await getOpenAIResponse({
          userText: message,
          threadId: chatId,
          assistantId: shopSession?.assistantId,
        });

        return new Response(JSON.stringify({ answer }), {
          headers: { "content-type": "application/json" },
        });
      }
      break;

    default:
      break;
  }
  console.log("default");

  return {};
};

const PublicChat = () => {
  const { shop, chatId, messages, assistantName } =
    useLoaderData<typeof loader>();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesList, setMessagesList] = useState<IMessage[]>(messages);
  const [message, setMessage] = useState("");

  const handleSubmit = async (message: string) => {
    const formData = new FormData();
    formData.append("action", "message");
    formData.append("message", message);
    try {
      setMessagesList((prev) => [{ role: "user", text: message }, ...prev]);
      setIsLoading(true);
      setMessage("");
      const response = await fetch(
        `/chat?_data=routes/_public.chat&shop=${shop}&chatId=${chatId}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await response.json()) as { answer: string };
      setMessagesList((prev) => [
        { role: "assistant", text: data.answer },
        ...prev,
      ]);
      if (conversationRef.current) {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollIntoView();
    }
  }, [messagesList.length]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.chatFrame}>
      <div className={styles.chatHeader}>{assistantName}</div>
      <div className={styles.chatBody}>
        <div className={styles.chatConversation}>
          {messagesList.map((item, index) => {
            return (
              <div
                ref={!index ? conversationRef : null}
                key={`${item.role}-${index}`}
                className={mergeClassNames([
                  styles.chatMessage,
                  roleToStyleMap[item.role],
                ])}
              >
                <p className={styles.chatMessage_text}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.chatFooter}>
        <textarea
          ref={textareaRef}
          className={styles.chatInput}
          placeholder={"Type a message..."}
          name={"chat-input"}
          value={message}
          rows={1}
          onChange={handleInput}
        ></textarea>
        <div className={styles.chatButtonFrame}>
          <button
            className={styles.chatSendButton}
            disabled={isLoading}
            onClick={() => message && handleSubmit(message)}
          >
            <SpriteIcon name={"send-message"} size={"1rem"} color="#000" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicChat;
