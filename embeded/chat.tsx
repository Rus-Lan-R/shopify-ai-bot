import Sprite from "app/components/SpriteIcon/Sprite";
import PublicChat from "app/components/publicChat/PublicChat";
import ReactDOM from "react-dom";

const renderComponent = () => {
  const container = document.getElementById("remix-embed");
  if (container) {
    const url = new URL(window.location.href);

    const shop = url.searchParams.get("shop");
    const localChatId = localStorage.getItem("chatId");
    ReactDOM.render(
      <>
        <link
          rel="stylesheet"
          href="https://transaction-lobby-scout-way.trycloudflare.com/embeded/chat.css"
        />
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
