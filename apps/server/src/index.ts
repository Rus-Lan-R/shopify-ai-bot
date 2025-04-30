import dotenv from "dotenv";
import express from "express";
import { server } from "./wsServer/expressSServer.js";
import apiRouter from "./routes/index.js";
dotenv.config();

const { app } = server;
const port = process.env.SERVER_PORT || 8080;
app.use(express.json());

app.use("/api", apiRouter);

// let isServiceOnline = false;
// let lastPing = Date.now();

// const broadcastToClients = (message: string) => {
//   app.clients.forEach((client) => {
//     if (client.readyState) {
//       client.send(message);
//     }
//   });
// };

// wss.on("connection", (ws) => {
//   ws.on("message", (data) => {
//     const message = data.toString();

//     if (message === "SHOPIFY_APP_CONNECT") {
//       broadcastToClients(
//         isServiceOnline ? "AUTOMATION_ONLINE" : "AUTOMATION_OFFLINE"
//       );
//     } else if (message === "AUTOMATION_CONNECT") {
//       isServiceOnline = true;
//       lastPing = Date.now();
//       broadcastToClients("AUTOMATION_ONLINE");
//     } else if (message === "AUTOMATION_ONLINE") {
//       isServiceOnline = true;
//       lastPing = Date.now();
//       broadcastToClients("AUTOMATION_ONLINE");
//     } else {
//       broadcastToClients(message);
//     }
//   });
// });

// setInterval(() => {
//   if (isServiceOnline && Date.now() - lastPing > 20000) {
//     isServiceOnline = false;
//     broadcastToClients("AUTOMATION_OFFLINE");
//   }
// }, 5000);

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
