import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  acceptOrder,
  addRiderProfile,
  fetchMyCurrentOrder,
  fetchMyProfile,
  incrementRiderEarnings,
  toggleRiderAvailablity,
  updateOrderStatus,
  updateRiderLocation,
  updateRiderProfile,
  getNotifications,
} from "../controllers/rider.controller.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);

router.get("/myprofile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toggleRiderAvailablity);
router.post("/accept/:orderId", isAuth, acceptOrder);
router.get("/order/current", isAuth, fetchMyCurrentOrder);
router.put("/order/update/:orderId", isAuth, updateOrderStatus);
router.post("/location", isAuth, updateRiderLocation);
router.patch("/profile", isAuth, uploadFile, updateRiderProfile);
router.post("/internal/earnings", incrementRiderEarnings);
router.get("/notifications", isAuth, getNotifications);

export default router;
