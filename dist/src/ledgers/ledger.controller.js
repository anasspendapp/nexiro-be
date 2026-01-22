"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ledgerController = void 0;
const ledger_model_1 = require("./ledger.model");
const user_model_1 = require("../users/user.model");
exports.ledgerController = {
    // Get all ledger entries
    getAllEntries: async (req, res) => {
        try {
            const entries = await ledger_model_1.Ledger.findAll({
                include: [
                    {
                        model: user_model_1.User,
                        as: "user",
                        attributes: ["email"],
                    },
                ],
                order: [["timestamp", "DESC"]],
            });
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get ledger entries by user ID
    getEntriesByUserId: async (req, res) => {
        try {
            const entries = await ledger_model_1.Ledger.findAll({
                where: { userId: req.params.userId },
                order: [["timestamp", "DESC"]],
            });
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get ledger entry by ID
    getEntryById: async (req, res) => {
        try {
            const entry = await ledger_model_1.Ledger.findByPk(req.params.id, {
                include: [
                    {
                        model: user_model_1.User,
                        as: "user",
                        attributes: ["email"],
                    },
                ],
            });
            if (!entry) {
                return res.status(404).json({ error: "Ledger entry not found" });
            }
            res.json(entry);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Create new ledger entry (append-only)
    createEntry: async (req, res) => {
        try {
            const { userId, type, amount, referenceId, referenceModel, description } = req.body;
            // Get current user balance
            const user = await user_model_1.User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            // Calculate new balance
            let balanceAfter = Number(user.creditBalance);
            if (type === ledger_model_1.TransactionType.CREDIT) {
                balanceAfter += amount;
            }
            else if (type === ledger_model_1.TransactionType.DEBIT) {
                balanceAfter -= amount;
            }
            // Prevent negative balance
            if (balanceAfter < 0) {
                return res.status(400).json({ error: "Insufficient credits" });
            }
            // Create ledger entry
            const entry = await ledger_model_1.Ledger.create({
                userId,
                type,
                amount,
                balanceAfter,
                referenceId,
                referenceModel,
                description,
            });
            // Update user balance
            await user.update({ creditBalance: balanceAfter });
            res.status(201).json(entry);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Get user balance history
    getBalanceHistory: async (req, res) => {
        try {
            const entries = await ledger_model_1.Ledger.findAll({
                where: { userId: req.params.userId },
                attributes: [
                    "timestamp",
                    "type",
                    "amount",
                    "balanceAfter",
                    "description",
                ],
                order: [["timestamp", "DESC"]],
            });
            res.json(entries);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=ledger.controller.js.map