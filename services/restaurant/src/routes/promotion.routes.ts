import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  createPromotion,
  getMyPromotions,
  togglePromotion,
  deletePromotion,
  validatePromoCode,
} from "../controllers/promotion.controller.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, createPromotion);
router.get("/my", isAuth, isSeller, getMyPromotions);
router.put("/toggle/:promoId", isAuth, isSeller, togglePromotion);
router.delete("/:promoId", isAuth, isSeller, deletePromotion);
router.post("/validate", validatePromoCode); // public endpoint for checkout

export default router;
