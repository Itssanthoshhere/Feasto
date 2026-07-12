import express from "express";
import {
  addUserRole,
  loginUser,
  mobileLoginUser,
  appleLoginUser,
  myProfile,
  savePushToken,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/mobile-login", mobileLoginUser);
router.post("/apple-login", appleLoginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);
router.patch("/push-token", isAuth, savePushToken);

export default router;
