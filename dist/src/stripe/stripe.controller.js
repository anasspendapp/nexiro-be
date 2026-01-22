"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = exports.handleWebhook = void 0;
const stripe_1 = __importDefault(require("stripe"));
const user_model_1 = require("../users/user.model");
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
        const email = session.customer_details?.email;
        // Determine plan based on amount (Test prices: 50 cents = Starter, 100 cents = Pro)
        // In production, check line items or pass metadata
        let newPlan = "FREE";
        if (session.amount_total === 50)
            newPlan = "STARTER";
        else if (session.amount_total === 10000 || session.amount_total === 100)
            newPlan = "PRO";
        // Note: session.amount_total is in cents.
        console.log(`Payment successful for ${email}. Plan: ${newPlan}`);
        try {
            // Import User model dynamically to avoid circular dependencies
            if (!email) {
                console.error("No email found in session");
                return res.status(400).json({ message: "No email found in session" });
            }
            const user = await user_model_1.User.findOne({ where: { email } });
            if (user) {
                user.creditBalance = newPlan === "PRO" ? 1000 : 500; // Example credit allocation
                await user.save();
                console.log("User upgraded successfully");
            }
            else {
                console.error("User not found for webhook email:", email);
            }
        }
        catch (dbErr) {
            console.error("Database update failed:", dbErr);
        }
    }
    res.json({ received: true });
};
exports.handleWebhook = handleWebhook;
// Create Stripe checkout session
const createCheckoutSession = async (req, res) => {
    try {
        const { priceId, email } = req.body;
        console.log("Create Checkout Session Request:", { priceId, email });
        if (!priceId) {
            console.error("Missing Price ID");
            return res
                .status(400)
                .json({ message: "Price ID is missing. Please contact support." });
        }
        // In production, fetch priceId from a config based on plan name to prevent tampering
        // For now, we accept priceId directly but you should validate it.
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Stripe Secret Key not configured");
        }
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: email,
            success_url: `${req.headers.origin}?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${req.headers.origin}?canceled=true`,
        });
        res.json({ url: session.url });
    }
    catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ message: error.message });
    }
};
exports.createCheckoutSession = createCheckoutSession;
//# sourceMappingURL=stripe.controller.js.map