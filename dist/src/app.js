"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = __importDefault(require("./database"));
// Import routes
const user_routes_1 = __importDefault(require("./users/user.routes"));
const price_book_routes_1 = __importDefault(require("./price-books/price-book.routes"));
const plan_routes_1 = __importDefault(require("./plans/plan.routes"));
const image_task_routes_1 = __importDefault(require("./image-tasks/image-task.routes"));
const ledger_routes_1 = __importDefault(require("./ledgers/ledger.routes"));
const stripe_session_routes_1 = __importDefault(require("./stripe-sessions/stripe-session.routes"));
const stripe_routes_1 = __importDefault(require("./stripe/stripe.routes"));
const gemini_routes_1 = __importDefault(require("./gemini/gemini.routes"));
const admin_user_routes_1 = __importDefault(require("./admin-users/admin-user.routes"));
// Import models to initialize associations
require("./users/user.model");
require("./price-books/price-book.model");
require("./plans/plan.model");
require("./image-tasks/image-task.model");
require("./ledgers/ledger.model");
require("./stripe-sessions/stripe-session.model");
require("./admin-users/admin-user.model");
// Initialize model associations
const associations_1 = require("./models/associations");
const stripe_controller_1 = require("./stripe/stripe.controller");
const auth_middleware_1 = require("./utils/auth.middleware");
require("dotenv").config();
const app = (0, express_1.default)();
const router = (0, express_1.Router)();
// Initialize associations after models are loaded
(0, associations_1.initializeAssociations)();
// Connect to PostgreSQL and sync models
database_1.default
    .authenticate()
    .then(() => {
    console.log("✅ Connected to PostgreSQL");
    return database_1.default.sync({ alter: true }); // Set to true for development to auto-update schema
})
    .then(() => console.log("✅ Database models synchronized"))
    .catch((error) => console.error("❌ Error connecting to PostgreSQL:", error));
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use("/api/stripe/webhook", express_1.default.raw({ type: "application/json" }), stripe_controller_1.handleWebhook);
app.use(express_1.default.json({ limit: "50mb" })); // Increased limit for base64 images
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true })); // Increased limit for base64 images
app.use((0, morgan_1.default)("dev"));
app.set("json spaces", 2);
// Enhanced request logging middleware
app.use((req, res, next) => {
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
    if ((method === "POST" || method === "PUT" || method === "PATCH") &&
        req.body &&
        Object.keys(req.body).length > 0) {
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
router.get("/", (req, res) => {
    res.json({
        message: "Welcome to Nexira API",
        version: "1.0.0",
        status: "running",
    });
});
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: database_1.default
            .authenticate()
            .then(() => "connected")
            .catch(() => "disconnected"),
    });
});
// API routes
router.use("/api/users", user_routes_1.default);
router.use("/api/price-books", price_book_routes_1.default);
router.use("/api/plans", plan_routes_1.default);
router.use("/api/image-tasks", image_task_routes_1.default);
router.use("/api/ledgers", auth_middleware_1.verifyAdminToken, ledger_routes_1.default);
router.use("/api/stripe-sessions", auth_middleware_1.verifyAdminToken, stripe_session_routes_1.default);
router.use("/api/admin-users", admin_user_routes_1.default);
router.use("/api/stripe", stripe_routes_1.default); // Stripe routes (webhook and checkout)
// Gemini routes
router.use("/api", gemini_routes_1.default);
app.use("/", router);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.originalUrl} not found`,
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map