import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  payWithStripe,
  verifyStripePayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.post("/stripe/create", payWithStripe);
router.post("/stripe/verify", verifyStripePayment);

export default router;
