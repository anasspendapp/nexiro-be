import { Request, Response } from "express";
import { User } from "./user.model";
import bcrypt from "bcryptjs";

export const userController = {
  // Get all users
  getAllUsers: async (req: Request, res: Response) => {
    try {
      const users = await User.find().select("-passwordHash");
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user by ID
  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select("-passwordHash");
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
      const { email, password, googleId } = req.body;

      // Hash password if provided
      let passwordHash;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      const user = new User({
        email,
        passwordHash,
        googleId,
      });

      await user.save();
      const userResponse = user.toObject();
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

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select("-passwordHash");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete user
  deleteUser: async (req: Request, res: Response) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get user credit balance
  getCreditBalance: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.params.id).select("creditBalance");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ creditBalance: user.creditBalance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
