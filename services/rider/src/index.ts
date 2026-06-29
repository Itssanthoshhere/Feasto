import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import riderRoutes from "./routes/rider.routes.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import { startOrderReadyConsumer } from "./config/orderReady.consumer.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/rider", riderRoutes);

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();
    await startOrderReadyConsumer();
    app.listen(process.env.PORT, () => {
      console.log(`Rider service is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

startServer();
