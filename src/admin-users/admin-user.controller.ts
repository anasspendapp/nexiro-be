import { Request, Response } from "express";
import { AdminUser } from "./admin-user.model";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const adminUserController = {
  // Get all admin users
  getAllAdminUsers: async (req: Request, res: Response) => {
    try {
      const adminUsers = await AdminUser.findAll({
        attributes: { exclude: ["passwordHash"] },
        order: [["createdAt", "DESC"]],
      });
      res.json(adminUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get admin user by ID
  getAdminUserById: async (req: Request, res: Response) => {
    try {
      const adminUser = await AdminUser.findByPk(req.params.id, {
        attributes: { exclude: ["passwordHash"] },
      });
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }
      res.json(adminUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new admin user
  createAdminUser: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Name, email, and password are required",
        });
      }

      // Check if admin user already exists
      const existingUser = await AdminUser.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          error: "Admin user with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create admin user
      const adminUser = await AdminUser.create({
        name,
        email,
        passwordHash,
      });

      const { passwordHash: _, ...adminUserResponse } = adminUser.toJSON();

      res.status(201).json(adminUserResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update admin user
  updateAdminUser: async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const updates: any = {};

      if (name) updates.name = name;
      if (email) updates.email = email;

      // Hash password if provided
      if (password) {
        updates.passwordHash = await bcrypt.hash(password, 10);
      }

      const adminUser = await AdminUser.findByPk(req.params.id);
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      await adminUser.update(updates);
      const { passwordHash: _, ...adminUserResponse } = adminUser.toJSON();

      res.json(adminUserResponse);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete admin user
  deleteAdminUser: async (req: Request, res: Response) => {
    try {
      const adminUser = await AdminUser.findByPk(req.params.id);
      if (!adminUser) {
        return res.status(404).json({ error: "Admin user not found" });
      }
      await adminUser.destroy();
      res.json({ message: "Admin user deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Login admin user
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      // Find admin user by email
      const adminUser = await AdminUser.findOne({ where: { email } });
      if (!adminUser) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        password,
        adminUser.passwordHash,
      );
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
      const token = jwt.sign(
        {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: "admin",
        },
        JWT_SECRET,
        signOptions,
      );

      // Return token and user info
      const { passwordHash: _, ...adminUserResponse } = adminUser.toJSON();

      res.json({
        token,
        user: adminUserResponse,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
