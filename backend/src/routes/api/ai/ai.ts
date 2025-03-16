import { Router } from "express";
import { Shops } from "../shops/shops.service";

const usersRoute = Router();

usersRoute.post("/create-assistant", async (req, res) => {
  const shop = await Shops.findOne({ shop: "" });
});

export default usersRoute;
