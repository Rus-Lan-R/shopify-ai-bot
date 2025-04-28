import Sprite from "app/components/SpriteIcon/Sprite";
import PublicChat from "app/components/publicChat/PublicChat";
import ReactDOM from "react-dom";

const renderComponent = () => {
  const container = document.getElementById("support-ai-chat-place");
  if (container) {
    const shopName = container?.getAttribute("data-shopName");
    const localChatId = localStorage.getItem("supportAiChatId");

    let userId = localStorage.getItem("chat-user-id");
    if (!userId) {
      userId = Date.now().toString();
      localStorage.setItem("chat-user-id", userId);
    }

    ReactDOM.render(
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
          chatId={
            localChatId && localChatId !== "undefined" ? localChatId : null
          }
        />
      </>,
      container,
    );
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderComponent);
} else {
  renderComponent();
}
