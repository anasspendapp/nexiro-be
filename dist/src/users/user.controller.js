"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_model_1 = require("./user.model");
const plan_model_1 = require("../plans/plan.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.userController = {
    // Get all users
    getAllUsers: async (req, res) => {
        try {
            const users = await user_model_1.User.findAll({
                attributes: { exclude: ["passwordHash"] },
                include: [
                    {
                        model: plan_model_1.Plan,
                        as: "plan",
                        attributes: ["id", "name", "price", "credits"],
                    },
                ],
            });
            res.json(users);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get user by ID
    getUserById: async (req, res) => {
        try {
            const user = await user_model_1.User.findByPk(req.params.id, {
                attributes: { exclude: ["passwordHash"] },
                include: [
                    {
                        model: plan_model_1.Plan,
                        as: "plan",
                        attributes: ["id", "name", "price", "credits"],
                    },
                ],
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json(user);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Create new user
    createUser: async (req, res) => {
        try {
            const { email, password, googleId, fullName, planId } = req.body;
            // Hash password if provided
            let passwordHash;
            if (password) {
                passwordHash = await bcryptjs_1.default.hash(password, 10);
            }
            const user = await user_model_1.User.create({
                email,
                passwordHash,
                googleId,
                fullName,
                planId,
            });
            const userResponse = user.toJSON();
            delete userResponse.passwordHash;
            res.status(201).json(userResponse);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Update user
    updateUser: async (req, res) => {
        try {
            const updates = req.body;
            // Don't allow direct password updates
            if (updates.password) {
                delete updates.password;
            }
            const user = await user_model_1.User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            await user.update(updates);
            const userResponse = user.toJSON();
            delete userResponse.passwordHash;
            res.json(userResponse);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Delete user
    deleteUser: async (req, res) => {
        try {
            const user = await user_model_1.User.findByPk(req.params.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            await user.destroy();
            res.json({ message: "User deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Get user credit balance
    getCreditBalance: async (req, res) => {
        try {
            const user = await user_model_1.User.findByPk(req.params.id, {
                attributes: ["creditBalance"],
            });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.json({ creditBalance: user.creditBalance });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Google OAuth authentication
    googleAuth: async (req, res) => {
        try {
            const { token, plan } = req.body;
            console.log("Received Google Auth Request:", {
                plan,
                tokenHeader: token.substring(0, 10),
            });
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID || "",
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                return res.status(401).json({ message: "Invalid Google Token" });
            }
            console.log("Google Token Payload:", payload);
            console.log("Google Token Payload:", ticket);
            const email = payload.email;
            const firstName = payload.given_name || "";
            const lastName = payload.family_name || "";
            const fullName = `${firstName} ${lastName}`.trim();
            const image = payload.picture || "";
            const isPro = plan === "pro" ||
                plan === "PRO" ||
                plan === "Pro" ||
                plan === "STARTER";
            let user = await user_model_1.User.findOne({ where: { email } });
            if (!user) {
                // Create new user with Google auth
                const passwordHash = await bcryptjs_1.default.hash("GOOGLE_AUTH_USER_" + Math.random().toString(36), 10);
                user = await user_model_1.User.create({
                    email,
                    fullName,
                    image,
                    passwordHash,
                    googleId: payload.sub,
                });
            }
            else {
                // Update existing user
                const updates = {};
                if (!user.fullName && fullName)
                    updates.fullName = fullName;
                if (!user.googleId && payload.sub)
                    updates.googleId = payload.sub;
                if (image)
                    updates.image = image;
                // Update plan if provided and is an upgrade
                if (plan && (plan === "PRO" || plan === "STARTER")) {
                    updates.plan = plan;
                    updates.isPro = true;
                }
                if (Object.keys(updates).length > 0) {
                    await user.update(updates);
                }
            }
            console.log(`User saved/updated: ${user.email}`);
            const userResponse = user.toJSON();
            delete userResponse.passwordHash;
            res.json({ user: userResponse });
        }
        catch (error) {
            console.error("Google Auth Error:", error);
            res.status(401).json({
                message: "Invalid Google Token",
                error: error.toString(),
            });
        }
    },
    // Get current user profile (renamed from verify-payment)
    getCurrentUser: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }
            const user = await user_model_1.User.findOne({
                where: { email },
                attributes: { exclude: ["passwordHash"] },
                include: [
                    {
                        model: plan_model_1.Plan,
                        as: "plan",
                        attributes: ["id", "name", "price", "credits"],
                    },
                ],
            });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user });
        }
        catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    },
};
//# sourceMappingURL=user.controller.js.map