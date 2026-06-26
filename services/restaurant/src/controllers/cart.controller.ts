import mongoose from "mongoose";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/trycatch.js";
import Cart from "../models/cart.js";
import Restaurant from "../models/Restaurant.js";
import MenuItem, { IMenuItem } from "../models/MenuItems.js";

export const addToCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please Login",
    });
  }

  const userId = req.user._id;

  const { restaurantId, itemId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(restaurantId) ||
    !mongoose.Types.ObjectId.isValid(itemId)
  ) {
    return res.status(400).json({
      message: "Invalid restaurant and item id",
    });
  }

  const restaurant = await Restaurant.findById(restaurantId);
  const menuItem = await MenuItem.findById(itemId);

  if (!restaurant || !menuItem) {
    return res.status(404).json({ message: "Restaurant or item not found" });
  }

  if (menuItem.restaurantId.toString() !== restaurantId.toString()) {
    return res.status(400).json({ message: "Item does not belong to this restaurant" });
  }

  if (!menuItem.isAvailable) {
    return res.status(400).json({ message: "This item is currently unavailable." });
  }

  // if (!restaurant.isOpen || !restaurant.isVerified) {
  //   return res.status(400).json({ message: "Restaurant is closed or not verified." });
  // }

  const cartFromDifferentRestaurant = await Cart.findOne({
    userId,
    restaurantId: { $ne: restaurantId },
  });

  if (cartFromDifferentRestaurant) {
    return res.status(400).json({
      message:
        "You can order from only one restaurant at a time. Please clear your cart first to add items from this restaurant.",
    });
  }

  const cartItem = await Cart.findOneAndUpdate(
    { userId, restaurantId, itemId },
    {
      $inc: { quantity: 1 },
      $setOnInsert: { userId, restaurantId, itemId },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  );

  return res.json({
    message: "Item added to cart",
    cart: cartItem,
  });
});

export const fetchMyCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please Login",
    });
  }

  const userId = req.user._id;

  const cartItems = await Cart.find({ userId })
    .populate("itemId", "name image price isAvailable")
    .populate("restaurantId", "name image autoLocation isOpen");

  let subtotal = 0;
  let cartLength = 0;

  const validCartItems = [];

  for (const cartItem of cartItems) {
    const item = cartItem.itemId as unknown as IMenuItem;
    if (!item) {
      await Cart.findByIdAndDelete(cartItem._id);
      continue;
    }

    subtotal += item.price * cartItem.quantity;
    cartLength += cartItem.quantity;
    validCartItems.push(cartItem);
  }

  return res.json({
    success: true,
    cartLength,
    subtotal,
    cart: validCartItems,
  });
});

export const incrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, itemId },
      { $inc: { quantity: 1 } },
      { returnDocument: 'after' },
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json({
      message: "Quantity increased",
      cartItem,
    });
  },
);

export const decrementCartItem = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    const { itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        message: "Invalid request",
      });
    }

    const cartItem = await Cart.findOne({ userId, itemId });

    if (!cartItem) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    if (cartItem.quantity === 1) {
      await Cart.deleteOne({ userId, itemId });

      return res.json({
        message: "Item removed from cart",
      });
    }

    cartItem.quantity -= 1;
    await cartItem.save();

    res.json({
      message: "Quantity decreased",
      cartItem,
    });
  },
);

export const clearCart = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  await Cart.deleteMany({ userId });

  res.json({
    message: "Cart cleared successfully",
  });
});
