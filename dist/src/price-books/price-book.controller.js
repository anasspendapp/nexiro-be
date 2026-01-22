"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceBookController = void 0;
const price_book_model_1 = require("./price-book.model");
const plan_model_1 = require("../plans/plan.model");
exports.priceBookController = {
    // Get all price books
    getAllPriceBooks: async (req, res) => {
        try {
            const priceBooks = await price_book_model_1.PriceBook.findAll({
                order: [["effectiveFrom", "DESC"]],
                include: [
                    {
                        model: plan_model_1.Plan,
                        as: "plans",
                    },
                ],
            });
            res.json(priceBooks);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get current active price book
    getCurrentPrice: async (req, res) => {
        try {
            const currentPrice = await price_book_model_1.PriceBook.getCurrentPrice();
            if (!currentPrice) {
                return res.status(404).json({ error: "No active price found" });
            }
            res.json(currentPrice);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get current active plans only
    getCurrentPlans: async (req, res) => {
        try {
            const currentPrice = await price_book_model_1.PriceBook.getCurrentPrice();
            if (!currentPrice) {
                return res.status(404).json({ error: "No active plans found" });
            }
            // Filter only active plans from the included plans
            const activePlans = currentPrice.plans?.filter((plan) => plan.isActive) || [];
            res.json({
                plans: activePlans,
                creditsPerEnhancement: currentPrice.creditsPerEnhancement,
                versionTag: currentPrice.versionTag,
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get specific plan by name from current price book
    getPlanByName: async (req, res) => {
        try {
            const { planName } = req.params;
            const currentPrice = await price_book_model_1.PriceBook.getCurrentPrice();
            if (!currentPrice) {
                return res.status(404).json({ error: "No active price book found" });
            }
            const plan = await currentPrice.getPlanByName(planName);
            if (!plan) {
                return res.status(404).json({ error: `Plan "${planName}" not found` });
            }
            if (!plan.isActive) {
                return res
                    .status(404)
                    .json({ error: `Plan "${planName}" is not active` });
            }
            res.json(plan);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get price book by ID
    getPriceBookById: async (req, res) => {
        try {
            const priceBook = await price_book_model_1.PriceBook.findByPk(req.params.id, {
                include: [
                    {
                        model: plan_model_1.Plan,
                        as: "plans",
                    },
                ],
            });
            if (!priceBook) {
                return res.status(404).json({ error: "Price book not found" });
            }
            res.json(priceBook);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Create new price book version
    createPriceBook: async (req, res) => {
        try {
            const priceBook = await price_book_model_1.PriceBook.create(req.body);
            res.status(201).json(priceBook);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Update price book
    updatePriceBook: async (req, res) => {
        try {
            const priceBook = await price_book_model_1.PriceBook.findByPk(req.params.id);
            if (!priceBook) {
                return res.status(404).json({ error: "Price book not found" });
            }
            await priceBook.update(req.body);
            res.json(priceBook);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Delete price book
    deletePriceBook: async (req, res) => {
        try {
            const priceBook = await price_book_model_1.PriceBook.findByPk(req.params.id);
            if (!priceBook) {
                return res.status(404).json({ error: "Price book not found" });
            }
            await priceBook.destroy();
            res.json({ message: "Price book deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=price-book.controller.js.map