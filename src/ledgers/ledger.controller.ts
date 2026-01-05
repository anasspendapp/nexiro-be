import { Request, Response } from "express";
import { Ledger, TransactionType } from "./ledger.model";
import { User } from "../users/user.model";

export const ledgerController = {
  // Get all ledger entries
  getAllEntries: async (req: Request, res: Response) => {
    try {
      const entries = await Ledger.find()
        .populate("userId", "email")
        .sort({ timestamp: -1 });
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get ledger entries by user ID
  getEntriesByUserId: async (req: Request, res: Response) => {
    try {
      const entries = await Ledger.find({ userId: req.params.userId }).sort({
        timestamp: -1,
      });
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get ledger entry by ID
  getEntryById: async (req: Request, res: Response) => {
    try {
      const entry = await Ledger.findById(req.params.id).populate(
        "userId",
        "email",
      );

      if (!entry) {
        return res.status(404).json({ error: "Ledger entry not found" });
      }
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new ledger entry (append-only)
  createEntry: async (req: Request, res: Response) => {
    try {
      const { userId, type, amount, referenceId, referenceModel, description } =
        req.body;

      // Get current user balance
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Calculate new balance
      let balanceAfter = user.creditBalance;
      if (type === TransactionType.CREDIT) {
        balanceAfter += amount;
      } else if (type === TransactionType.DEBIT) {
        balanceAfter -= amount;
      }

      // Prevent negative balance
      if (balanceAfter < 0) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      // Create ledger entry
      const entry = new Ledger({
        userId,
        type,
        amount,
        balanceAfter,
        referenceId,
        referenceModel,
        description,
      });

      await entry.save();

      // Update user balance
      user.creditBalance = balanceAfter;
      await user.save();

      res.status(201).json(entry);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user balance history
  getBalanceHistory: async (req: Request, res: Response) => {
    try {
      const entries = await Ledger.find({ userId: req.params.userId })
        .sort({ timestamp: -1 })
        .select("timestamp type amount balanceAfter description");

      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
