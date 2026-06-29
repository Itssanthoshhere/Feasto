import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Promotion from "../models/Promotion.js";
import mongoose from "mongoose";

export const createPromotion = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user?.restaurantId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { code, discountType, discountValue, minOrderValue, expiresAt } =
      req.body;

    if (!code || !discountType || !discountValue) {
      return res
        .status(400)
        .json({ message: "code, discountType, discountValue are required" });
    }

    if (discountType === "percent" && Number(discountValue) > 100) {
      return res
        .status(400)
        .json({ message: "Percent discount cannot exceed 100" });
    }

    const createData: any = {
      restaurantId: user.restaurantId,
      code: String(code).toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
    };
    if (expiresAt) {
      createData.expiresAt = new Date(expiresAt);
    }

    let promo;
    try {
      promo = await Promotion.create(createData);
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(409).json({
          message: "A promo with this code already exists for your restaurant",
        });
      }
      throw err;
    }

    return res
      .status(201)
      .json({ message: "Promo code created!", promotion: promo });
  },
);

export const getMyPromotions = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user?.restaurantId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const promotions = await Promotion.find({
      restaurantId: user.restaurantId,
    }).sort({ createdAt: -1 });

    return res.json({ promotions });
  },
);

export const togglePromotion = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const promoId = req.params.promoId as string;

    if (!user?.restaurantId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(promoId)) {
      return res.status(400).json({ message: "Invalid promo ID" });
    }

    const promo = await Promotion.findOne({
      _id: new mongoose.Types.ObjectId(promoId),
      restaurantId: user.restaurantId,
    });

    if (!promo) return res.status(404).json({ message: "Promo not found" });

    promo.isActive = !promo.isActive;
    await promo.save();

    return res.json({
      message: `Promo ${promo.isActive ? "activated" : "deactivated"}`,
      promotion: promo,
    });
  },
);

export const deletePromotion = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    const promoId = req.params.promoId as string;

    if (!user?.restaurantId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(promoId)) {
      return res.status(400).json({ message: "Invalid promo ID" });
    }

    await Promotion.deleteOne({
      _id: new mongoose.Types.ObjectId(promoId),
      restaurantId: user.restaurantId,
    });

    return res.json({ message: "Promo deleted" });
  },
);

export const validatePromoCode = TryCatch(async (req, res) => {
  const { code, restaurantId, orderTotal } = req.body;

  if (!code || !restaurantId) {
    return res
      .status(400)
      .json({ message: "code and restaurantId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(restaurantId as string)) {
    return res.status(400).json({ message: "Invalid restaurant" });
  }

  const promo = await Promotion.findOne({
    restaurantId: new mongoose.Types.ObjectId(restaurantId as string),
    code: String(code).toUpperCase().trim(),
    isActive: true,
  });

  if (!promo) {
    return res.status(404).json({ message: "Invalid or expired promo code" });
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return res.status(400).json({ message: "This promo code has expired" });
  }

  const total = Number(orderTotal) || 0;
  if (promo.minOrderValue > 0 && total < promo.minOrderValue) {
    return res.status(400).json({
      message: `Minimum order of ₹${promo.minOrderValue} required for this code`,
    });
  }

  const rawDiscount =
    promo.discountType === "percent"
      ? Math.round((total * promo.discountValue) / 100)
      : promo.discountValue;
  const discount = Math.max(0, Math.min(rawDiscount, total));

  return res.json({
    valid: true,
    discountAmount: discount,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    code: promo.code,
    message: `₹${discount} discount applied!`,
  });
});

export const getActivePromotions = TryCatch(async (req, res) => {
  const restaurantId = req.params.restaurantId as string;

  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({ message: "Invalid restaurant ID" });
  }

  const promotions = await Promotion.find({
    restaurantId: new mongoose.Types.ObjectId(restaurantId),
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  }).select("-__v -updatedAt");

  return res.json({ promotions });
});
