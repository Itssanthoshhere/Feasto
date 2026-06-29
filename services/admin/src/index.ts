import express from "express";
import dotenv from "dotenv";
import adminRoutes from "./routes/admin.js";
import cors from "cors";

dotenv.config();

if (!process.env.PORT || !process.env.JWT_SECRET) {
  console.error(
    "FATAL ERROR: PORT and JWT_SECRET environment variables are required.",
  );
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", adminRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Admin Service is running on port ${process.env.PORT}`);
});
