import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";
import sequelize from "./config/database.js";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
// Webhook endpoint (MUST be before express.json)
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const email = session.customer_details.email; // Or session.customer_email

      // Determine plan based on amount (Test prices: 50 cents = Starter, 100 cents = Pro)
      // In production, check line items or pass metadata
      let newPlan = "FREE";
      if (session.amount_total === 50) newPlan = "STARTER";
      else if (session.amount_total === 10000 || session.amount_total === 100)
        newPlan = "PRO";
      // Note: session.amount_total is in cents.

      console.log(`Payment successful for ${email}. Plan: ${newPlan}`);

      try {
        const user = await User.findOne({ where: { email } });
        if (user) {
          user.isPro = true;
          user.plan = newPlan;
          user.usageCount = 0; // Reset usage on upgrade/renewal
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
  },
);

app.use(express.json({ limit: "50mb" })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database Connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Connected to PostgreSQL");
    console.log("✅ Connected to PostgreSQL");
    return sequelize.sync({ alter: true }); // Updates tables if schema changed
  })
  .then(() => console.log("✅ Database Synced"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

// --- Routes ---

import { GoogleGenAI } from "@google/genai";
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Server-side instance

// Gemini Proxy
app.post("/api/gemini-proxy", async (req, res) => {
  try {
    const { model, contents, config } = req.body;

    // Safety check: Don't allow arbitrary config override if needed,
    // but for now passing through is fine as this is an internal studio tool.

    const aiResponse = await genAI.models.generateContent({
      model: model,
      contents: contents,
      config: config,
    });

    // Return the full opaque response object or just the text?
    // The frontend expects the full structure to parse `response.text()` or candidates.
    // However, the node SDK returns a structured object.

    // Let's send back the structured response.
    // Note: The Node SDK response object might need serialization helper or just usage of .response
    res.json(aiResponse);
  } catch (error) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ error: error.message || "Gemini Proxy Failed" });
  }
});

// Sign Up
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({ email, password });

    res.status(201).json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        usageCount: user.usageCount,
        isPro: user.isPro,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Google Auth
app.post("/api/google-auth", async (req, res) => {
  try {
    const { token, plan } = req.body;
    console.log("Received Google Auth Request:", {
      plan,
      tokenHeader: token.substring(0, 10),
    });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience:
        process.env.GOOGLE_CLIENT_ID ||
        "468562803826-3l746fkd419r86kvlaajgogsenm52ubs.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const firstName = payload.given_name || "";
    const lastName = payload.family_name || "";
    const isPro =
      plan === "pro" || plan === "PRO" || plan === "Pro" || plan === "STARTER";

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        email,
        firstName,
        lastName,
        password: "GOOGLE_AUTH_USER_" + Math.random().toString(36), // Dummy password
        isPro: isPro,
        plan: isPro ? plan : "FREE",
      });
    } else {
      // Update logic
      let updates = {};
      if (!user.firstName && firstName) updates.firstName = firstName;
      if (!user.lastName && lastName) updates.lastName = lastName;
      // Update plan if provided and is an upgrade (simple logic for now)
      if (plan && (plan === "PRO" || plan === "STARTER")) {
        updates.plan = plan;
        updates.isPro = true;
      }

      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    }

    console.log(`User saved/updated: ${user.email}, Pro: ${user.isPro}`);
    res.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        usageCount: user.usageCount,
        isPro: user.isPro,
        plan: user.plan || (user.isPro ? "PRO" : "FREE"),
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res
      .status(401)
      .json({ message: "Invalid Google Token", error: error.toString() });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password (simple comparison)
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        usageCount: user.usageCount,
        isPro: user.isPro,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update Usage
app.post("/api/usage", async (req, res) => {
  try {
    const { email, amount } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Limit check logic (example)
    const limit = 5;
    if (!user.isPro && user.usageCount + (amount || 1) > limit) {
      // return res.status(403).json({ message: 'Limit reached' });
    }

    await user.incrementUsage(amount || 1);

    res.json({
      usageCount: user.usageCount,
      isPro: user.isPro,
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify Payment / Get Profile
app.post("/api/verify-payment", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        usageCount: user.usageCount,
        isPro: user.isPro,
        plan: user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Upgrade to Pro (Legacy/Manual)
app.post("/api/upgrade", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      await user.update({ isPro: true });
      res.json({ isPro: user.isPro });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
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
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Catch-all handler for any request that doesn't match the above
app.get("*", (req, res) => {
  res.json({ message: "Nexiro AI Studio Backend is running." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
