import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import SpriteIcon from "app/components/SpriteIcon";
import { mergeClassNames } from "app/helpers/utils";
import { useWebsocket } from "app/websocket/useWebsocket";
import { MessageRole } from "@internal/const";
import { useIsTyping } from "app/hooks/useIsTyping";

export interface IChatMessage {
  role: "assistant" | "user";
  text: string;
}

const roleToStyleMap = {
  [MessageRole.ASSISTANT]: styles.chatMessage_assistant,
  [MessageRole.USER]: styles.chatMessage_user,
  [MessageRole.MANAGER]: styles.chatMessage_manager,
};

interface ILodaerData {
  assistantName?: string | null;
  chatId?: string | null;
  shopName?: string | null;
}

const PublicChat = (props: {
  userId: string;
  chatId?: string | null;
  shopName?: string | null;
}) => {
  const { shopName, chatId, userId } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loaderData, setLoaderData] = useState<Partial<ILodaerData>>({
    chatId,
    shopName,
  });

  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [messagesList, setMessagesList] = useState<IChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const { socket } = useWebsocket({
    wsUrl: process.env.WS_URL || "",
    path: `chats/${chatId}?userId=${userId}`,
    onMessage: (e) => {
      let parsedData;
      try {
        parsedData = JSON.parse(e.data);
      } catch (error) {
        console.log("PARSE PAYLOAD ERROR: ", error);
        return;
      }
      switch (parsedData.type) {
        case "NEW_MESSAGE":
          setMessagesList((prev) => {
            return [...prev, parsedData.data];
          });
          break;

        case "TYPING":
          setIsOtherTyping(parsedData.data.isTyping);
          break;

        default:
          break;
      }
    },
    onOpen: () => {
      console.log("socket connect");
    },
    onClose: () => {
      console.log("chat close");
    },
  });

  const handleOnTyping = (value: boolean) => {
    socket?.send(JSON.stringify({ type: "TYPING", data: { isTyping: value } }));
  };

  const { setIsTyping } = useIsTyping({
    value: message,
    onTypingChange: handleOnTyping,
  });

  const handleSubmit = async (message: string) => {
    const formData = new FormData();
    formData.append("action", "message");
    formData.append("message", message);
    setMessage("");
    try {
      socket?.send(
        JSON.stringify({
          type: "NEW_MESSAGE",
          data: { role: MessageRole.USER, text: message },
        }),
      );
      setMessagesList((prev) => {
        return [...prev, { role: "user", text: message }];
      });
      setIsLoading(true);
      const response = await fetch(
        `${process.env.SHOPIFY_APP_URL}/api/chat?shopName=${loaderData.shopName}&chatId=${loaderData.chatId}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await response.json()) as { answer: string };
      if (!!data?.answer) {
        setMessagesList((prev) => {
          return [...prev, { role: "assistant", text: data.answer }];
        });
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (socket && socket.readyState === 1) {
      socket?.send(JSON.stringify({ type: "CHECK_ONLINE" }));
    }
  }, [socket]);

  useEffect(() => {
    (async () => {
      if (loaderData.chatId) {
        try {
          const response = await fetch(
            `${process?.env?.SHOPIFY_APP_URL}/api/chat?shopName=${loaderData?.shopName}&chatId=${loaderData?.chatId}`,
            {
              method: "GET",
            },
          );
          const data = (await response.json()) as {
            assistantName: string;
            messages: IChatMessage[];
            chatId: string;
          };

          setMessagesList(data.messages.length ? data.messages : []);
          setLoaderData((prev) => ({
            ...prev,
            chatId: data.chatId,
            assistantName: data.assistantName,
          }));
        } catch (error) {
          await handleInit();
        }
      } else {
        await handleInit();
      }
    })();
  }, [loaderData.chatId]);

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollIntoView();
    }
  }, [messagesList.length, conversationRef.current, isOpen]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInit = async () => {
    const formData = new FormData();
    formData.append("action", "init");

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process?.env?.SHOPIFY_APP_URL}/api/chat?_data=routes/api.chat&shopName=${loaderData?.shopName}`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = (await response.json()) as { chatId: string };
      localStorage.setItem("supportAiChatId", data.chatId);
      setLoaderData((prev) => ({ ...prev, chatId: data.chatId }));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    const localChatId = localStorage.getItem("supportAiChatId");
    if (!localChatId) {
      await handleInit();
    }
  };

  return (
    <div className={styles.widget}>
      {isOpen ? (
        <div className={styles.chatFrame}>
          <div className={styles.chatHeader}>
            <p className={styles.chatTitle}>
              {loaderData?.assistantName || "Assistant chat"}
            </p>
          </div>
          <div className={styles.chatBody}>
            <div className={styles.chatConversation}>
              {messagesList.map((item, index) => {
                return (
                  <div
                    ref={
                      index === messagesList.length - 1 ? conversationRef : null
                    }
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
              {!!isLoading || isOtherTyping ? (
                <div
                  className={mergeClassNames([
                    styles.chatMessage,
                    styles.chatMessage_assistant,
                  ])}
                >
                  <div className={styles.typing}>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                    <div className={styles.typingDot}></div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className={styles.chatFooter}>
            <textarea
              ref={textareaRef}
              className={styles.chatInput}
              placeholder={"Type a message...."}
              name={"chat-input"}
              value={message}
              rows={1}
              onChange={handleInput}
              onBlur={() => setIsTyping(false)}
            ></textarea>
            <div className={styles.chatButtonFrame}>
              <button
                className={styles.chatSendButton}
                disabled={isLoading}
                onClick={() => message && handleSubmit(message)}
              >
                <SpriteIcon
                  name={"send-message"}
                  size={"1.5rem"}
                  color="#000"
                />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className={styles.widgetButtonFrame}>
        <button
          className={mergeClassNames([
            styles.widgetButton,
            isLoading ? styles.loading : null,
          ])}
          onClick={handleOpen}
          disabled={isLoading}
        >
          <SpriteIcon
            name={isOpen ? "cross" : "message"}
            size={"2rem"}
            color="#000"
          />
        </button>
      </div>
    </div>
  );
};

export default PublicChat;
