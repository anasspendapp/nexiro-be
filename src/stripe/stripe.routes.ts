import { Router } from "express";
import express from "express";
import { handleWebhook, createCheckoutSession } from "./stripe.controller";
import { verifySelfAccess, verifyUserToken } from "../utils/auth.middleware";

const router = Router();

// Webhook endpoint (uses raw body parser)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook,
);

// Create checkout session
router.post("/create-checkout-session", verifyUserToken, createCheckoutSession);

export default router;
