import "dotenv/config";
import "express-async-errors";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from "socket.io";

import connectMongoDB from "./configs/connectMongoDB.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { setIO } from "./utils/socket.util.js";
import { registerSeatMapSocket } from "./sockets/seatMap.socket.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import stationRoutes from "./routes/station.route.js";
import trainRoutes from "./routes/train.route.js";
import routeRoutes from "./routes/route.route.js";
import scheduleRoutes from "./routes/schedule.route.js";
import classRoutes from "./routes/class.route.js";
import fareRoutes from "./routes/fare.route.js";
import coachRoutes from "./routes/coach.route.js";
import seatRoutes from "./routes/seat.route.js";
import bookingRoutes from "./routes/booking.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import paymentRoutes from "./routes/payment.route.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.route.js";
import adminRoutes from "./routes/admin.route.js";
import reportRoutes from "./routes/report.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security & infra middleware
app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// The stripeWebhook route applies its own express.raw() body parser. (Stripe webhook MUST be mounted before express.json())
app.use("/api/stripe/webhook", stripeWebhookRoutes);

// JSON parser for everything else
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) =>
  res.json({
    success: true,
    message: "NexTrain API up",
    time: new Date().toISOString(),
  }),
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/fares", fareRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportRoutes);

// 404
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// HTTP + Socket.io
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});
setIO(io);
registerSeatMapSocket(io);

// Boot
const start = async () => {
  await connectMongoDB();
  httpServer.listen(PORT, () => {
    console.log(`🚆 NexTrain API listening on http://localhost:${PORT}`);
    console.log(`   ↳ CORS origin: ${CLIENT_URL}`);
    console.log(`   ↳ Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down...`);
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
