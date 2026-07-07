import express from "express";
import {
  addUserRole,
  loginUser,
  mobileLoginUser,
  myProfile,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/mobile-login", mobileLoginUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
