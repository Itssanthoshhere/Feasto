import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import {
  addRestaurant,
  fetchMyRestaurant,
  fetchSingleRestaurant,
  getNearbyRestaurant,
  updateRestaurant,
  updateStatusRestaurant,
  getNotifications,
} from "../controllers/restaurant.controllers.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, uploadFile, addRestaurant);
router.get("/my", isAuth, isSeller, fetchMyRestaurant);
router.put("/status", isAuth, isSeller, updateStatusRestaurant);
router.put("/edit", isAuth, isSeller, updateRestaurant);
router.get("/all", isAuth, getNearbyRestaurant);
router.get("/notifications", isAuth, isSeller, getNotifications);
router.get("/:id", isAuth, fetchSingleRestaurant);

export default router;
