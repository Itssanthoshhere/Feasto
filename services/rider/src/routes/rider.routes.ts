import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addRiderProfile,
  fetchMyProfile,
  toggleRiderAvailablity,
} from "../controllers/rider.controller.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, addRiderProfile);

router.get("/myprofile", isAuth, fetchMyProfile);
router.patch("/toggle", isAuth, toggleRiderAvailablity);

export default router;
