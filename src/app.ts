import express, { Request, Response, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

// Import routes
import userRoutes from "./users/user.routes";
import priceBookRoutes from "./price-books/price-book.routes";
import imageTaskRoutes from "./image-tasks/image-task.routes";
import ledgerRoutes from "./ledgers/ledger.routes";
import stripeSessionRoutes from "./stripe-sessions/stripe-session.routes";

require("dotenv").config();

const app = express();
const router = Router();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/nexira")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("json spaces", 2);

// Enhanced request logging middleware
app.use((req: Request, res: Response, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.socket.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(`\n🌐 [${timestamp}] ${method} ${url}`);
  console.log(`📍 IP: ${ip}`);
  console.log(`🔧 User-Agent: ${userAgent}`);

  // Log request body for POST/PUT/PATCH requests
  if (
    (method === "POST" || method === "PUT" || method === "PATCH") &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    console.log("📝 Request Body:", JSON.stringify(req.body, null, 2));
  }

  // Log response details
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - startTime;
    console.log(`✅ Response: ${res.statusCode} - Duration: ${duration}ms`);
    return originalSend.call(this, body);
  };

  next();
});

// Routes
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Welcome to Nexira API",
    version: "1.0.0",
    status: "running",
  });
});

router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API routes
router.use("/api/users", userRoutes);
router.use("/api/price-books", priceBookRoutes);
router.use("/api/image-tasks", imageTaskRoutes);
router.use("/api/ledgers", ledgerRoutes);
router.use("/api/stripe-sessions", stripeSessionRoutes);

app.use("/", router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
