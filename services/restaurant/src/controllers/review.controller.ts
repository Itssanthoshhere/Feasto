import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Restaurant from "../models/Restaurant.js";

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const { rating, comment } = req.body;
    const userId = req.user?._id as string;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Valid rating (1-5) is required" });
      return;
    }

    // 1. Validate order exists, belongs to user, and is delivered
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    if (order.status !== "delivered") {
      res.status(400).json({ message: "You can only review delivered orders" });
      return;
    }

    // 2 Create the review (relies on unique index to prevent duplicates)
    const newReview = await Review.create({
      userId,
      userName: req.user?.name || "Unknown User",
      userImage: req.user?.image || "",
      restaurantId: order.restaurantId,
      orderId,
      rating,
      comment,
    });

    // 3. Update the restaurant's average rating and totalReviews atomically
    await Restaurant.updateOne(
      { _id: order.restaurantId },
      [
        {
          $set: {
            rating: {
              $divide: [
                { $add: [{ $multiply: [{ $ifNull: ["$rating", 0] }, { $ifNull: ["$totalReviews", 0] }] }, rating] },
                { $add: [{ $ifNull: ["$totalReviews", 0] }, 1] }
              ]
            },
            totalReviews: { $add: [{ $ifNull: ["$totalReviews", 0] }, 1] }
          }
        }
      ]
    );

    res.status(201).json({
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error: any) {
    console.error("Error creating review:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "You have already reviewed this order" });
      return;
    }
    res.status(500).json({ message: "Failed to submit review" });
  }
};

export const getRestaurantReviews = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = req.params.restaurantId as string;

    const reviews = await Review.find({ restaurantId })
      .sort({ createdAt: -1 })
      .limit(50); // Fetch top 50 recent reviews for performance

    res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("Error fetching restaurant reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const getOrderReview = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const orderId = req.params.orderId as string;
    const userId = req.user?._id as string;

    const review = await Review.findOne({ orderId, userId });

    res.status(200).json({
      review, // Returns null if no review exists
    });
  } catch (error) {
    console.error("Error fetching order review:", error);
    res.status(500).json({ message: "Failed to fetch review status" });
  }
};
