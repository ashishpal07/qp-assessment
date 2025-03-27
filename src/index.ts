import express from "express";
import dotenv from "dotenv";

import groceryRouter from "./routes/grocery.route";
import userRouter from "./routes/user.route";
import orderRouter from "./routes/order.route";

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/v1/groceries', groceryRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/orders', orderRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, (err) => {
  if (err) {
    console.log("Error while running express server : ", err);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
});