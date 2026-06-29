import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Address from "../models/Address.js";
import Cart from "../models/cart.js";
import { IMenuItem } from "../models/MenuItems.js";
import Order, { IOrder } from "../models/Order.js";
import Restaurant, { IRestaurant } from "../models/Restaurant.js";
import Promotion from "../models/Promotion.js";
import axios from "axios";
import { publishEvent } from "../config/order.publisher.js";

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const { paymentMethod, addressId, promoCode } = req.body;

  if (!addressId) {
    return res.status(400).json({
      message: "Address is required",
    });
  }

  const address = await Address.findOne({
    _id: addressId,
    userId: user._id,
  });

  if (!address) {
    return res.status(404).json({
      message: "Address Not found",
    });
  }

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const cartItems = await Cart.find({ userId: user._id })
    .populate<{ itemId: IMenuItem }>("itemId")
    .populate<{ restaurantId: IRestaurant }>("restaurantId");

  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const firstCartItem = cartItems[0];

  if (!firstCartItem || !firstCartItem.restaurantId) {
    return res.status(400).json({
      message: "Invalid Cart Data",
    });
  }

  const restaurantId = firstCartItem.restaurantId._id;

  const isMixedCart = cartItems.some(
    (item) => item.restaurantId._id.toString() !== restaurantId.toString(),
  );

  if (isMixedCart) {
    return res.status(400).json({
      message:
        "Your cart contains items from multiple restaurants. Please clear your cart or order from a single restaurant.",
    });
  }

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    return res.status(404).json({
      message: "No restaurant with this id",
    });
  }

  if (!restaurant.isOpen) {
    return res.status(404).json({
      message: "Sorry this restaurant is closed for now",
    });
  }

  const distance = getDistanceKm(
    address.location.coordinates[1],
    address.location.coordinates[0],
    restaurant.autoLocation.coordinates[1],
    restaurant.autoLocation.coordinates[0],
  );

  let subtotal = 0;

  const orderItems = cartItems.map((cart) => {
    const item = cart.itemId;

    if (!item) {
      throw new Error("Invalid cart item");
    }

    const itemTotal = item.price * cart.quantity;

    subtotal += itemTotal;

    return {
      itemId: item._id.toString(),
      name: item.name,
      price: item.price,
      quantity: cart.quantity,
    };
  });

  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  let totalAmount = subtotal + deliveryFee + platformFee;
  let discountAmount = 0;

  if (promoCode) {
    const promo = await Promotion.findOne({
      restaurantId: restaurantId,
      code: String(promoCode).toUpperCase().trim(),
      isActive: true,
    });

    if (!promo) {
      return res.status(400).json({ message: "Invalid or expired promo code" });
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return res.status(400).json({ message: "This promo code has expired" });
    }

    if (promo.minOrderValue > 0 && subtotal < promo.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order of ₹${promo.minOrderValue} required for this code`,
      });
    }

    const rawDiscount =
      promo.discountType === "percent"
        ? Math.round((subtotal * promo.discountValue) / 100)
        : promo.discountValue;
    discountAmount = Math.max(0, Math.min(rawDiscount, subtotal));
    totalAmount -= discountAmount;
  }

  const riderAmount = Math.ceil(distance) * 17;

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  let prepTimeMins = 15;
  if (restaurant.kitchenLoad === "busy") prepTimeMins = 30;
  else if (restaurant.kitchenLoad === "very_busy") prepTimeMins = 45;

  const travelTimeMins = Math.ceil(distance * 3); // 3 mins per km
  const estimatedDeliveryTime = new Date(Date.now() + (prepTimeMins + travelTimeMins) * 60000);

  const [longitude, latitude] = address.location.coordinates;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderData: any = {
      userId: user._id,
      restaurantId: restaurantId,
      restaurantName: restaurant.name,
      riderId: null,
      distance,
      riderAmount,
      items: orderItems,
      subtotal,
      deliveryFee,
      platformFee,
      discountAmount,
      totalAmount,
      addressId: address._id,
      deliveryAddress: {
        formattedAddress: address.formattedAddress,
        mobile: address.mobile,
        latitude,
        longitude,
      },
      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      expiresAt,
      estimatedDeliveryTime,
    };

    if (promoCode) {
      orderData.promoCode = String(promoCode).toUpperCase().trim();
    }

    const order = await Order.create([orderData], { session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "Order created successfully",
      orderId: order[0]?._id,
      amount: totalAmount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// Internal API
export const fetchOrderForPayment = TryCatch(async (req, res) => {
  if (!process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "pending") {
    return res.status(400).json({
      message: "Order already paid",
    });
  }

  res.json({
    orderId: order._id,
    amount: order.totalAmount,
    currency: "INR",
  });
});

export const fetchRestaurantOrders = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { restaurantId } = req.params;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!restaurantId) {
      return res.status(400).json({
        message: "Restaurant id is required",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant || restaurant.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message: "You are not authorized to access this restaurant's orders",
      });
    }

    const limit = req.query.limit ? Number(req.query.limit) : 0;

    const orders = await Order.find({ restaurantId, paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  },
);

const ALLOWED_STATUSES = ["accepted", "preparing", "ready_for_rider"] as const;

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { orderId } = req.params;
    const { status } = req.body;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "paid") {
      return res.status(404).json({
        message: "Order not completed",
      });
    }

    const restaurant = await Restaurant.findById(order.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    if (restaurant.ownerId !== user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to update this order",
      });
    }

    order.status = status;

    await order.save();

    axios
      .post(
        `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
        {
          event: "order:update",
          room: `user:${order.userId}`,
          payload: {
            orderId: order._id,
            status: order.status,
          },
        },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
          timeout: 2000,
        },
      )
      .catch((err) => {
        console.warn(
          "Failed to emit order:update event to realtime service:",
          err.message,
        );
      });

    // TODO: Now assign riders
    if (status === "ready_for_rider") {
      console.log(
        "Publishing Order ready for rider event for order",
        order._id,
      );

      await publishEvent("ORDER_READY_FOR_RIDER", {
        orderId: order._id.toString(),
        restaurantId: restaurant._id.toString(),
        location: restaurant.autoLocation,
      });

      console.log("Event Published Successfully");
    }

    res.json({
      message: "order status updated successfully",
      order,
    });
  },
);

