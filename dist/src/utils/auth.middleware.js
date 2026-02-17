"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySelfAccess = exports.verifyUserToken = exports.verifyUser = exports.verifyAdminToken = exports.verifyAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }
        // Bearer token format: "Bearer <token>"
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader;
        if (!token) {
            return res.status(401).json({ error: "Invalid token format" });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Attach user info to request
        req.user = decoded;
        // Continue to next middleware/route handler
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        }
        return res.status(401).json({ error: "Authentication failed" });
    }
};
exports.verifyToken = verifyToken;
// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};
exports.verifyAdmin = verifyAdmin;
// Combined middleware: verify token and admin role
exports.verifyAdminToken = [exports.verifyToken, exports.verifyAdmin];
// Middleware to verify user role
const verifyUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    if (req.user.role !== "user") {
        return res.status(403).json({ error: "User access required" });
    }
    next();
};
exports.verifyUser = verifyUser;
// Combined middleware: verify token and user role
exports.verifyUserToken = [exports.verifyToken, exports.verifyUser];
// Middleware to verify user can only access their own data
const verifySelfAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user.id;
    console.log(`Self Access Check: Authenticated User ID: ${authenticatedUserId}, Requested User ID: ${requestedUserId}`);
    if (requestedUserId !== authenticatedUserId) {
        return res.status(403).json({ error: "You can only access your own data" });
    }
    next();
};
exports.verifySelfAccess = verifySelfAccess;
//# sourceMappingURL=auth.middleware.js.map