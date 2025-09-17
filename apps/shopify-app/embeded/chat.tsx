import { createRoot } from "react-dom/client";
import Sprite from "app/components/SpriteIcon/Sprite";
import PublicChat from "app/components/publicChat/PublicChat";

function getOrCreateUserId(): string {
  let userId = localStorage.getItem("chat-user-id");
  if (!userId) {
    userId = Date.now().toString();
    localStorage.setItem("chat-user-id", userId);
  }
  return userId;
}

function renderChat() {
  const container = document.getElementById("support-ai-chat-place");
  if (!container) return;

  const shopName = container.getAttribute("data-shopName") ?? "";
  const position = container.getAttribute("data-position") ?? "right";
  const localChatId = localStorage.getItem("supportAiChatId");
  const userId = getOrCreateUserId();

  const chatId =
    localChatId && localChatId !== "undefined" ? localChatId : null;

  const root = createRoot(container);
  root.render(
    <>
      <div
        style={{
          width: 0,
          height: 0,
          overflow: "hidden",
          visibility: "hidden",
        }}
      >
        <Sprite />
      </div>
      <PublicChat
        shopName={shopName}
        userId={userId}
        position={position}
        chatId={chatId}
      />
    </>,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderChat);
} else {
  renderChat();
}
