import express from "express";
import { isAdmin, isAuth } from "../middlewares/isAuth.js";
import {
  getPendingRestaurant,
  getPendingRiders,
  verifyRestaurant,
  verifyRider,
  getAllRestaurants,
  getAllRiders,
  unverifyRestaurant,
  unverifyRider,
  getAnalytics,
  getActiveOrders,
  getRestaurantMenu,
  getRevenueChart,
  getOrderHistory,
  getAllUsers,
  getActivityLog,
  sendNotification,
  getNotifications,
  dismissNotification,
} from "../controllers/admin.js";

const router = express.Router();

router.get("/admin/analytics", isAuth, isAdmin, getAnalytics);
router.get("/admin/orders/active", isAuth, isAdmin, getActiveOrders);
router.get("/admin/restaurant/:id/menu", isAuth, isAdmin, getRestaurantMenu);

router.get("/admin/restaurant/pending", isAuth, isAdmin, getPendingRestaurant);
router.get("/admin/rider/pending", isAuth, isAdmin, getPendingRiders);

router.get("/admin/restaurant/all", isAuth, isAdmin, getAllRestaurants);
router.get("/admin/rider/all", isAuth, isAdmin, getAllRiders);

router.patch("/verify/rider/:id", isAuth, isAdmin, verifyRider);
router.patch("/verify/restaurant/:id", isAuth, isAdmin, verifyRestaurant);

router.patch("/unverify/rider/:id", isAuth, isAdmin, unverifyRider);
router.patch("/unverify/restaurant/:id", isAuth, isAdmin, unverifyRestaurant);

// Phase 2
router.get("/admin/revenue-chart", isAuth, isAdmin, getRevenueChart);
router.get("/admin/orders/history", isAuth, isAdmin, getOrderHistory);
router.get("/admin/users", isAuth, isAdmin, getAllUsers);
router.get("/admin/activity-log", isAuth, isAdmin, getActivityLog);
router.post("/admin/notify", isAuth, isAdmin, sendNotification);
router.get("/admin/notifications", isAuth, isAdmin, getNotifications);
router.patch(
  "/admin/notification/:id/dismiss",
  isAuth,
  isAdmin,
  dismissNotification,
);

export default router;
