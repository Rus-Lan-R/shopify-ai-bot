import { Router } from "express";
import wsChatsRouter from "./ws/chats";
import testRouter from "./test";

const apiRouter = Router();

apiRouter.use("/ws", wsChatsRouter);
apiRouter.use("/test", testRouter);

export default apiRouter;
