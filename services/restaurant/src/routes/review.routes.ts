import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  createReview,
  getRestaurantReviews,
  getOrderReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.post("/new/:orderId", isAuth, createReview);
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.get("/order/:orderId", isAuth, getOrderReview);

export default router;
