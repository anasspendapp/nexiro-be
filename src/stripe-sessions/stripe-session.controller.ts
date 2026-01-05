import { Request, Response } from "express";
import { StripeSession } from "./stripe-session.model";

export const stripeSessionController = {
  // Get all Stripe sessions
  getAllSessions: async (req: Request, res: Response) => {
    try {
      const sessions = await StripeSession.find()
        .populate("userId", "email")
        .sort({ createdAt: -1 });
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get sessions by user ID
  getSessionsByUserId: async (req: Request, res: Response) => {
    try {
      const sessions = await StripeSession.find({
        userId: req.params.userId,
      }).sort({ createdAt: -1 });
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get session by ID
  getSessionById: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findById(req.params.id).populate(
        "userId",
        "email",
      );

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get session by Stripe ID
  getSessionByStripeId: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findOne({
        stripeId: req.params.stripeId,
      }).populate("userId", "email");

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new session
  createSession: async (req: Request, res: Response) => {
    try {
      const session = new StripeSession(req.body);
      await session.save();
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update session status
  updateSessionStatus: async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      const updateData: any = { status };

      // Set processedAt if status is succeeded or failed
      if (status === "succeeded" || status === "failed") {
        updateData.processedAt = new Date();
      }

      const session = await StripeSession.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update session
  updateSession: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete session
  deleteSession: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findByIdAndDelete(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json({ message: "Session deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
