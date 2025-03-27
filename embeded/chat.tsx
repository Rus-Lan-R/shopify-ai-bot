import Sprite from "app/components/SpriteIcon/Sprite";
import PublicChat from "app/components/publicChat/PublicChat";
import ReactDOM from "react-dom";

const renderComponent = () => {
  const container = document.getElementById("support-ai-chat-place");
  if (container) {
    const scriptTag = document.getElementById("support-ai-chat-id");
    const shop = scriptTag?.getAttribute("data-shopId");
    const localChatId = localStorage.getItem("supportAiChatId");

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
        <PublicChat shop={shop} chatId={localChatId} />
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
