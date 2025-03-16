import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connect } from "./database";
import apiRoute from "./routes";
import { getStores } from "./routes/api/ai/ai.module";

const app = express();
const port = process.env.API_PORT;

app.use(express.json());
app.use("/api", apiRoute);

app.listen(port, async () => {
  // await connect()
  //   .then(() => console.log("Connect to DB"))
  //   .catch(() => console.log("Error with DB"));

  // await bot().then(() => {
  //   console.log("BOT STARTED");
  // });

  // await assistantInit({
  //   shopId: "ShopId",
  //   productsObject: {
  //     list: [{ productName: "test", price: "200" }],
  //   },
  //   ordersObject: {
  //     list: [{ orderNumber: "228", total: "900" }],
  //   },
  // });
  await getStores();
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
