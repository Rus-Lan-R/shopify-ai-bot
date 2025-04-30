import { Router } from "express";
import wsChatsRouter from "./ws/chats.js";
import testRouter from "./test/index.js";

const apiRouter = Router();

apiRouter.use("/ws", wsChatsRouter);
apiRouter.use("/test", testRouter);

export default apiRouter;
