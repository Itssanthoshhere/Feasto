import express from "express";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import cors from "cors";
import helmet from "helmet";
import uploadRoutes from "./routes/cloudinary.routes.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173", // Frontend (Vite)
    "http://localhost:8001", // Auth service
    "http://localhost:8002", // Restaurant service
  ],
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_SECRET_KEY } = process.env;

if (!CLOUD_NAME || !CLOUD_API_KEY || !CLOUD_SECRET_KEY) {
  const missing = [];
  if (!CLOUD_NAME) missing.push("CLOUD_NAME");
  if (!CLOUD_API_KEY) missing.push("CLOUD_API_KEY");
  if (!CLOUD_SECRET_KEY) missing.push("CLOUD_SECRET_KEY");
  throw new Error(
    `Missing required Cloudinary environment variables: ${missing.join(", ")}`
  );
}

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_SECRET_KEY,
});

app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 8003;

app.listen(PORT, () => {
  console.log(`Utils service is running on port ${PORT}`);
});
