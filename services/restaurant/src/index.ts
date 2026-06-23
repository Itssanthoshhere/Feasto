import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

import restaurantRoutes from "./routes/restaurant.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8002;

app.use("/api/restaurant", restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Restaurant service is running on port ${PORT}`);
  connectDB();
});
