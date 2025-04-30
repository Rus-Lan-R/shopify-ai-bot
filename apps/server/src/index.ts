import dotenv from "dotenv";
import express from "express";
import { server } from "./wsServer/expressSServer.js";
import apiRouter from "./routes/index.js";
import wsChatsRouter from "./routes/ws/chats.js";
dotenv.config();

const { app, getWss } = server;
const port = process.env.PORT || 8080;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("OK");
});

app.use("/api", apiRouter);
app.use("/ws", wsChatsRouter);

setInterval(() => {
  getWss().clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  });
}, 30000);

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
