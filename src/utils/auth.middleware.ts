import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    role?: string;
  };
}

// Middleware to verify JWT token
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: string;
    };

    // Attach user info to request
    req.user = decoded;

    // Continue to next middleware/route handler
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Middleware to verify admin role
export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

// Combined middleware: verify token and admin role
export const verifyAdminToken = [verifyToken, verifyAdmin];

// Middleware to verify user role
export const verifyUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({ error: "User access required" });
  }

  next();
};

// Combined middleware: verify token and user role
export const verifyUserToken = [verifyToken, verifyUser];

// Middleware to verify user can only access their own data
export const verifySelfAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const requestedUserId = req.params.id;
  const authenticatedUserId = req.user.id;

  console.log(
    `Self Access Check: Authenticated User ID: ${authenticatedUserId}, Requested User ID: ${requestedUserId}`,
  );

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({ error: "You can only access your own data" });
  }

  next();
};
