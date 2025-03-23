import { LoaderFunctionArgs } from "@remix-run/node";
import styles from "./styles.module.css";
import db from "../../db.server";
import { useLoaderData } from "@remix-run/react";
import { useRef, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const [shop, chatId] = [searchParams.get("shop"), searchParams.get("chatId")];

  if (!shop) {
    throw new Response("Bad Request", {
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

  return {
    assistantName: shopSession.assistantName,
  };
};

const PublicChat = () => {
  const { assistantName } = useLoaderData<typeof loader>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.chatFrame}>
      <div className={styles.chatHeader}>{assistantName}</div>
      <div className={styles.chatBody}>
        <div className={styles.chatConversation}>body</div>
      </div>
      <div className={styles.chatFooter}>
        <textarea
          ref={textareaRef}
          className={styles.chatInput}
          placeholder={"Type a message..."}
          name={"chat-input"}
          value={value}
          rows={1}
          onChange={handleInput}
        ></textarea>
      </div>
    </div>
  );
};

export default PublicChat;