export const getMyOrders = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const orders = await Order.find({
    userId: req.user._id.toString(),
    paymentStatus: "paid",
  }).sort({ createdAt: -1 });

  res.json({ orders });
});

export const fetchSingleOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "You are not allowed to view this order",
      });
    }

    res.json(order);
  },
);

export const assignRiderToOrder = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId, riderId, riderName, riderPicture, riderPhone } = req.body;

  const orderAvailable = await Order.findOne({
    riderId,
    status: { $ne: "delivered" },
  });

  if (orderAvailable) {
    return res.status(400).json({
      message: "You already have an order",
    });
  }

  const order = await Order.findById(orderId);

  if (order?.riderId !== null) {
    return res.status(400).json({
      message: "Order Already taken",
    });
  }

  const orderUpdated = await Order.findOneAndUpdate(
    { _id: orderId, riderId: null },
    {
      riderId,
      riderName,
      riderPicture,
      riderPhone,
      status: "rider_assigned",
    },
    { new: true },
  );

  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `user:${order.userId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    },
  );
  await axios.post(
    `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
    {
      event: "order:rider_assigned",
      room: `restaurant:${order.restaurantId}`,
      payload: order,
    },
    {
      headers: {
        "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
      },
    },
  );

  res.json({
    message: "Rider Assigned Successfully",
    success: true,
    order: orderUpdated,
  });
});

export const getCurrentOrderForRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { riderId } = req.query;

  if (!riderId || typeof riderId !== "string") {
    return res.status(400).json({
      message: "Rider id is required",
    });
  }

  const statusQuery =
    typeof req.query.status === "string" ? req.query.status : "current";
  const normalizedStatus = statusQuery.toLowerCase();

  const currentStatuses = [
    "rider_assigned",
    "picked_up",
    "ready_for_rider",
    "accepted",
    "preparing",
    "placed",
  ] as const;
  const pastStatuses = ["delivered", "cancelled"] as const;
  const allStatuses = [...currentStatuses, ...pastStatuses];

  if (!["current", "past", ...allStatuses].includes(normalizedStatus)) {
    return res.status(400).json({
      message:
        "Invalid status. Use current, past, or one of: placed, accepted, preparing, ready_for_rider, rider_assigned, picked_up, delivered, cancelled",
    });
  }

  if (normalizedStatus === "current") {
    const order = await Order.findOne({
      riderId,
      status: { $in: currentStatuses },
    })
      .sort({ updatedAt: -1 })
      .populate("restaurantId");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json(order);
  }

  const statusFilter =
    normalizedStatus === "past"
      ? { $in: pastStatuses }
      : (normalizedStatus as IOrder["status"]);

  const orders = await Order.find({
    riderId,
    status: statusFilter,
  })
    .sort({ updatedAt: -1 })
    .populate("restaurantId");

  return res.json({
    orders,
  });
});

export const updateOrderStatusRider = TryCatch(async (req, res) => {
  if (req.headers["x-internal-key"] !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }

  const { orderId } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  if (order.status === "rider_assigned") {
    order.status = "picked_up";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    return res.json({
      message: "Order updated Successfully",
    });
  }

  if (order.status === "picked_up") {
    order.status = "delivered";

    await order.save();

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `restaurant:${order.restaurantId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    await axios.post(
      `${process.env.REALTIME_SERVICE}/api/v1/internal/emit`,
      {
        event: "order:rider_assigned",
        room: `user:${order.userId}`,
        payload: order,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );

    // Increment rider earnings
    if (order.riderId) {
      try {
        await axios.post(
          `${process.env.RIDER_SERVICE}/api/rider/internal/earnings`,
          {
            riderId: order.riderId,
            amount: order.riderAmount,
            orderId: order._id,
          },
          {
            headers: {
              "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
            },
            timeout: 5000,
          },
        );
      } catch (earningsError) {
        console.error("Failed to update rider earnings:", earningsError);
      }
    }

    return res.json({
      message: "Order updated Successfully",
    });
  }
});

export const getRestaurantAnalytics = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const restaurantId = req.params.restaurantId as string;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid Restaurant ID" });
    }

    const restIdObj = new mongoose.Types.ObjectId(restaurantId);

    // Calculate totals for paid orders
    const stats = await Order.aggregate([
      {
        $match: {
          restaurantId: restIdObj,
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }, // Gross revenue
          netEarnings: { $sum: "$subtotal" }, // Net earnings
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const analytics = stats[0] || {
      totalRevenue: 0,
      netEarnings: 0,
      totalOrders: 0,
    };
    const averageOrderValue =
      analytics.totalOrders > 0
        ? Math.round(analytics.totalRevenue / analytics.totalOrders)
        : 0;

    // Get past 7 days sales data for chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailySales = await Order.aggregate([
      {
        $match: {
          restaurantId: restIdObj,
          paymentStatus: "paid",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0
    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const found = dailySales.find((s) => s._id === dateStr);
      chartData.push({
        date: dateStr,
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      });
    }

    return res.json({
      totalRevenue: analytics.totalRevenue,
      netEarnings: analytics.netEarnings,
      totalOrders: analytics.totalOrders,
      averageOrderValue,
      chartData,
    });
  },
);
