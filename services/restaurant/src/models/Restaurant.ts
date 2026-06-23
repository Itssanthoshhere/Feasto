import mongoose, { Schema, Document } from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  description?: string;
  image: string;
  ownerId: String;
  phone: number;
  isVerified: boolean;
  rating: number;
  totalReviews: number;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; // [longitude latitude]
    formattedAddress: string;
  };

  isOpen: boolean;
  createdAt: Date;
}

const schema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    image: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    autoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      formattedAddress: {
        type: String,
      },
    },
    isOpen: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({ autoLocation: "2dsphere" });

export default mongoose.model<IRestaurant>("Restaurant", schema);
