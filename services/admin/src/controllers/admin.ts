import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import {
  getRestaurantCollection,
  getRiderCollection,
} from "../util/collection.js";

export const getPendingRestaurant = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    count: restaurants.length,
    restaurants,
  });
});

export const getPendingRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection())
    .find({ isVerified: false })
    .toArray();

  res.json({
    count: riders.length,
    riders,
  });
});

export const verifyRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid restaurant id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  res.json({
    message: "Restaurant verified successfully",
  });
});

export const verifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "invalid rider id",
    });
  }

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid object id",
    });
  }

  const result = await (
    await getRiderCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({
      message: "rider not found",
    });
  }

  res.json({
    message: "rider verified successfully",
  });
});

export const getAllRestaurants = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection()).find({}).toArray();
  res.json({ count: restaurants.length, restaurants });
});

export const getAllRiders = TryCatch(async (req, res) => {
  const riders = await (await getRiderCollection()).find({}).toArray();
  res.json({ count: riders.length, riders });
});

export const unverifyRestaurant = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid object id" });
  }
  const result = await (await getRestaurantCollection()).updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVerified: false, updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ message: "Restaurant not found" });
  res.json({ message: "Restaurant unverified successfully" });
});

export const unverifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid object id" });
  }
  const result = await (await getRiderCollection()).updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVerified: false, isAvailble: false, updatedAt: new Date() } }
  );
  if (result.matchedCount === 0) return res.status(404).json({ message: "Rider not found" });
  res.json({ message: "Rider unverified successfully" });
});
