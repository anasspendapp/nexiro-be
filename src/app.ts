import express, { Request, Response, Router } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import sequelize from "./database";

// Import routes
import userRoutes from "./users/user.routes";
import priceBookRoutes from "./price-books/price-book.routes";
import planRoutes from "./plans/plan.routes";
import imageTaskRoutes from "./image-tasks/image-task.routes";
import ledgerRoutes from "./ledgers/ledger.routes";
import stripeSessionRoutes from "./stripe-sessions/stripe-session.routes";
import stripeRoutes from "./stripe/stripe.routes";
import geminiRoutes from "./gemini/gemini.routes";
import adminUserRoutes from "./admin-users/admin-user.routes";

// Import models to initialize associations
import "./users/user.model";
import "./price-books/price-book.model";
import "./plans/plan.model";
import "./image-tasks/image-task.model";
import "./ledgers/ledger.model";
import "./stripe-sessions/stripe-session.model";
import "./admin-users/admin-user.model";

// Initialize model associations
import { initializeAssociations } from "./models/associations";
import { handleWebhook } from "./stripe/stripe.controller";

require("dotenv").config();

const app = express();
const router = Router();

// Initialize associations after models are loaded
initializeAssociations();

// Connect to PostgreSQL and sync models
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");
    return sequelize.sync({ alter: true }); // Set to true for development to auto-update schema
  })
  .then(() => console.log("✅ Database models synchronized"))
  .catch((error) => console.error("❌ Error connecting to PostgreSQL:", error));

// Middleware
app.use(helmet());
app.use(cors());

app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

app.use(express.json({ limit: "50mb" })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increased limit for base64 images
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
    database: sequelize
      .authenticate()
      .then(() => "connected")
      .catch(() => "disconnected"),
  });
});

// API routes
router.use("/api/users", userRoutes);
router.use("/api/price-books", priceBookRoutes);
router.use("/api/plans", planRoutes);
router.use("/api/image-tasks", imageTaskRoutes);
router.use("/api/ledgers", ledgerRoutes);
router.use("/api/stripe-sessions", stripeSessionRoutes);
router.use("/api/admin-users", adminUserRoutes);
router.use("/api/stripe", stripeRoutes); // Stripe routes (webhook and checkout)

// Gemini routes
router.use("/api", geminiRoutes);

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
