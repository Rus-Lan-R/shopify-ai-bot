import { Router } from "express";
import cors from "cors";
import shopsRoute from "./api/shops/shops";

const apiRoute = Router();

apiRoute.use(cors());
apiRoute.use("/shops", shopsRoute);

export default apiRoute;
