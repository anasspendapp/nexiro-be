import { Request, Response } from "express";
import { User } from "./user.model";
import { Plan } from "../plans/plan.model";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

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
      const { token, plan } = req.body;
      console.log("Received Google Auth Request:", {
        plan,
        tokenHeader: token.substring(0, 10),
      });

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || "",
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(401).json({ message: "Invalid Google Token" });
      }

      const email = payload.email;
      const firstName = payload.given_name || "";
      const lastName = payload.family_name || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const isPro =
        plan === "pro" ||
        plan === "PRO" ||
        plan === "Pro" ||
        plan === "STARTER";

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
          passwordHash,
          googleId: payload.sub,
        });
      } else {
        // Update existing user
        const updates: any = {};
        if (!user.fullName && fullName) updates.fullName = fullName;
        if (!user.googleId && payload.sub) updates.googleId = payload.sub;

        // Update plan if provided and is an upgrade
        if (plan && (plan === "PRO" || plan === "STARTER")) {
          updates.plan = plan;
          updates.isPro = true;
        }

        if (Object.keys(updates).length > 0) {
          await user.update(updates);
        }
      }

      console.log(`User saved/updated: ${user.email}`);

      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      res.json({ user: userResponse });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      res.status(401).json({
        message: "Invalid Google Token",
        error: error.toString(),
      });
    }
  },

  // Get current user profile (renamed from verify-payment)
  getCurrentUser: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
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
