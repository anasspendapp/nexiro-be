import { Request, Response } from "express";
import { Plan } from "./plan.model";
import { PriceBook } from "../price-books/price-book.model";

export const planController = {
  // Get all plans
  getAllPlans: async (req: Request, res: Response) => {
    try {
      const plans = await Plan.findAll({
        include: [
          {
            model: PriceBook,
            as: "priceBook",
            attributes: ["versionTag", "effectiveFrom"],
          },
        ],
        order: [["price", "ASC"]],
      });
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all active plans
  getActivePlans: async (req: Request, res: Response) => {
    try {
      const plans = await Plan.getActivePlans();
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get plan by ID
  getPlanById: async (req: Request, res: Response) => {
    try {
      const plan = await Plan.findByPk(req.params.id, {
        include: [
          {
            model: PriceBook,
            as: "priceBook",
          },
        ],
      });
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get plan by name
  getPlanByName: async (req: Request, res: Response) => {
    try {
      const { name } = req.params;
      const plan = await Plan.getPlanByName(name);

      if (!plan) {
        return res.status(404).json({ error: `Plan "${name}" not found` });
      }

      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new plan
  createPlan: async (req: Request, res: Response) => {
    try {
      const plan = await Plan.create(req.body);
      res.status(201).json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update plan
  updatePlan: async (req: Request, res: Response) => {
    try {
      const plan = await Plan.findByPk(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      await plan.update(req.body);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete plan
  deletePlan: async (req: Request, res: Response) => {
    try {
      const plan = await Plan.findByPk(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }
      await plan.destroy();
      res.json({ message: "Plan deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Toggle plan active status
  togglePlanStatus: async (req: Request, res: Response) => {
    try {
      const plan = await Plan.findByPk(req.params.id);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      await plan.update({ isActive: !plan.isActive });
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
};
