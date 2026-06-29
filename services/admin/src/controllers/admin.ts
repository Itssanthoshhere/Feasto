import { ObjectId } from "mongodb";
import TryCatch from "../middlewares/trycatch.js";
import {
  getMenuCollection,
  getOrderCollection,
  getRestaurantCollection,
  getRiderCollection,
  getUserCollection,
  getActivityLogCollection,
  getNotificationCollection,
} from "../util/collection.js";

const logActivity = async (
  action: string,
  targetType: string,
  targetId: string,
) => {
  try {
    const col = await getActivityLogCollection();
    await col.insertOne({
      action,
      targetType,
      targetId,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};

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

  logActivity("Verified Restaurant", "restaurant", id);
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

  logActivity("Verified Rider", "rider", id);
});

export const getAllRestaurants = TryCatch(async (req, res) => {
  const restaurants = await (await getRestaurantCollection())
    .find({})
    .toArray();
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
  const result = await (
    await getRestaurantCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVerified: false, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0)
    return res.status(404).json({ message: "Restaurant not found" });
  res.json({ message: "Restaurant unverified successfully" });

  logActivity("Unverified Restaurant", "restaurant", id);
});

export const unverifyRider = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid object id" });
  }
  const result = await (
    await getRiderCollection()
  ).updateOne(
    { _id: new ObjectId(id) },
    { $set: { isVerified: false, isAvailble: false, updatedAt: new Date() } },
  );
  if (result.matchedCount === 0)
    return res.status(404).json({ message: "Rider not found" });
  res.json({ message: "Rider unverified successfully" });

  logActivity("Unverified Rider", "rider", id);
});

export const getAnalytics = TryCatch(async (req, res) => {
  const [restaurantsCount, onlineRidersCount, orders] = await Promise.all([
    (await getRestaurantCollection()).countDocuments({ isVerified: true }),
    (await getRiderCollection()).countDocuments({
      isAvailble: true,
      isVerified: true,
    }),
    (await getOrderCollection()).find({}).toArray(),
  ]);

  const activeOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0,
  );

  res.json({
    activeOrdersCount: activeOrders.length,
    totalRevenue,
    restaurantsCount,
    onlineRidersCount,
  });
});

export const getActiveOrders = TryCatch(async (req, res) => {
  const orders = await (
    await getOrderCollection()
  )
    .find({ status: { $nin: ["delivered", "cancelled"] } })
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ count: orders.length, orders });
});

export const getRestaurantMenu = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid restaurant id" });
  }

  const menu = await (await getMenuCollection())
    .find({ restaurantId: new ObjectId(id) })
    .toArray();

  res.json({ count: menu.length, menu });
});

export const getRevenueChart = TryCatch(async (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orders = await (
    await getOrderCollection()
  )
    .find({ status: "delivered", createdAt: { $gte: thirtyDaysAgo } })
    .sort({ createdAt: 1 })
    .toArray();

  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  orders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dailyMap[key] !== undefined) dailyMap[key] += o.totalAmount || 0;
  });

  const chart = Object.entries(dailyMap).map(([date, revenue]) => ({
    date,
    revenue,
  }));
  res.json({ chart });
});

export const getOrderHistory = TryCatch(async (req, res) => {
  const { status } = req.query;
  const filter: any = {};
  if (status && status !== "all") filter.status = status;

  const orders = await (await getOrderCollection())
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  res.json({ count: orders.length, orders });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const users = await (await getUserCollection()).find({}).toArray();
  res.json({ count: users.length, users });
});

export const getActivityLog = TryCatch(async (req, res) => {
  const logs = await (await getActivityLogCollection())
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  res.json({ count: logs.length, logs });
});

export const sendNotification = TryCatch(async (req, res) => {
  const { target, message } = req.body;

  if (!target || !message) {
    return res.status(400).json({ message: "target and message are required" });
  }

  const notification = {
    target,
    message,
    createdAt: new Date(),
    read: false,
  };

  await (await getNotificationCollection()).insertOne(notification);

  logActivity(`Sent notification to ${target}`, "notification", "");

  res.json({ message: "Notification sent successfully" });
});

export const getNotifications = TryCatch(async (req, res) => {
  const notifications = await (await getNotificationCollection())
    .find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  res.json({ count: notifications.length, notifications });
});

export const dismissNotification = TryCatch(async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid id" });
  await (
    await getNotificationCollection()
  ).updateOne({ _id: new ObjectId(id) }, { $set: { read: true } });
  res.json({ message: "Notification dismissed" });
});
