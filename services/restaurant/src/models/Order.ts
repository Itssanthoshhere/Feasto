import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  restaurantName: string;
  riderId?: mongoose.Types.ObjectId | null;
  riderPhone: number | null;
  riderName: string | null;
  riderPicture: string | null;
  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;

  addressId: mongoose.Types.ObjectId;

  deliveryAddress: {
    formattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };

  status:
  | "placed"
  | "accepted"
  | "preparing"
  | "ready_for_rider"
  | "rider_assigned"
  | "picked_up"
  | "delivered"
  | "cancelled";

  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    restaurantName: {
      type: String,
      required: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      default: null,
    },
    riderName: {
      type: String,
      default: null,
    },
    riderPicture: {
      type: String,
      default: null,
    },
    riderPhone: {
      type: Number,
      default: null,
    },
    riderAmount: {
      type: Number,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },

    items: {
      type: [
        {
          itemId: String,
          name: String,
          price: Number,
          quantity: Number,
        },
      ],
      required: true,
    },

    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    deliveryAddress: {
      type: {
        formattedAddress: { type: String, required: true },
        mobile: { type: Number, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
      },
      required: true,
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready_for_rider",
        "rider_assigned",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      default: "placed",
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      index: {
        expireAfterSeconds: 0,
        partialFilterExpression: { paymentStatus: "pending" }
      },
    },
  },
  {
    timestamps: true,
  },
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ restaurantId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ riderId: 1, status: 1 });

export default mongoose.model<IOrder>("Order", OrderSchema);
