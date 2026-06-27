import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { initSocket } from "./socket.js";
import internalRoute from "./routes/internal.routes.js";

dotenv.config();

if (!process.env.INTERNAL_SERVICE_KEY || !process.env.JWT_SECRET) {
  console.error("FATAL ERROR: INTERNAL_SERVICE_KEY and JWT_SECRET must be set");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/internal", internalRoute);

const server = http.createServer(app);

initSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`Realtime service is running port ${process.env.PORT}`);
});
