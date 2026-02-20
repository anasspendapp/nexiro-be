import { Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../users/user.model";
import { Plan } from "../plans/plan.model";
import { StripeSession } from "../stripe-sessions/stripe-session.model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Webhook handler for Stripe events
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeSessionId = session.id;

    console.log(
      "Processing checkout.session.completed webhook:",
      stripeSessionId,
    );

    try {
      // Find the stripe session record by stripeId
      const stripeSession = await StripeSession.findOne({
        where: { stripeId: stripeSessionId },
      });

      if (!stripeSession) {
        console.error("StripeSession not found for stripeId:", stripeSessionId);
        return res
          .status(404)
          .json({ message: "StripeSession record not found" });
      }

      // Find the plan by planId from stripe session
      const plan = await Plan.findByPk(stripeSession.planId);

      if (!plan) {
        console.error("Plan not found for planId:", stripeSession.planId);
        return res.status(404).json({ message: "Plan not found" });
      }

      // Find the user
      const user = await User.findByPk(stripeSession.userId);

      if (!user) {
        console.error("User not found for userId:", stripeSession.userId);
        return res.status(404).json({ message: "User not found" });
      }

      // Update stripe session status to succeeded
      await stripeSession.update({
        status: "succeeded",
        processedAt: new Date(),
      });

      // Update user with new plan
      await user.update({
        planId: plan.id,
      });

      // Increment credits using Sequelize's increment method to avoid string concatenation issues
      await user.increment('creditBalance', { by: plan.credits });

      console.log(
        `Payment successful for user ${user.email}. Plan: ${plan.name}, Credits added: ${plan.credits}`,
      );
    } catch (dbErr: any) {
      console.error("Database update failed:", dbErr.message);
      // Still return success to Stripe to avoid retry
      return res.json({ received: true, error: dbErr.message });
    }
  }

  res.json({ received: true });
};

// Create Stripe checkout session
export const createCheckoutSession = async (req: any, res: Response) => {
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

    const plan = await Plan.findOne({ where: { id: planId, isActive: true } });

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
    const stripeSessionRecord = await StripeSession.create({
      userId,
      planId,
      stripeId: session.id,
      amount: plan.price,
      status: "pending",
    });

    console.log(
      `StripeSession created: ${stripeSessionRecord.id} for session ${session.id}`,
    );

    return res.json({
      url: session.url,
      sessionId: session.id,
      stripeSessionId: stripeSessionRecord.id,
    });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
};
