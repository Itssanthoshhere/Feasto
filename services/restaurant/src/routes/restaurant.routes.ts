import express from "express";
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addRestaurant } from "../controllers/restaurant.controllers.js";

const router = express.Router();

router.post("/new", isAuth, isSeller, addRestaurant);

export default router;
