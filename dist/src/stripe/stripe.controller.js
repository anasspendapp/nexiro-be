"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.handleWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const user_model_1 = require("../users/user.model");
const plan_model_1 = require("../plans/plan.model");
const stripe_session_model_1 = require("../stripe-sessions/stripe-session.model");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "");
// Webhook handler for Stripe events
const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    }
    catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const stripeSessionId = session.id;
        console.log("Processing checkout.session.completed webhook:", stripeSessionId);
        try {
            // Find the stripe session record by stripeId
            const stripeSession = await stripe_session_model_1.StripeSession.findOne({
                where: { stripeId: stripeSessionId },
            });
            if (!stripeSession) {
                console.error("StripeSession not found for stripeId:", stripeSessionId);
                return res
                    .status(404)
                    .json({ message: "StripeSession record not found" });
            }
            // Find the plan by planId from stripe session
            const plan = await plan_model_1.Plan.findByPk(stripeSession.planId);
            if (!plan) {
                console.error("Plan not found for planId:", stripeSession.planId);
                return res.status(404).json({ message: "Plan not found" });
            }
            // Find the user
            const user = await user_model_1.User.findByPk(stripeSession.userId);
            if (!user) {
                console.error("User not found for userId:", stripeSession.userId);
                return res.status(404).json({ message: "User not found" });
            }
            // Update stripe session status to succeeded
            await stripeSession.update({
                status: "succeeded",
                processedAt: new Date(),
            });
            // Update user with new plan and credits
            await user.update({
                planId: plan.id,
                creditBalance: user.creditBalance + plan.credits,
            });
            console.log(`Payment successful for user ${user.email}. Plan: ${plan.name}, Credits added: ${plan.credits}`);
        }
        catch (dbErr) {
            console.error("Database update failed:", dbErr.message);
            // Still return success to Stripe to avoid retry
            return res.json({ received: true, error: dbErr.message });
        }
    }
    res.json({ received: true });
};
exports.handleWebhook = handleWebhook;
// Create Stripe checkout session
const createCheckoutSession = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user?.id;
        console.log("Create Checkout Session Request:", {
            planId,
            userId,
            userEmail: req.user?.email,
        });
        if (!planId) {
            console.error("Missing Plan ID");
            return res
                .status(400)
                .json({ message: "Plan ID is missing. Please contact support." });
        }
        if (!userId) {
            console.error("Missing User ID");
            return res
                .status(401)
                .json({ message: "User authentication required. Please log in." });
        }
        const plan = await plan_model_1.Plan.findOne({ where: { id: planId, isActive: true } });
        if (!plan || !plan.stripeKey) {
            console.error("Plan not found or missing stripeKey");
            return res
                .status(404)
                .json({ message: "Plan not found or not available for purchase." });
        }
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe Secret Key not configured");
        }
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: plan.stripeKey,
                    quantity: 1,
                },
            ],
            customer_email: req.user?.email,
            success_url: `${req.headers.origin}?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${req.headers.origin}?canceled=true`,
        });
        // Create StripeSession record to track this transaction
        const stripeSessionRecord = await stripe_session_model_1.StripeSession.create({
            userId,
            planId,
            stripeId: session.id,
            amount: plan.price,
            status: "pending",
        });
        console.log(`StripeSession created: ${stripeSessionRecord.id} for session ${session.id}`);
        return res.json({
            url: session.url,
            sessionId: session.id,
            stripeSessionId: stripeSessionRecord.id,
        });
    }
    catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
//# sourceMappingURL=stripe.controller.js.map