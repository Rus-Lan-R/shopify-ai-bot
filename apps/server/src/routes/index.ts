import { Router } from "express";
import testRouter from "./test/index.js";

const apiRouter = Router();

apiRouter.use("/test", testRouter);

export default apiRouter;
