import { Request, Response } from "express";
import { StripeSession } from "./stripe-session.model";
import { User } from "../users/user.model";
import { Plan } from "../plans/plan.model";

export const stripeSessionController = {
  // Get all Stripe sessions
  getAllSessions: async (req: Request, res: Response) => {
    try {
      const sessions = await StripeSession.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get sessions by user ID
  getSessionsByUserId: async (req: Request, res: Response) => {
    try {
      const sessions = await StripeSession.findAll({
        where: { userId: req.params.userId },
        include: [
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get session by ID
  getSessionById: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
      });

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
        where: { stripeId: req.params.stripeId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "email"],
          },
          {
            model: Plan,
            as: "plan",
            attributes: ["id", "name", "price", "credits"],
          },
        ],
      });

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
      const session = await StripeSession.create(req.body);
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

      const session = await StripeSession.findByPk(req.params.id);

      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      await session.update(updateData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update session
  updateSession: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findByPk(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      await session.update(req.body);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete session
  deleteSession: async (req: Request, res: Response) => {
    try {
      const session = await StripeSession.findByPk(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      await session.destroy();
      res.json({ message: "Session deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
