import { Router } from "express";
import express from "express";
import { handleWebhook, createCheckoutSession } from "./stripe.controller";

const router = Router();

// Webhook endpoint (uses raw body parser)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// Create checkout session
router.post("/create-checkout-session", createCheckoutSession);

export default router;
