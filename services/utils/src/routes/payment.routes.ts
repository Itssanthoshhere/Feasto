import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  payWithStripe,
  verifyStripePayment,
  createPaymentIntent,
  verifyPaymentIntent,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);
router.post("/stripe/create", payWithStripe);
router.post("/stripe/verify", verifyStripePayment);
router.post("/stripe/intent", createPaymentIntent);
router.post("/stripe/verify-intent", verifyPaymentIntent);

export default router;
