"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeSessionController = void 0;
const stripe_session_model_1 = require("./stripe-session.model");
const user_model_1 = require("../users/user.model");
exports.stripeSessionController = {
    // Get all Stripe sessions
    getAllSessions: async (req, res) => {
        try {
            const sessions = await stripe_session_model_1.StripeSession.findAll({
                include: [
                    {
                        model: user_model_1.User,
                        as: "user",
                        attributes: ["email"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });
            res.json(sessions);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get sessions by user ID
    getSessionsByUserId: async (req, res) => {
        try {
            const sessions = await stripe_session_model_1.StripeSession.findAll({
                where: { userId: req.params.userId },
                order: [["createdAt", "DESC"]],
            });
            res.json(sessions);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get session by ID
    getSessionById: async (req, res) => {
        try {
            const session = await stripe_session_model_1.StripeSession.findByPk(req.params.id, {
                include: [
                    {
                        model: user_model_1.User,
                        as: "user",
                        attributes: ["email"],
                    },
                ],
            });
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            res.json(session);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get session by Stripe ID
    getSessionByStripeId: async (req, res) => {
        try {
            const session = await stripe_session_model_1.StripeSession.findOne({
                where: { stripeId: req.params.stripeId },
                include: [
                    {
                        model: user_model_1.User,
                        as: "user",
                        attributes: ["email"],
                    },
                ],
            });
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            res.json(session);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Create new session
    createSession: async (req, res) => {
        try {
            const session = await stripe_session_model_1.StripeSession.create(req.body);
            res.status(201).json(session);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Update session status
    updateSessionStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const updateData = { status };
            // Set processedAt if status is succeeded or failed
            if (status === "succeeded" || status === "failed") {
                updateData.processedAt = new Date();
            }
            const session = await stripe_session_model_1.StripeSession.findByPk(req.params.id);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            await session.update(updateData);
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Update session
    updateSession: async (req, res) => {
        try {
            const session = await stripe_session_model_1.StripeSession.findByPk(req.params.id);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            await session.update(req.body);
            res.json(session);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Delete session
    deleteSession: async (req, res) => {
        try {
            const session = await stripe_session_model_1.StripeSession.findByPk(req.params.id);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            await session.destroy();
            res.json({ message: "Session deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
//# sourceMappingURL=stripe-session.controller.js.map