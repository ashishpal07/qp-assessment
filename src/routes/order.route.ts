import express from "express";
import { authenticate, isAdmin } from "../middleware/auth";
import {
  createOrder,
  cancelOrder,
  deliverOrder,
} from "../controller/order.controller";

const router = express.Router();

router.post("/", authenticate, createOrder);

router.patch("/cancel/:orderId", authenticate, cancelOrder);

router.patch("/deliver/:orderId", authenticate, isAdmin, deliverOrder);

export default router;
