import { Request, Response } from "express";
import { PriceBook } from "./price-book.model";

export const priceBookController = {
  // Get all price books
  getAllPriceBooks: async (req: Request, res: Response) => {
    try {
      const priceBooks = await PriceBook.find().sort({ effectiveFrom: -1 });
      res.json(priceBooks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get current active price book
  getCurrentPrice: async (req: Request, res: Response) => {
    try {
      const currentPrice = await PriceBook.findOne({
        effectiveFrom: { $lte: new Date() },
      }).sort({ effectiveFrom: -1 });

      if (!currentPrice) {
        return res.status(404).json({ error: "No active price found" });
      }

      res.json(currentPrice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get current active plans only
  getCurrentPlans: async (req: Request, res: Response) => {
    try {
      const currentPrice = await PriceBook.findOne({
        effectiveFrom: { $lte: new Date() },
      }).sort({ effectiveFrom: -1 });

      if (!currentPrice) {
        return res.status(404).json({ error: "No active plans found" });
      }

      // Filter only active plans
      const activePlans = currentPrice.plans.filter((plan) => plan.isActive);

      res.json({
        plans: activePlans,
        creditsPerEnhancement: currentPrice.creditsPerEnhancement,
        versionTag: currentPrice.versionTag,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get specific plan by name from current price book
  getPlanByName: async (req: Request, res: Response) => {
    try {
      const { planName } = req.params;

      const currentPrice = await PriceBook.findOne({
        effectiveFrom: { $lte: new Date() },
      }).sort({ effectiveFrom: -1 });

      if (!currentPrice) {
        return res.status(404).json({ error: "No active price book found" });
      }

      const plan = currentPrice.getPlanByName(planName);

      if (!plan) {
        return res.status(404).json({ error: `Plan "${planName}" not found` });
      }

      if (!plan.isActive) {
        return res
          .status(404)
          .json({ error: `Plan "${planName}" is not active` });
      }

      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get price book by ID
  getPriceBookById: async (req: Request, res: Response) => {
    try {
      const priceBook = await PriceBook.findById(req.params.id);
      if (!priceBook) {
        return res.status(404).json({ error: "Price book not found" });
      }
      res.json(priceBook);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new price book version
  createPriceBook: async (req: Request, res: Response) => {
    try {
      const priceBook = new PriceBook(req.body);
      await priceBook.save();
      res.status(201).json(priceBook);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update price book
  updatePriceBook: async (req: Request, res: Response) => {
    try {
      const priceBook = await PriceBook.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true },
      );

      if (!priceBook) {
        return res.status(404).json({ error: "Price book not found" });
      }

      res.json(priceBook);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete price book
  deletePriceBook: async (req: Request, res: Response) => {
    try {
      const priceBook = await PriceBook.findByIdAndDelete(req.params.id);
      if (!priceBook) {
        return res.status(404).json({ error: "Price book not found" });
      }
      res.json({ message: "Price book deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
