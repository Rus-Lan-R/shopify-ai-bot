import styles from "./styles.module.css";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import SpriteIcon from "app/components/SpriteIcon";
import { formDataToObject, mergeClassNames } from "app/helpers/utils";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import db from "../../db.server";
import { aiClient } from "app/services/openAi.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;

  const [shop] = [searchParams.get("shop")];

  if (!shop) {
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

  return {
    shop,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { action } = formDataToObject(formData);
  const searchParams = new URL(request.url).searchParams;
  const [shop] = [searchParams.get("shop")];

  if (!shop) {
    throw new Response("Chat bad request", {
      status: 400,
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

  switch (action) {
    case "init": {
      if (shopSession?.assistantId) {
        const thread = await aiClient.beta.threads.create();
        return new Response(JSON.stringify({ chatId: thread.id }), {
          headers: { "content-type": "application/json" },
        });
      }
      // add error response
    }

    default:
      break;
    // add error respons
  }

  return {};
};

const PublicChat = () => {
  const { shop } = useLoaderData<typeof loader>();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const handleOpen = async () => {
    let localChatId = localStorage.getItem("chatId");

    if (!localChatId) {
      const formData = new FormData();
      formData.append("action", "init");

      try {
        setIsLoading(true);

        const response = await fetch(
          `/chat?_data=routes/_public.chat&shop=${shop}`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = (await response.json()) as { chatId: string };
        localChatId = data.chatId;
        localStorage.setItem("chatId", data.chatId);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen((prev) => !prev);
    setChatId(localChatId);
  };

  return (
    <div
      className={mergeClassNames([
        styles.widget,
        isOpen ? styles.widgetOpen : null,
      ])}
    >
      {isOpen && !!chatId ? (
        <iframe
          className={styles.widgetIframe}
          width={"100%"}
          height={"100%"}
          src={`http://localhost:51991/chat?shop=${shop}&chatId=${chatId}`}
        ></iframe>
      ) : (
        <></>
      )}
      <div className={styles.widgetButtonFrame}>
        <button
          className={styles.widgetButton}
          onClick={handleOpen}
          disabled={isLoading}
        >
          <SpriteIcon
            name={isOpen ? "cross" : "message"}
            size={"1rem"}
            color="#000"
          />
        </button>
      </div>
    </div>
  );
};

export default PublicChat;
