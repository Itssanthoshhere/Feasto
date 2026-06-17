import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  connectDB();
});
