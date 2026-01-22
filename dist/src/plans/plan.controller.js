"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planController = void 0;
const plan_model_1 = require("./plan.model");
const price_book_model_1 = require("../price-books/price-book.model");
exports.planController = {
    // Get all plans
    getAllPlans: async (req, res) => {
        try {
            const plans = await plan_model_1.Plan.findAll({
                include: [
                    {
                        model: price_book_model_1.PriceBook,
                        as: "priceBook",
                        attributes: ["versionTag", "effectiveFrom"],
                    },
                ],
                order: [["price", "ASC"]],
            });
            res.json(plans);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get all active plans
    getActivePlans: async (req, res) => {
        try {
            const plans = await plan_model_1.Plan.getActivePlans();
            res.json(plans);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get plan by ID
    getPlanById: async (req, res) => {
        try {
            const plan = await plan_model_1.Plan.findByPk(req.params.id, {
                include: [
                    {
                        model: price_book_model_1.PriceBook,
                        as: "priceBook",
                    },
                ],
            });
            if (!plan) {
                return res.status(404).json({ error: "Plan not found" });
            }
            res.json(plan);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get plan by name
    getPlanByName: async (req, res) => {
        try {
            const { name } = req.params;
            const plan = await plan_model_1.Plan.getPlanByName(name);
            if (!plan) {
                return res.status(404).json({ error: `Plan "${name}" not found` });
            }
            res.json(plan);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Create new plan
    createPlan: async (req, res) => {
        try {
            const plan = await plan_model_1.Plan.create(req.body);
            res.status(201).json(plan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Update plan
    updatePlan: async (req, res) => {
        try {
            const plan = await plan_model_1.Plan.findByPk(req.params.id);
            if (!plan) {
                return res.status(404).json({ error: "Plan not found" });
            }
            await plan.update(req.body);
            res.json(plan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Delete plan
    deletePlan: async (req, res) => {
        try {
            const plan = await plan_model_1.Plan.findByPk(req.params.id);
            if (!plan) {
                return res.status(404).json({ error: "Plan not found" });
            }
            await plan.destroy();
            res.json({ message: "Plan deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Toggle plan active status
    togglePlanStatus: async (req, res) => {
        try {
            const plan = await plan_model_1.Plan.findByPk(req.params.id);
            if (!plan) {
                return res.status(404).json({ error: "Plan not found" });
            }
            await plan.update({ isActive: !plan.isActive });
            res.json(plan);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=plan.controller.js.map