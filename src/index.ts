import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import http from "http";
import { Server } from "socket.io";
import setupSocket from "./config/socket";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use(globalErrorHandler);

const server = http.createServer(app);
const io: Server = setupSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
