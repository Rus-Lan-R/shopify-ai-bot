import styles from "./styles.module.css";
import { useEffect, useRef, useState } from "react";
import SpriteIcon from "app/components/SpriteIcon";
import { mergeClassNames } from "app/helpers/utils";

export interface IMessage {
  role: "assistant" | "user";
  text: string;
}

const roleToStyleMap = {
  assistant: styles.chatMessage_assistant,
  user: styles.chatMessage_user,
};

interface ILodaerData {
  assistantName?: string | null;
  chatId?: string | null;
  shop?: string | null;
}
const defaulMessage: IMessage = {
  text: "Hi, how can I help you?",
  role: "assistant",
};

const PublicChat = (props: {
  chatId?: string | null;
  shop?: string | null;
}) => {
  const { shop, chatId } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loaderData, setLoaderData] = useState<Partial<ILodaerData>>({
    chatId,
    shop,
  });
  const [messagesList, setMessagesList] = useState<IMessage[]>([defaulMessage]);
  const [message, setMessage] = useState("");

  const handleSubmit = async (message: string) => {
    const formData = new FormData();
    formData.append("action", "message");
    formData.append("message", message);
    setMessage("");
    try {
      setMessagesList((prev) => [{ role: "user", text: message }, ...prev]);
      setIsLoading(true);
      const response = await fetch(
        `https://ve-retail-allied-airlines.trycloudflare.com/chat?shop=${loaderData.shop}&chatId=${chatId}`,
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
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `https://ve-retail-allied-airlines.trycloudflare.com/chat?shop=${loaderData?.shop}&chatId=${loaderData?.chatId}`,
        {
          method: "GET",
        },
      );
      const data = (await response.json()) as {
        assistantName: string;
        messages: IMessage[];
        chatId: string;
      };

      setMessagesList(data.messages.length ? data.messages : [defaulMessage]);
      setLoaderData((prev) => ({
        ...prev,
        chatId: data.chatId,
        assistantName: data.assistantName,
      }));
    })();
  }, []);

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

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    const localChatId = localStorage.getItem("supportAiChatId");
    if (!localChatId) {
      const formData = new FormData();
      formData.append("action", "init");

      try {
        setIsLoading(true);
        const response = await fetch(
          `https://ve-retail-allied-airlines.trycloudflare.com/chat?_data=routes/chat&shop=${loaderData?.shop}`,
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
              {!!isLoading ? (
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
