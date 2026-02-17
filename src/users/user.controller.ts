import { Request, Response } from "express";
import { User } from "./user.model";
import { Plan } from "../plans/plan.model";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt, { SignOptions } from "jsonwebtoken";
import { AuthRequest } from "../utils/auth.middleware";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const userController = {
  // Get all users
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["passwordHash"] },
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
      });
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID
  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ["passwordHash"] },
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new user
  createUser: async (req: Request, res: Response) => {
    try {
      const { email, password, googleId, fullName, planId } = req.body;

      // Hash password if provided
      let passwordHash;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await User.create({
        email,
        passwordHash,
        googleId,
        fullName,
        planId,
      });

      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      res.status(201).json(userResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update user
  updateUser: async (req: Request, res: Response) => {
    try {
      const updates = req.body;

      // Don't allow direct password updates
      if (updates.password) {
        delete updates.password;
      }

      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await user.update(updates);
      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete user
  deleteUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user credit balance
  getCreditBalance: async (req: Request, res: Response) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ["creditBalance"],
      });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ creditBalance: user.creditBalance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Google OAuth authentication
  googleAuth: async (req: Request, res: Response) => {
    try {
      const { token: googleToken, plan } = req.body;
      console.log("Received Google Auth Request:", {
        plan,
        tokenHeader: googleToken.substring(0, 10),
      });

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID || "",
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ message: "Invalid Google Token" });
      }

      console.log("Google Token Payload:", payload);
      console.log("Google Token Payload:", ticket);

      const email = payload.email;
      const firstName = payload.given_name || "";
      const lastName = payload.family_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const image = payload.picture || "";

      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user with Google auth
        const passwordHash = await bcrypt.hash(
          "GOOGLE_AUTH_USER_" + Math.random().toString(36),
          10,
        );

        user = await User.create({
          email,
          fullName,
          image,
          passwordHash,
          googleId: payload.sub,
        });
      } else {
        // Update existing user
        const updates: any = {};
        if (!user.fullName && fullName) updates.fullName = fullName;
        if (!user.googleId && payload.sub) updates.googleId = payload.sub;
        if (image) updates.image = image;

        if (Object.keys(updates).length > 0) {
          await user.update(updates);
        }
      }

      console.log(`User saved/updated: ${user.email}`);

      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      // Generate JWT token
      const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
      const token = jwt.sign(
        {
          id: user.id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: "user",
        },
        JWT_SECRET,
        signOptions,
      );

      res.json({ user: userResponse, token });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      res.status(401).json({
        message: "Invalid Google Token",
        error: error.toString(),
      });
    }
  },

  // Get current user profile (renamed from verify-payment)
  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      // Extract email from JWT token (set by verifyUserToken middleware)
      const email = req.user?.email;

      if (!email) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ["passwordHash"] },
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  },
};
