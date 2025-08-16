import { Router } from "express";
import testRouter from "./test/index.js";

const apiRouter = Router();

apiRouter.get("/health", (req, res) => {
  console.log("health request");
  res.send("OK");
});

apiRouter.use("/test", testRouter);

export default apiRouter;
