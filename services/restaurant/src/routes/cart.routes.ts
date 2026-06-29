import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  clearCart,
  addToCart,
  decrementCartItem,
  fetchMyCart,
  incrementCartItem,
  reorder,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/add", isAuth, addToCart);
router.get("/all", isAuth, fetchMyCart);
router.put("/inc", isAuth, incrementCartItem);
router.put("/dec", isAuth, decrementCartItem);
router.delete("/clear", isAuth, clearCart);
router.post("/reorder", isAuth, reorder);

export default router;
