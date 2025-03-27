import express from "express";
import { authenticate, isAdmin } from "../middleware/auth";
import {
  createGrocery,
  updateGrocery,
  deleteGrocery,
  getGrocery,
  getAllGroceries,
} from "../controller/grocery.controller";

const router = express.Router();

router.post("/", authenticate, isAdmin, createGrocery);

router.patch("/:groceryId", authenticate, isAdmin, updateGrocery);

router.delete("/:groceryId", authenticate, isAdmin, deleteGrocery);

router.get("/:groceryId", getGrocery);

router.get("/", getAllGroceries);

export default router;
