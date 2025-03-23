(function () {
  const chatBox = document.createElement("div");
  chatBox.style.position = "fixed";
  chatBox.style.bottom = "20px";
  chatBox.style.right = "20px";
  chatBox.style.width = "300px";
  chatBox.style.height = "400px";
  chatBox.style.background = "#fff";
  chatBox.style.border = "1px solid #ccc";
  chatBox.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
  chatBox.style.padding = "10px";
  chatBox.style.overflow = "hidden";
  chatBox.style.fontFamily = "Arial, sans-serif";

  const chatHeader = document.createElement("div");
  chatHeader.textContent = "Чат поддержки ▼";
  chatHeader.style.background = "#0078ff";
  chatHeader.style.color = "#fff";
  chatHeader.style.padding = "10px";
  chatHeader.style.textAlign = "center";
  chatHeader.style.cursor = "pointer";

  chatHeader.addEventListener("click", () => {
    chatBox.style.height = chatBox.style.height === "50px" ? "400px" : "50px";
  });

  const chatMessages = document.createElement("div");
  chatMessages.style.height = "300px";
  chatMessages.style.overflowY = "auto";
  chatMessages.style.padding = "10px";

  const chatInput = document.createElement("input");
  chatInput.type = "text";
  chatInput.placeholder = "Введите сообщение...";
  chatInput.style.width = "calc(100% - 20px)";
  chatInput.style.margin = "10px";
  chatInput.style.padding = "8px";
  chatInput.style.border = "1px solid #ccc";

  chatBox.appendChild(chatHeader);
  chatBox.appendChild(chatMessages);
  chatBox.appendChild(chatInput);
  document.body.appendChild(chatBox);
})();
