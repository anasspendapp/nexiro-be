import { Request, Response } from "express";
import Stripe from "stripe";
import { User } from "../users/user.model";

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
    const email = session.customer_details?.email;

    // Determine plan based on amount (Test prices: 50 cents = Starter, 100 cents = Pro)
    // In production, check line items or pass metadata
    let newPlan = "FREE";
    if (session.amount_total === 50) newPlan = "STARTER";
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
      const user = await User.findOne({ where: { email } });
      if (user) {
        user.creditBalance = newPlan === "PRO" ? 1000 : 500; // Example credit allocation
        await user.save();
        console.log("User upgraded successfully");
      } else {
        console.error("User not found for webhook email:", email);
      }
    } catch (dbErr) {
      console.error("Database update failed:", dbErr);
    }
  }

  res.json({ received: true });
};

// Create Stripe checkout session
export const createCheckoutSession = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
};
