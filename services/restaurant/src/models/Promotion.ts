import mongoose, { Schema, Document } from "mongoose";

export interface IPromotion extends Document {
  restaurantId: mongoose.Types.ObjectId;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  isActive: boolean;
  minOrderValue: number;
  expiresAt?: Date;
  createdAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// Unique code per restaurant
PromotionSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

export default mongoose.model<IPromotion>("Promotion", PromotionSchema);
